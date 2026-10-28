"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowDown, ArrowLeft, Check, Moon, MoveHorizontal, Sun } from "lucide-react";
import { useSite, type EditableProps } from "@/components/SiteProvider";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { TiltCard3D } from "@/components/TiltCard3D";
import type { LuxTheme } from "@/lib/luxtheme";
import type { ServiceItem } from "@/types/site";

export type ArchitecturalVariant = "forge" | "apple" | "horology" | "kinetic" | "swiss";
export type ArchitecturalMode = "day" | "night";

export interface ArchitecturalMaterial {
  id: string;
  label: string;
  english: string;
  multiplier: number;
  css: string;
}

export interface ArchitecturalConfig {
  variant: ArchitecturalVariant;
  studio: string;
  portalTitle: string;
  portalLabel: string;
  windowName: string;
  defaultMode: ArchitecturalMode;
  accent: string;
  secondary: string;
  interiorImage: string;
  beforeImage: string;
  afterImage: string;
  materials: ArchitecturalMaterial[];
}

const FALLBACK_SERVICES: ServiceItem[] = [
  { title: "תכנון אדריכלי", description: "קונספט, תכנון ופרטי ביצוע שמחברים את החלל לשגרת החיים.", price: "BESPOKE", iconName: "Compass" },
  { title: "עיצוב פנים", description: "חומר, אור וריהוט בהרכב אחד מדויק, מהרעיון ועד הפרט האחרון.", price: "TAILORED", iconName: "Layers" },
  { title: "שיפוץ והתחדשות", description: "התאמת המבנה לעתיד עם פיקוח מלא, תכנון מערכות וגימור מוקפד.", price: "FULL SCOPE", iconName: "Home" },
  { title: "פיקוח וביצוע", description: "ניהול ספקים, לוחות זמנים ואיכות ביצוע בשפה מקצועית אחת.", price: "SUPERVISED", iconName: "Check" },
];

const TIMELINES = [
  { id: "flexible", label: "גמיש", english: "FLEXIBLE", multiplier: 0.9 },
  { id: "balanced", label: "מאוזן", english: "BALANCED", multiplier: 1 },
  { id: "priority", label: "מואץ", english: "PRIORITY", multiplier: 1.22 },
];

const LAYER_NAMES = ["קליפת המבנה", "מערכות ותשתיות", "חומר וגימור", "אור וריהוט"];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
}

function useReducedMotionPreference() {
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduceMotion;
}

function SectionHeading({ code, eyebrow, title, copy, accent }: { code: string; eyebrow: string; title: string; copy?: string; accent: string }) {
  return (
    <div className="mb-10 grid gap-5 border-t pt-5 md:mb-14 md:grid-cols-12 md:gap-6" style={{ borderColor: "var(--line)" }}>
      <div className="flex items-start gap-4 md:col-span-3" dir="ltr">
        <span className="font-space text-xs tracking-[.2em]" style={{ color: accent }}>{code}</span>
        <span className="pt-0.5 text-[10px] font-medium tracking-[.22em] text-[var(--muted)]">{eyebrow}</span>
      </div>
      <h2 className="max-w-3xl font-frank text-4xl font-light leading-[1.08] tracking-[-.035em] text-[var(--text)] md:col-span-6 md:text-6xl">{title}</h2>
      {copy && <p className="max-w-md self-end text-base leading-8 text-[var(--muted)] md:col-span-3">{copy}</p>}
    </div>
  );
}

