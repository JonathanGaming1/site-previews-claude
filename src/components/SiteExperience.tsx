"use client";

import React from "react";
import { SiteProvider, useSite } from "@/components/SiteProvider";
import { AdminToolbar } from "@/components/AdminToolbar";
import { SecurityGuard } from "@/components/SecurityGuard";
import { ViewTracker } from "@/components/ViewTracker";
import { AdminLogin } from "@/components/AdminLogin";
import { ForgeAutomotiveTemplate } from "@/templates/ForgeAutomotiveTemplate";
import { AppleSpatialTemplate } from "@/templates/AppleSpatialTemplate";
import { HorologyChronoTemplate } from "@/templates/HorologyChronoTemplate";
import { KineticMonolithTemplate } from "@/templates/KineticMonolithTemplate";
import { SwissEditorialTemplate } from "@/templates/SwissEditorialTemplate";

function TemplateRenderer() {
  const { data } = useSite();
  switch (data.templateId) {
    case "forge-automotive": return <ForgeAutomotiveTemplate />;
    case "horology-chrono": return <HorologyChronoTemplate />;
    case "kinetic-monolith": return <KineticMonolithTemplate />;
    case "swiss-editorial": return <SwissEditorialTemplate />;
    case "apple-spatial":
    default: return <AppleSpatialTemplate />;
  }
}

function ExperienceShell() {
  return (
    <>
      <ViewTracker />
      <TemplateRenderer />
      <AdminToolbar />
      <AdminLogin />
      <SecurityGuard />
    </>
  );
}

export function SiteExperience() {
  return <SiteProvider><ExperienceShell /></SiteProvider>;
}
