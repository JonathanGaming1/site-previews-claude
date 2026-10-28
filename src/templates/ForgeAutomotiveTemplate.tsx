"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useSite } from "@/components/SiteProvider";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { TiltCard3D } from "@/components/TiltCard3D";
import { LUX_THEMES } from "@/templates/theme";
import { CameraInterface, CameraScene, chapterLabel, glassPanel, mutedCopy } from "@/templates/CameraInterface";
import { useVirtualCameraEngine, useVirtualCameraScene } from "@/templates/useVirtualCameraEngine";

const ACCENT = "#C8A97E";
const chapters = [
  { code: "01", title: "SHOWROOM" }, { code: "02", title: "CRAFT" },
  { code: "03", title: "CONFIGURE" }, { code: "04", title: "PRECISION" },
  { code: "05", title: "COMMISSION" },
];

export function ForgeAutomotiveTemplate() {
  const { data, editsFor } = useSite();
  const info = data.businessInfo;
  const hero = data.hero;
  const services = Array.isArray(data.services) ? data.services : [];
  const reviews = Array.isArray(data.reviews) ? data.reviews : [];
  const projects = Array.isArray(data.projects) ? data.projects : [];
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(0);
  const [tier, setTier] = useState("BESPOKE");
  const [timeline, setTimeline] = useState("VIP");
  const engine = useVirtualCameraEngine(menuOpen);
  const { smoothProgress, smoothScene, activeScene, jumpToScene, rigRotateX, rigRotateY } = engine;
  const scenes = [
    useVirtualCameraScene(smoothScene, 0), useVirtualCameraScene(smoothScene, 1),
    useVirtualCameraScene(smoothScene, 2), useVirtualCameraScene(smoothScene, 3),
    useVirtualCameraScene(smoothScene, 4),
  ];
  const number = String(info.whatsapp || info.phone || "").replace(/\D/g, "").replace(/^0/, "972");
  const whatsapp = number ? `https://wa.me/${number}` : "#contact";
  const heroImage = hero.backgroundImage || projects[0]?.afterImage || "";
  const specification = encodeURIComponent(`שלום, אשמח לתאם פרויקט.\nמערכת: ${services[selectedService]?.title || "מותאם אישית"}\nגימור: ${tier}\nלוח זמנים: ${timeline}`);
  const specificationLink = number ? `${whatsapp}?text=${specification}` : whatsapp;

  return (
    <div dir="rtl" className="fixed inset-0 h-screen w-screen overflow-hidden bg-[#030303] font-heebo text-[#F4F1EB]">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_50%_42%,#17130d_0%,#030303_62%)]" />
      <CameraInterface brand={info.name || "FORGE ATELIER"} chapters={chapters} activeScene={activeScene} jumpToScene={jumpToScene} menuOpen={menuOpen} setMenuOpen={setMenuOpen} smoothProgress={smoothProgress} zDepthReadout={engine.zDepthReadout} lightX={engine.lightX} lightY={engine.lightY} cursorX={engine.cursorX} cursorY={engine.cursorY} accent={ACCENT} menuLabel="FORGE / ATELIER" contactLine={`${info.address || info.city} · ${info.phone}`} />
      <motion.main style={{ rotateX: rigRotateX, rotateY: rigRotateY, transformStyle: "preserve-3d", perspective: "1500px" }} className="relative h-full w-full">
        <CameraScene index={0} activeScene={activeScene} scene={scenes[0]} className="text-center">
          <div className="w-full max-w-6xl">
            <p className={chapterLabel} style={{ color: ACCENT }} dir="ltr">BESPOKE / PERFORMANCE / CRAFT</p>
            <h1 {...editsFor("hero.headline")} className="mx-auto mt-4 max-w-5xl font-frank text-4xl font-light leading-[1.08] tracking-[-.025em] text-white sm:text-6xl md:text-7xl lg:text-[5.4rem]">{hero.headline || "For Those Who Refuse Ordinary"}</h1>
            <div className="relative mx-auto mt-5 h-[27vh] min-h-[150px] w-full max-w-5xl overflow-hidden" style={{ maskImage: "radial-gradient(ellipse 72% 68% at 50% 50%,#000 38%,transparent 96%)", WebkitMaskImage: "radial-gradient(ellipse 72% 68% at 50% 50%,#000 38%,transparent 96%)" }}>
              {heroImage ? <img src={heroImage} alt={info.name || "Forge showroom"} className="h-full w-full object-cover contrast-125 brightness-[.62]" /> : <div className="h-full w-full bg-[linear-gradient(135deg,#292219,#050505_58%,#17130e)]" />}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_25%,#030303_100%),radial-gradient(ellipse_at_center,transparent_15%,#030303_95%)]" />
              <div className="absolute inset-x-[12%] top-[16%] h-px bg-gradient-to-r from-transparent via-[#C8A97E]/70 to-transparent" />
            </div>
            <p {...editsFor("hero.subheadline")} className={`${mutedCopy} mx-auto max-w-xl`}>{hero.subheadline || info.description}</p>
            <button type="button" onClick={() => jumpToScene(2)} className="mt-4 min-h-11 border-b px-3 text-[10px] tracking-[.18em] text-white transition hover:text-[#C8A97E]" style={{ borderColor: ACCENT }}>{hero.ctaText || "כניסה לקונפיגורטור"} ↗</button>
          </div>
        </CameraScene>

        <CameraScene index={1} activeScene={activeScene} scene={scenes[1]}>
          <div className="w-full max-w-6xl">
            <div className="mb-5 flex items-end justify-between gap-4 border-b border-white/10 pb-4"><div><p className={chapterLabel} style={{ color: ACCENT }} dir="ltr">02 / BESPOKE ARCHITECTURE</p><h2 className="mt-2 font-frank text-3xl font-light leading-tight sm:text-5xl">מפרטים שנבנים סביבכם</h2></div><span className="hidden text-[9px] text-white/40 sm:block" dir="ltr">{String(services.length).padStart(2, "0")} UNITS</span></div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">{services.slice(0, 4).map((service, index) => <TiltCard3D key={service.title + index} maxTilt={10} glare={.2}><button type="button" onClick={() => { setSelectedService(index); jumpToScene(2); }} className={`${glassPanel} glass-reflection group flex min-h-[160px] w-full flex-col justify-between p-4 text-right transition-colors hover:border-[#C8A97E]/60 md:min-h-[220px] md:p-5`}><span className="flex items-center justify-between gap-2 text-[8px] tracking-[.18em] text-white/40" dir="ltr"><span>UNIT / 0{index + 1}</span><span style={{ color: ACCENT }}>{service.price || "CUSTOM"}</span></span><span><h3 {...editsFor(`services.${index}.title`)} className="font-frank text-xl font-light leading-snug text-white md:text-2xl">{service.title}</h3><p {...editsFor(`services.${index}.description`)} className="mt-2 line-clamp-3 text-[10px] leading-5 text-white/55 sm:text-xs sm:leading-6">{service.description}</p></span><span className="mt-4 border-t border-white/10 pt-3 text-[8px] tracking-[.18em] text-white/50" dir="ltr">CONFIGURE ↗</span></button></TiltCard3D>)}</div>
          </div>
        </CameraScene>

        <CameraScene index={2} activeScene={activeScene} scene={scenes[2]}>
          <div className="max-h-[calc(100dvh-210px)] w-full max-w-6xl overflow-y-auto pr-1" data-native-scroll="true">
            <p className={chapterLabel} style={{ color: ACCENT }} dir="ltr">03 / COMMISSION CONFIGURATOR</p><h2 className="mt-2 font-frank text-3xl font-light sm:text-5xl">הרכבת מפרט פרויקט חי</h2>
            <div className="mt-5 grid gap-4 lg:grid-cols-12"><div className="space-y-3 lg:col-span-8"><div className={`${glassPanel} p-4`}><p className="mb-3 text-[8px] tracking-[.22em] text-white/40" dir="ltr">STAGE 01 / SYSTEM</p><div className="grid grid-cols-2 gap-2">{services.slice(0, 4).map((service, index) => <button type="button" key={service.title + index} onClick={() => setSelectedService(index)} className="min-h-11 border p-2 text-right text-xs transition" style={{ borderColor: selectedService === index ? ACCENT : "rgba(255,255,255,.12)", background: selectedService === index ? `${ACCENT}18` : "transparent", color: selectedService === index ? "#fff" : "rgba(255,255,255,.6)" }}>{service.title}</button>)}</div></div><div className="grid grid-cols-2 gap-3">{[{ title: "STAGE 02 / FINISH", values: ["SIGNATURE", "BESPOKE", "RESERVE"], current: tier, set: setTier }, { title: "STAGE 03 / TIMELINE", values: ["STANDARD", "PRIORITY", "VIP"], current: timeline, set: setTimeline }].map((group) => <div key={group.title} className={`${glassPanel} p-4`}><p className="mb-3 text-[8px] tracking-[.18em] text-white/40" dir="ltr">{group.title}</p><div className="space-y-2">{group.values.map((value) => <button type="button" key={value} onClick={() => group.set(value)} className="min-h-10 w-full border px-2 text-right text-[9px] tracking-[.08em]" style={{ borderColor: group.current === value ? ACCENT : "rgba(255,255,255,.1)", color: group.current === value ? ACCENT : "rgba(255,255,255,.55)" }}>{value}</button>)}</div></div>)}</div></div><aside className={`${glassPanel} flex flex-col justify-between p-5 lg:col-span-4`}><div><p className="border-b border-white/10 pb-3 text-[8px] tracking-[.22em]" style={{ color: ACCENT }} dir="ltr">TELEMETRY SUMMARY</p><p className="mt-4 text-[9px] text-white/45">מערכת</p><h3 className="mt-1 font-frank text-2xl font-light leading-snug">{services[selectedService]?.title || "פרויקט מותאם אישית"}</h3><p className="mt-4 text-xs" style={{ color: ACCENT }} dir="ltr">{tier} / {timeline}</p><p className="mt-4 text-sm text-white/75">{services[selectedService]?.price || "בהתאמה אישית"}</p></div><a href={specificationLink} target={number ? "_blank" : undefined} rel="noreferrer" className="mt-5 flex min-h-12 items-center justify-center bg-[#F1EEE7] px-4 text-center text-[10px] tracking-[.12em] text-black transition hover:bg-[#C8A97E]">שליחת המפרט ↗</a></aside></div>
          </div>
        </CameraScene>

        <CameraScene index={3} activeScene={activeScene} scene={scenes[3]}>
          <div className="w-full max-w-5xl"><div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className={chapterLabel} style={{ color: ACCENT }} dir="ltr">04 / VISUAL CALIBRATION</p><h2 className="mt-2 font-frank text-3xl font-light sm:text-5xl">השוואת רמת גימור חיה</h2></div><span className="text-[10px] text-white/50">גררו או השתמשו בחצים</span></div><BeforeAfterSlider theme={LUX_THEMES["forge-automotive"]} beforeImage={projects[0]?.beforeImage || heroImage} afterImage={projects[0]?.afterImage || heroImage} beforeLabel="לפני / מקור" afterLabel="אחרי / גימור" caption="" handleColor={ACCENT} /></div>
        </CameraScene>

        <CameraScene index={4} activeScene={activeScene} scene={scenes[4]} id="contact">
          <div className={`${glassPanel} grid max-h-[calc(100dvh-210px)] w-full max-w-6xl gap-7 overflow-y-auto p-6 md:p-10 lg:grid-cols-2`} data-native-scroll="true"><div><p className={chapterLabel} style={{ color: ACCENT }} dir="ltr">05 / PRIVATE COMMISSION</p><h2 className="mt-3 font-frank text-4xl font-light leading-[1.12] sm:text-5xl">מוכנים לפרויקט הבא שלכם?</h2><p className={`${mutedCopy} mt-4`}>{info.address || info.city} · {info.openingHours}</p><div className="mt-6 flex flex-wrap gap-3"><a href={whatsapp} target={number ? "_blank" : undefined} rel="noreferrer" className="flex min-h-12 items-center bg-[#F1EEE7] px-5 text-[10px] text-black transition hover:bg-[#C8A97E]">פתיחת שיחה ↗</a>{info.phone && <a href={`tel:${info.phone}`} className="flex min-h-12 items-center border border-white/25 px-5 text-[10px] text-white/75" dir="ltr">{info.phone}</a>}</div></div><div className="space-y-4 border-white/10 lg:border-r lg:pr-7">{reviews.slice(0, 2).map((review, index) => <blockquote key={review.author + index} className="border-b border-white/10 pb-4"><p className="font-frank text-lg font-light leading-8 text-white/80">“{review.text}”</p><footer className="mt-2 text-[10px]" style={{ color: ACCENT }}>{review.author}</footer></blockquote>)}{reviews.length === 0 && <p className={mutedCopy}>{info.description || hero.subheadline}</p>}<p className="text-[8px] tracking-[.22em] text-white/40" dir="ltr">PRIVATE APPOINTMENTS / {info.city || "ISRAEL"}</p></div></div>
        </CameraScene>
      </motion.main>
    </div>
  );
}
