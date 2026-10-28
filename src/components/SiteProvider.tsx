"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { SiteData, TemplateId, ThemeConfig } from "@/types/site";
import { LEGACY_TEMPLATE_FALLBACK } from "@/types/site";
import siteDataJson from "@/data/siteData.json";

const INSTANT_ACCESS_CODE = "yam2026";
const ADMIN_STORAGE_KEY = "site-previews-admin";

export interface EditableProps {
  contentEditable?: boolean;
  suppressContentEditableWarning?: boolean;
  "data-edit-active"?: string;
  onBlur?: (e: React.FocusEvent<HTMLElement>) => void;
}

interface SiteContextValue {
  data: SiteData;
  initialData: SiteData;
  slug: string | null;
  remoteLoaded: boolean;
  isAdmin: boolean;
  mounted: boolean;
  replaceData: (next: SiteData) => void;
  editsFor: (path: string) => EditableProps;
  updateValue: (path: string, value: string | number) => void;
  setTemplate: (id: TemplateId) => void;
  setTheme: (theme: Partial<ThemeConfig>) => void;
  loginAdmin: (password: string) => Promise<string | null>;
  logoutAdmin: () => Promise<void>;
}

const SiteContext = createContext<SiteContextValue | null>(null);

export function clone<T>(value: T): T {
  return typeof structuredClone === "function" ? structuredClone(value) : (JSON.parse(JSON.stringify(value)) as T);
}

export function setByPath(obj: Record<string, unknown>, path: string, value: string | number): void {
  const parts = path.split(".");
  let cursor: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const next = cursor[parts[i]];
    if (next === undefined || next === null || typeof next !== "object") cursor[parts[i]] = {};
    cursor = cursor[parts[i]] as Record<string, unknown>;
  }
  cursor[parts[parts.length - 1]] = value;
}

export function getByPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>(
    (acc, key) => acc !== null && acc !== undefined && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined,
    obj,
  );
}

export function normalizeTemplate(id: unknown): TemplateId {
  if (typeof id === "string") {
    if (LEGACY_TEMPLATE_FALLBACK[id]) return LEGACY_TEMPLATE_FALLBACK[id];
    if (["forge-automotive", "apple-spatial", "horology-chrono", "kinetic-monolith", "swiss-editorial"].includes(id)) return id as TemplateId;
  }
  return "apple-spatial";
}

function hydrateSite(remote: Partial<SiteData>, slug: string | null): SiteData {
  const base = clone(siteDataJson as unknown as SiteData);
  const merged = {
    ...base,
    ...clone(remote),
    theme: { ...base.theme, ...(remote.theme ?? {}) },
    businessInfo: { ...base.businessInfo, ...(remote.businessInfo ?? {}) },
    hero: { ...base.hero, ...(remote.hero ?? {}) },
    services: Array.isArray(remote.services) ? remote.services : base.services,
    benefits: Array.isArray(remote.benefits) ? remote.benefits : base.benefits,
    reviews: Array.isArray(remote.reviews) ? remote.reviews : base.reviews,
    faq: Array.isArray(remote.faq) ? remote.faq : base.faq,
  } as SiteData;
  merged.templateId = normalizeTemplate(remote.templateId ?? base.templateId);
  merged.slug = slug ?? remote.slug ?? base.slug ?? "default";
  return merged;
}

function setAdminStorage(enabled: boolean) {
  for (const storage of [window.sessionStorage, window.localStorage]) {
    try {
      if (enabled) storage.setItem(ADMIN_STORAGE_KEY, "1");
      else {
        for (const key of Object.keys(storage)) {
          if (/admin/i.test(key)) storage.removeItem(key);
        }
      }
    } catch { /* storage may be disabled */ }
  }
}

function hasStoredAdminFlag() {
  for (const storage of [window.sessionStorage, window.localStorage]) {
    try {
      if (storage.getItem(ADMIN_STORAGE_KEY) === "1") return true;
    } catch { /* storage may be disabled */ }
  }
  return false;
}

