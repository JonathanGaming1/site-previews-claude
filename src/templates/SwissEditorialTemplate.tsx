"use client";

import React from "react";
import { ArchitecturalExperience, type ArchitecturalConfig } from "@/templates/ArchitecturalExperience";

const config: ArchitecturalConfig = {
  variant: "swiss",
  studio: "SE / DAYLIGHT ARCHITECTURE",
  portalTitle: "Daylight Architectural Gallery",
  portalLabel: "MUSEUM PAVILION / FOLDING WALLS",
  windowName: "MINIMALIST GALLERY FRAME",
  defaultMode: "day",
  accent: "#A98555",
  secondary: "#C8A97E",
  interiorImage: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2000&q=88",
  beforeImage: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1800&q=85",
  afterImage: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=85",
  materials: [
    { id: "alabaster", label: "אלבסטר טבעי", english: "NATURAL ALABASTER", multiplier: 1.06, css: "linear-gradient(112deg,#e7ddc9,#fff8e9 45%,#cfc0a4)" },
    { id: "ash", label: "עץ מילה", english: "EUROPEAN ASH", multiplier: 1, css: "repeating-linear-gradient(96deg,#c7b699 0 2px,#e2d5bb 2px 8px,#bbaa8d 8px 10px)" },
    { id: "bronze", label: "ברונזה מלוטשת", english: "SATIN BRONZE", multiplier: 1.21, css: "repeating-linear-gradient(0deg,#8d6945 0 1px,#c19b71 1px 3px,#9d7b56 3px 5px)" },
  ],
};

export function SwissEditorialTemplate() {
  return <ArchitecturalExperience config={config} />;
}
