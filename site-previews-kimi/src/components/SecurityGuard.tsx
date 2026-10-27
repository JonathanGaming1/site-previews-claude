"use client";

import React from "react";
import { ShieldAlert } from "lucide-react";
import { useSite } from "@/components/SiteProvider";

export function SecurityGuard() {
  const { data, isAdmin, mounted, slug } = useSite();
  if (!mounted || data.isDemo !== true || isAdmin) return null;
  const checkoutHref = "/checkout?site=" + encodeURIComponent(slug ?? data.slug ?? "default");

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-[99999] flex justify-center px-4">
      <a href={checkoutHref} className="pointer-events-auto flex w-full max-w-2xl items-center justify-center gap-2 border border-white/20 bg-black/60 px-5 py-3 text-center text-sm text-white shadow-2xl backdrop-blur-3xl transition hover:bg-black/75">
        <ShieldAlert size={15} className="shrink-0 text-white/70" />
        <span>אתר בהדגמה עבור <strong>{data.businessInfo.name}</strong> · <span className="underline underline-offset-4">לרכישת האתר המלא</span></span>
      </a>
    </div>
  );
}