function PortalHeader({ config, mode, setMode, brand }: { config: ArchitecturalConfig; mode: ArchitecturalMode; setMode: (mode: ArchitecturalMode) => void; brand: string }) {
  const nextMode = mode === "day" ? "night" : "day";
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b backdrop-blur-2xl" style={{ borderColor: "var(--line)", background: "var(--header)", color: "var(--text)" }}>
      <div className="mx-auto flex min-h-[76px] max-w-[1600px] items-center justify-between gap-2 px-3 py-3 sm:px-6 lg:px-10">
        <button type="button" onClick={() => scrollToId("top")} className="flex min-h-11 min-w-0 items-center gap-3 text-right transition-opacity hover:opacity-70" aria-label="חזרה לתחילת העמוד">
          <span className="grid h-7 w-7 shrink-0 grid-cols-3 gap-[3px]" aria-hidden="true">{Array.from({ length: 9 }).map((_, index) => <span key={index} className="h-1.5 w-1.5" style={{ background: index === 4 ? config.accent : "currentColor" }} />)}</span>
          <span className="hidden min-w-0 sm:block"><span className="block truncate font-space text-[10px] font-medium tracking-[.16em]" dir="ltr">{config.studio}</span><span className="block truncate text-[10px] text-[var(--muted)]">{brand}</span></span>
        </button>
        <nav aria-label="ניווט ראשי" className="hidden items-center gap-1 lg:flex">
          {[["services", "שירותים"], ["signature", "החלל"], ["configure", "קונפיגורטור"], ["transformation", "לפני / אחרי"], ["contact", "ייעוץ פרטי"]].map(([id, label]) => (
            <button key={id} type="button" onClick={() => scrollToId(id)} className="min-h-11 px-3 text-xs text-[var(--muted)] transition-colors hover:text-[var(--text)]">{label}</button>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => setMode(nextMode)}
          aria-pressed={mode === "night"}
          aria-label={nextMode === "day" ? "מעבר למצב יום" : "מעבר למצב לילה"}
          className="flex min-h-11 shrink-0 items-center gap-2 border px-3 text-xs font-medium transition-transform hover:-translate-y-0.5 sm:px-4"
          style={{ borderColor: "var(--line)", background: "var(--surface)", color: "var(--text)" }}
        >
          {nextMode === "day" ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
          <span>{nextMode === "day" ? "☀️ מצב יום" : "🌙 מצב לילה"}</span>
        </button>
      </div>
    </header>
  );
}

function ArchitecturalPortal({ config, mode, headline, subheadline, image, services, editHeadline, editSubheadline }: {
  config: ArchitecturalConfig;
  mode: ArchitecturalMode;
  headline: string;
  subheadline: string;
  image: string;
  services: ServiceItem[];
  editHeadline: EditableProps;
  editSubheadline: EditableProps;
}) {
  const portalRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotionPreference();
  const { scrollYProgress } = useScroll({ target: portalRef, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 95, damping: 25, mass: 0.42 });
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 90, damping: 23, mass: 0.45 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 90, damping: 23, mass: 0.45 });
  const roomX = useTransform(smoothMouseX, [-0.5, 0.5], [-35, 35]);
  const roomY = useTransform(smoothMouseY, [-0.5, 0.5], [-20, 20]);
  const roomRotateX = useTransform(smoothMouseY, [-0.5, 0.5], [3.5, -3.5]);
  const roomRotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-5.5, 5.5]);
  const facadeRotateX = useTransform(smoothMouseY, [-0.5, 0.5], [1.5, -1.5]);
  const facadeRotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-2.5, 2.5]);
  const roomScale = useTransform(progress, [0, 0.75, 1], [0.78, 1.05, 1.05]);
  const roomZ = useTransform(progress, [0, 0.75, 1], [-200, 0, 0]);
  const glassScale = useTransform(progress, [0, 0.65, 1], [1, 7.5, 7.5]);
  const glassOpacity = useTransform(progress, [0, 0.45, 0.65, 1], [1, 0.8, 0, 0]);
  const facadeScale = useTransform(progress, [0, 0.65, 1], [1, 8.5, 8.5]);
  const facadeZ = useTransform(progress, [0, 0.65, 1], [120, 900, 900]);
  const facadeOpacity = useTransform(progress, [0, 0.58, 0.72, 1], [1, 1, 0, 0]);
  const cardOpacity = useTransform(progress, [0, 0.28, 0.62, 1], [0.3, 0.72, 1, 1]);
  const stage = useTransform(progress, (value): string => value < 0.35 ? "EXTERIOR / 01" : value < 0.7 ? "THRESHOLD / 02" : "INTERIOR / 03");

  useEffect(() => {
    if (reduceMotion) return;
    const handlePointer = (event: PointerEvent) => {
      mouseX.set(event.clientX / Math.max(1, window.innerWidth) - 0.5);
      mouseY.set(event.clientY / Math.max(1, window.innerHeight) - 0.5);
    };
    window.addEventListener("pointermove", handlePointer, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointer);
  }, [mouseX, mouseY, reduceMotion]);

  const facadePanel = "absolute overflow-hidden border-[var(--facade-line)] bg-[var(--facade)] shadow-[inset_0_0_90px_var(--facade-shadow)]";
  const facadeTexture = <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60" style={{ background: "var(--facade-texture)" }} />;
  const isArch = config.variant === "horology";
  const isApple = config.variant === "apple";
  const isKinetic = config.variant === "kinetic";
  const windowRadius = isArch ? "48% 48% 2px 2px" : isApple ? "28px" : "0px";

  return (
    <section ref={portalRef} id="top" aria-label={config.portalTitle} className={`relative ${reduceMotion ? "h-[100dvh]" : "h-[250vh]"}`}>
      <div className="sticky top-0 h-[100dvh] w-screen max-w-full overflow-hidden bg-[var(--page)] [perspective:1400px]">
        <motion.div
          className="absolute inset-[-4%] overflow-hidden [transform-style:preserve-3d]"
          style={reduceMotion ? undefined : { x: roomX, y: roomY, rotateX: roomRotateX, rotateY: roomRotateY, scale: roomScale, z: roomZ }}
        >
          <img src={image} alt={`${config.windowName} — חלל פנים אדריכלי`} className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: config.variant === "horology" ? "center 58%" : "center" }} />
          <div className="absolute inset-0" style={{ background: mode === "day" ? "linear-gradient(180deg,rgba(244,239,230,.08),rgba(35,31,32,.12))" : "linear-gradient(180deg,rgba(5,5,7,.18),rgba(5,5,7,.52)), radial-gradient(circle at 50% 42%,rgba(200,169,126,.28),transparent 62%)" }} />
          <div aria-hidden="true" className="absolute inset-0 opacity-50" style={{ background: mode === "day" ? "linear-gradient(112deg,rgba(255,252,240,.36),transparent 35%)" : "linear-gradient(112deg,rgba(200,169,126,.12),transparent 32%)" }} />
          <motion.div style={reduceMotion ? undefined : { opacity: cardOpacity }} className="absolute inset-x-4 bottom-8 flex items-end justify-between gap-3 sm:inset-x-8 sm:bottom-10 lg:inset-x-14">
            <div className="max-w-xs border bg-[var(--glass)] p-4 text-[var(--text)] shadow-[0_24px_80px_rgba(0,0,0,.2)] backdrop-blur-2xl sm:p-5" style={{ borderColor: "var(--line)", borderRadius: isApple ? "24px" : "0" }}>
              <span className="font-space text-[9px] tracking-[.22em]" style={{ color: config.accent }} dir="ltr">INTERIOR / LIVE SPACE</span>
              <p className="mt-2 font-frank text-xl font-light sm:text-2xl">{services[0]?.title || "עיצוב פנים בהתאמה אישית"}</p>
              <p {...editSubheadline} className="mt-1 hidden text-xs leading-6 text-[var(--muted)] sm:block">{subheadline}</p>
            </div>
            <div className="hidden w-52 border bg-[var(--glass)] p-5 text-[var(--text)] backdrop-blur-2xl md:block" style={{ borderColor: "var(--line)", borderRadius: isApple ? "24px" : "0" }} dir="ltr">
              <span className="font-space text-[9px] tracking-[.2em] text-[var(--muted)]">NATURAL LIGHT</span>
              <div className="mt-4 flex items-end justify-between"><span className="font-space text-4xl font-light" style={{ color: config.accent }}>{mode === "day" ? "84" : "26"}</span><span className="pb-1 text-[10px] text-[var(--muted)]">LUX / INDEX</span></div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute left-[18%] right-[18%] top-[25%] bottom-[13%] border-[10px] sm:left-[20%] sm:right-[20%] sm:border-[14px]"
          style={reduceMotion ? { borderColor: config.accent, borderRadius: windowRadius } : { z: 40, scale: glassScale, opacity: glassOpacity, borderColor: config.accent, borderRadius: windowRadius, transformStyle: "preserve-3d" }}
        >
          <div className="absolute inset-0" style={{ background: "linear-gradient(125deg,rgba(255,255,255,.22) 0%,transparent 45%,rgba(255,255,255,.08) 100%)", borderRadius: `calc(${windowRadius} - 8px)` }} />
          <span className="absolute left-1/2 top-0 h-full w-[3px] -translate-x-1/2 bg-[var(--mullion)] shadow-[1px_0_rgba(255,255,255,.3)]" />
          {!isArch && <span className="absolute left-0 top-1/2 h-[3px] w-full -translate-y-1/2 bg-[var(--mullion)] shadow-[0_1px_rgba(255,255,255,.3)]" />}
          {config.variant === "forge" && <><span className="absolute left-1/4 top-0 h-full w-[2px] bg-[var(--mullion)]" /><span className="absolute right-1/4 top-0 h-full w-[2px] bg-[var(--mullion)]" /></>}
          {isKinetic && <><span className="absolute left-1/4 top-0 h-full w-px bg-[var(--mullion)]" /><span className="absolute right-1/4 top-0 h-full w-px bg-[var(--mullion)]" /><span className="absolute left-0 top-1/4 h-px w-full bg-[var(--mullion)]" /><span className="absolute left-0 top-3/4 h-px w-full bg-[var(--mullion)]" /></>}
          <span className="absolute inset-3 border border-white/25" style={{ borderRadius: windowRadius }} />
        </motion.div>

        <motion.div
          className="pointer-events-none absolute inset-0 z-20 [transform-style:preserve-3d]"
          style={reduceMotion ? undefined : { scale: facadeScale, z: facadeZ, opacity: facadeOpacity, rotateX: facadeRotateX, rotateY: facadeRotateY }}
        >
          <div className={`${facadePanel} inset-x-0 top-0 h-[25%] border-b`}>
            {facadeTexture}
            <div className="absolute inset-x-4 bottom-3 mx-auto max-w-6xl text-center sm:bottom-5">
              <p className="mb-2 hidden font-space text-[9px] tracking-[.3em] sm:block" style={{ color: config.accent }} dir="ltr">{config.portalLabel}</p>
              <h1 {...editHeadline} className="mx-auto max-w-5xl font-frank text-[clamp(1.55rem,3.7vw,4.4rem)] font-light leading-[1.04] tracking-[-.035em] text-[var(--facade-text)]">{headline}</h1>
            </div>
          </div>
          <div className={`${facadePanel} inset-x-0 bottom-0 h-[13%] border-t`}>
            {facadeTexture}
            <div className="absolute inset-0 flex items-center justify-center gap-3 px-4 text-center text-[11px] font-medium text-[var(--facade-text)] sm:text-sm">
              <span>גלול כדי להיכנס לבית דרך החלון</span><ArrowDown className="h-4 w-4" style={{ color: config.accent }} aria-hidden="true" />
            </div>
          </div>
          <div className={`${facadePanel} bottom-[13%] left-0 top-[25%] w-[18%] border-r sm:w-[20%]`}>{facadeTexture}<span className="absolute bottom-8 left-3 hidden font-space text-[8px] tracking-[.25em] text-[var(--facade-muted)] [writing-mode:vertical-rl] lg:block" dir="ltr">{config.windowName}</span></div>
          <div className={`${facadePanel} bottom-[13%] right-0 top-[25%] w-[18%] border-l sm:w-[20%]`}>{facadeTexture}<span className="absolute bottom-8 right-3 hidden font-space text-[8px] tracking-[.25em] text-[var(--facade-muted)] [writing-mode:vertical-rl] lg:block" dir="ltr">ARCHITECTURE / PORTAL</span></div>
        </motion.div>

        <div className="pointer-events-none absolute bottom-[14.5%] left-1/2 z-30 hidden -translate-x-1/2 items-center gap-3 text-[var(--text)] sm:flex" dir="ltr">
          <motion.span className="font-space text-[8px] tracking-[.22em]">{stage}</motion.span>
          <span className="relative h-px w-28 bg-[var(--line)]"><motion.span className="absolute inset-0 origin-left" style={{ scaleX: progress, background: config.accent }} /></span>
        </div>
      </div>
    </section>
  );
}

