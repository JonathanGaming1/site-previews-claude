"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type PlanId = "one-time" | "vip-monthly";
type QuizState = { frequency?: string; maintenance?: string; payment?: string };
const plans = [
  { id: "one-time" as const, name: "תוכנית חד-פעמית", price: "2,000 ₪", note: "תשלום חד-פעמי", badge: "בעלות מלאה על האתר", features: ["הקמת אתר פרימיום מותאם אישית לעסק שלך", "שנה ראשונה של אחסון ותחזוקה בחינם", "התאמה מלאה למובייל", "חיבור לוואטסאפ ורשתות חברתיות"] },
  { id: "vip-monthly" as const, name: "תוכנית VIP חודשית", price: "150 ₪", note: "לחודש • ללא התחייבות", badge: "ראש שקט — הכל עלינו", features: ["אתר פרימיום מותאם אישית לעסק שלך", "אחסון שרתים ותחזוקה שוטפת ללא הגבלת זמן", "עד 10 שינויי תוכן בשבוע על ידי הצוות", "גיבויים ואבטחה שוטפת"] },
];
const questions = [
  { key: "frequency" as const, title: "באיזו תדירות אתם מעדכנים את התוכן באתר?", options: [["seldom", "נדיר — פעם בכמה חודשים"], ["regular", "קבוע — פעם־פעמיים בשבוע"], ["always", "כל הזמן — תוכן חי ומתעדכן"]] },
  { key: "maintenance" as const, title: "מי אמור לטפל בתחזוקה הטכנית?", options: [["self", "אני אסתדר לבד — פשוט שיעבוד"], ["agency", "שהצוות שלכם יעשה זאת בשבילי"]] },
  { key: "payment" as const, title: "איך אתם מעדיפים לשלם על האתר?", options: [["one-time", "תשלום חד־פעמי"], ["monthly", "מנוי חודשי שמכסה שירות"]] },
];
const terms = [
  ["היעדר החזר כספי (No Refunds)", "הלקוח מאשר כי צפה באתר ההדגמה מראש וכי מדובר במוצר דיגיטלי שיוצר והותאם אישית לעסק שלו, ולכן בהתאם לחוק הגנת הצרכן לא ניתן לבטל את העסקה ולא יינתן החזר כספי לאחר הרכישה."],
  ["אחסון ועריכה בתוכנית החד־פעמית", "התוכנית כוללת שנת אחסון ראשונה בחינם. לאחר תום השנה הראשונה, באחריות הלקוח לאחסן את האתר באופן עצמאי ולבצע בו שינויים לבד, או לחדש אחסון ותחזוקה בתשלום."],
  ["מגבלת שינויים וזמני תגובה בתוכנית החודשית", "התוכנית כוללת עד 10 שינויי תוכן נקודתיים בשבוע. זמני ביצוע השינויים כפופים לעומס המערכת וללא התחייבות לזמן תגובה מיידי."],
];

