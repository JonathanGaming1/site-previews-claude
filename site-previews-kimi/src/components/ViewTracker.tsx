"use client";

import { useEffect, useRef } from "react";
import { useSite } from "@/components/SiteProvider";

const COOLDOWN_MS = 5 * 60 * 1000;

function detectDevice() {
  const ua = navigator.userAgent || "";
  if (/iPad|Tablet/i.test(ua)) return "Tablet";
  if (/Android/i.test(ua)) return "Android";
  if (/iPhone|iPod/i.test(ua)) return "iPhone";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Macintosh|Mac OS/i.test(ua)) return "Mac";
  if (/Linux/i.test(ua)) return "Linux";
  return "Browser";
}

export function ViewTracker() {
  const { data, isAdmin, mounted, remoteLoaded, slug } = useSite();
  const started = useRef(false);

  useEffect(() => {
    if (!mounted || !remoteLoaded || started.current || isAdmin) return;
    started.current = true;

    const pathSlug = window.location.pathname.match(/^\/p\/([a-zA-Z0-9_-]+)/)?.[1];
    const targetSlug = String(slug || data.slug || pathSlug || "").replace(/[^a-zA-Z0-9_-]/g, "");
    if (!targetSlug) return;

    const storageKey = "visit_ts_" + targetSlug;
    const deviceStorageKey = "visit_ts_device";
    const now = Date.now();
    let insideCooldown = false;

    try {
      const previousSlug = Number(window.localStorage.getItem(storageKey) || "0");
      const previousDevice = Number(window.localStorage.getItem(deviceStorageKey) || "0");
      insideCooldown = [previousSlug, previousDevice].some(
        (timestamp) => Number.isFinite(timestamp) && timestamp > 0 && now - timestamp < COOLDOWN_MS,
      );
      window.localStorage.setItem(storageKey, String(now));
      window.localStorage.setItem(deviceStorageKey, String(now));
      if (insideCooldown) return;
    } catch {
      // Continue with the server-side HttpOnly cookie and worker cooldown if storage is blocked.
    }

    void fetch("/api/track", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: targetSlug,
        businessName: data.businessInfo?.name || "עסק לא מזוהה",
        templateId: data.templateId || "unknown",
        device: detectDevice(),
        url: window.location.origin + window.location.pathname,
      }),
      keepalive: true,
    }).then(async (response) => {
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result?.ok !== true) {
        try {
          if (window.localStorage.getItem(storageKey) === String(now)) window.localStorage.removeItem(storageKey);
        } catch {
          // The HttpOnly cookie / server cooldown remain the source of truth.
        }
      }
    }).catch(() => {
      try {
        if (window.localStorage.getItem(storageKey) === String(now)) window.localStorage.removeItem(storageKey);
      } catch {
        // Ignore blocked browser storage.
      }
    });
  }, [data.businessInfo?.name, data.slug, data.templateId, isAdmin, mounted, remoteLoaded, slug]);

  return null;
}
