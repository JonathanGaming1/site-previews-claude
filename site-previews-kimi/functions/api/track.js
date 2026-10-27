import { json, verifyAdminJwt } from "../_lib/security.js";

const visitCache = new Map();
const COOLDOWN_MS = 5 * 60 * 1000;
const MAX_CACHE_ITEMS = 5000;
const VISIT_COOKIE = "demo_visit_cooldown";

function shortText(value, max = 160) {
  return typeof value === "string" ? value.replace(/[\r\n\u0000-\u001f]/g, " ").replace(/@everyone|@here/g, "@\u200b$&").trim().slice(0, max) : "";
}

function cookieValue(request, name) {
  const cookieHeader = request.headers.get("Cookie") || "";
  for (const entry of cookieHeader.split(";")) {
    const separator = entry.indexOf("=");
    if (separator < 0) continue;
    if (entry.slice(0, separator).trim() === name) return entry.slice(separator + 1).trim();
  }
  return "";
}

function visitCookie(maxAge = 300) {
  return VISIT_COOKIE + "=1; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=" + maxAge;
}

function pruneCache(now) {
  for (const [key, timestamp] of visitCache) {
    if (now - timestamp >= COOLDOWN_MS) visitCache.delete(key);
  }
  if (visitCache.size <= MAX_CACHE_ITEMS) return;
  while (visitCache.size > 4000) {
    const oldestKey = visitCache.keys().next().value;
    if (oldestKey === undefined) break;
    visitCache.delete(oldestKey);
  }
}

function safePageUrl(request, candidate) {
  try {
    const parsed = new URL(typeof candidate === "string" ? candidate : request.headers.get("Referer") || request.url, request.url);
    if (parsed.origin !== new URL(request.url).origin) return new URL(request.url).origin + new URL(request.url).pathname;
    return parsed.origin + parsed.pathname;
  } catch {
    return new URL(request.url).origin + new URL(request.url).pathname;
  }
}

async function sendPostHog(env, event) {
  const apiKey = typeof env?.POST_HOG_KEY === "string" ? env.POST_HOG_KEY : "";
  if (!apiKey) return;
  try {
    await fetch("https://us.i.posthog.com/capture/", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ api_key: apiKey, event: "demo_visit", distinct_id: crypto.randomUUID(), properties: event }),
    });
  } catch {
    // Analytics must never block site rendering or Discord notifications.
  }
}

export async function onRequestPost({ request, env }) {
  // Keep admin traffic out of visitor analytics and Discord.
  const auth = await verifyAdminJwt(request, env);
  if (auth.ok) return json({ ok: true, skipped: "admin" });

  let body;
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).length > 12000) return json({ ok: false, error: "request_too_large" }, 413);
    body = JSON.parse(text);
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  const slug = shortText(body?.slug, 100);
  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(slug)) return json({ ok: false, error: "invalid_slug" }, 400);

  const clientIp = request.headers.get("CF-Connecting-IP") || "unknown";
  const userAgent = request.headers.get("User-Agent") || "unknown";
  // The key is deliberately in memory only. It is never logged or sent to Discord.
  const deviceKey = clientIp + "\u0000" + userAgent;
  const now = Date.now();
  pruneCache(now);

  // A HttpOnly cookie supplies a browser-level cooldown; the in-memory map also
  // covers cookie-less clients and requests arriving in the same worker isolate.
  if (cookieValue(request, VISIT_COOKIE) === "1") {
    visitCache.set(deviceKey, now);
    return json({ ok: true, skipped: "cooldown" }, 200, { "set-cookie": visitCookie() });
  }

  const lastVisit = visitCache.get(deviceKey);
  if (typeof lastVisit === "number" && now - lastVisit < COOLDOWN_MS) {
    // Every return visit refreshes the rolling inactivity window.
    visitCache.set(deviceKey, now);
    return json({ ok: true, skipped: "cooldown" }, 200, { "set-cookie": visitCookie() });
  }

  const businessName = shortText(body?.businessName, 120) || "עסק לא מזוהה";
  const templateId = shortText(body?.templateId, 80) || "לא ידועה";
  const device = shortText(body?.device, 50) || "דפדפן";
  const pageUrl = safePageUrl(request, body?.url);
  const webhook = typeof env?.DISCORD_WEBHOOK_URL === "string" ? env.DISCORD_WEBHOOK_URL : "";

  if (!webhook) {
    await sendPostHog(env, { slug, business_name: businessName, template_id: templateId, device, $current_url: pageUrl, $host: new URL(request.url).host });
    return json({ ok: false, error: "tracking_not_configured" }, 503);
  }

  // Claim the cooldown before I/O so overlapping requests cannot double-send.
  visitCache.set(deviceKey, now);
  const content = [
    "**כניסה חדשה לאתר הדגמה**",
    "עסק: " + businessName + " (" + slug + ")",
    "תבנית: " + templateId + " | מכשיר: " + device,
    "קישור: " + pageUrl,
  ].join("\n");
  const analyticsEvent = { slug, business_name: businessName, template_id: templateId, device, $current_url: pageUrl, $host: new URL(request.url).host };

  try {
    const delivery = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content, allowed_mentions: { parse: [] } }),
    });
    if (!delivery.ok) {
      visitCache.delete(deviceKey);
      return json({ ok: false, error: "discord_delivery_failed" }, 502, { "set-cookie": visitCookie(0) });
    }
  } catch {
    visitCache.delete(deviceKey);
    return json({ ok: false, error: "discord_delivery_failed" }, 502, { "set-cookie": visitCookie(0) });
  }

  await sendPostHog(env, analyticsEvent);
  return json({ ok: true }, 200, { "set-cookie": visitCookie() });
}

export async function onRequest(context) {
  if (context.request.method === "POST") return onRequestPost(context);
  return new Response("Method Not Allowed", { status: 405, headers: { allow: "POST", "cache-control": "no-store" } });
}
