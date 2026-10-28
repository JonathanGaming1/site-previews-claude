"use client";

import React, { useMemo, useState } from "react";
import { Check, Clock3, LogOut, RotateCcw, X } from "lucide-react";
import { useSite } from "@/components/SiteProvider";
import { TEMPLATE_OPTIONS, type SiteData } from "@/types/site";

type AdminAction = "manual_save" | "ai_edit" | "recall";

function clearSiteCache(slug: string) {
  try {
    for (const key of Object.keys(window.localStorage)) {
      if (key.includes(slug) && /cache|site_data|preview_data/i.test(key)) window.localStorage.removeItem(key);
    }
  } catch { /* storage may be disabled */ }
}

function friendlyError(code: string) {
  const messages: Record<string, string> = {
    github_not_configured: "לא הוגדר GITHUB_TOKEN ב-Cloudflare.",
    unauthorized: "פג תוקף החיבור. התחבר מחדש.",
    origin_not_allowed: "הבקשה נדחתה מטעמי אבטחה.",
    github_write_conflict: "האתר השתנה במקביל. רענן ונסה שוב.",
    admin_state_write_failed: "לא ניתן לשמור היסטוריית עריכה פרטית.",
    admin_state_read_failed: "לא ניתן לקרוא היסטוריית עריכה פרטית.",

    groq_not_configured: "לא הוגדר GROQ_API_KEY ב-Cloudflare.",
    site_not_found: "קובץ האתר לא נמצא ב-GitHub.",
    checkpoint_not_found: "נקודת השחזור לא נמצאה.",
    groq_request_failed: "שירות ה-AI לא הצליח להשלים את הבקשה.",
    github_read_failed: "לא ניתן לקרוא את קובץ האתר מ-GitHub.",
    github_write_failed: "לא ניתן לשמור את קובץ האתר ב-GitHub.",
  };
  return messages[code] || "הפעולה נכשלה. בדוק את הגדרות Cloudflare ונסה שוב.";
}

