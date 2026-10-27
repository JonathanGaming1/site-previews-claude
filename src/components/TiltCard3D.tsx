"use client";

import React, { useCallback, useRef } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from "react";

interface TiltCard3DProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  perspective?: number;
  maxTilt?: number;
  glare?: number;
}

/** Zero-state 3D tilt with a cursor-tracked specular studio highlight. */
export function TiltCard3D({
  children,
  className = "",
  style,
  perspective = 1200,
  maxTilt = 12,
  glare = 0.18,
}: TiltCard3DProps) {
  const frame = useRef<number | null>(null);
  const pending = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const glareRef = useRef<HTMLSpanElement | null>(null);

  const flush = useCallback(() => {
    frame.current = null;
    const card = cardRef.current;
    const p = pending.current;
    if (!card || !p) return;
    card.style.transform = `rotateX(${p.x.toFixed(2)}deg) rotateY(${p.y.toFixed(2)}deg) translateZ(10px) scale(1.015)`;
    const g = glareRef.current;
    if (g) {
      g.style.background = `radial-gradient(380px circle at ${p.px}% ${p.py}%, rgba(255,255,255,${glare}), transparent 62%)`;
      g.style.opacity = "1";
    }
  }, [glare]);

  const schedule = useCallback(() => {
    if (frame.current === null) frame.current = requestAnimationFrame(flush);
  }, [flush]);

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    pending.current = { x: -(py - 0.5) * 2 * maxTilt, y: (px - 0.5) * 2 * maxTilt, px: px * 100, py: py * 100 };
    schedule();
  }, [maxTilt, schedule]);

  const reset = useCallback(() => {
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
    pending.current = null;
    const card = cardRef.current;
    if (card) card.style.transform = "rotateX(0deg) rotateY(0deg) translateZ(0)";
    const g = glareRef.current;
    if (g) g.style.opacity = "0";
  }, []);

  return (
    <div style={{ perspective: `${perspective}px`, transformStyle: "preserve-3d" }}>
      <div
        ref={cardRef}
        onPointerMove={glare > 0 || maxTilt > 0 ? onPointerMove : undefined}
        onPointerLeave={reset}
        className={`relative will-change-transform transition-transform duration-200 ease-out ${className}`}
        style={{ ...style, transform: "rotateX(0deg) rotateY(0deg) translateZ(0)", transformStyle: "preserve-3d" }}
      >
        {glare > 0 && (
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden" style={{ borderRadius: "inherit" }}>
            <span ref={glareRef} className="absolute inset-0" style={{ opacity: 0, mixBlendMode: "soft-light", transition: "opacity 180ms ease" }} />
          </span>
        )}
        {children}
      </div>
    </div>
  );
}
