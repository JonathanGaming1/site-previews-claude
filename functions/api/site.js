import { json, publicAdminMetadata, readAdminState, readSite, sanitizePublicData, validateSlug, verifyAdminJwt } from "../_lib/security.js";

export async function onRequestGet({ request, env }) {
  const slug = new URL(request.url).searchParams.get("site") || "";
  if (!validateSlug(slug)) return json({ error: "invalid_slug" }, 400);
  const token = typeof env?.GITHUB_TOKEN === "string" ? env.GITHUB_TOKEN : "";
  if (!token) return json({ error: "github_not_configured" }, 503);

  let file;
  try {
    file = await readSite(token, slug);
  } catch (error) {
    return json({ error: error?.message || "github_read_failed" }, error?.status || 502);
  }

  const publicData = sanitizePublicData(file.data);
  const auth = await verifyAdminJwt(request, env);
  if (!auth.ok) return json(publicData);

  try {
    const state = await readAdminState(token, slug);
    return json(publicAdminMetadata(publicData, state?.data || null));
  } catch {
    return json({ error: "admin_state_read_failed" }, 502);
  }
}

export async function onRequest(context) {
  if (context.request.method === "GET") return onRequestGet(context);
  return new Response("Method Not Allowed", { status: 405, headers: { allow: "GET", "cache-control": "no-store" } });
}
