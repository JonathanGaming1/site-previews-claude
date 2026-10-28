const API_ROOT = "https://api.github.com";
const OWNER = "JonathanGaming1";
const REPO = "site-previews-kimi";
const JWT_COOKIE = "admin_jwt";
const SESSION_SECONDS = 12 * 60 * 60;
const MAX_CHECKPOINTS = 30;

export function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store, max-age=0",
      "pragma": "no-cache",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
      "x-frame-options": "DENY",
      ...headers,
    },
  });
}

export function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function validateSlug(value) {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{1,100}$/.test(value);
}

function encodeBase64Url(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function decodeBase64Url(value) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]+$/.test(value)) throw new Error("invalid_base64url");
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - value.length % 4) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function decodeJsonPart(value) {
  return JSON.parse(new TextDecoder().decode(decodeBase64Url(value)));
}

async function getHmacKey(secret, usages) {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, usages);
}

export async function signAdminJwt(secret) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const claims = { iss: "site-previews-kimi", sub: "admin", iat: now, exp: now + SESSION_SECONDS };
  const encodedHeader = encodeBase64Url(new TextEncoder().encode(JSON.stringify(header)));
  const encodedClaims = encodeBase64Url(new TextEncoder().encode(JSON.stringify(claims)));
  const message = encodedHeader + "." + encodedClaims;
  const key = await getHmacKey(secret, ["sign"]);
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message)));
  return message + "." + encodeBase64Url(signature);
}

export function getCookie(request, name) {
  const header = request.headers.get("Cookie") || "";
  for (const entry of header.split(";")) {
    const separator = entry.indexOf("=");
    if (separator < 0) continue;
    if (entry.slice(0, separator).trim() === name) return entry.slice(separator + 1).trim();
  }
  return "";
}

export async function verifyAdminJwt(request, env) {
  const secret = (env?.ADMIN_KEY || "yam2026").trim();
  const token = getCookie(request, JWT_COOKIE);
  if (!token) return { ok: false, reason: "missing" };
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return { ok: false, reason: "malformed" };
    const header = decodeJsonPart(parts[0]);
    const claims = decodeJsonPart(parts[1]);
    if (header?.alg !== "HS256" || header?.typ !== "JWT") return { ok: false, reason: "algorithm" };
    const key = await getHmacKey(secret, ["verify"]);
    const valid = await crypto.subtle.verify("HMAC", key, decodeBase64Url(parts[2]), new TextEncoder().encode(parts[0] + "." + parts[1]));
    if (!valid) return { ok: false, reason: "signature" };
    const now = Math.floor(Date.now() / 1000);
    if (claims?.iss !== "site-previews-kimi" || claims?.sub !== "admin") return { ok: false, reason: "claims" };
    if (!Number.isInteger(claims?.iat) || !Number.isInteger(claims?.exp)) return { ok: false, reason: "time_claims" };
    if (claims.exp <= now || claims.iat > now + 60) return { ok: false, reason: "expired" };
    if (claims.exp <= claims.iat || claims.exp - claims.iat > SESSION_SECONDS) return { ok: false, reason: "lifetime" };
    return { ok: true, claims };
  } catch {
    return { ok: false, reason: "invalid" };
  }
}

export function sanitizePublicData(value) {
  if (Array.isArray(value)) return value.map(sanitizePublicData);
  if (!isObject(value)) return value;
  const blockedKey = /^(?:__proto__|prototype|constructor|initialbackup|checkpoints?|.*webhook.*|.*token.*|.*secret.*|.*password.*|.*credential.*|.*api[_-]?key.*|authorization|access[_-]?token)$/i;
  const output = {};
  for (const [key, child] of Object.entries(value)) {
    if (blockedKey.test(key)) continue;
    output[key] = sanitizePublicData(child);
  }
  return output;
}

export function clonePublicSnapshot(value) {
  return sanitizePublicData(JSON.parse(JSON.stringify(value)));
}

function githubHeaders(token) {
  return {
    authorization: "Bearer " + token,
    accept: "application/vnd.github+json",
    "content-type": "application/json",
    "x-github-api-version": "2022-11-28",
    "user-agent": "site-previews-kimi-cloudflare-pages",
  };
}

function contentUrl(path) {
  return API_ROOT + "/repos/" + OWNER + "/" + REPO + "/contents/" + path.split("/").map(encodeURIComponent).join("/") + "?ref=main";
}