function ServicesStudio({ config, services, onSelect }: { config: ArchitecturalConfig; services: ServiceItem[]; onSelect: (index: number) => void }) {
  const reduceMotion = useReducedMotionPreference();
  return (
    <section id="services" className="scroll-mt-24 px-4 py-20 sm:px-6 md:py-28 lg:px-10">
      <div className="mx-auto max-w-[1440px]">
        <SectionHeading code="01" eyebrow="SERVICES STUDIO" title="מהחלל שבחוץ לחלל שמרגיש שלכם" copy="בוחרים נקודת פתיחה. כל שירות מזין את הקונפיגורטור ונשמר במפרט הפרויקט האישי." accent={config.accent} />
        <div className="grid gap-px border sm:grid-cols-2 lg:grid-cols-4" style={{ borderColor: "var(--line)", background: "var(--line)" }}>
          {services.slice(0, 4).map((service, index) => (
            <TiltCard3D key={`${service.title}-${index}`} maxTilt={config.variant === "apple" ? 10 : 5} glare={modeGlare(config.variant)} className="h-full bg-[var(--surface)]">
              <motion.button
                type="button"
                onClick={() => { onSelect(index); scrollToId("configure"); }}
                animate={!reduceMotion && config.variant === "apple" ? { y: [0, index % 2 ? 6 : -6, 0] } : undefined}
                transition={{ duration: 7 + index, repeat: Infinity, ease: "easeInOut" }}
                className="group flex min-h-[290px] w-full flex-col justify-between bg-[var(--surface)] p-5 text-right transition-colors hover:bg-[var(--surface-hover)] sm:min-h-[340px] sm:p-7"
                style={{ borderRadius: config.variant === "apple" ? "24px" : "0" }}
              >
                <span className="flex items-center justify-between gap-3" dir="ltr"><span className="font-space text-[10px] tracking-[.2em] text-[var(--muted)]">SPACE / 0{index + 1}</span><span className="font-space text-[9px]" style={{ color: config.accent }}>{service.price || "BESPOKE"}</span></span>
                <span><span className="mb-5 block h-px w-10 transition-all duration-300 group-hover:w-20" style={{ background: config.accent }} /><h3 className="font-frank text-3xl font-light leading-tight text-[var(--text)]">{service.title}</h3><p className="mt-4 text-base leading-7 text-[var(--muted)]">{service.description}</p></span>
                <span className="flex items-center justify-between border-t pt-4 text-xs text-[var(--muted)]" style={{ borderColor: "var(--line)" }}><span>הוספה למפרט</span><ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" style={{ color: config.accent }} aria-hidden="true" /></span>
              </motion.button>
            </TiltCard3D>
          ))}
        </div>
      </div>
    </section>
  );
}

