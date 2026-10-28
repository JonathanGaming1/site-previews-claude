"use client";

import React from "react";
import { ArchitecturalExperience, type ArchitecturalConfig } from "@/templates/ArchitecturalExperience";

const config: ArchitecturalConfig = {
  variant: "horology",
  studio: "OBSIDIAN / INTERIOR ATELIER",
  portalTitle: "Bespoke Kitchen & Interior Atelier",
  portalLabel: "MEDITERRANEAN ARCHED VILLA",
  windowName: "GRAND STONE ARCHWAY",
  defaultMode: "night",
  accent: "#C8A97E",
  secondary: "#D8BE8B",
  interiorImage: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=2000&q=88",
  beforeImage: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1800&q=85",
  afterImage: "https://images.unsplash.com/photo-1600585152915-d208bec867a1?auto=format&fit=crop&w=1800&q=85",
  materials: [
    { id: "stone", label: "אבן טרוורטין", english: "VEIN-CUT STONE", multiplier: 1.12, css: "repeating-linear-gradient(97deg,#b7a58b 0 2px,#e0d2ba 2px 7px,#c9b89e 7px 10px)" },
    { id: "wood", label: "עץ אלון מעושן", english: "SMOKED OAK", multiplier: 1.04, css: "repeating-linear-gradient(94deg,#4a3021 0 3px,#79543a 3px 8px,#382219 8px 11px)" },
    { id: "brass", label: "פליז מוברש", english: "BRUSHED BRASS", multiplier: 1.28, css: "repeating-linear-gradient(0deg,#8d6b32 0 1px,#d2b16a 1px 3px,#a17f42 3px 5px)" },
  ],
};

export function HorologyChronoTemplate() {
  return <ArchitecturalExperience config={config} />;
}