function decodeUtf8Base64(value) {
  const binary = atob(String(value || "").replace(/\s/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function encodeUtf8Base64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

async function readGithubFile(token, path, missingAllowed = false) {
  const response = await fetch(contentUrl(path), { headers: githubHeaders(token) });
  if (response.status === 404 && missingAllowed) return null;
  if (response.status === 404) throw Object.assign(new Error("site_not_found"), { status: 404 });
  if (!response.ok) throw Object.assign(new Error("github_read_failed"), { status: 502 });
  const file = await response.json();
  if (!file || typeof file.sha !== "string" || typeof file.content !== "string") throw Object.assign(new Error("invalid_github_file"), { status: 502 });
  let data;
  try {
    data = JSON.parse(decodeUtf8Base64(file.content));
  } catch {
    throw Object.assign(new Error("invalid_site_json"), { status: 502 });
  }
  if (!isObject(data)) throw Object.assign(new Error("invalid_site_json"), { status: 502 });
  return { sha: file.sha, data };
}

export async function readSite(token, slug) {
  if (!validateSlug(slug)) throw Object.assign(new Error("invalid_slug"), { status: 400 });
  return readGithubFile(token, "public/sites/" + slug + ".json");
}

export async function writeSite(token, slug, currentSha, data, message) {
  if (!validateSlug(slug)) throw Object.assign(new Error("invalid_slug"), { status: 400 });
  const publicData = sanitizePublicData(data);
  const path = "public/sites/" + slug + ".json";
  const response = await fetch(API_ROOT + "/repos/" + OWNER + "/" + REPO + "/contents/" + path.split("/").map(encodeURIComponent).join("/"), {
    method: "PUT",
    headers: githubHeaders(token),
    body: JSON.stringify({
      message: String(message || "Update site " + slug).slice(0, 120),
      content: encodeUtf8Base64(JSON.stringify(publicData, null, 2) + "\n"),
      sha: currentSha,
      branch: "main",
    }),
  });
  if (!response.ok) {
    const status = response.status === 409 || response.status === 422 ? 409 : 502;
    throw Object.assign(new Error(status === 409 ? "github_write_conflict" : "github_write_failed"), { status });
  }
  return publicData;
}

function statePath(slug) {
  return "private/admin-state/" + slug + ".json";
}

export async function readAdminState(token, slug) {
  const file = await readGithubFile(token, statePath(slug), true);
  if (!file) return null;
  const state = file.data;
  if (!isObject(state) || state.version !== 1 || !Array.isArray(state.checkpoints)) throw Object.assign(new Error("admin_state_invalid"), { status: 502 });
  return {
    sha: file.sha,
    data: {
      version: 1,
      initialBackup: isObject(state.initialBackup) ? clonePublicSnapshot(state.initialBackup) : null,
      checkpoints: state.checkpoints.filter((item) => isObject(item) && isObject(item.data) && typeof item.id === "string").slice(-MAX_CHECKPOINTS).map((item) => ({
        id: item.id.slice(0, 120),
        label: typeof item.label === "string" ? item.label.slice(0, 100) : "שמירה קודמת",
        timestamp: typeof item.timestamp === "string" ? item.timestamp : new Date().toISOString(),
        data: clonePublicSnapshot(item.data),
      })),
    },
  };
}

export async function writeAdminState(token, slug, state) {
  const current = await readAdminState(token, slug);
  const path = statePath(slug);
  const response = await fetch(API_ROOT + "/repos/" + OWNER + "/" + REPO + "/contents/" + path.split("/").map(encodeURIComponent).join("/"), {
    method: "PUT",
    headers: githubHeaders(token),
    body: JSON.stringify({
      message: "Update private admin history for " + slug,
      content: encodeUtf8Base64(JSON.stringify({
        version: 1,
        initialBackup: state.initialBackup ? clonePublicSnapshot(state.initialBackup) : null,
        checkpoints: (state.checkpoints || []).slice(-MAX_CHECKPOINTS).map((item) => ({
          id: item.id,
          label: item.label,
          timestamp: item.timestamp,
          data: clonePublicSnapshot(item.data),
        })),
        updatedAt: new Date().toISOString(),
      }, null, 2) + "\n"),
      ...(current?.sha ? { sha: current.sha } : {}),
      branch: "main",
    }),
  });
  if (!response.ok) {
    const status = response.status === 409 || response.status === 422 ? 409 : 502;
    throw Object.assign(new Error(status === 409 ? "admin_state_write_conflict" : "admin_state_write_failed"), { status });
  }
}

export function publicAdminMetadata(publicData, state) {
  const output = clonePublicSnapshot(publicData);
  if (!state) return output;
  output.initialBackup = Boolean(state.initialBackup);
  output.checkpoints = (state.checkpoints || []).slice(-MAX_CHECKPOINTS).map((item) => ({ id: item.id, label: item.label, timestamp: item.timestamp }));
  return output;
}

export function createCheckpoint(data, label) {
  return { id: crypto.randomUUID(), label: String(label || "שמירה").slice(0, 100), timestamp: new Date().toISOString(), data: clonePublicSnapshot(data) };
}
