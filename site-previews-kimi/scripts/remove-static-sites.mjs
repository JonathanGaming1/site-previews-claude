import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";
const generatedSites = resolve(process.cwd(), "out", "sites");
if (existsSync(generatedSites)) rmSync(generatedSites, { recursive: true, force: true });
if (existsSync(generatedSites)) {
  console.error("[security] Refusing to finish build: public site JSON remains in the static export.");
  process.exit(1);
}
console.log("[security] Removed raw site JSON from the static export; site data is served through /api/site.");
