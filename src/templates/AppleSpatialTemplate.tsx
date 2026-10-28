"use client";

import React, { useState } from "react";
import { motion, useTransform } from "framer-motion";
import { useSite } from "@/components/SiteProvider";
import { TiltCard3D } from "@/components/TiltCard3D";
import { CameraInterface, CameraScene, chapterLabel, glassPanel, mutedCopy } from "@/templates/CameraInterface";
import { useVirtualCameraEngine, useVirtualCameraScene } from "@/templates/useVirtualCameraEngine";

const ACCENT = "#A8D3FF";
const chapters = [
  { code: "01", title: "ARRIVAL" }, { code: "02", title: "ISLANDS" },
  { code: "03", title: "DYNAMIC SPACE" }, { code: "04", title: "DEPTH SYSTEM" },
  { code: "05", title: "CONNECTION" },
];
const ambient = [
  { name: "AMBIENT", bg: "#070A10", tint: "rgba(93,143,205,.13)" },
  { name: "PRECISION", bg: "#05080B", tint: "rgba(168,211,255,.09)" },
  { name: "IMMERSIVE", bg: "#090711", tint: "rgba(155,126,209,.14)" },
];

export function AppleSpatialTemplate() {
  const { data, editsFor } = useSite();
  const b = data.businessInfo;
  const hero = data.hero;
  const services = Array.isArray(data.services) ? data.services : [];
  const reviews = Array.isArray(data.reviews) ? data.reviews : [];
  const [menuOpen, setMenuOpen] = useState(false);
  const [islandExpanded, setIslandExpanded] = useState(false);
  const [selectedService, setSelectedService] = useState(0);
  const [ambientMode, setAmbientMode] = useState(0);
  const engine = useVirtualCameraEngine(menuOpen);
  const { smoothProgress, smoothScene, activeScene, jumpToScene, rigRotateX, rigRotateY } = engine;
  const scenes = [
    useVirtualCameraScene(smoothScene, 0), useVirtualCameraScene(smoothScene, 1),
    useVirtualCameraScene(smoothScene, 2), useVirtualCameraScene(smoothScene, 3),
    useVirtualCameraScene(smoothScene, 4),
  ];
  const orbit = useTransform(smoothProgress, [0, 1], [0, 540]);
  const depthFloat = useTransform(smoothProgress, [0, 1], [0, -180]);
  const number = String(b.whatsapp || b.phone || "").replace(/\D/g, "").replace(/^0/, "972");
  const contact = number ? `https://wa.me/${number}` : "#contact";

  return (
    <div dir="rtl" className="fixed inset-0 h-screen w-screen overflow-hidden font-heebo text-[#F2F6FF] transition-colors duration-700" style={{ background: ambient[ambientMode].bg }}>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 transition-colors duration-700" style={{ background: `radial-gradient(ellipse at 60% 40%, ${ambient[ambientMode].tint}, transparent 65%)` }} />
      <CameraInterface brand={b.name || "SPATIAL STUDIO"} chapters={chapters} activeScene={activeScene} jumpToScene={jumpToScene} menuOpen={menuOpen} setMenuOpen={setMenuOpen} smoothProgress={smoothProgress} zDepthReadout={engine.zDepthReadout} lightX={engine.lightX} lightY={engine.lightY} cursorX={engine.cursorX} cursorY={engine.cursorY} accent={ACCENT} menuLabel="SPATIAL / OS" contactLine={`${b.address || b.city} · ${b.phone}`} />
      <motion.main style={{ rotateX: rigRotateX, rotateY: rigRotateY, transformStyle: "preserve-3d", perspective: "1500px" }} className="relative h-full w-full">
        <CameraScene index={0} activeScene={activeScene} scene={scenes[0]}>
          <div className="grid w-full max-w-6xl items-center gap-6 lg:grid-cols-[.9fr_1.1fr]">
            <div className="relative z-10 order-2 lg:order-1"><p className={chapterLabel} style={{ color: ACCENT }} dir="ltr">A NEW KIND OF PRESENCE / 01</p><h1 {...editsFor("hero.headline")} className="mt-4 font-frank text-4xl font-light leading-[1.06] tracking-[-.03em] sm:text-6xl md:text-7xl">{hero.headline || b.name}</h1><p {...editsFor("hero.subheadline")} className={`${mutedCopy} mt-5 max-w-lg`}>{hero.subheadline || b.description}</p><div className="mt-6 flex flex-wrap gap-3"><a href={contact} target={number ? "_blank" : undefined} rel="noreferrer" className="flex min-h-12 items-center rounded-full bg-[#EAF4FF] px-6 text-xs text-[#0B1220] transition hover:bg-[#A8D3FF]">{hero.ctaText || "תיאום שיחה"} ↗</a><button type="button" onClick={() => jumpToScene(1)} className="min-h-12 rounded-full border border-white/20 px-6 text-xs text-white/70">לגלות את המרחב ↓</button></div></div>
            <div className="relative order-1 mx-auto aspect-square w-full max-w-[430px] lg:order-2" style={{ perspective: "1200px" }}>
              <motion.div style={{ rotate: orbit }} className="absolute inset-[5%] rounded-full border border-dashed border-[#A8D3FF]/25" /><motion.div style={{ rotate: orbit, z: depthFloat }} className="absolute inset-[16%] rounded-full border border-white/15" />
              <motion.div animate={{ y: [0, -10, 0], rotateY: [0, 4, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} className={`${glassPanel} glass-reflection absolute left-[1%] top-[16%] h-[35%] w-[48%] rounded-[28px] p-4`}><span className="text-[8px] tracking-[.2em] text-[#A8D3FF]" dir="ltr">ISLAND / 01</span><div className="absolute inset-x-4 bottom-4 h-px bg-white/20" /></motion.div>
              <motion.div animate={{ y: [0, 12, 0], rotateY: [0, -4, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: .5 }} className={`${glassPanel} glass-reflection absolute bottom-[12%] right-[1%] h-[40%] w-[56%] rounded-[28px] p-4`}><span className="text-[8px] tracking-[.2em] text-white/55" dir="ltr">YOUR SPACE</span><p className="mt-4 font-frank text-2xl font-light leading-snug">{b.name}</p><p className="mt-2 line-clamp-2 text-[10px] leading-5 text-white/55">{b.category} · {b.city}</p></motion.div>
              <div className="absolute left-[39%] top-[39%] h-20 w-20 rounded-full border border-[#A8D3FF]/35 bg-[#A8D3FF]/[.07] shadow-[0_0_80px_rgba(143,202,255,.2)] backdrop-blur-2xl" />
            </div>
          </div>
        </CameraScene>

        <CameraScene index={1} activeScene={activeScene} scene={scenes[1]}>
          <div className="w-full max-w-6xl"><div className="mb-5 flex items-end justify-between"><div><p className={chapterLabel} style={{ color: ACCENT }} dir="ltr">02 / FLOATING ISLANDS</p><h2 className="mt-2 font-frank text-4xl font-light sm:text-5xl">ממשקים שנושמים בחלל</h2></div><span className="hidden text-[8px] tracking-[.2em] text-white/40 sm:block" dir="ltr">DEPTH / LAYER / LIGHT</span></div><div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">{services.slice(0, 4).map((service, index) => <TiltCard3D key={service.title + index} maxTilt={11} glare={.22}><motion.button type="button" animate={{ y: [0, index % 2 ? 7 : -7, 0] }} transition={{ duration: 6 + index, repeat: Infinity, ease: "easeInOut" }} onClick={() => { setSelectedService(index); jumpToScene(2); }} className={`${glassPanel} glass-reflection flex min-h-[160px] w-full flex-col justify-between rounded-[24px] p-4 text-right md:min-h-[220px] md:p-5`}><span className="text-[8px] tracking-[.2em] text-[#A8D3FF]/75" dir="ltr">MODULE / 0{index + 1}</span><span><h3 {...editsFor(`services.${index}.title`)} className="font-frank text-xl font-light leading-snug md:text-2xl">{service.title}</h3><p {...editsFor(`services.${index}.description`)} className="mt-2 line-clamp-3 text-[10px] leading-5 text-white/55 sm:text-xs sm:leading-6">{service.description}</p></span><span className="text-[9px] text-[#A8D3FF]/70" dir="ltr">OPEN SPACE ↗</span></motion.button></TiltCard3D>)}</div></div>
        </CameraScene>

        <CameraScene index={2} activeScene={activeScene} scene={scenes[2]}>
          <div className="w-full max-w-5xl text-center"><p className={chapterLabel} style={{ color: ACCENT }} dir="ltr">03 / DYNAMIC ISLAND</p><h2 className="mt-2 font-frank text-4xl font-light sm:text-5xl">מרכז שליטה. בלי עומס</h2><div className="mt-6 flex justify-center"><motion.div layout animate={{ width: islandExpanded ? "min(90vw,760px)" : "min(84vw,420px)", height: islandExpanded ? 270 : 84, borderRadius: islandExpanded ? 32 : 999 }} transition={{ type: "spring", stiffness: 230, damping: 28 }} className={`${glassPanel} relative overflow-hidden p-5 text-right`} data-camera-interactive="true"><button type="button" onClick={() => setIslandExpanded((value) => !value)} aria-expanded={islandExpanded} className="flex min-h-11 w-full items-center justify-between"><span className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-[#A8D3FF] shadow-[0_0_16px_#A8D3FF]" /><span className="text-xs text-white/80">{islandExpanded ? "מרכז השליטה פתוח" : "מרחב השירות שלך"}</span></span><span className="text-lg text-[#A8D3FF]">{islandExpanded ? "−" : "+"}</span></button>{islandExpanded && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 grid gap-4 text-right sm:grid-cols-[1fr_.65fr]"><div><p className="font-frank text-2xl font-light sm:text-3xl">{services[selectedService]?.title || b.name}</p><p className="mt-2 line-clamp-2 text-xs leading-6 text-white/55">{services[selectedService]?.description || b.description}</p><div className="mt-3 flex max-h-20 flex-wrap gap-2 overflow-y-auto" data-native-scroll="true">{services.slice(0, 4).map((service, index) => <button type="button" key={service.title + index} onClick={() => setSelectedService(index)} className="min-h-9 border px-3 text-[10px]" style={{ borderColor: selectedService === index ? ACCENT : "rgba(255,255,255,.12)", color: selectedService === index ? ACCENT : "rgba(255,255,255,.55)" }}>{service.title}</button>)}</div></div><div className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><span className="text-[8px] tracking-[.2em] text-[#A8D3FF]" dir="ltr">SPATIAL STATUS</span><p className="mt-3 font-heebo text-3xl font-light" dir="ltr">{String(services.length).padStart(2, "0")}</p><p className="text-xs text-white/50">מרכיבי שירות</p></div></motion.div>}</motion.div></div></div>
        </CameraScene>

        <CameraScene index={3} activeScene={activeScene} scene={scenes[3]}>
          <div className="w-full max-w-6xl"><p className={chapterLabel} style={{ color: ACCENT }} dir="ltr">04 / DEPTH SYSTEM</p><h2 className="mt-2 font-frank text-4xl font-light sm:text-5xl">כל שכבה מקבלת מקום</h2><div className="relative mt-5 grid min-h-[38vh] grid-cols-3 gap-2 [perspective:1200px] md:gap-4">{[{ label: "CONTEXT", z: -180, rotateY: -9 }, { label: "CLARITY", z: 90, rotateY: 3 }, { label: "FOCUS", z: 260, rotateY: 8 }].map((layer, index) => <motion.div key={layer.label} style={{ z: layer.z, rotateY: layer.rotateY, y: index === 1 ? depthFloat : 0 }} className={`${glassPanel} glass-reflection flex flex-col justify-between rounded-[24px] p-3 md:rounded-[30px] md:p-6`}><span className="text-[8px] tracking-[.16em] text-white/45" dir="ltr">DEPTH / 0{index + 1}</span><p className="font-frank text-lg font-light sm:text-3xl">{layer.label}</p>{index === 2 && <div className="h-12 rounded-2xl border border-[#A8D3FF]/25 bg-[#A8D3FF]/[.07]" />}</motion.div>)}</div><div className="mt-4 flex flex-wrap gap-2">{ambient.map((mode, index) => <button type="button" key={mode.name} onClick={() => setAmbientMode(index)} aria-pressed={ambientMode === index} className="min-h-11 border px-4 text-[10px] tracking-[.12em]" style={{ borderColor: ambientMode === index ? ACCENT : "rgba(255,255,255,.12)", background: ambientMode === index ? `${ACCENT}12` : "transparent", color: ambientMode === index ? "#fff" : "rgba(255,255,255,.55)" }} dir="ltr">{mode.name}</button>)}</div></div>
        </CameraScene>

        <CameraScene index={4} activeScene={activeScene} scene={scenes[4]} id="contact">
          <div className={`${glassPanel} grid max-h-[calc(100dvh-210px)] w-full max-w-6xl gap-6 overflow-y-auto rounded-[30px] p-6 md:p-9 lg:grid-cols-[1.1fr_.9fr]`} data-native-scroll="true"><div><p className={chapterLabel} style={{ color: ACCENT }} dir="ltr">05 / CONNECTION</p><h2 className="mt-3 font-frank text-4xl font-light leading-[1.08] sm:text-6xl">{b.name}</h2><p className={`${mutedCopy} mt-4 max-w-xl`}>{hero.subheadline || b.description}</p><div className="mt-6 flex flex-wrap gap-3"><a href={contact} target={number ? "_blank" : undefined} rel="noreferrer" className="flex min-h-12 items-center rounded-full bg-[#EAF4FF] px-6 text-xs text-[#0B1220]">{hero.ctaText || "בואו נדבר"} ↗</a>{b.phone && <a href={`tel:${b.phone}`} className="flex min-h-12 items-center rounded-full border border-white/20 px-5 text-xs text-white/70" dir="ltr">{b.phone}</a>}</div><p className="mt-5 text-[10px] leading-6 text-white/45">{b.address} · {b.openingHours}</p></div><div className="space-y-3">{reviews.slice(0, 2).map((review, index) => <blockquote key={review.author + index} className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-xs leading-6 text-white/75">“{review.text}”</p><footer className="mt-3 text-[10px] text-[#A8D3FF]">{review.author}</footer></blockquote>)}</div></div>
        </CameraScene>
      </motion.main>
    </div>
  );
}
