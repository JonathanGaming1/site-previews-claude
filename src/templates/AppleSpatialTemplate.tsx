"use client";

import React from "react";
import { ArchitecturalExperience, type ArchitecturalConfig } from "@/templates/ArchitecturalExperience";

const config: ArchitecturalConfig = {
  variant: "apple",
  studio: "SPATIAL / PENTHOUSE OS",
  portalTitle: "Floating Penthouse Glass Islands",
  portalLabel: "SKYLIGHT & FLOATING GLASS PENTHOUSE",
  windowName: "FLOATING ATRIUM APERTURE",
  defaultMode: "night",
  accent: "#C8A97E",
  secondary: "#A8D3FF",
  interiorImage: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=88",
  beforeImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=85",
  afterImage: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1800&q=85",
  materials: [
    { id: "frost", label: "זכוכית חלבית", english: "FROSTED GLASS", multiplier: 1.08, css: "linear-gradient(125deg,rgba(255,255,255,.9),rgba(168,211,255,.4),rgba(255,255,255,.7))" },
    { id: "oak", label: "אלון מוקצף", english: "PALE OAK", multiplier: 1, css: "repeating-linear-gradient(94deg,#c8b394 0 3px,#dfceb0 3px 9px,#bda583 9px 12px)" },
    { id: "aluminum", label: "אלומיניום מוברש", english: "BRUSHED ALUMINUM", multiplier: 1.18, css: "repeating-linear-gradient(0deg,#a7adb2 0 1px,#d4d8da 1px 3px,#92999e 3px 4px)" },
  ],
};

export function AppleSpatialTemplate() {
  return <ArchitecturalExperience config={config} />;
}