function modeGlare(variant: ArchitecturalVariant) {
  return variant === "kinetic" ? 0.26 : variant === "apple" ? 0.22 : 0.13;
}

function ForgeSignature({ config, image }: { config: ArchitecturalConfig; image: string }) {
  return (
    <div className="grid overflow-hidden border lg:grid-cols-12" style={{ borderColor: "var(--line)" }}>
      <div className="relative min-h-[420px] lg:col-span-8 lg:min-h-[620px]"><img src={image} alt="סלון וילה מודרנית באור טבעי" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" /><div className="absolute bottom-5 right-5 left-5 flex items-end justify-between text-white"><span className="font-frank text-3xl font-light">The Glass Villa</span><span className="font-space text-[9px] tracking-[.2em]" dir="ltr">RESIDENCE / 01</span></div></div>
      <div className="grid content-between gap-12 bg-[var(--surface)] p-6 lg:col-span-4 lg:p-9"><div className="grid grid-cols-3 gap-2" aria-hidden="true">{Array.from({ length: 9 }).map((_, index) => <span key={index} className="h-2 w-2" style={{ background: index === 4 ? config.accent : "var(--text)" }} />)}</div><div><p className="font-frank text-3xl font-light leading-snug text-[var(--text)]">פלדה שחורה. אבן בהירה. אור שנשאר.</p><p className="mt-5 text-base leading-8 text-[var(--muted)]">קו פנורמי נקי מפריד בין החצר לסלון, ומשאיר את התוכן האדריכלי במרכז.</p></div><dl className="grid grid-cols-2 gap-5 border-t pt-5 text-sm" style={{ borderColor: "var(--line)" }}><div><dt className="text-[var(--muted)]">שטח תכנון</dt><dd className="mt-1 font-space text-2xl" dir="ltr">320 m²</dd></div><div><dt className="text-[var(--muted)]">פרופיל חלון</dt><dd className="mt-1 font-space text-2xl" dir="ltr">28 mm</dd></div></dl></div>
    </div>
  );
}

function AppleSignature({ config, services }: { config: ArchitecturalConfig; services: ServiceItem[] }) {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotionPreference();
  return (
    <div className="relative min-h-[560px] overflow-hidden border bg-[var(--surface)] p-5 [perspective:1200px] sm:p-8" style={{ borderColor: "var(--line)" }}>
      <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed opacity-40" style={{ borderColor: config.secondary }} />
      <div className="relative grid min-h-[500px] items-center gap-5 md:grid-cols-3">
        {services.slice(0, 3).map((service, index) => <TiltCard3D key={service.title + index} maxTilt={12} glare={0.25}><motion.button type="button" onClick={() => setActive(index)} aria-pressed={active === index} animate={!reduceMotion ? { y: active === index ? -18 : [0, index % 2 ? 10 : -10, 0], rotateY: active === index ? 0 : index - 1 } : undefined} transition={active === index ? { duration: 0.25 } : { duration: 7 + index, repeat: Infinity, ease: "easeInOut" }} className="flex min-h-[270px] w-full flex-col justify-between rounded-[28px] border bg-[var(--glass)] p-6 text-right shadow-[0_28px_80px_rgba(0,0,0,.15)] backdrop-blur-2xl" style={{ borderColor: active === index ? config.secondary : "var(--line)", transformStyle: "preserve-3d" }}><span className="font-space text-[9px] tracking-[.22em]" style={{ color: config.secondary }} dir="ltr">GLASS ISLAND / 0{index + 1}</span><span><h3 className="font-frank text-3xl font-light text-[var(--text)]">{service.title}</h3><p className="mt-3 text-base leading-7 text-[var(--muted)]">{service.description}</p></span><span className="text-xs text-[var(--muted)]">{active === index ? "האי נבחר — נוסף למפרט" : "בחירת אי מרחבי"}</span></motion.button></TiltCard3D>)}
      </div>
      <div className="relative mt-5 flex items-center justify-between border-t pt-4 text-xs text-[var(--muted)]" style={{ borderColor: "var(--line)" }}><span>איי זכוכית מגיבים לתנועת העכבר ולבחירה</span><span className="font-space" dir="ltr">ACTIVE / 0{active + 1}</span></div>
    </div>
  );
}

function HorologySignature({ config, materials, selected, onSelect }: { config: ArchitecturalConfig; materials: ArchitecturalMaterial[]; selected: number; onSelect: (index: number) => void }) {
  return (
    <div className="grid border lg:grid-cols-[1.15fr_.85fr]" style={{ borderColor: "var(--line)" }}>
      <div className="relative min-h-[440px] overflow-hidden transition-background lg:min-h-[560px]" style={{ background: materials[selected]?.css }}><div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,.2),transparent_40%,rgba(0,0,0,.28))]" /><div className="absolute inset-[8%] border border-white/30" /><div className="absolute bottom-6 right-6 left-6 flex items-end justify-between gap-4 text-white"><div><span className="font-space text-[9px] tracking-[.22em]" dir="ltr">{materials[selected]?.english}</span><p className="mt-2 font-frank text-4xl font-light">{materials[selected]?.label}</p></div><span className="font-space text-xs" dir="ltr">FINISH / 0{selected + 1}</span></div></div>
      <div className="flex flex-col justify-center bg-[var(--surface)] p-6 sm:p-9"><p className="font-space text-[9px] tracking-[.24em]" style={{ color: config.accent }} dir="ltr">MATERIAL LIBRARY</p><h3 className="mt-3 font-frank text-4xl font-light text-[var(--text)]">ספריית גימורים חיה</h3><p className="mt-4 text-base leading-8 text-[var(--muted)]">כל בחירה משנה את תצוגת החומר, את מקדם התכנון ואת המפרט שיישלח לייעוץ.</p><div className="mt-7 space-y-2">{materials.map((material, index) => <button type="button" key={material.id} onClick={() => onSelect(index)} aria-pressed={selected === index} className="flex min-h-[68px] w-full items-center justify-between gap-4 border px-4 py-3 text-right transition-colors" style={{ borderColor: selected === index ? config.accent : "var(--line)", background: selected === index ? "var(--surface-hover)" : "transparent" }}><span><span className="block font-medium text-[var(--text)]">{material.label}</span><span className="mt-1 block font-space text-[9px] tracking-[.16em] text-[var(--muted)]" dir="ltr">{material.english}</span></span><span className="h-10 w-16 border border-white/20" style={{ background: material.css }} /></button>)}</div></div>
    </div>
  );
}

