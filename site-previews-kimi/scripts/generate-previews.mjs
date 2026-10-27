import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = path.join(ROOT, "public", "previews");
const FONT_CONFIG = path.join(ROOT, "scripts", "fontconfig.conf");
process.env.FONTCONFIG_FILE = FONT_CONFIG;
process.env.FONTCONFIG_PATH = path.dirname(FONT_CONFIG);

const W = 1200;
const H = 675;
const esc = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const text = (x, y, value, options = {}) => {
  const { size = 16, fill = "#fff", family = "Heebo", weight = 400, anchor = "start", spacing = 0, opacity = 1, transform = "" } = options;
  return `<text x="${x}" y="${y}" fill="${fill}" font-family="${family}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" letter-spacing="${spacing}" opacity="${opacity}"${transform ? ` transform="${transform}"` : ""}>${esc(value)}</text>`;
};
const line = (x1, y1, x2, y2, stroke, opacity = 1, width = 1) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-opacity="${opacity}" stroke-width="${width}"/>`;
const rect = (x, y, width, height, options = {}) => {
  const { fill = "none", stroke = "none", opacity = 1, rx = 0, transform = "", extra = "" } = options;
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" fill="${fill}" fill-opacity="${opacity}" stroke="${stroke}"${transform ? ` transform="${transform}"` : ""} ${extra}/>`;
};
const label = (x, y, value, color = "#C8A97E", anchor = "start") => text(x, y, value, { size: 11, fill: color, spacing: 3.2, weight: 500, anchor });
const footer = (active, accent, items = ["01", "02", "03", "04", "05"]) => `
  ${line(56, 603, 1144, 603, "#FFFFFF", .11)}
  ${items.map((item, index) => `${text(58 + index * 49, 635, item, { size: 11, fill: index + 1 === active ? accent : "#FFFFFF", spacing: 2, opacity: index + 1 === active ? 1 : .38 })}${index + 1 === active ? line(58 + index * 49, 615, 79 + index * 49, 615, accent, .95, 2) : ""}`).join("")}
  ${text(1144, 635, "VIRTUAL CAMERA / 1200 × 675", { size: 9, fill: "#FFFFFF", spacing: 2.2, anchor: "end", opacity: .36 })}`;
