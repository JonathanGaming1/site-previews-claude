import { json, signAdminJwt, verifyAdminJwt } from "../_lib/security.js";

const COOKIE_NAME = "admin_jwt";
const SESSION_SECONDS = 12 * 60 * 60;
const MAX_BODY_BYTES = 4096;
const attemptsByIp = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function cookieHeader(value, maxAge) {
  return COOKIE_NAME + "=" + value + "; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=" + maxAge;
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
  const values = [
    body?.key,
    body?.password,
    new URL(request.url).searchParams.get("key"),
    request.headers.get("x-admin-key"),
  ];
  return values.find((value) => typeof value === "string") || "";
}

function requestIp(request) {
  return request.headers.get("CF-Connecting-IP") || "unknown";
}

function isRateLimited(ip, now) {
  const record = attemptsByIp.get(ip);
  if (!record) return false;
  if (record.resetAt <= now) {
    attemptsByIp.delete(ip);
    return false;
  }
  return record.failures >= MAX_ATTEMPTS;
}

function recordFailure(ip, now) {
  const current = attemptsByIp.get(ip);
  const record = !current || current.resetAt <= now ? { failures: 0, resetAt: now + WINDOW_MS } : current;
  record.failures += 1;
  attemptsByIp.set(ip, record);
  if (attemptsByIp.size > 5000) {
    for (const [key, value] of attemptsByIp) {
      if (value.resetAt <= now) attemptsByIp.delete(key);
      if (attemptsByIp.size <= 4000) break;
    }
  }
}

function sameOrigin(request) {
  const origin = request.headers.get("Origin");
  return Boolean(origin) && origin === new URL(request.url).origin;
}

async function onRequestGet({ request, env }) {
  const cookieAuth = await verifyAdminJwt(request, env);
  if (cookieAuth.ok) return json({ authenticated: true });
  const ADMIN_SECRET = (env?.ADMIN_KEY || "yam2026").trim();
  return json({ authenticated: constantTimeEqual(adminKeyCandidate(request), ADMIN_SECRET) });
}

async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return json({ authenticated: false, error: "origin_not_allowed" }, 403);
  const ADMIN_SECRET = (env?.ADMIN_KEY || "yam2026").trim();
  const cookieAuth = await verifyAdminJwt(request, env);
  if (cookieAuth.ok) return json({ authenticated: true });

  const ip = requestIp(request);
  const now = Date.now();
  if (isRateLimited(ip, now)) return json({ authenticated: false, error: "too_many_attempts" }, 429, { "retry-after": "900" });

  let body;
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) return json({ authenticated: false, error: "request_too_large" }, 413);
    body = text.trim() ? JSON.parse(text) : {};
  } catch {
    return json({ authenticated: false, error: "invalid_json" }, 400);
  }

  const candidate = adminKeyCandidate(request, body);
  if (!constantTimeEqual(candidate, ADMIN_SECRET)) {
    recordFailure(ip, now);
    return json({ authenticated: false, error: "invalid_credentials" }, 401);
  }

  attemptsByIp.delete(ip);
  const token = await signAdminJwt(ADMIN_SECRET);
  return json({ authenticated: true }, 200, { "set-cookie": cookieHeader(token, SESSION_SECONDS) });
}

async function onRequestDelete({ request }) {
  if (!sameOrigin(request)) return json({ authenticated: false, error: "origin_not_allowed" }, 403);
  return json({ authenticated: false }, 200, {
    "set-cookie": cookieHeader("", 0) + "; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
  });
}

export async function onRequest(context) {
  switch (context.request.method) {
    case "GET": return onRequestGet(context);
    case "POST": return onRequestPost(context);
    case "DELETE": return onRequestDelete(context);
    default: return new Response("Method Not Allowed", { status: 405, headers: { allow: "GET, POST, DELETE", "cache-control": "no-store" } });
  }
}
