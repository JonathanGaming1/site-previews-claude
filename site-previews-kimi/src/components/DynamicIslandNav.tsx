"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, MessageCircle, Phone, Star } from "lucide-react";
import { useSite } from "@/components/SiteProvider";
import type { LuxTheme } from "@/lib/luxtheme";

const NAV_ITEMS = [
  { href: "#services", label: "שירותים" },
  { href: "#projects", label: "פרויקטים" },
  { href: "#reviews", label: "ביקורות" },
  { href: "#contact", label: "צור קשר" },
];

export function DynamicIslandNav({ theme }: { theme: LuxTheme }) {
  const { data } = useSite();
  const [expanded, setExpanded] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const podRef = useRef<HTMLDivElement | null>(null);

  const city = data.businessInfo.address.split(",")[0]?.trim() || "באזור שלכם";
  const status = expanded ? `פתוח כעת • זמינות לפרויקטים ב${city}` : "פתוח כעת";
  const glassBg = theme.dark ? "rgba(18,18,22,0.66)" : "rgba(255,255,255,0.62)";
  const glassBorder = theme.dark ? "rgba(255,255,255,0.14)" : "rgba(15,18,26,0.10)";

  const scrollTo = (href: string) => {
    setExpanded(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    if (!expanded) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setExpanded(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setExpanded(false); };
    document.addEventListener("pointerdown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [expanded]);

  useEffect(() => {
    const el = podRef.current;
    if (!el) return;
    const onScroll = () => {
      const scrolledNow = window.scrollY > 40;
      if (el.dataset.scrolled === String(scrolledNow)) return;
      el.dataset.scrolled = String(scrolledNow);
      el.style.boxShadow = scrolledNow
        ? `0 18px 44px rgba(0,0,0,${theme.dark ? 0.55 : 0.18}), inset 0 1px 0 rgba(255,255,255,0.08)`
        : `0 8px 26px rgba(0,0,0,${theme.dark ? 0.35 : 0.12}), inset 0 1px 0 rgba(255,255,255,0.08)`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [theme.dark]);

  return (
    <div ref={wrapRef} className="pointer-events-none fixed inset-x-0 top-3 z-[9700] flex justify-center px-4" data-camera-interactive="true">
      <motion.div
        layout
        ref={podRef}
        data-scrolled={false}
        onMouseEnter={() => setExpanded(true)}
        className="pointer-events-auto flex cursor-pointer flex-col items-center overflow-hidden backdrop-blur-2xl"
        style={{
          background: glassBg,
          border: `1px solid ${glassBorder}`,
          borderRadius: 28,
          boxShadow: `0 8px 26px rgba(0,0,0,${theme.dark ? 0.35 : 0.12}), inset 0 1px 0 rgba(255,255,255,0.08)`,
          WebkitBackdropFilter: "blur(24px saturate(180%))",
          backdropFilter: "blur(24px saturate(180%))",
        }}
        initial={{ y: -72, opacity: 0 }}
        animate={{ y: 0, opacity: 1, width: expanded ? "min(560px, 92vw)" : "min(270px, 70vw)" }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-label="ניווט דינמי"
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setExpanded((v) => !v); }}
      >
        <motion.div layout className="flex w-full items-center justify-between gap-3 px-5 py-2.5" dir="rtl">
          <span className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: theme.headline }}>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#30d158] opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#30d158]" />
            </span>
            {status}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-300" style={{ color: theme.muted, transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }} aria-hidden="true" />
        </motion.div>

        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }} className="w-full">
              <div className="w-full px-5 pb-4 pt-1" style={{ borderTop: `1px solid ${theme.dark ? "rgba(255,255,255,0.08)" : "rgba(15,18,26,0.06)"}` }}>
                <div className="mt-2 mb-3 flex items-center justify-between gap-3 rounded-2xl px-4 py-3" style={{ background: theme.dark ? "rgba(255,255,255,0.05)" : "rgba(15,18,26,0.04)" }}>
                  <span className="flex items-center gap-2 text-xs" style={{ color: theme.muted }}>
                    <Star className="h-3.5 w-3.5" style={{ color: theme.accent, fill: theme.accent }} aria-hidden="true" />
                    זמינות לפרויקטים ב{city}
                  </span>
                  <span className="text-xs font-bold" style={{ color: theme.accent }}>{data.businessInfo.openingHours}</span>
                </div>

                <nav className="grid grid-cols-4 gap-2" dir="rtl">
                  {NAV_ITEMS.map((item) => (
                    <button key={item.href} onClick={(e) => { e.stopPropagation(); scrollTo(item.href); }} className="min-h-11 rounded-xl px-2 py-2.5 text-xs font-semibold transition hover:bg-white/10" style={{ background: theme.dark ? "rgba(255,255,255,0.05)" : "rgba(15,18,26,0.04)", color: theme.text }} type="button">
                      {item.label}
                    </button>
                  ))}
                </nav>

                <div className="mt-3 flex gap-2" dir="rtl">
                  <motion.a href={`https://wa.me/${data.businessInfo.whatsapp}?text=${encodeURIComponent(`היי, אשמח לפרטים נוספים ${data.businessInfo.name}`)}`} target="_blank" rel="noopener noreferrer" whileTap={{ scale: 0.97 }} onClick={(e) => e.stopPropagation()} className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold" style={{ background: theme.accent, color: theme.dark ? "#14100a" : "#fdf9f3" }}>
                    <MessageCircle className="h-4 w-4" fill="currentColor" aria-hidden="true" />
                    וואטסאפ מיידי
                  </motion.a>
                  <motion.a href={`tel:${data.businessInfo.phone}`} whileTap={{ scale: 0.97 }} onClick={(e) => e.stopPropagation()} className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold" style={{ background: theme.dark ? "rgba(255,255,255,0.07)" : "rgba(15,18,26,0.05)", color: theme.headline }}>
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    {data.businessInfo.phone}
                  </motion.a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