function KineticSignature({ config, area }: { config: ArchitecturalConfig; area: number }) {
  const [activeLayer, setActiveLayer] = useState(2);
  const reduceMotion = useReducedMotionPreference();
  const amplitude = 16 + area * 0.24;
  const wavePath = `M0 100 C45 ${100 - amplitude} 75 ${100 + amplitude} 120 100 S205 ${100 - amplitude * .72} 250 100 S345 ${100 + amplitude * .85} 375 100 S460 ${100 - amplitude} 500 100 S585 ${100 + amplitude * .66} 625 100 S710 ${100 - amplitude * .82} 750 100`;
  return (
    <div className="grid border lg:grid-cols-[.78fr_1.22fr]" style={{ borderColor: "var(--line)" }}>
      <div className="border-b p-5 lg:border-b-0 lg:border-l" style={{ borderColor: "var(--line)" }}><p className="font-space text-[9px] tracking-[.24em]" style={{ color: config.secondary }} dir="ltr">EXPLODED LAYER INSPECTOR</p><h3 className="mt-3 font-frank text-4xl font-light text-[var(--text)]">פירוק שכבות 3D</h3><div className="mt-6 space-y-2">{LAYER_NAMES.map((name, index) => <button type="button" key={name} onClick={() => setActiveLayer(index)} aria-pressed={activeLayer === index} className="flex min-h-12 w-full items-center justify-between border px-4 text-right text-sm transition-colors" style={{ borderColor: activeLayer === index ? config.secondary : "var(--line)", background: activeLayer === index ? "var(--surface-hover)" : "transparent", color: activeLayer === index ? "var(--text)" : "var(--muted)" }}><span>{name}</span><span className="font-space text-[10px]" dir="ltr">L/0{index + 1}</span></button>)}</div><div className="mt-7 grid grid-cols-3 gap-3 border-t pt-5 text-center" style={{ borderColor: "var(--line)" }}>{[["AREA", area], ["LAYER", activeLayer + 1], ["LOAD", Math.round(area * 1.7)]].map(([label, value]) => <div key={label}><span className="font-space text-xl" style={{ color: config.secondary }} dir="ltr">{value}</span><span className="mt-1 block font-space text-[8px] tracking-[.18em] text-[var(--muted)]" dir="ltr">{label}</span></div>)}</div></div>
      <div className="bg-[var(--surface)] p-5 sm:p-8"><div className="relative h-[330px] overflow-hidden border [perspective:1000px]" style={{ borderColor: "var(--line)", background: "linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px)", backgroundSize: "36px 36px" }}><div className="absolute inset-0 [transform-style:preserve-3d]">{LAYER_NAMES.map((name, index) => { const distance = index - activeLayer; return <motion.div key={name} animate={reduceMotion ? undefined : { x: distance * 12, y: index * 55 - 82, rotateX: 58, rotateZ: -10, scale: activeLayer === index ? 1.04 : .94 }} transition={{ type: "spring", stiffness: 160, damping: 23 }} className="absolute left-[16%] top-[22%] h-[150px] w-[68%] border bg-[var(--glass)] shadow-[0_22px_45px_rgba(0,0,0,.18)] backdrop-blur-md" style={{ borderColor: activeLayer === index ? config.secondary : "var(--line)", zIndex: LAYER_NAMES.length - index, transformStyle: "preserve-3d" }}><span className="absolute right-3 top-2 font-space text-[8px] tracking-[.18em]" style={{ color: activeLayer === index ? config.secondary : "var(--muted)" }} dir="ltr">0{index + 1} / {name}</span><span className="absolute inset-4 border border-dashed" style={{ borderColor: "var(--line)" }} /></motion.div>; })}</div></div><div className="mt-5 border-t pt-4" style={{ borderColor: "var(--line)" }}><div className="mb-2 flex justify-between font-space text-[8px] tracking-[.2em] text-[var(--muted)]" dir="ltr"><span>LIVE WAVEFORM CALCULATOR</span><span style={{ color: config.secondary }}>{area}.0 M²</span></div><svg viewBox="0 0 750 200" preserveAspectRatio="none" className="h-24 w-full" role="img" aria-label={`תצוגת גל המחושבת משטח ${area} מטר רבוע`}><path d="M0 50H750 M0 100H750 M0 150H750 M125 0V200 M250 0V200 M375 0V200 M500 0V200 M625 0V200" stroke="var(--line)" fill="none" /><motion.path animate={{ d: wavePath }} transition={{ duration: .25 }} d={wavePath} fill="none" stroke={config.secondary} strokeWidth="3" /></svg></div></div>
    </div>
  );
}

function SwissSignature({ config, services, images }: { config: ArchitecturalConfig; services: ServiceItem[]; images: string[] }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="flex min-h-[560px] flex-col gap-2 md:h-[580px] md:flex-row" dir="ltr">
      {services.slice(0, 4).map((service, index) => <motion.button key={service.title + index} type="button" onClick={() => setOpen(index)} onMouseEnter={() => setOpen(index)} animate={{ flexGrow: open === index ? 4 : 1 }} transition={{ duration: .45, ease: [.22, 1, .36, 1] }} aria-expanded={open === index} className="relative min-h-[150px] min-w-0 flex-1 overflow-hidden border text-left md:min-h-0" style={{ borderColor: "var(--line)" }}><img src={images[index % images.length]} alt="" className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300" style={{ opacity: open === index ? .9 : .42, filter: open === index ? "none" : "grayscale(.75)" }} /><span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-black/15" /><span className="absolute left-4 top-4 font-frank text-2xl text-white">0{index + 1}</span><span className="absolute bottom-5 left-5 right-5 text-white"><span className={`block font-frank font-light leading-tight ${open === index ? "text-3xl md:text-4xl" : "text-xl md:-rotate-90 md:origin-bottom-left md:whitespace-nowrap"}`}>{service.title}</span>{open === index && <span className="mt-3 block max-w-md text-sm leading-6 text-white/85" dir="rtl">{service.description}</span>}</span></motion.button>)}
    </div>
  );
}

