"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Clock, Crown, Phone, X } from "lucide-react";
import { useSite } from "@/components/SiteProvider";
import type { LuxTheme } from "@/lib/luxtheme";

const WINDOWS = [
  { value: "morning", label: "בוקר", range: "08:00–12:00" },
  { value: "noon", label: "צהריים", range: "12:00–16:00" },
  { value: "evening", label: "ערב", range: "16:00–20:00" },
] as const;

interface VipConciergeDrawerProps {
  theme: LuxTheme;
  triggerPosition?: "left" | "right";
  className?: string;
}

export function VipConciergeDrawer({ theme, triggerPosition = "left" }: VipConciergeDrawerProps) {
  const { data } = useSite();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [slot, setSlot] = useState<(typeof WINDOWS)[number]["value"]>("morning");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const bookCallback = () => {
    const w = WINDOWS.find((x) => x.value === slot);
    const msg = `בקשת החזרה VIP מהאתר של ${data.businessInfo.name}.\n` +
      `• שם: ${name || "—"}\n` +
      `• טלפון: ${phone || "—"}\n` +
      `• חלון מועדף לחזרה: ${w?.label} (${w?.range}).\n` +
      "תיאמו איתי שיחת ייעוץ בעדיפות ראשונה.";
    window.open(`https://wa.me/${data.businessInfo.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  const triggerSide = triggerPosition === "left" ? "left-5" : "right-5";
  const drawerSide = triggerPosition === "left" ? "left-0" : "right-0";
  const drawerIn = triggerPosition === "left" ? "-105%" : "105%";
  const inputStyle: React.CSSProperties = {
    background: theme.dark ? "rgba(255,255,255,0.05)" : "rgba(15,18,26,0.03)",
    border: `1px solid ${theme.border}`,
    color: theme.headline,
  };

  return (
    <>
      <motion.button
        initial={{ scale: 0.95, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 240, damping: 20 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        data-camera-interactive="true"
        className={`fixed bottom-24 z-[9100] hidden min-h-11 items-center gap-2 rounded-full px-5 py-3 text-sm font-bold shadow-2xl md:flex ${triggerSide}`}
        style={{ background: `linear-gradient(120deg, ${theme.accent}, ${theme.accent}d9)`, color: theme.dark ? "#14100a" : "#fdf9f3" }}
      >
        <Crown className="h-4 w-4" aria-hidden="true" />
        שיחת קונסיירז' VIP
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="fixed inset-0 z-[93000] bg-black/60 backdrop-blur-sm" />
            <motion.aside
              initial={{ x: drawerIn }}
              animate={{ x: 0 }}
              exit={{ x: drawerIn }}
              transition={{ type: "spring", stiffness: 320, damping: 33 }}
              className={`fixed inset-y-0 ${drawerSide} z-[93100] flex w-full max-w-md flex-col overflow-y-auto p-7 pb-24 shadow-2xl`}
              style={{ background: theme.dark ? "rgba(14,12,10,0.98)" : "rgba(255,252,246,0.98)", color: theme.headline, backdropFilter: "blur(24px)" }}
              role="dialog"
              aria-modal="true"
              aria-label="שיחת קונסיירז' VIP"
              data-camera-interactive="true"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: `${theme.accent}1f`, color: theme.accent }}><Crown className="h-5 w-5" aria-hidden="true" /></span>
                <button onClick={() => setOpen(false)} aria-label="סגור" className="flex min-h-11 min-w-11 items-center justify-center rounded-lg p-1.5 transition hover:bg-white/5" style={{ color: theme.muted }}><X className="h-5 w-5" /></button>
              </div>
              <h3 className="text-2xl font-bold leading-10" style={{ fontFamily: theme.fontSerif, color: theme.headline }}>שיחת קונסיירז' אישית</h3>
              <p className="mb-6 mt-1 text-sm leading-7" style={{ color: theme.muted }}>תיאום עדיפות טלפונית מול הסטודיו של {data.businessInfo.name} — בלי תור, בלי המתנה. בחרו חלון שנוח לכם ואנחנו חוזרים אליכם.</p>

              <label className="mb-4 block">
                <span className="mb-1.5 block text-sm font-semibold" style={{ color: theme.headline }}>השם שלכם</span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="למשל: דנה כהן" className="min-h-11 w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2" style={inputStyle} />
              </label>
              <label className="mb-6 block">
                <span className="mb-1.5 block text-sm font-semibold" style={{ color: theme.headline }}>מספר טלפון</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" dir="ltr" placeholder="050-0000000" className="min-h-11 w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2" style={inputStyle} />
              </label>

              <p className="mb-2 text-sm font-semibold" style={{ color: theme.headline }}>מתי נוח לכם שנחזור?</p>
              <div className="mb-8 flex flex-col gap-2">
                {WINDOWS.map((w) => {
                  const active = slot === w.value;
                  return (
                    <button key={w.value} type="button" onClick={() => setSlot(w.value)} className="flex min-h-11 items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold transition" style={{ border: `1px solid ${active ? theme.accent : theme.border}`, background: active ? `${theme.accent}1a` : "transparent", color: theme.text }}>
                      <span className="flex items-center gap-2.5"><Clock className="h-4 w-4" style={{ color: theme.accent }} aria-hidden="true" />{w.label}<span className="text-xs opacity-60" dir="ltr">{w.range}</span></span>
                      {active && <Check className="h-4 w-4" style={{ color: theme.accent }} aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>

              <button type="button" onClick={bookCallback} className="mt-auto flex min-h-12 items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold shadow-xl transition hover:brightness-110" style={{ background: theme.accent, color: theme.dark ? "#14100a" : "#fdf9f3" }}>
                <Phone className="h-5 w-5" aria-hidden="true" />
                הזמינו שיחת קונסיירז' VIP
              </button>
              <p className="mt-3 text-center text-xs leading-6" style={{ color: theme.muted }}>הבקשה נשלחת ישירות לוואטסאפ של {data.businessInfo.name} עם החלון שבחרתם.</p>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
