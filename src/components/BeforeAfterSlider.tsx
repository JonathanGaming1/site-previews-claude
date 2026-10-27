"use client";

import React, { useCallback, useRef } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import { MoveHorizontal } from "lucide-react";
import type { LuxTheme } from "@/lib/luxtheme";

interface BeforeAfterSliderProps {
  theme: LuxTheme;
  beforeImage?: string;
  afterImage?: string;
  beforeLabel?: string;
  afterLabel?: string;
  caption?: string;
  handleColor?: string;
}

/** Pointer- and keyboard-accessible split comparison with ref-based motion. */
export function BeforeAfterSlider({
  theme,
  beforeImage,
  afterImage,
  beforeLabel = "סטנדרט עבודה רגיל",
  afterLabel = "הסטנדרט הבספוק שלנו",
  caption = "גררו את הידית המתכתית וראו את ההפרש בעיניים",
  handleColor,
}: BeforeAfterSliderProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const afterRef = useRef<HTMLDivElement | null>(null);
  const splitRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);
  const frame = useRef<number | null>(null);
  const pendingX = useRef<number | null>(null);
  const accent = handleColor ?? theme.accent;

  const flush = useCallback(() => {
    frame.current = null;
    const wrap = wrapRef.current;
    const x = pendingX.current;
    if (!wrap || x === null) return;
    pendingX.current = null;
    const rect = wrap.getBoundingClientRect();
    const pct = Math.min(94, Math.max(6, ((x - rect.left) / rect.width) * 100));
    if (afterRef.current) afterRef.current.style.clipPath = `inset(0 0 0 ${pct}%)`;
    if (splitRef.current) splitRef.current.style.left = `${pct}%`;
    wrap.setAttribute("aria-valuenow", String(Math.round(pct)));
  }, []);

  const schedule = useCallback((clientX: number) => {
    pendingX.current = clientX;
    if (frame.current === null) frame.current = requestAnimationFrame(flush);
  }, [flush]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    schedule(e.clientX);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragging.current) schedule(e.clientX);
  };
  const onPointerUp = () => { dragging.current = false; };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const current = ((splitRef.current?.offsetLeft ?? rect.width / 2) / rect.width) * 100;
    let target = current;
    if (e.key === "ArrowLeft") target = Math.max(6, current - 4);
    if (e.key === "ArrowRight") target = Math.min(94, current + 4);
    if (target !== current) {
      e.preventDefault();
      schedule(rect.left + (target / 100) * rect.width);
    }
  };

  const handleInk = theme.dark ? "#14100a" : "#fdf9f3";

  return (
    <div className="w-full" data-camera-interactive="true">
      {caption && <p className="mb-3 text-center text-sm leading-7" style={{ color: theme.muted }}>{caption}</p>}

      <div
        ref={wrapRef}
        role="slider"
        tabIndex={0}
        aria-valuenow={50}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="השוואת לפני ואחרי"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerUp}
        onKeyDown={onKeyDown}
        className="relative h-[300px] w-full cursor-ew-resize select-none overflow-hidden outline-none focus-visible:ring-2 md:h-[440px]"
        style={{ border: `1px solid ${theme.border}`, background: theme.surface, touchAction: "pan-x" }}
      >
        {beforeImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={beforeImage} alt={beforeLabel} draggable={false} className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-10" style={{ background: theme.dark ? "linear-gradient(135deg, #191713, #22201b)" : "linear-gradient(135deg, #e7e2d8, #d9d2c4)" }}>
            <span className="text-center text-lg font-light" style={{ color: theme.muted }}>{beforeLabel}</span>
          </div>
        )}

        <div ref={afterRef} className="pointer-events-none absolute inset-0" style={{ clipPath: "inset(0 0 0 50%)" }} dir="ltr">
          {afterImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={afterImage} alt={afterLabel} draggable={false} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-10">
              <span className="text-center text-lg font-normal" style={{ color: theme.dark ? "#efe7d8" : "#2a2118" }}>{afterLabel}</span>
            </div>
          )}
        </div>

        <div ref={splitRef} className="pointer-events-none absolute inset-y-0 z-20" style={{ left: "50%", width: 2 }} dir="ltr">
          <span className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2" style={{ background: `linear-gradient(180deg, transparent, ${accent} 12%, rgba(255,255,255,0.55) 50%, ${accent} 88%, transparent)` }} />
          <span className="absolute top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full" style={{ background: `linear-gradient(145deg, ${lightenOrDarken(accent, 0.35)}, ${accent}, ${lightenOrDarken(accent, -0.25)})`, boxShadow: "0 6px 20px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -2px 4px rgba(0,0,0,0.3)", color: handleColor === undefined && !theme.dark ? "#14100a" : "#151007" }}>
            <MoveHorizontal className="h-5 w-5" aria-hidden="true" strokeWidth={2.4} />
          </span>
        </div>

        <span className="pointer-events-none absolute bottom-4 right-4 z-10 px-3.5 py-1.5 text-[11px] font-normal tracking-wide backdrop-blur" style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }} dir="rtl">{beforeLabel}</span>
        <span className="pointer-events-none absolute bottom-4 left-4 z-10 px-3.5 py-1.5 text-[11px] font-medium" style={{ background: accent, color: handleInk }} dir="rtl">{afterLabel}</span>
      </div>
    </div>
  );
}

function lightenOrDarken(hex: string, amount: number): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return hex;
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const target = amount > 0 ? 255 : 0;
  const f = Math.abs(amount);
  const mix = (c: number) => clamp(c + (target - c) * f);
  return `#${[mix(r), mix(g), mix(b)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}