function SignatureSection({ config, services, images, materials, selectedMaterial, setSelectedMaterial, area }: { config: ArchitecturalConfig; services: ServiceItem[]; images: string[]; materials: ArchitecturalMaterial[]; selectedMaterial: number; setSelectedMaterial: (index: number) => void; area: number }) {
  const content = config.variant === "forge" ? <ForgeSignature config={config} image={images[0]} />
    : config.variant === "apple" ? <AppleSignature config={config} services={services} />
      : config.variant === "horology" ? <HorologySignature config={config} materials={materials} selected={selectedMaterial} onSelect={setSelectedMaterial} />
        : config.variant === "kinetic" ? <KineticSignature config={config} area={area} />
          : <SwissSignature config={config} services={services} images={images} />;
  const titles: Record<ArchitecturalVariant, [string, string, string]> = {
    forge: ["THE GLASS VILLA", "מינימליזם שמראה את כל פרט", "חומרים כנים, פרופורציה מדויקת ותצוגת פרויקט ללא רעש מסביב."],
    apple: ["FLOATING PENTHOUSE", "איי זכוכית במרחב", "משטחים שקופים, עומק פיזי וממשק שמגיב לתנועה ולמגע."],
    horology: ["INTERIOR ATELIER", "החומר קובע את האווירה", "אבן, עץ ומתכת מוברשת בתצוגה חיה, עם בחירה שמחוברת ישירות למפרט."],
    kinetic: ["X-RAY BLUEPRINT", "המבנה נפתח לשכבות", "בודקים מערכות, טלמטריה ועומס תכנוני בתצוגה טכנית אחת."],
    swiss: ["FOLDING WALLS", "גלריה שנפתחת בקצב שלכם", "ארבע קצוות של אותו חלל. מעבר בעכבר או בחירה פותחים כל קיר."],
  };
  const [eyebrow, title, copy] = titles[config.variant];
  return <section id="signature" className="scroll-mt-24 px-4 py-20 sm:px-6 md:py-28 lg:px-10" style={{ background: "var(--section-alt)" }}><div className="mx-auto max-w-[1440px]"><SectionHeading code="02" eyebrow={eyebrow} title={title} copy={copy} accent={config.accent} />{content}</div></section>;
}

function ProjectConfigurator({ config, services, selectedService, setSelectedService, selectedMaterial, setSelectedMaterial, area, setArea }: { config: ArchitecturalConfig; services: ServiceItem[]; selectedService: number; setSelectedService: (index: number) => void; selectedMaterial: number; setSelectedMaterial: (index: number) => void; area: number; setArea: (value: number) => void }) {
  const { data } = useSite();
  const [timeline, setTimeline] = useState(1);
  const material = config.materials[selectedMaterial] || config.materials[0];
  const schedule = TIMELINES[timeline];
  const planningIndex = Math.round(area * material.multiplier * schedule.multiplier);
  const rawNumber = String(data.businessInfo.whatsapp || data.businessInfo.phone || "").replace(/\D/g, "").replace(/^0/, "972");
  const specification = encodeURIComponent(`שלום, אשמח לייעוץ לפרויקט.\nשירות: ${services[selectedService]?.title || "מותאם אישית"}\nשטח: ${area} מ"ר\nגימור: ${material.label}\nלוח זמנים: ${schedule.label}\nמדד תכנון: ${planningIndex}`);
  const href = rawNumber ? `https://wa.me/${rawNumber}?text=${specification}` : "#contact";
  return (
    <section id="configure" className="scroll-mt-24 px-4 py-20 sm:px-6 md:py-28 lg:px-10">
      <div className="mx-auto max-w-[1440px]"><SectionHeading code="03" eyebrow="3-STAGE CONFIGURATOR" title="מפרט שנבנה בשלושה צעדים" copy="המדד משווה היקף, חומר ולוח זמנים. הוא נועד לתכנון ראשוני ואינו הצעת מחיר." accent={config.accent} />
        <div className="grid border lg:grid-cols-12" style={{ borderColor: "var(--line)" }}>
          <div className="space-y-8 p-5 sm:p-8 lg:col-span-8">
            <fieldset><legend className="mb-4 flex w-full items-center justify-between text-sm font-medium text-[var(--text)]"><span><span className="ml-3 font-space text-xs" style={{ color: config.accent }}>01</span>בחירת מערכת הפרויקט</span><span className="font-space text-[9px] tracking-[.18em] text-[var(--muted)]" dir="ltr">SYSTEM</span></legend><div className="grid gap-2 sm:grid-cols-2">{services.slice(0, 4).map((service, index) => <button type="button" key={service.title + index} onClick={() => setSelectedService(index)} aria-pressed={selectedService === index} className="flex min-h-[58px] items-center justify-between border px-4 text-right transition-colors" style={{ borderColor: selectedService === index ? config.accent : "var(--line)", background: selectedService === index ? "var(--surface-hover)" : "transparent" }}><span className="text-[var(--text)]">{service.title}</span>{selectedService === index && <Check className="h-4 w-4" style={{ color: config.accent }} aria-hidden="true" />}</button>)}</div></fieldset>
            <fieldset><legend className="mb-4 flex w-full items-center justify-between text-sm font-medium text-[var(--text)]"><span><span className="ml-3 font-space text-xs" style={{ color: config.accent }}>02</span>חומר וגימור</span><span className="font-space text-[9px] tracking-[.18em] text-[var(--muted)]" dir="ltr">FINISH</span></legend><div className="grid gap-2 sm:grid-cols-3">{config.materials.map((item, index) => <button type="button" key={item.id} onClick={() => setSelectedMaterial(index)} aria-pressed={selectedMaterial === index} className="min-h-[84px] border p-3 text-right transition-colors" style={{ borderColor: selectedMaterial === index ? config.accent : "var(--line)", background: selectedMaterial === index ? "var(--surface-hover)" : "transparent" }}><span className="mb-3 block h-5 w-full" style={{ background: item.css }} /><span className="block text-sm text-[var(--text)]">{item.label}</span><span className="font-space text-[8px] tracking-[.14em] text-[var(--muted)]" dir="ltr">{item.english}</span></button>)}</div></fieldset>
            <fieldset><legend className="mb-4 flex w-full items-center justify-between text-sm font-medium text-[var(--text)]"><span><span className="ml-3 font-space text-xs" style={{ color: config.accent }}>03</span>שטח ולוח זמנים</span><span className="font-space text-[9px] tracking-[.18em] text-[var(--muted)]" dir="ltr">SCHEDULE</span></legend><div className="grid gap-6 md:grid-cols-2"><div><div className="flex items-end justify-between"><label htmlFor={`${config.variant}-area`} className="text-sm text-[var(--muted)]">שטח משוער</label><span className="font-space text-3xl" style={{ color: config.accent }} dir="ltr">{area}<small className="mr-1 text-xs text-[var(--muted)]">m²</small></span></div><input id={`${config.variant}-area`} type="range" min="40" max="320" step="5" value={area} onChange={(event) => setArea(Number(event.target.value))} className="kinetic-range mt-2" style={{ ["--range-accent" as string]: config.accent }} /></div><div className="grid grid-cols-3 gap-2">{TIMELINES.map((item, index) => <button type="button" key={item.id} onClick={() => setTimeline(index)} aria-pressed={timeline === index} className="min-h-14 border px-2 text-sm transition-colors" style={{ borderColor: timeline === index ? config.accent : "var(--line)", background: timeline === index ? "var(--surface-hover)" : "transparent", color: timeline === index ? "var(--text)" : "var(--muted)" }}>{item.label}</button>)}</div></div></fieldset>
          </div>
          <aside className="flex flex-col justify-between border-t bg-[var(--surface)] p-5 sm:p-8 lg:col-span-4 lg:border-r lg:border-t-0" style={{ borderColor: "var(--line)" }}><div><span className="font-space text-[9px] tracking-[.24em]" style={{ color: config.accent }} dir="ltr">LIVE PROJECT SPECIFICATION</span><h3 className="mt-5 font-frank text-3xl font-light leading-snug text-[var(--text)]">{services[selectedService]?.title || "פרויקט מותאם אישית"}</h3><dl className="mt-6 space-y-3 border-t pt-5 text-sm" style={{ borderColor: "var(--line)" }}><div className="flex justify-between gap-4"><dt className="text-[var(--muted)]">גימור</dt><dd className="text-[var(--text)]">{material.label}</dd></div><div className="flex justify-between gap-4"><dt className="text-[var(--muted)]">שטח</dt><dd dir="ltr">{area} m²</dd></div><div className="flex justify-between gap-4"><dt className="text-[var(--muted)]">לוח זמנים</dt><dd>{schedule.label}</dd></div></dl><div className="mt-7 border-t pt-6" style={{ borderColor: "var(--line)" }}><span className="text-xs text-[var(--muted)]">מדד תכנון יחסי</span><p className="mt-2 font-space text-6xl font-light" style={{ color: config.accent }} dir="ltr" data-testid="planning-index">{planningIndex}</p></div></div><a href={href} target={rawNumber ? "_blank" : undefined} rel="noreferrer" className="mt-8 flex min-h-12 items-center justify-center gap-3 px-4 text-sm font-semibold transition-transform hover:-translate-y-0.5" style={{ background: config.accent, color: "#17130e" }}>שליחת המפרט לייעוץ<ArrowLeft className="h-4 w-4" aria-hidden="true" /></a></aside>
        </div>
      </div>
    </section>
  );
}