const svg = (body, defs = "", background = "#050505") => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${defs}</defs>${rect(0, 0, W, H, { fill: background })}${body}</svg>`;

function forge() {
  const defs = `
    <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#3D382F"/><stop offset=".35" stop-color="#0B0B0B"/><stop offset=".72" stop-color="#1C1914"/><stop offset="1" stop-color="#030303"/></linearGradient>
    <radialGradient id="forge-vignette"><stop stop-color="#000" stop-opacity="0"/><stop offset=".7" stop-color="#000" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity=".92"/></radialGradient>
    <linearGradient id="forge-beam" x1="0" x2="1"><stop stop-color="#C8A97E" stop-opacity="0"/><stop offset=".5" stop-color="#C8A97E" stop-opacity=".7"/><stop offset="1" stop-color="#C8A97E" stop-opacity="0"/></linearGradient>`;
  const car = `
    <g opacity=".9">
      <path d="M245 430 C315 407 356 365 433 344 C520 320 667 318 748 340 C824 360 859 397 946 420 L1000 439 L975 469 L222 469 L202 449 Z" fill="url(#metal)" stroke="#6F6250" stroke-opacity=".32"/>
      <path d="M420 348 C487 296 647 291 737 338 L768 367 L376 367 Z" fill="#080808" stroke="#B9A687" stroke-opacity=".24"/>
      <path d="M483 343 L528 312 L572 308 L562 361 Z M583 308 L651 312 L711 353 L579 360 Z" fill="#151715" stroke="#B9A687" stroke-opacity=".14"/>
      <path d="M231 431 C409 415 781 410 960 431" fill="none" stroke="#D6C5AA" stroke-opacity=".24"/>
      <path d="M280 468 L322 468 M874 468 L923 468" stroke="#C8A97E" stroke-opacity=".6" stroke-width="3"/>
      <path d="M231 446 L325 440 M849 438 L957 446" stroke="#E7D5B6" stroke-opacity=".55" stroke-width="3"/>
    </g>
    ${rect(140, 282, 920, 245, { fill: "url(#forge-vignette)" })}`;
  return svg(`
    ${label(58, 59, "FORGE / PRIVATE ATELIER")}
    ${text(1144, 59, "AUTOMOTIVE / 01", { size: 10, fill: "#fff", spacing: 2.5, anchor: "end", opacity: .45 })}
    ${text(70, 180, "FOR THOSE WHO", { size: 67, family: "Frank Ruhl Libre", weight: 300, spacing: -1.8 })}
    ${text(70, 249, "REFUSE ORDINARY", { size: 67, family: "Frank Ruhl Libre", weight: 300, spacing: -1.8, fill: "#D7C3A4" })}
    ${line(72, 279, 184, 279, "#C8A97E", .8)}
    ${car}
    ${line(236, 514, 1000, 514, "url(#forge-beam)", .65)}
    ${label(600, 554, "BESPOKE / PERFORMANCE / CRAFT", "#B7A58C", "middle")}
    ${footer(1, "#C8A97E", ["01", "03", "05"])}
  `, defs, "#030303");
}

function apple() {
  const defs = `
    <radialGradient id="space"><stop stop-color="#17283C"/><stop offset=".52" stop-color="#090E17"/><stop offset="1" stop-color="#05070B"/></radialGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#DDF1FF" stop-opacity=".19"/><stop offset=".42" stop-color="#A8D3FF" stop-opacity=".06"/><stop offset="1" stop-color="#fff" stop-opacity=".025"/></linearGradient>
    <linearGradient id="glass-edge" x1="0" x2="1"><stop stop-color="#fff" stop-opacity=".58"/><stop offset=".5" stop-color="#A8D3FF" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity=".32"/></linearGradient>
    <filter id="apple-blur"><feGaussianBlur stdDeviation="35"/></filter>
    <filter id="apple-shadow" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="24" stdDeviation="25" flood-color="#000" flood-opacity=".55"/></filter>`;
  const glassCard = (x, y, w, h, rx, transform = "") => `<g filter="url(#apple-shadow)"${transform ? ` transform="${transform}"` : ""}>${rect(x, y, w, h, { fill: "url(#glass)", stroke: "url(#glass-edge)", rx, extra: 'stroke-width="1.2"' })}${line(x + 20, y + 1, x + w - 20, y + 1, "#fff", .32)}</g>`;
  return svg(`
    ${rect(0, 0, W, H, { fill: "url(#space)" })}
    <ellipse cx="900" cy="250" rx="280" ry="210" fill="#75A9E8" opacity=".09" filter="url(#apple-blur)"/>
    <ellipse cx="880" cy="318" rx="247" ry="247" fill="none" stroke="#A8D3FF" stroke-opacity=".16" stroke-dasharray="3 10"/>
    <ellipse cx="880" cy="318" rx="178" ry="178" fill="none" stroke="#fff" stroke-opacity=".13"/>
    ${label(58, 59, "SPATIAL / VISION OS", "#A8D3FF")}
    ${text(1144, 59, "DEPTH SYSTEM / 02", { size: 10, fill: "#fff", spacing: 2.5, anchor: "end", opacity: .45 })}
    ${text(70, 189, "SPACE,", { size: 84, family: "Frank Ruhl Libre", weight: 300, spacing: -2 })}
    ${text(70, 274, "MADE PERSONAL.", { size: 68, family: "Frank Ruhl Libre", weight: 300, spacing: -2, fill: "#C9E5FF" })}
    ${text(74, 321, "Floating interfaces. Quiet depth. A new kind of presence.", { size: 16, fill: "#fff", opacity: .55 })}
    ${glassCard(676, 151, 256, 156, 29, "rotate(-7 804 229)")}
    ${label(704, 189, "ISLAND / 01", "#A8D3FF")}
    ${line(704, 263, 876, 263, "#fff", .2)}
    ${glassCard(831, 312, 290, 183, 31, "rotate(6 976 403)")}
    ${label(862, 352, "YOUR SPACE", "#fff")}
    ${text(861, 410, "CLARITY", { size: 36, family: "Frank Ruhl Libre", weight: 300, fill: "#EAF5FF" })}
    ${text(862, 445, "Layered in light", { size: 13, fill: "#fff", opacity: .48 })}
    ${glassCard(551, 380, 190, 118, 25, "rotate(5 646 439)")}
    ${label(576, 419, "MODULE / 03", "#A8D3FF")}
    <g filter="url(#apple-shadow)">${rect(424, 74, 352, 66, { fill: "#080C12", stroke: "#A8D3FF", rx: 33, extra: 'stroke-opacity=".32"' })}${rect(437, 87, 74, 40, { fill: "url(#glass)", rx: 20 })}${text(535, 115, "DYNAMIC ISLAND", { size: 10, fill: "#D9EDFF", spacing: 2.4 })}${rect(730, 103, 24, 2, { fill: "#A8D3FF", rx: 1 })}</g>
    ${footer(2, "#A8D3FF")}
  `, defs, "#05070B");
}

function horology() {
  const defs = `
    <linearGradient id="obsidian" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#17130E"/><stop offset=".38" stop-color="#070708"/><stop offset="1" stop-color="#020203"/></linearGradient>
    <linearGradient id="champagne" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#C8A97E" stop-opacity=".22"/><stop offset=".5" stop-color="#C8A97E" stop-opacity=".035"/><stop offset="1" stop-color="#000" stop-opacity=".1"/></linearGradient>
    <linearGradient id="platinum" x1="0" x2="1"><stop stop-color="#C8A97E" stop-opacity="0"/><stop offset=".52" stop-color="#E4D3B8" stop-opacity=".85"/><stop offset="1" stop-color="#C8A97E" stop-opacity="0"/></linearGradient>`;
  return svg(`
    ${rect(0, 0, W, H, { fill: "url(#obsidian)" })}
    ${label(58, 59, "OBSIDIAN / PRIVATE FLOOR")}
    ${text(1144, 59, "VIP PENTHOUSE & 3D GALLERY", { size: 10, fill: "#C8A97E", spacing: 2.4, anchor: "end", opacity: .85 })}
    ${text(70, 175, "OBSIDIAN", { size: 76, family: "Frank Ruhl Libre", weight: 300, spacing: 1 })}
    ${text(70, 250, "PENTHOUSE", { size: 76, family: "Frank Ruhl Libre", weight: 300, spacing: -1, fill: "#C8A97E" })}
    ${text(74, 294, "PRIVATE ARCHITECTURE / CONTROLLED LIGHT", { size: 10, fill: "#fff", spacing: 2.7, opacity: .45 })}
    ${line(74, 326, 198, 326, "#C8A97E", .8)}
    ${text(74, 374, "Floating glass. Champagne platinum.", { size: 16, fill: "#EDE7DD", opacity: .66 })}
    ${text(74, 400, "A private floor composed in depth.", { size: 16, fill: "#EDE7DD", opacity: .66 })}
    <g transform="translate(635 108)">
      ${rect(80, 8, 355, 350, { fill: "#C8A97E", opacity: .025, stroke: "#C8A97E", transform: "rotate(-7 257 183)", extra: 'stroke-opacity=".3"' })}
      ${rect(12, 48, 355, 350, { fill: "#FFFFFF", opacity: .018, stroke: "#FFFFFF", transform: "rotate(8 189 223)", extra: 'stroke-opacity=".22"' })}
      ${rect(90, 80, 310, 335, { fill: "url(#champagne)", stroke: "#C8A97E", extra: 'stroke-opacity=".7"' })}
      ${line(116, 107, 374, 107, "url(#platinum)", .8)}
      ${rect(116, 136, 118, 113, { fill: "#C8A97E", opacity: .08, stroke: "#C8A97E", extra: 'stroke-opacity=".25"' })}
      ${rect(246, 136, 128, 113, { fill: "#FFFFFF", opacity: .025, stroke: "#FFFFFF", extra: 'stroke-opacity=".13"' })}
      ${rect(116, 261, 258, 104, { fill: "#000", opacity: .32, stroke: "#C8A97E", extra: 'stroke-opacity=".18"' })}
      ${label(134, 165, "AMBIENT GOLD")}
      ${label(265, 165, "TITANIUM", "#A7B2C2")}
      ${text(135, 302, "PRIVATE", { size: 27, family: "Frank Ruhl Libre", weight: 300, fill: "#EDE6DB" })}
      ${text(135, 334, "BY APPOINTMENT", { size: 9, fill: "#C8A97E", spacing: 2.4 })}
      ${rect(37, 390, 150, 35, { fill: "#040405", stroke: "#C8A97E", extra: 'stroke-opacity=".5"' })}
      ${text(62, 413, "CRIMSON STUDIO", { size: 8, fill: "#C66B68", spacing: 1.8 })}
    </g>
    ${line(74, 493, 496, 493, "#FFFFFF", .12)}
    ${text(74, 531, "01  PRIVATE ARRIVAL", { size: 10, fill: "#C8A97E", spacing: 2 })}
    ${text(294, 531, "02  ARCHITECTURAL GALLERY", { size: 10, fill: "#fff", spacing: 2, opacity: .42 })}
    ${footer(3, "#C8A97E")}
  `, defs, "#040405");
}

function kinetic() {
  const defs = `
    <linearGradient id="chrome" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#F2F5F2" stop-opacity=".7"/><stop offset=".17" stop-color="#323838" stop-opacity=".28"/><stop offset=".38" stop-color="#CDFF3D" stop-opacity=".2"/><stop offset=".56" stop-color="#0A0D0E"/><stop offset=".77" stop-color="#B6C1C1" stop-opacity=".38"/><stop offset="1" stop-color="#111516" stop-opacity=".1"/></linearGradient>
    <linearGradient id="wave" x1="0" x2="1"><stop stop-color="#CDFF3D" stop-opacity=".08"/><stop offset=".5" stop-color="#CDFF3D"/><stop offset="1" stop-color="#D8E8C9" stop-opacity=".2"/></linearGradient>
    <filter id="k-shadow" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="25" stdDeviation="24" flood-color="#000" flood-opacity=".65"/></filter>`;
  return svg(`
    ${label(58, 59, "KINETIC / MONOLITH", "#CDFF3D")}
    ${text(1144, 59, "LIQUID CHROME / LIVE SIGNAL", { size: 10, fill: "#fff", spacing: 2.4, anchor: "end", opacity: .45 })}
    ${text(62, 197, "KINETIC", { size: 105, family: "Heebo", weight: 600, spacing: -6 })}
    ${text(62, 292, "MONOLITH", { size: 105, family: "Heebo", weight: 600, spacing: -7, fill: "#CDFF3D" })}
    ${text(70, 336, "MATTER IN MOTION / SYSTEM 01", { size: 10, fill: "#fff", spacing: 3, opacity: .42 })}
    <g filter="url(#k-shadow)">
      ${rect(732, 90, 284, 318, { fill: "url(#chrome)", stroke: "#E4EBE7", transform: "translate(0 105) skewY(-9)", extra: 'stroke-opacity=".28"' })}
      ${rect(887, 177, 196, 249, { fill: "url(#chrome)", stroke: "#CDFF3D", transform: "skewY(12)", extra: 'stroke-opacity=".4"' })}
      ${rect(655, 271, 181, 155, { fill: "#CDFF3D", opacity: .07, stroke: "#CDFF3D", transform: "skewY(7)", extra: 'stroke-opacity=".4"' })}
    </g>
    ${line(633, 443, 1104, 443, "#CDFF3D", .25)}
    <g transform="translate(62 390)">
      ${rect(0, 0, 526, 158, { fill: "#080B0C", stroke: "#FFFFFF", extra: 'stroke-opacity=".14"' })}
      ${label(22, 30, "LIVE WAVE MODULATOR", "#CDFF3D")}
      ${text(500, 30, "LIVE", { size: 9, fill: "#CDFF3D", spacing: 2, anchor: "end" })}
      ${[52, 82, 112].map((y) => line(22, y, 504, y, "#FFFFFF", .08)).join("")}
      ${[122, 222, 322, 422].map((x) => line(x, 45, x, 132, "#FFFFFF", .07)).join("")}
      <path d="M22 91 C55 36 79 143 116 91 S180 49 216 91 S280 136 316 91 S380 42 416 91 S472 127 504 91" fill="none" stroke="url(#wave)" stroke-width="3"/>
      ${text(22, 149, "FREQUENCY  58.0", { size: 8, fill: "#fff", spacing: 1.6, opacity: .42 })}
      ${text(504, 149, "AMPLITUDE  +12.8", { size: 8, fill: "#fff", spacing: 1.6, anchor: "end", opacity: .42 })}
    </g>
    ${footer(4, "#CDFF3D")}
  `, defs, "#060809");
}

function swiss() {
  const defs = `
    <linearGradient id="museum" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#1C1A15"/><stop offset=".52" stop-color="#0A0A08"/><stop offset="1" stop-color="#050504"/></linearGradient>
    <linearGradient id="column" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#C8A97E" stop-opacity=".2"/><stop offset=".55" stop-color="#C8A97E" stop-opacity=".035"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></linearGradient>`;
  const grid = Array.from({ length: 17 }, (_, i) => line(i * 75, 0, i * 75, H, "#C8A97E", .09)).join("") + Array.from({ length: 10 }, (_, i) => line(0, i * 75, W, i * 75, "#C8A97E", .09)).join("");
  const columns = [
    { x: 625, w: 112, n: "01", name: "SPACE" }, { x: 749, w: 230, n: "02", name: "PROPORTION" },
    { x: 991, w: 66, n: "03", name: "LIGHT" }, { x: 1069, w: 66, n: "04", name: "FORM" },
  ];
  return svg(`
    ${rect(0, 0, W, H, { fill: "url(#museum)" })}${grid}
    ${label(58, 59, "SE / ARCHITECTURAL MUSEUM")}
    ${text(1144, 59, "EXPOSED BLUEPRINT / REVISION A", { size: 10, fill: "#fff", spacing: 2.4, anchor: "end", opacity: .45 })}
    ${text(70, 183, "SWISS", { size: 92, family: "Frank Ruhl Libre", weight: 300, spacing: -2 })}
    ${text(70, 272, "EDITORIAL", { size: 92, family: "Frank Ruhl Libre", weight: 300, spacing: -3, fill: "#C8A97E" })}
    ${text(74, 318, "SPACE / LIGHT / PROPORTION", { size: 10, fill: "#fff", spacing: 3.1, opacity: .48 })}
    ${line(74, 354, 480, 354, "#C8A97E", .45)}
    ${text(74, 398, "An architecture of details.", { size: 24, family: "Frank Ruhl Libre", weight: 300, fill: "#EAE4D9" })}
    ${text(74, 433, "A gallery measured in rhythm and restraint.", { size: 14, fill: "#fff", opacity: .48 })}
    ${columns.map((c, index) => `<g>${rect(c.x, 117, c.w, 407, { fill: index === 1 ? "url(#column)" : "#C8A97E", opacity: index === 1 ? 1 : .035, stroke: "#C8A97E", extra: `stroke-opacity="${index === 1 ? .65 : .25}"` })}${text(c.x + 15, 150, c.n, { size: 17, family: "Frank Ruhl Libre", fill: "#C8A97E" })}${line(c.x + 15, 170, c.x + c.w - 15, 170, "#C8A97E", .35)}${index === 1 ? `${text(c.x + 18, 451, c.name, { size: 25, family: "Frank Ruhl Libre", weight: 300 })}${text(c.x + 18, 483, "EXPANDING COLUMN", { size: 8, fill: "#C8A97E", spacing: 2 })}` : text(c.x + 28, 490, c.name, { size: 9, fill: "#fff", spacing: 2, opacity: .5, transform: `rotate(-90 ${c.x + 28} 490)` })}</g>`).join("")}
    ${text(74, 523, "FIG. 01 / THE ENTRANCE", { size: 9, fill: "#C8A97E", spacing: 2.3 })}
    ${footer(5, "#C8A97E")}
  `, defs, "#070706");
}

const previews = {
  "forge-automotive": forge,
  "apple-spatial": apple,
  "horology-chrono": horology,
  "kinetic-monolith": kinetic,
  "swiss-editorial": swiss,
};

await mkdir(OUTPUT, { recursive: true });
for (const [name, render] of Object.entries(previews)) {
  const target = path.join(OUTPUT, `${name}.png`);
  const source = Buffer.from(render());
  await sharp(source, { density: 144 }).resize(W, H, { fit: "fill" }).png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(target);
  const metadata = await sharp(target).metadata();
  if (metadata.width !== W || metadata.height !== H || metadata.format !== "png") throw new Error(`Invalid preview output: ${name}`);
  const file = await stat(target);
  console.log(`${name}.png — ${metadata.width}×${metadata.height} — ${file.size} bytes`);
}
