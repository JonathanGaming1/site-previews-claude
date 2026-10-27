import type { LuxTheme } from "@/lib/luxtheme";
import type { TemplateId } from "@/types/site";

export const LUX_THEMES: Record<TemplateId, LuxTheme> = {
  "apple-spatial": {
    accent: "#9bbce8", dark: true, pageBg: "#07080c",
    surface: "rgba(255,255,255,0.075)", border: "rgba(255,255,255,0.15)",
    headline: "#f5f6f8", text: "rgba(245,246,248,0.80)", muted: "rgba(245,246,248,0.58)",
    fontSerif: undefined,
  },
  "forge-automotive": {
    accent: "#c8a97e", dark: true, pageBg: "#030303",
    surface: "rgba(255,255,255,0.035)", border: "rgba(255,255,255,0.12)",
    headline: "#f4efe6", text: "rgba(244,239,230,0.80)", muted: "rgba(244,239,230,0.56)",
    fontSerif: "'Frank Ruhl Libre', serif",
  },
  "horology-chrono": {
    accent: "#C8A97E", dark: true, pageBg: "#040405",
    surface: "rgba(200,169,126,0.065)", border: "rgba(200,169,126,0.24)",
    headline: "#f2efe8", text: "rgba(242,239,232,0.82)", muted: "rgba(242,239,232,0.58)",
    fontSerif: "'Frank Ruhl Libre', serif",
  },
  "kinetic-monolith": {
    accent: "#cdff3d", dark: true, pageBg: "#07080a",
    surface: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.10)",
    headline: "#f2f4f6", text: "rgba(242,244,246,0.80)", muted: "rgba(242,244,246,0.56)",
    fontSerif: undefined,
  },
  "swiss-editorial": {
    accent: "#c8a97e", dark: true, pageBg: "#070706",
    surface: "rgba(255,255,255,0.035)", border: "rgba(200,169,126,0.20)",
    headline: "#f0ece4", text: "rgba(240,236,228,0.78)", muted: "rgba(240,236,228,0.56)",
    fontSerif: "'Frank Ruhl Libre', serif",
  },
};
