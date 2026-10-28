"use client";

import React from "react";
import { ArchitecturalExperience, type ArchitecturalConfig } from "@/templates/ArchitecturalExperience";

const config: ArchitecturalConfig = {
  variant: "kinetic",
  studio: "KINETIC / CONSTRUCTION LAB",
  portalTitle: "3D Exploded Blueprint & Construction Showcase",
  portalLabel: "INDUSTRIAL LOFT / X-RAY PORTAL",
  windowName: "STRUCTURAL STEEL WINDOW",
  defaultMode: "night",
  accent: "#C8A97E",
  secondary: "#CDFF3D",
  interiorImage: "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=2000&q=88",
  beforeImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=85",
  afterImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=85",
  materials: [
    { id: "concrete", label: "בטון מזויף", english: "BOARD-FORMED CONCRETE", multiplier: 1, css: "repeating-linear-gradient(90deg,#777870 0 2px,#a3a399 2px 38px,#6d6e68 38px 40px)" },
    { id: "corten", label: "פלדת קורטן", english: "WEATHERED CORTEN", multiplier: 1.17, css: "linear-gradient(115deg,#4b2518,#a34f29 42%,#593023 68%,#bc6a36)" },
    { id: "graphite", label: "גרפיט טכני", english: "TECHNICAL GRAPHITE", multiplier: 1.22, css: "repeating-linear-gradient(45deg,#151719 0 3px,#34383a 3px 5px,#101112 5px 8px)" },
  ],
};

export function KineticMonolithTemplate() {
  return <ArchitecturalExperience config={config} />;
}
