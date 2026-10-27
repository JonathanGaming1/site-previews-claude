"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { LockKeyhole, ShieldCheck, X } from "lucide-react";
import { useSite } from "@/components/SiteProvider";

export function AdminLogin() {
  const { isAdmin, mounted, loginAdmin } = useSite();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("login") === "1") {
      setOpen(true);
      url.searchParams.delete("login");
      window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
    }
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || !password) return;
    setBusy(true);
    setError("");
    const result = await loginAdmin(password);
    setBusy(false);
    if (result) {
      setError(result === "invalid_credentials" ? "הסיסמה אינה נכונה." : result === "too_many_attempts" ? "יותר מדי ניסיונות. נסה שוב בעוד 15 דקות." : "לא ניתן להתחבר כרגע. בדוק את החיבור ונסה שוב.");
      return;
    }
    setPassword("");
    setOpen(false);
  };

  return (
    <>
      {mounted && (
        <button type="button" onClick={() => { setError(""); setOpen(true); }}
          aria-label={isAdmin ? "מחובר כמנהל" : "כניסת מנהל"}
          title={isAdmin ? "מחובר כמנהל" : "כניסת מנהל"}
          className="fixed bottom-20 left-4 z-[100000] flex h-10 w-10 items-center justify-center border border-white/15 bg-black/60 text-white/75 shadow-xl backdrop-blur-xl transition hover:border-white/35 hover:text-white">
          {isAdmin ? <ShieldCheck size={17} /> : <LockKeyhole size={17} />}
        </button>
      )}

      {open && !isAdmin && (
        <div className="fixed inset-0 z-[200000] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md" onClick={() => setOpen(false)}>
          <section role="dialog" aria-modal="true" aria-labelledby="admin-login-title" className="w-full max-w-sm border border-white/15 bg-[#0b0b0e] p-6 text-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <header className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] tracking-[0.25em] text-white/45">PRIVATE ACCESS</p>
                <h2 id="admin-login-title" className="mt-2 text-xl font-medium">כניסת מנהל</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="סגור" className="p-2 text-white/55 hover:text-white"><X size={18} /></button>
            </header>
            <form onSubmit={submit}>
              <label htmlFor="admin-password" className="mb-2 block text-sm text-white/70">סיסמת מנהל</label>
              <input id="admin-password" type="password" autoComplete="current-password" value={password}
                onChange={(event) => setPassword(event.target.value)} required maxLength={1024} autoFocus
                className="w-full border border-white/15 bg-white/[0.04] px-4 py-3 text-sm outline-none transition focus:border-white/40"
                placeholder="הזן סיסמה" />
              {error && <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>}
              <button type="submit" disabled={busy || !password} className="mt-5 w-full bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-40">
                {busy ? "מתחבר..." : "התחברות מאובטחת"}
              </button>
              <p className="mt-4 text-xs leading-6 text-white/40">הסיסמה נשלחת לשרת דרך HTTPS ואינה נשמרת בכתובת או באחסון הדפדפן.</p>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
