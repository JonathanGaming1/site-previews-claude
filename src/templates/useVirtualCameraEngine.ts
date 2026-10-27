"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export function useVirtualCameraEngine(menuOpen = false) {
  const rawProgress = useMotionValue(0);
  const smoothProgress = useSpring(rawProgress, { stiffness: 48, damping: 19, mass: 0.95 });
  const [activeScene, setActiveScene] = useState(0);
  const touchStartY = useRef(0);
  const touchStartedOnControl = useRef(false);
  const snapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const cursorRawX = useMotionValue(-100);
  const cursorRawY = useMotionValue(-100);
  const cursorX = useSpring(cursorRawX, { stiffness: 400, damping: 28, mass: 0.35 });
  const cursorY = useSpring(cursorRawY, { stiffness: 400, damping: 28, mass: 0.35 });
  const rigRotateXRaw = useTransform(mouseY, [-0.5, 0.5], [8, -8]);
  const rigRotateYRaw = useTransform(mouseX, [-0.5, 0.5], [-12, 12]);
  const lightXRaw = useTransform(mouseX, [-0.5, 0.5], [6, 94]);
  const lightYRaw = useTransform(mouseY, [-0.5, 0.5], [7, 93]);
  const rigRotateX = useSpring(rigRotateXRaw, { stiffness: 85, damping: 22 });
  const rigRotateY = useSpring(rigRotateYRaw, { stiffness: 85, damping: 22 });
  const lightX = useSpring(lightXRaw, { stiffness: 70, damping: 20 });
  const lightY = useSpring(lightYRaw, { stiffness: 70, damping: 20 });
  const zDepthReadout = useTransform(smoothProgress, (value) => "Z // -" + String(Math.round(value * 4800)).padStart(4, "0") + " MM");

  useEffect(() => {
    const unsubscribe = smoothProgress.on("change", (value) => {
      setActiveScene(Math.min(4, Math.max(0, Math.round(value * 4))));
    });
    return () => unsubscribe();
  }, [smoothProgress]);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    html.classList.add("virtual-camera-active");
    body.classList.add("virtual-camera-active");
    return () => {
      html.classList.remove("virtual-camera-active");
      body.classList.remove("virtual-camera-active");
    };
  }, []);

  useEffect(() => {
    const interactiveSelector = 'input, textarea, select, button, a, summary, [role="button"], [contenteditable="true"], [data-camera-interactive], [data-native-scroll], [data-wheel-guard]';
    const isInteractiveTarget = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return false;
      return Boolean(target.closest(interactiveSelector));
    };
    const cancelPendingSnap = () => {
      if (snapTimeoutRef.current) {
        clearTimeout(snapTimeoutRef.current);
        snapTimeoutRef.current = null;
      }
    };
    const scheduleMagneticSnap = () => {
      cancelPendingSnap();
      snapTimeoutRef.current = setTimeout(() => {
        const nearestScene = Math.round(rawProgress.get() * 4);
        rawProgress.set(nearestScene / 4);
        snapTimeoutRef.current = null;
      }, 220);
    };
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey || menuOpen || isInteractiveTarget(e.target)) return;
      e.preventDefault();
      const delta = e.deltaY * 0.00018;
      rawProgress.set(clamp(rawProgress.get() + delta));
      scheduleMagneticSnap();
    };
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0]?.clientY ?? 0;
      touchStartedOnControl.current = isInteractiveTarget(e.target);
      if (!touchStartedOnControl.current) cancelPendingSnap();
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartedOnControl.current || menuOpen) return;
      if (e.cancelable) e.preventDefault();
      const currentY = e.touches[0]?.clientY ?? touchStartY.current;
      const delta = touchStartY.current - currentY;
      touchStartY.current = currentY;
      if (Math.abs(delta) < 0.01) return;
      rawProgress.set(clamp(rawProgress.get() + delta * 0.0012));
      scheduleMagneticSnap();
    };
    const handleTouchEnd = () => {
      if (!touchStartedOnControl.current && !menuOpen) scheduleMagneticSnap();
      touchStartedOnControl.current = false;
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && isInteractiveTarget(target)) return;
      if (event.key === "ArrowDown" || event.key === "PageDown" || event.key === " ") {
        event.preventDefault();
        if (!menuOpen) {
          rawProgress.set(clamp(rawProgress.get() + (event.key === " " ? 0.2 : 0.12)));
          scheduleMagneticSnap();
        }
      } else if (event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        if (!menuOpen) {
          rawProgress.set(clamp(rawProgress.get() - 0.12));
          scheduleMagneticSnap();
        }
      } else if (event.key === "Home") {
        event.preventDefault();
        if (!menuOpen) {
          cancelPendingSnap();
          rawProgress.set(0);
        }
      } else if (event.key === "End") {
        event.preventDefault();
        if (!menuOpen) {
          cancelPendingSnap();
          rawProgress.set(1);
        }
      }
    };
    const handleMouseMove = (event: MouseEvent) => {
      mouseX.set(event.clientX / Math.max(1, window.innerWidth) - 0.5);
      mouseY.set(event.clientY / Math.max(1, window.innerHeight) - 0.5);
      cursorRawX.set(event.clientX);
      cursorRawY.set(event.clientY);
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      cancelPendingSnap();
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [menuOpen, rawProgress, mouseX, mouseY, cursorRawX, cursorRawY]);

  const jumpToScene = (sceneIndex: number) => {
    cancelPendingSnapSafe();
    rawProgress.set(clamp(sceneIndex / 4));
  };

  function cancelPendingSnapSafe() {
    if (snapTimeoutRef.current) {
      clearTimeout(snapTimeoutRef.current);
      snapTimeoutRef.current = null;
    }
  }

  return { rawProgress, smoothProgress, activeScene, jumpToScene, rigRotateX, rigRotateY, lightX, lightY, cursorX, cursorY, zDepthReadout };
}

const sceneConfigs = [
  { input: [0, 0.12, 0.24], scale: [1, 2.2, 4.2], opacity: [1, 0.55, 0], z: [0, 250, 800] },
  { input: [0.13, 0.25, 0.38, 0.49], scale: [0.45, 1, 1, 2.4], opacity: [0, 1, 1, 0], z: [-520, 0, 0, 720] },
  { input: [0.26, 0.5, 0.63, 0.74], scale: [0.4, 1, 1, 2.35], opacity: [0, 1, 1, 0], z: [-540, 0, 0, 720] },
  { input: [0.51, 0.75, 0.86, 0.99], scale: [0.4, 1, 1, 2.2], opacity: [0, 1, 1, 0], z: [-560, 0, 0, 700] },
  { input: [0.76, 0.94, 1], scale: [0.45, 0.9, 1], opacity: [0, 1, 1], z: [-560, 0, 0] },
];

export function useVirtualCameraScene(progress: MotionValue<number>, sceneIndex: number) {
  const config = sceneConfigs[sceneIndex] ?? sceneConfigs[0];
  const scale = useTransform(progress, [...config.input], [...config.scale]);
  const opacity = useTransform(progress, [...config.input], [...config.opacity]);
  const z = useTransform(progress, [...config.input], [...config.z]);
  return { scale, opacity, z };
}
