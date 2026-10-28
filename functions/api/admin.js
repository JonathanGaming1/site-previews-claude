import {
  clonePublicSnapshot,
  createCheckpoint,
  isObject,
  json,
  publicAdminMetadata,
  readAdminState,
  readSite,
  sanitizePublicData,
  validateSlug,
  verifyAdminJwt,
  writeAdminState,
  writeSite,
} from "../_lib/security.js";

const MAX_BODY_BYTES = 700_000;

function responseError(error, fallback) {
  return json({ ok: false, error: error?.message || fallback }, error?.status || 502);
}

function sameOrigin(request) {
  const origin = request.headers.get("Origin");
  return Boolean(origin) && origin === new URL(request.url).origin;
}

function constantTimeEqual(candidate, expected) {
  const encoder = new TextEncoder();
  const left = encoder.encode(candidate);
  const right = encoder.encode(expected);
  let difference = left.length ^ right.length;
  for (let i = 0; i < 1024; i += 1) difference |= (left[i] || 0) ^ (right[i] || 0);
  if (left.length > 1024 || right.length > 1024) difference |= 1;
  return difference === 0;
}

function adminKeyCandidate(request, body) {
  const values = [body?.key, new URL(request.url).searchParams.get("key"), request.headers.get("x-admin-key")];
  return values.find((value) => typeof value === "string") || "";
}

async function readJson(request) {
  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) throw Object.assign(new Error("request_too_large"), { status: 413 });
  return JSON.parse(text);
}

async function makeAiEdit(apiKey, current, prompt) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { authorization: "Bearer " + apiKey, "content-type": "application/json" },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b",
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You edit JSON for a Hebrew local-business website. Return exactly one valid JSON object. Preserve the schema and unrelated fields. Make only the requested content/design changes. Never add credentials, tokens, webhook URLs, backup fields, admin metadata or executable code. Do not invent reviews, certifications, prices, guarantees or claims. Keep user-facing copy natural Hebrew unless another language is requested." },
        { role: "user", content: "Requested change:\n" + prompt + "\n\nCurrent public site JSON:\n" + JSON.stringify(sanitizePublicData(current)) },
      ],
    }),
  });
  if (!response.ok) throw Object.assign(new Error("groq_request_failed"), { status: 502 });
  const result = await response.json();
  const content = result?.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw Object.assign(new Error("groq_empty_response"), { status: 502 });
  let patch;
  try { patch = JSON.parse(content); } catch { throw Object.assign(new Error("groq_invalid_json"), { status: 502 }); }
  if (!isObject(patch)) throw Object.assign(new Error("groq_invalid_json"), { status: 502 });
  return sanitizePublicData(mergeObjects(sanitizePublicData(current), sanitizePublicData(patch)));
}

function mergeObjects(base, patch) {
  if (!isObject(base) || !isObject(patch)) return patch === undefined ? base : patch;
  const output = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    output[key] = isObject(value) && isObject(base[key]) ? mergeObjects(base[key], value) : value;
  }
  return output;
}

function sanitizeEditableData(candidate, current, slug) {
  const clean = sanitizePublicData(candidate);
  return {
    ...clean,
    slug,
    businessId: current.businessId,
    isDemo: current.isDemo,
    checkoutUrl: current.checkoutUrl,
  };
}

function checkpointState(existing, current, label) {
  const state = existing || { version: 1, initialBackup: null, checkpoints: [] };
  return {
    version: 1,
    initialBackup: state.initialBackup || clonePublicSnapshot(current),
    checkpoints: [...(state.checkpoints || []), createCheckpoint(current, label)].slice(-30),
  };
}

async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return json({ ok: false, error: "origin_not_allowed" }, 403);

  let body;
  try {
    body = await readJson(request);
  } catch (error) {
    return json({ ok: false, error: error?.message === "request_too_large" ? "request_too_large" : "invalid_json" }, error?.status || 400);
  }
  if (!isObject(body) || typeof body.action !== "string") return json({ ok: false, error: "invalid_payload" }, 400);

  const ADMIN_SECRET = (env?.ADMIN_KEY || "yam2026").trim();
  const cookieAuth = await verifyAdminJwt(request, env);
  const keyAuth = constantTimeEqual(adminKeyCandidate(request, body), ADMIN_SECRET);
  if (!cookieAuth.ok && !keyAuth) return json({ ok: false, error: "unauthorized" }, 401);

  const token = typeof env?.GITHUB_TOKEN === "string" ? env.GITHUB_TOKEN : "";
  if (!token) return json({ ok: false, error: "github_not_configured" }, 503);

  const slug = typeof body.slug === "string" ? body.slug : "";
  if (!validateSlug(slug)) return json({ ok: false, error: "invalid_slug" }, 400);

  let file;
  let stateFile;
  try {
    file = await readSite(token, slug);
    stateFile = await readAdminState(token, slug);
  } catch (error) {
    return responseError(error, "github_read_failed");
  }

  const state = stateFile?.data || { version: 1, initialBackup: null, checkpoints: [] };
  const current = sanitizePublicData(file.data);
  let nextPublic;
  let nextState;

  if (body.action === "manual_save") {
    if (!isObject(body.updatedData)) return json({ ok: false, error: "updated_data_required" }, 400);
    nextState = checkpointState(state, current, "לפני שמירה ידנית");
    nextPublic = sanitizeEditableData(body.updatedData, current, slug);
  } else if (body.action === "ai_edit") {
    const prompt = typeof body.prompt === "string" ? body.prompt.trim().slice(0, 3000) : "";
    if (!prompt) return json({ ok: false, error: "prompt_required" }, 400);
    const apiKey = typeof env?.GROQ_API_KEY === "string" ? env.GROQ_API_KEY : "";
    if (!apiKey) return json({ ok: false, error: "groq_not_configured" }, 503);
    let edited;
    try { edited = await makeAiEdit(apiKey, current, prompt); } catch (error) { return responseError(error, "groq_request_failed"); }
    nextState = checkpointState(state, current, "לפני עריכת AI");
    nextPublic = sanitizeEditableData(edited, current, slug);
  } else if (body.action === "recall") {
    let restore = null;
    if (body.recallLabel === "initialBackup") restore = state.initialBackup;
    else if (typeof body.checkpointId === "string") {
      const checkpoint = state.checkpoints.find((item) => item.id === body.checkpointId);
      restore = checkpoint?.data || null;
    }
    if (!isObject(restore)) return json({ ok: false, error: "checkpoint_not_found" }, 404);
    nextState = checkpointState(state, current, "לפני שחזור");
    nextPublic = sanitizeEditableData(restore, current, slug);
  } else {
    return json({ ok: false, error: "unsupported_action" }, 400);
  }

  try {
    await writeAdminState(token, slug, nextState);
  } catch (error) {
    return responseError(error, "admin_state_write_failed");
  }

  try {
    const saved = await writeSite(token, slug, file.sha, nextPublic, "Admin " + body.action.replace(/_/g, " ") + ": " + slug);
    return json({ ok: true, updatedData: publicAdminMetadata(saved, nextState) });
  } catch (error) {
    return responseError(error, "github_write_failed");
  }
}

export async function onRequest(context) {
  if (context.request.method === "POST") return onRequestPost(context);
  return new Response("Method Not Allowed", { status: 405, headers: { allow: "POST", "cache-control": "no-store" } });
}
