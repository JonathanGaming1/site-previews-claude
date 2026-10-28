import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(process.cwd(), "src");
const forbidden = [
  { name: "Discord webhook URL", pattern: /discord\.com\/api\/webhooks/i },
  { name: "GitHub personal access token", pattern: /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/ },
  { name: "Groq API key", pattern: /\bgsk_[A-Za-z0-9]{20,}\b/ },
  { name: "PostHog key", pattern: /\bphc_[A-Za-z0-9]{20,}\b/ },
  { name: "private n8n editor URL", pattern: /https?:\/\/[^\s"']*\/webhook\/site-editor/i },
  { name: "hardcoded admin/password assignment", pattern: /(?:ADMIN_KEY|ADMIN_PASSWORD|adminPassword)\s*[:=]\s*["'][^"']{6,}["']/i },
];
const findings = [];
function walk(directory) {
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    const info = statSync(path);
    if (info.isDirectory()) walk(path);
    else if (/\.(?:js|jsx|ts|tsx|json|css|mjs|cjs)$/.test(name)) {
      const source = readFileSync(path, "utf8");
      for (const rule of forbidden) if (rule.pattern.test(source)) findings.push({ path: path.slice(root.length + 1), name: rule.name });
    }
  }
}
walk(root);
if (findings.length) {
  console.error("[security] Possible credential / webhook exposure in src/:");
  for (const finding of findings) console.error("  - " + finding.path + ": " + finding.name);
  process.exit(1);
}
console.log("[security] No known webhook URLs or raw API keys found under src/.");
