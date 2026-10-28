"use client";

import React from "react";
import { ArchitecturalExperience, type ArchitecturalConfig } from "@/templates/ArchitecturalExperience";

const config: ArchitecturalConfig = {
  variant: "forge",
  studio: "FORGE / ARCHITECTURAL ATELIER",
  portalTitle: "The Glass Villa Window Portal",
  portalLabel: "BLACK-STEEL PANORAMIC VILLA",
  windowName: "PANORAMIC VILLA WINDOW",
  defaultMode: "night",
  accent: "#C8A97E",
  secondary: "#91A0AA",
  interiorImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=88",
  beforeImage: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1800&q=85",
  afterImage: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1800&q=85",
  materials: [
    { id: "limestone", label: "אבן גיר", english: "HONED LIMESTONE", multiplier: 1, css: "linear-gradient(115deg,#d9d1c1,#f0eadf 48%,#bcb3a1)" },
    { id: "walnut", label: "אגוז מלטש", english: "SMOKED WALNUT", multiplier: 1.16, css: "repeating-linear-gradient(96deg,#35251b 0 3px,#5b4030 3px 8px,#2a1c16 8px 12px)" },
    { id: "steel", label: "פלדה שחורה", english: "BLACKENED STEEL", multiplier: 1.24, css: "linear-gradient(125deg,#08090a,#42464a 45%,#111214 72%,#5b5d5e)" },
  ],
};

export function ForgeAutomotiveTemplate() {
  return <ArchitecturalExperience config={config} />;
}