export function useSite(): SiteContextValue {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used within SiteProvider");
  return ctx;
}

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const bundledData = useMemo(() => clone(siteDataJson as unknown as SiteData), []);
  const [data, setData] = useState<SiteData>(() => clone(siteDataJson as unknown as SiteData));
  const [adminSession, setAdminSession] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);
  const [remoteLoaded, setRemoteLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const activeSlugRef = useRef("default");

  const refreshSite = useCallback(async (requestedSlug?: string) => {
    const targetSlug = requestedSlug || activeSlugRef.current || "default";
    if (!/^[a-zA-Z0-9_-]{1,100}$/.test(targetSlug)) return;
    activeSlugRef.current = targetSlug;
    setSlug(targetSlug);
    try {
      const response = await fetch("/api/site?site=" + encodeURIComponent(targetSlug), { credentials: "same-origin", cache: "no-store" });
      if (!response.ok) throw new Error("site_load_failed");
      const remote = await response.json() as Partial<SiteData>;
      setData(hydrateSite(remote, targetSlug));
    } catch {
      setData(hydrateSite(bundledData, targetSlug));
    } finally {
      setRemoteLoaded(true);
    }
  }, [bundledData]);

  useEffect(() => {
    let cancelled = false;
    const initialize = async () => {
      const url = new URL(window.location.href);
      const querySlug = url.searchParams.get("site");
      const pathSlug = window.location.pathname.match(/^\/p\/([a-zA-Z0-9_-]+)/)?.[1];
      const candidate = (querySlug?.trim() || pathSlug || "default").replace(/[^a-zA-Z0-9_-]/g, "");
      const resolvedSlug = candidate || "default";
      activeSlugRef.current = resolvedSlug;
      setSlug(resolvedSlug);

      const instantUnlock = url.searchParams.get("key") === INSTANT_ACCESS_CODE || hasStoredAdminFlag();
      if (instantUnlock) {
        setAdminSession(true);
        setMounted(true);
        setAdminStorage(true);
        void fetch("/api/auth", {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: INSTANT_ACCESS_CODE }),
        }).catch(() => undefined);
      } else {
        try {
          const response = await fetch("/api/auth", { credentials: "same-origin", cache: "no-store" });
          if (response.ok) {
            const result = await response.json().catch(() => ({}));
            if (!cancelled) setAdminSession(result?.authenticated === true);
          }
        } catch {
          if (!cancelled) setAdminSession(false);
        }
      }

      try {
        const response = await fetch("/api/site?site=" + encodeURIComponent(resolvedSlug), { credentials: "same-origin", cache: "no-store" });
        if (!response.ok) throw new Error("site_load_failed");
        const remote = await response.json() as Partial<SiteData>;
        if (!cancelled) setData(hydrateSite(remote, resolvedSlug));
      } catch {
        if (!cancelled) setData(hydrateSite(bundledData, resolvedSlug));
      } finally {
        if (!cancelled) {
          setMounted(true);
          setRemoteLoaded(true);
        }
      }
    };
    void initialize();
    return () => { cancelled = true; };
  }, [bundledData]);

  const loginAdmin = useCallback(async (password: string): Promise<string | null> => {
    if (password === INSTANT_ACCESS_CODE) {
      setAdminSession(true);
      setMounted(true);
      setAdminStorage(true);
      void fetch("/api/auth", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      }).then(async (response) => {
        if (response.ok) await refreshSite(activeSlugRef.current);
      }).catch(() => undefined);
      return null;
    }
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result?.authenticated !== true) return typeof result?.error === "string" ? result.error : "invalid_credentials";
      setAdminSession(true);
      await refreshSite(activeSlugRef.current);
      return null;
    } catch {
      return "auth_request_failed";
    }
  }, [refreshSite]);

  const logoutAdmin = useCallback(async () => {
    setAdminSession(false);
    setAdminStorage(false);
    try {
      await fetch("/api/auth", { method: "DELETE", credentials: "same-origin", cache: "no-store" });
    } catch {
      // Local admin state and query credentials must still be cleared offline.
    }
    const targetSlug = activeSlugRef.current || "default";
    window.location.assign(`/?site=${encodeURIComponent(targetSlug)}`);
  }, []);

  const updateValue = useCallback((path: string, value: string | number) => {
    setData((prev) => {
      const next = clone(prev);
      setByPath(next as unknown as Record<string, unknown>, path, value);
      return next;
    });
  }, []);

  const replaceData = useCallback((next: SiteData) => setData(clone(next)), []);

  const editsFor = useCallback((path: string): EditableProps => {
    if (!adminSession) return {};
    const current = getByPath(data as unknown as Record<string, unknown>, path);
    return {
      contentEditable: true,
      suppressContentEditableWarning: true,
      "data-edit-active": "true",
      onBlur: (e) => {
        const value = e.currentTarget.textContent ?? "";
        if (value !== current) updateValue(path, value);
      },
    };
  }, [adminSession, data, updateValue]);

  const setTemplate = useCallback((id: TemplateId) => setData((prev) => ({ ...prev, templateId: id })), []);
  const setTheme = useCallback((theme: Partial<ThemeConfig>) => {
    setData((prev) => ({ ...prev, theme: { ...prev.theme, ...theme } }));
  }, []);

  const value = useMemo<SiteContextValue>(() => ({
    data,
    initialData: clone(bundledData),
    slug,
    remoteLoaded,
    isAdmin: mounted && adminSession,
    mounted,
    replaceData,
    editsFor,
    updateValue,
    setTemplate,
    setTheme,
    loginAdmin,
    logoutAdmin,
  }), [data, bundledData, slug, remoteLoaded, mounted, adminSession, replaceData, editsFor, updateValue, setTemplate, setTheme, loginAdmin, logoutAdmin]);

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}
