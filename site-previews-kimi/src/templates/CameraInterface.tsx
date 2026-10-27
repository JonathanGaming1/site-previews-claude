"use client";

import React from "react";
import { AnimatePresence, motion, useTransform, type MotionValue } from "framer-motion";

export interface CameraChapter { code: string; title: string }
interface CameraInterfaceProps {
  brand: string;
  chapters: CameraChapter[];
  activeScene: number;
  jumpToScene: (index: number) => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  smoothProgress: MotionValue<number>;
  zDepthReadout: MotionValue<string>;
  lightX: MotionValue<number>;
  lightY: MotionValue<number>;
  cursorX: MotionValue<number>;
  cursorY: MotionValue<number>;
  accent: string;
  menuLabel: string;
  contactLine?: string;
}

export function CameraInterface(props: CameraInterfaceProps) {
  const { brand, chapters, activeScene, jumpToScene, menuOpen, setMenuOpen, smoothProgress, zDepthReadout, lightX, lightY, cursorX, cursorY, accent, menuLabel, contactLine } = props;
  const spotlight = useTransform([lightX, lightY], (values: number[]) => `radial-gradient(ellipse 760px 620px at ${values[0]}% ${values[1]}%, ${accent}20, ${accent}08 34%, transparent 74%)`);
  const cursorGlow = useTransform([lightX, lightY], (values: number[]) => `radial-gradient(ellipse 62% 58% at ${values[0]}% ${values[1]}%, ${accent}16, transparent 68%)`);

  return (
    <>
      <motion.div aria-hidden="true" className="pointer-events-none fixed inset-0 z-10" style={{ background: spotlight }} />
      <motion.div aria-hidden="true" className="pointer-events-none fixed inset-0 z-10 opacity-70" style={{ background: cursorGlow }} />
      <motion.div aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[90] hidden h-8 w-8 border bg-black/10 backdrop-blur-sm md:block" style={{ x: cursorX, y: cursorY, translateX: "-50%", translateY: "-50%", borderColor: `${accent}80` }}>
        <span className="absolute left-1/2 top-1/2 h-px w-3 -translate-x-1/2 -translate-y-1/2" style={{ background: accent }} />
      </motion.div>

      <header className="fixed inset-x-0 top-0 z-40 flex min-h-[72px] items-center justify-between gap-3 border-b border-white/[.07] bg-black/25 px-5 py-4 backdrop-blur-xl md:px-12">
        <button type="button" onClick={() => jumpToScene(0)} className="min-h-11 text-left text-[9px] tracking-[.26em] text-white/65 transition hover:text-white" dir="ltr">{menuLabel}</button>
        <button type="button" onClick={() => jumpToScene(0)} className="min-h-11 max-w-[46vw] text-center font-frank text-sm font-light leading-6 tracking-[.08em] text-white md:text-lg" style={{ color: accent }}>{brand}</button>
        <button type="button" onClick={() => setMenuOpen(true)} className="flex min-h-11 items-center gap-3 text-[9px] tracking-[.2em] text-white/75" dir="ltr"><span className="hidden sm:inline">INDEX</span><span className="flex w-6 flex-col gap-1.5"><span className="h-px w-full bg-white/80" /><span className="ml-auto h-px w-2/3" style={{ background: accent }} /></span></button>
      </header>

      <aside className="fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex xl:left-8">
        <motion.span className="mb-1 text-[8px] tracking-[.18em] text-white/45 [writing-mode:vertical-rl]" dir="ltr">{zDepthReadout}</motion.span>
        <div className="relative h-32 w-px bg-white/15"><motion.div className="absolute inset-0" style={{ scaleY: smoothProgress, transformOrigin: "top", background: accent }} /></div>
        <div className="mt-1 flex flex-col gap-1">{chapters.map((chapter, index) => <button key={chapter.code} type="button" onClick={() => jumpToScene(index)} title={chapter.title} className="min-h-9 px-2 text-[9px] tracking-widest transition" style={{ color: activeScene === index ? accent : "rgba(255,255,255,.35)" }}>{chapter.code}</button>)}</div>
      </aside>

      <div className="pointer-events-none fixed inset-x-4 bottom-[4.5rem] z-40 flex items-end justify-between md:inset-x-12 md:bottom-6">
        <nav aria-label="ניווט בין סצנות" className="pointer-events-auto flex items-center gap-1 border border-white/10 bg-black/75 px-2 py-1 backdrop-blur-xl md:gap-3 md:px-3" data-camera-interactive="true">
          {chapters.map((chapter, index) => <button key={chapter.code} type="button" onClick={() => jumpToScene(index)} aria-label={`${chapter.code} — ${chapter.title}`} aria-current={activeScene === index ? "step" : undefined} className="min-h-11 min-w-9 px-1.5 text-[9px] tracking-[.16em] transition md:px-2" style={{ color: activeScene === index ? accent : "rgba(255,255,255,.42)" }}>{chapter.code}</button>)}
        </nav>
        <span className="hidden pb-4 text-[8px] tracking-[.2em] text-white/40 md:block" dir="ltr">WHEEL / TOUCH / KEYS — CAMERA FLIGHT</span>
      </div>

      <AnimatePresence>
        {menuOpen && <motion.div initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }} animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }} exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }} transition={{ duration: .45, ease: [.22, 1, .36, 1] }} className="fixed inset-0 z-[80] flex flex-col overflow-y-auto bg-[#050505]/[.985] p-6 pb-24 backdrop-blur-2xl md:p-14" data-camera-interactive="true" data-native-scroll="true">
          <div className="flex items-center justify-between border-b border-white/10 pb-5"><span className="text-[9px] tracking-[.28em]" style={{ color: accent }} dir="ltr">SPATIAL INDEX</span><button type="button" onClick={() => setMenuOpen(false)} className="min-h-11 px-3 text-xs tracking-[.16em] text-white/75">סגירה</button></div>
          <div className="my-auto w-full max-w-3xl py-8">{chapters.map((chapter, index) => <button key={chapter.code} type="button" onClick={() => { jumpToScene(index); setMenuOpen(false); }} className="group flex min-h-[72px] w-full items-baseline gap-5 border-b border-white/[.08] py-4 text-right"><span className="text-[10px]" style={{ color: accent }} dir="ltr">{chapter.code}</span><span className="font-frank text-3xl font-light leading-tight text-white transition group-hover:-translate-x-1 md:text-5xl">{chapter.title}</span></button>)}</div>
          {contactLine && <p className="border-t border-white/10 pt-5 text-xs leading-6 text-white/45">{contactLine}</p>}
        </motion.div>}
      </AnimatePresence>
    </>
  );
}

interface CameraSceneProps {
  index: number;
  activeScene: number;
  scene: { scale: MotionValue<number>; opacity: MotionValue<number>; z: MotionValue<number> };
  className?: string;
  children: React.ReactNode;
  id?: string;
}

export function CameraScene({ index, activeScene, scene, className = "", children, id }: CameraSceneProps) {
  return <motion.section id={id} aria-hidden={activeScene !== index} style={{ ...scene, pointerEvents: activeScene === index ? "auto" : "none" }} className={`absolute inset-0 flex items-center justify-center px-5 pb-36 pt-24 md:px-16 md:pb-28 ${className}`}>{children}</motion.section>;
}

export const glassPanel = "border border-white/[.13] bg-white/[.035] shadow-[0_30px_100px_rgba(0,0,0,.42),inset_0_1px_0_rgba(255,255,255,.09)] backdrop-blur-2xl";
export const mutedCopy = "text-xs leading-7 text-white/55 sm:text-sm sm:leading-8";
export const chapterLabel = "text-[8px] font-medium tracking-[.3em]";
