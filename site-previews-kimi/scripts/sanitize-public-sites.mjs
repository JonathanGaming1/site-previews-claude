import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const directories = [join(ROOT, "src", "data"), join(ROOT, "public", "sites")];
const blocked = /^(?:__proto__|prototype|constructor|initialBackup|checkpoints?|n8nEditWebhookUrl|trackingWebhookUrl|discordWebhookUrl|githubToken|groqApiKey|adminKey|.*(?:secret|token|password|credential|api[_-]?key|authorization|webhook).*)$/i;
function sanitize(value) {
  if (Array.isArray(value)) return value.map(sanitize);
  if (!value || typeof value !== "object") return value;
  const output = {};
  for (const [key, child] of Object.entries(value)) {
    if (blocked.test(key)) continue;
    output[key] = sanitize(child);
  }
  return output;
}
function walk(directory) {
  let changed = 0;
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    const info = statSync(path);
    if (info.isDirectory()) { changed += walk(path); continue; }
    if (!name.endsWith(".json")) continue;
    const original = readFileSync(path, "utf8");
    let parsed;
    try { parsed = JSON.parse(original); } catch { throw new Error("Invalid JSON file: " + path.slice(ROOT.length + 1)); }
    const clean = JSON.stringify(sanitize(parsed), null, 2) + "\n";
    if (clean !== original) {
      writeFileSync(path, clean);
      changed += 1;
      console.log("[sanitize] removed private editor metadata from " + path.slice(ROOT.length + 1));
    }
  }
  return changed;
}
let changed = 0;
try { for (const directory of directories) changed += walk(directory); }
catch (error) { console.error("[sanitize] " + (error instanceof Error ? error.message : "failed")); process.exit(1); }
console.log("[sanitize] checked source defaults and public site JSON; changed " + changed + " file(s).");