function TransformationSection({ config, mode, beforeImage, afterImage }: { config: ArchitecturalConfig; mode: ArchitecturalMode; beforeImage: string; afterImage: string }) {
  const theme: LuxTheme = { accent: config.accent, dark: mode === "night", pageBg: "var(--page)", surface: "var(--surface)", border: mode === "night" ? "rgba(244,239,230,.2)" : "rgba(35,31,32,.2)", headline: "var(--text)", text: "var(--text)", muted: mode === "night" ? "#c4bcb0" : "#514c45", fontSerif: "Frank Ruhl Libre" };
  return <section id="transformation" className="scroll-mt-24 px-4 py-20 sm:px-6 md:py-28 lg:px-10" style={{ background: "var(--section-alt)" }}><div className="mx-auto max-w-[1440px]"><SectionHeading code="04" eyebrow="ROOM TRANSFORMATION" title="אותו חלל. ראייה חדשה." copy="גררו את קו ההשוואה, או השתמשו בחצי המקלדת, כדי לבדוק את השינוי בחומר ובאור." accent={config.accent} /><BeforeAfterSlider theme={theme} beforeImage={beforeImage} afterImage={afterImage} beforeLabel="לפני / מצב קיים" afterLabel="אחרי / חזון אדריכלי" caption="" handleColor={config.accent} /><div className="mt-4 flex items-center justify-between text-xs text-[var(--muted)]"><span>השוואה אינטראקטיבית של אור, חומר ופרופורציה</span><MoveHorizontal className="h-4 w-4" style={{ color: config.accent }} aria-hidden="true" /></div></div></section>;
}

function ConsultationSection({ config }: { config: ArchitecturalConfig }) {
  const { data } = useSite();
  const info = data.businessInfo;
  const rawNumber = String(info.whatsapp || info.phone || "").replace(/\D/g, "").replace(/^0/, "972");
  const whatsapp = rawNumber ? `https://wa.me/${rawNumber}?text=${encodeURIComponent("שלום, אשמח לתאם ייעוץ אדריכלי פרטי.")}` : "#contact";
  const reviews = Array.isArray(data.reviews) ? data.reviews : [];
  return <section id="contact" className="scroll-mt-24 px-4 py-20 sm:px-6 md:py-28 lg:px-10"><div className="mx-auto max-w-[1440px]"><div className="grid border lg:grid-cols-12" style={{ borderColor: "var(--line)" }}><div className="p-6 sm:p-10 lg:col-span-7 lg:p-14"><p className="font-space text-[9px] tracking-[.25em]" style={{ color: config.accent }} dir="ltr">05 / PRIVATE CONSULTATION</p><h2 className="mt-5 max-w-3xl font-frank text-5xl font-light leading-[1.06] tracking-[-.04em] text-[var(--text)] sm:text-6xl">הבית הבא מתחיל בשיחה אחת.</h2><p className="mt-6 max-w-xl text-base leading-8 text-[var(--muted)]">נבחן את החלל, סדר העדיפויות והחומרים שמתאימים לכם. המפרט שבניתם יחכה לנו בשיחה.</p><div className="mt-8 flex flex-wrap gap-3"><a href={whatsapp} target={rawNumber ? "_blank" : undefined} rel="noreferrer" className="flex min-h-12 items-center gap-3 px-6 text-sm font-semibold transition-transform hover:-translate-y-0.5" style={{ background: config.accent, color: "#17130e" }}>תיאום ייעוץ בווטסאפ<ArrowLeft className="h-4 w-4" aria-hidden="true" /></a>{info.phone && <a href={`tel:${info.phone}`} className="flex min-h-12 items-center border px-5 text-sm text-[var(--text)]" style={{ borderColor: "var(--line)" }} dir="ltr">{info.phone}</a>}</div><p className="mt-7 text-sm leading-7 text-[var(--muted)]">{info.address || info.city}<br />{info.openingHours}</p></div><div className="border-t bg-[var(--surface)] p-6 sm:p-10 lg:col-span-5 lg:border-r lg:border-t-0" style={{ borderColor: "var(--line)" }}><div className="grid grid-cols-3 gap-2" aria-hidden="true">{Array.from({ length: 9 }).map((_, index) => <span key={index} className="h-2 w-2" style={{ background: index === 4 ? config.accent : "var(--text)" }} />)}</div><div className="mt-10 space-y-6">{reviews.slice(0, 2).map((review, index) => <blockquote key={review.author + index} className="border-b pb-6" style={{ borderColor: "var(--line)" }}><p className="font-frank text-2xl font-light leading-9 text-[var(--text)]">“{review.text}”</p><footer className="mt-3 text-xs" style={{ color: config.accent }}>{review.author}</footer></blockquote>)}{reviews.length === 0 && <p className="text-base leading-8 text-[var(--muted)]">{info.description}</p>}</div></div></div><footer className="mt-8 flex flex-col gap-3 border-t pt-5 text-xs text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "var(--line)" }}><button type="button" onClick={() => scrollToId("top")} className="min-h-11 self-start text-right transition-colors hover:text-[var(--text)] sm:self-auto">חזרה לפתח הבית ↑</button><span className="font-space tracking-[.16em]" dir="ltr">{config.studio} / ARCHITECTURAL PORTAL ENGINE</span></footer></div></section>;
}