export default function CheckoutPage() {
  const [selected, setSelected] = useState<PlanId | null>(null);
  const [recommended, setRecommended] = useState<PlanId | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [answers, setAnswers] = useState<QuizState>({});
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeNoRefund, setAgreeNoRefund] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const canOrder = selected && agreeTerms && agreeNoRefund;
  const choosePlan = (id: PlanId) => { setSelected(id); setAgreeTerms(false); setAgreeNoRefund(false); setOrdered(false); };
  const answer = (value: string) => {
    const question = questions[quizStep];
    const next = { ...answers, [question.key]: value };
    setAnswers(next);
    if (quizStep < 2) setQuizStep(quizStep + 1);
    else {
      const score = (next.payment === "one-time" ? 2 : 0) + (next.frequency === "seldom" ? 1 : 0) + (next.maintenance === "self" ? 1 : 0);
      setRecommended(score >= 2 ? "one-time" : "vip-monthly");
      setQuizOpen(false);
    }
  };

  return (
    <main dir="rtl" className="min-h-screen bg-[#07070B] px-5 py-14 pb-28 font-heebo text-[#F3F0EA]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_70%_0%,rgba(200,169,126,.14),transparent_55%)]" />
      <div className="relative mx-auto max-w-5xl">
        <header className="text-center"><p className="text-[10px] tracking-[.25em] text-[#C8A97E]">הזמנת אתר פרימיום • סוכנות עיצוב אוטומטית</p><h1 className="mt-5 font-frank text-4xl font-light leading-tight sm:text-6xl">בחרו את התוכנית המושלמת לעסק שלכם</h1><p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/55">שני מסלולים להשיג את האתר שראיתם בהדגמה — שניהם כוללים הקמה מלאה, עיצוב בהתאמה אישית ועלייה לאוויר.</p></header>
        <section className="mt-10 flex flex-col items-center justify-between gap-5 border border-white/10 bg-white/[.035] p-6 backdrop-blur-xl sm:flex-row"><div className="text-center sm:text-right"><h2 className="font-frank text-2xl font-light">איזו תוכנית הכי מתאימה לכם?</h2><p className="mt-2 text-xs leading-6 text-white/50">שלוש שאלות קצרות ונציג המלצה מותאמת.</p></div><button type="button" onClick={() => { setQuizStep(0); setQuizOpen(true); }} className="min-h-12 bg-[#C8A97E] px-6 text-xs font-semibold text-black">{recommended ? "הצגת ההמלצה שוב" : "התחלת שאלון"}</button></section>
        <div className="mt-8 grid gap-5 md:grid-cols-2">{plans.map((plan) => <article key={plan.id} className="relative border bg-[#0C0C12]/90 p-6 transition" style={{ borderColor: selected === plan.id ? "#C8A97E" : recommended === plan.id ? "rgba(200,169,126,.55)" : "rgba(255,255,255,.1)" }}>{recommended === plan.id && <span className="absolute -top-3 right-5 bg-[#C8A97E] px-3 py-1 text-[10px] font-semibold text-black">התוכנית המומלצת עבורך</span>}<p className="text-[10px] text-[#C8A97E]">{plan.badge}</p><h2 className="mt-3 font-frank text-3xl font-light">{plan.name}</h2><p className="mt-4 text-4xl font-semibold text-white">{plan.price}</p><p className="mt-1 text-xs text-white/45">{plan.note}</p><ul className="mt-6 space-y-3">{plan.features.map((feature) => <li key={feature} className="flex gap-3 text-xs leading-6 text-white/65"><span className="text-[#C8A97E]">—</span>{feature}</li>)}</ul><button type="button" onClick={() => choosePlan(plan.id)} aria-pressed={selected === plan.id} className="mt-7 min-h-12 w-full border text-xs font-semibold" style={{ background: selected === plan.id ? "#C8A97E" : "transparent", color: selected === plan.id ? "#000" : "#fff", borderColor: selected === plan.id ? "#C8A97E" : "rgba(255,255,255,.15)" }}>{selected === plan.id ? "התוכנית נבחרה" : "בחירת תוכנית"}</button></article>)}</div>
        <AnimatePresence>{selected && <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-8 border border-white/10 bg-[#0C0C12]/90 p-6 md:p-8"><h2 className="font-frank text-3xl font-light">תקנון ותנאי שימוש</h2><div tabIndex={0} className="mt-5 max-h-64 space-y-5 overflow-y-auto border border-white/10 bg-black/25 p-5 text-xs leading-6 text-white/55">{terms.map(([title, body], index) => <div key={title}><h3 className="font-semibold text-[#D8BE98]">{index + 1}. {title}</h3><p className="mt-1">{body}</p></div>)}<p>4. הרכישה מהווה אישור לכל התנאים המפורטים לעיל. לשאלה או הבהרה לפני תשלום, ניתן לפנות לצוות.</p></div><div className="mt-5 space-y-3"><label className="flex cursor-pointer items-start gap-3 border border-white/10 p-4 text-xs leading-6 text-white/65"><input type="checkbox" checked={agreeTerms} onChange={(event) => setAgreeTerms(event.target.checked)} className="mt-1 h-5 w-5 accent-[#C8A97E]" />אני מאשר/ת שקראתי את תקנון ותנאי השימוש במלואם ומסכים/ה להם.</label><label className="flex cursor-pointer items-start gap-3 border border-white/10 p-4 text-xs leading-6 text-white/65"><input type="checkbox" checked={agreeNoRefund} onChange={(event) => setAgreeNoRefund(event.target.checked)} className="mt-1 h-5 w-5 accent-[#C8A97E]" />אני מאשר/ת שמדובר במוצר דיגיטלי ללא החזר כספי לאחר הרכישה.</label></div><button type="button" disabled={!canOrder} onClick={() => setOrdered(true)} className="mt-6 min-h-13 w-full bg-[#C8A97E] py-4 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/35">המשך לתשלום</button>{ordered && <p role="status" className="mt-5 border border-emerald-400/30 bg-emerald-400/10 p-4 text-center text-sm text-emerald-300">ההזמנה התקבלה. צוות ההקמה יצור קשר לתיאום ההמשך.</p>}</motion.section>}</AnimatePresence>
      </div>
      <AnimatePresence>{quizOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-5 backdrop-blur-sm"><motion.div initial={{ scale: .96, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-lg border border-white/10 bg-[#0D0D13] p-6" role="dialog" aria-modal="true" aria-label="שאלון התאמת תוכנית"><div className="flex items-center justify-between"><span className="text-[10px] tracking-[.2em] text-[#C8A97E]">שאלה {quizStep + 1} מתוך 3</span><button type="button" onClick={() => setQuizOpen(false)} className="min-h-11 px-3 text-xs text-white/60">סגירה</button></div><h2 className="mt-3 font-frank text-3xl font-light leading-tight">{questions[quizStep].title}</h2><div className="mt-6 space-y-3">{questions[quizStep].options.map(([value, label]) => <button type="button" key={value} onClick={() => answer(value)} className="min-h-13 w-full border border-white/10 bg-white/[.035] px-4 py-3 text-right text-sm text-white/75 transition hover:border-[#C8A97E]/60">{label}</button>)}</div>{quizStep > 0 && <button type="button" onClick={() => setQuizStep(quizStep - 1)} className="mt-5 min-h-11 text-xs text-white/50">חזרה לשאלה הקודמת</button>}</motion.div></motion.div>}</AnimatePresence>
    </main>
  );
}