export function AdminToolbar() {
  const { data, isAdmin, mounted, slug, setTemplate, setTheme, replaceData, logoutAdmin } = useSite();
  const [aiOpen, setAiOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [recallOpen, setRecallOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const targetSlug = slug ?? data.slug ?? "default";
  const checkpoints = useMemo(() => [...(data.checkpoints ?? [])].reverse(), [data.checkpoints]);

  const runAdmin = async (
    action: AdminAction,
    extra: { prompt?: string; updatedData?: SiteData; checkpointId?: string; recallLabel?: string } = {},
  ) => {
    if (!isAdmin) {
      setStatus("אין הרשאת מנהל פעילה. פתח שוב את קישור המנהל.");
      return false;
    }
    setBusy(true);
    setStatus(action === "ai_edit" ? "ה-AI עורך את האתר..." : action === "recall" ? "משחזר גרסה..." : "שומר שינויים...");
    try {
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({ action, slug: targetSlug, repo: "site-previews-kimi", ...extra }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result?.ok !== true || !result?.updatedData) {
        throw new Error(typeof result?.error === "string" ? result.error : "request_failed");
      }
      replaceData(result.updatedData as SiteData);
      clearSiteCache(targetSlug);
      setStatus(action === "ai_edit" ? "השינוי נשמר והאתר עודכן." : action === "recall" ? "הגרסה שוחזרה בהצלחה." : "השינויים נשמרו ב-GitHub.");
      return true;
    } catch (error) {
      setStatus(friendlyError(error instanceof Error ? error.message : "request_failed"));
      return false;
    } finally {
      setBusy(false);
    }
  };

  if (!mounted || !isAdmin) return null;
  if (collapsed) return <button type="button" onClick={() => setCollapsed(false)} className="fixed bottom-4 left-4 z-[100001] border border-white/20 bg-black/85 px-4 py-2 text-xs text-white backdrop-blur-xl">Admin · פתיחה</button>;

  return (
    <>
      <div className="fixed inset-x-2 top-2 z-[100001] mx-auto flex max-w-[1400px] flex-wrap items-center gap-2 border border-white/10 bg-[#09090b]/95 p-2 text-xs text-white shadow-2xl backdrop-blur-2xl sm:inset-x-4">
        <span className="px-2 font-semibold tracking-wide text-white/75">AGENCY / EDITOR</span>
        <select value={data.templateId} disabled={busy} onChange={(e) => setTemplate(e.target.value as SiteData["templateId"])} aria-label="בחירת תבנית" className="max-w-[240px] border border-white/10 bg-[#151518] px-2 py-2 text-white disabled:opacity-50">
          {TEMPLATE_OPTIONS.map((template) => <option key={template.id} value={template.id}>{template.label}</option>)}
        </select>
        <label className="flex items-center gap-1 border border-white/10 px-2 py-1.5">ראשי <input type="color" value={data.theme.primaryColor} disabled={busy} onChange={(e) => setTheme({ primaryColor: e.target.value })} aria-label="צבע ראשי" /></label>
        <label className="flex items-center gap-1 border border-white/10 px-2 py-1.5">מבטא <input type="color" value={data.theme.accentColor} disabled={busy} onChange={(e) => setTheme({ accentColor: e.target.value })} aria-label="צבע מבטא" /></label>
        <button type="button" disabled={busy} onClick={() => setAiOpen(true)} className="border border-white/15 px-3 py-2 hover:bg-white/10 disabled:opacity-50">בקש שינוי מ-AI</button>
        <button type="button" disabled={busy} onClick={() => void runAdmin("manual_save", { updatedData: data })} className="flex items-center gap-1 border border-emerald-300/30 bg-emerald-400/10 px-3 py-2 text-emerald-200 hover:bg-emerald-400/20 disabled:opacity-50"><Check size={14}/> שמור שינויים</button>
        <button type="button" disabled={busy} onClick={() => setRecallOpen(true)} className="flex items-center gap-1 border border-white/15 px-3 py-2 hover:bg-white/10 disabled:opacity-50"><Clock3 size={14}/> חזור לגרסה קודמת (Recall)</button>
        <button type="button" onClick={() => void logoutAdmin()} className="flex items-center gap-1 border border-red-400/40 bg-red-500/15 px-3 py-2 font-medium text-red-100 transition hover:bg-red-500/25 focus-visible:outline-red-300"><LogOut size={14}/> יציאה ממצב אדמין</button>
        <span className="mr-auto text-white/40" dir="ltr">/p/{targetSlug}</span>
        {busy && <span className="text-white/50">מעבד...</span>}
        {status && <span role="status" className="text-emerald-200">{status}</span>}
        <button type="button" onClick={() => setCollapsed(true)} aria-label="קפל סרגל" className="p-2 text-white/55 hover:text-white"><X size={15}/></button>
      </div>

      {aiOpen && <div className="fixed inset-0 z-[100002] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
        <section role="dialog" aria-modal="true" aria-labelledby="ai-edit-title" className="w-full max-w-xl border border-white/15 bg-[#101013] p-6 text-white shadow-2xl">
          <header className="mb-5 flex items-center justify-between"><h2 id="ai-edit-title" className="text-xl font-light">עריכה באמצעות AI</h2><button type="button" onClick={() => setAiOpen(false)} aria-label="סגור"><X size={18}/></button></header>
          <p className="mb-4 text-sm leading-7 text-white/60">תאר את השינוי המבוקש. הבקשה תישלח לשירות השרת ותישמר ב-GitHub.</p>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={5} className="w-full border border-white/15 bg-black/40 p-3 text-sm outline-none focus:border-white/40" placeholder="לדוגמה: שכתב את הכותרת הראשית והוסף שירות חדש..." />
          <div className="mt-4 flex justify-end gap-2"><button type="button" disabled={busy} onClick={() => setAiOpen(false)} className="px-4 py-2 text-white/60">ביטול</button><button type="button" disabled={busy || !prompt.trim()} onClick={async () => { const nextPrompt = prompt.trim(); const success = await runAdmin("ai_edit", { prompt: nextPrompt }); if (success) { setPrompt(""); setAiOpen(false); } }} className="border border-white/20 bg-white px-5 py-2 font-medium text-black disabled:opacity-40">{busy ? "שולח..." : "שלח בקשה"}</button></div>
        </section>
      </div>}

      {recallOpen && <div className="fixed inset-0 z-[100002] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
        <section className="w-full max-w-xl border border-white/15 bg-[#101013] p-6 text-white shadow-2xl">
          <header className="mb-5 flex items-center justify-between"><h2 className="text-xl font-light">Recall / נקודות שחזור</h2><button type="button" onClick={() => setRecallOpen(false)} aria-label="סגור"><X size={18}/></button></header>
          {data.initialBackup && <button type="button" disabled={busy} onClick={() => { setRecallOpen(false); void runAdmin("recall", { recallLabel: "initialBackup" }); }} className="mb-3 w-full border border-amber-300/30 bg-amber-300/10 p-4 text-right hover:bg-amber-300/15 disabled:opacity-50">שחזור הגרסה המקורית</button>}
          <div className="max-h-[50vh] space-y-2 overflow-y-auto">{checkpoints.length === 0 && <p className="py-8 text-center text-sm text-white/45">עדיין אין נקודות שמירה.</p>}
            {checkpoints.map((checkpoint) => <button type="button" key={checkpoint.id} disabled={busy} onClick={() => { setRecallOpen(false); void runAdmin("recall", { checkpointId: checkpoint.id }); }} className="flex w-full items-center justify-between border border-white/10 p-3 text-right hover:bg-white/5 disabled:opacity-50"><span><span className="block">{checkpoint.label}</span><span className="mt-1 block text-xs text-white/45">{new Date(checkpoint.timestamp).toLocaleString("he-IL")}</span></span><RotateCcw size={15}/></button>)}
          </div>
        </section>
      </div>}
    </>
  );
}