export function ArchitecturalExperience({ config }: { config: ArchitecturalConfig }) {
  const { data, editsFor } = useSite();
  const [mode, setMode] = useState<ArchitecturalMode>(config.defaultMode);
  const [selectedService, setSelectedService] = useState(0);
  const [selectedMaterial, setSelectedMaterial] = useState(0);
  const [area, setArea] = useState(120);
  const services = Array.isArray(data.services) && data.services.length ? data.services : FALLBACK_SERVICES;
  const projects = Array.isArray(data.projects) ? data.projects : [];
  const heroImage = data.hero.backgroundImage || config.interiorImage;
  const interiorImage = config.interiorImage || heroImage;
  const beforeImage = projects[0]?.beforeImage || config.beforeImage;
  const afterImage = projects[0]?.afterImage || config.afterImage;
  const images = useMemo(() => [config.interiorImage, config.afterImage, heroImage, config.beforeImage], [config, heroImage]);
  const headline = data.hero.headline || data.businessInfo.name;
  const subheadline = data.hero.subheadline || data.businessInfo.description;
  const themedConfig = useMemo(() => {
    if (mode === "night") return config;
    if (config.variant === "kinetic") return { ...config, secondary: "#4C6100" };
    if (config.variant === "apple") return { ...config, secondary: "#356585" };
    return config;
  }, [config, mode]);
  const tokens = {
    "--page": mode === "day" ? (config.variant === "swiss" ? "#F6F3EC" : "#F4EFE6") : "#050507",
    "--surface": mode === "day" ? "#fffaf1" : "#0d0e11",
    "--surface-hover": mode === "day" ? "#ece4d5" : "#17171b",
    "--section-alt": mode === "day" ? "#ede6d3" : "#090a0c",
    "--text": mode === "day" ? "#231f20" : "#f4efe6",
    "--muted": mode === "day" ? "#514c45" : "#b8b0a4",
    "--line": mode === "day" ? "rgba(35,31,32,.17)" : "rgba(244,239,230,.15)",
    "--header": mode === "day" ? "rgba(244,239,230,.86)" : "rgba(5,5,7,.82)",
    "--glass": mode === "day" ? "rgba(255,250,241,.72)" : "rgba(13,14,17,.7)",
    "--facade": mode === "day" ? "#F4EFE6" : "#050507",
    "--facade-text": mode === "day" ? "#231f20" : "#f4efe6",
    "--facade-muted": mode === "day" ? "#625b52" : "#b8b0a4",
    "--facade-line": mode === "day" ? "rgba(35,31,32,.2)" : "rgba(244,239,230,.16)",
    "--facade-shadow": mode === "day" ? "rgba(120,96,60,.12)" : "rgba(0,0,0,.65)",
    "--facade-texture": config.variant === "kinetic" ? (mode === "day" ? "repeating-linear-gradient(90deg,rgba(35,31,32,.07) 0 1px,transparent 1px 56px),linear-gradient(135deg,#e8e1d3,#bdbba6)" : "repeating-linear-gradient(90deg,rgba(244,239,230,.06) 0 1px,transparent 1px 56px),linear-gradient(135deg,#151619,#050507)") : (mode === "day" ? "repeating-linear-gradient(97deg,rgba(130,105,75,.045) 0 1px,transparent 1px 7px),linear-gradient(120deg,#f8f4ec,#e5dccb)" : "repeating-linear-gradient(97deg,rgba(255,255,255,.025) 0 1px,transparent 1px 7px),linear-gradient(120deg,#161619,#050507)"),
    "--mullion": mode === "day" ? "rgba(35,31,32,.78)" : "rgba(200,169,126,.72)",
    colorScheme: mode === "day" ? "light" : "dark",
  } as React.CSSProperties;

  return (
    <div dir="rtl" className="min-h-screen w-full overflow-x-clip bg-[var(--page)] font-assistant text-[var(--text)] transition-colors duration-300" style={tokens} data-template={config.variant} data-mode={mode}>
      <PortalHeader config={themedConfig} mode={mode} setMode={setMode} brand={data.businessInfo.name} />
      <main>
        <ArchitecturalPortal config={themedConfig} mode={mode} headline={headline} subheadline={subheadline} image={interiorImage} services={services} editHeadline={editsFor("hero.headline")} editSubheadline={editsFor("hero.subheadline")} />
        <ServicesStudio config={themedConfig} services={services} onSelect={setSelectedService} />
        <SignatureSection config={themedConfig} services={services} images={images} materials={config.materials} selectedMaterial={selectedMaterial} setSelectedMaterial={setSelectedMaterial} area={area} />
        <ProjectConfigurator config={themedConfig} services={services} selectedService={selectedService} setSelectedService={setSelectedService} selectedMaterial={selectedMaterial} setSelectedMaterial={setSelectedMaterial} area={area} setArea={setArea} />
        <TransformationSection config={themedConfig} mode={mode} beforeImage={beforeImage} afterImage={afterImage} />
        <ConsultationSection config={themedConfig} />
      </main>
    </div>
  );
}
