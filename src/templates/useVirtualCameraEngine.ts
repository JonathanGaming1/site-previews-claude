"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";

const LAST_SCENE = 4;
const clampScene = (value: number) => Math.min(LAST_SCENE, Math.max(0, value));

export function useVirtualCameraEngine(menuOpen = false) {
  // Camera coordinates are exact scene indices: 0, 1, 2, 3, 4.
  const rawScene = useMotionValue(0);
  const smoothScene = useSpring(rawScene, { stiffness: 75, damping: 22, mass: 0.75 });
  // Normalized progress is reserved for decorative animation and interface meters.
  const smoothProgress = useTransform(smoothScene, [0, LAST_SCENE], [0, 1]);
  const [activeScene, setActiveScene] = useState(0);
  const touchStartY = useRef(0);
  const touchStartedOnControl = useRef(false);
  const snapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
  const zDepthReadout = useTransform(smoothScene, (value) => "Z // -" + String(Math.round(value * 1200)).padStart(4, "0") + " MM");

  useEffect(() => {
    const unsubscribe = smoothScene.on("change", (value) => {
      setActiveScene(clampScene(Math.round(value)));
    });
    return () => unsubscribe();
  }, [smoothScene]);

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
    const controlSelector = 'input, textarea, select, button, a, summary, [role="button"], [role="slider"], [contenteditable="true"], [data-camera-interactive], [data-native-scroll], [data-wheel-guard]';
    const wheelGuardSelector = 'input, textarea, select, [contenteditable="true"], [role="dialog"], [data-native-scroll], [data-wheel-guard]';
    const closestElement = (target: EventTarget | null, selector: string) => target instanceof Element ? target.closest(selector) : null;
    const isInteractiveTarget = (target: EventTarget | null) => Boolean(closestElement(target, controlSelector));
    const scrollableSceneContent = (target: EventTarget | null): HTMLElement | null => {
      const element = closestElement(target, "[data-scene-content]");
      return element instanceof HTMLElement && element.scrollHeight > element.clientHeight + 1 ? element : null;
    };
    const cancelPendingSnap = () => {
      if (snapTimeoutRef.current) {
        clearTimeout(snapTimeoutRef.current);
        snapTimeoutRef.current = null;
      }
    };
    let wheelCameraGesture = false;
    const scheduleMagneticSnap = () => {
      cancelPendingSnap();
      snapTimeoutRef.current = setTimeout(() => {
        const targetIndex = Math.round(rawScene.get());
        rawScene.set(clampScene(targetIndex));
        wheelCameraGesture = false;
        snapTimeoutRef.current = null;
      }, 160);
    };
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey || menuOpen || closestElement(e.target, wheelGuardSelector)) return;
      if (!wheelCameraGesture) {
        const content = scrollableSceneContent(e.target);
        if (content) {
          const atTop = content.scrollTop <= 0;
          const atBottom = content.scrollTop + content.clientHeight >= content.scrollHeight - 1;
          if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) return;
        }
      }
      e.preventDefault();
      wheelCameraGesture = true;
      const step = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY) * 0.0032, 0.35);
      rawScene.set(clampScene(rawScene.get() + step));
      scheduleMagneticSnap();
    };
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0]?.clientY ?? 0;
      touchStartedOnControl.current = isInteractiveTarget(e.target) || Boolean(scrollableSceneContent(e.target));
      if (!touchStartedOnControl.current) cancelPendingSnap();
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartedOnControl.current || menuOpen) return;
      if (e.cancelable) e.preventDefault();
      const currentY = e.touches[0]?.clientY ?? touchStartY.current;
      const delta = touchStartY.current - currentY;
      touchStartY.current = currentY;
      if (Math.abs(delta) < 0.01) return;
      rawScene.set(clampScene(rawScene.get() + delta * 0.006));
      scheduleMagneticSnap();
    };
    const handleTouchEnd = () => {
      if (!touchStartedOnControl.current && !menuOpen) scheduleMagneticSnap();
      touchStartedOnControl.current = false;
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isInteractiveTarget(event.target)) return;
      if (["ArrowDown", "PageDown", " "].includes(event.key)) {
        event.preventDefault();
        if (!menuOpen) {
          rawScene.set(clampScene(rawScene.get() + 1));
          scheduleMagneticSnap();
        }
      } else if (["ArrowUp", "PageUp"].includes(event.key)) {
        event.preventDefault();
        if (!menuOpen) {
          rawScene.set(clampScene(rawScene.get() - 1));
          scheduleMagneticSnap();
        }
      } else if (event.key === "Home") {
        event.preventDefault();
        if (!menuOpen) {
          cancelPendingSnap();
          rawScene.set(0);
        }
      } else if (event.key === "End") {
        event.preventDefault();
        if (!menuOpen) {
          cancelPendingSnap();
          rawScene.set(LAST_SCENE);
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
  }, [menuOpen, rawScene, mouseX, mouseY, cursorRawX, cursorRawY]);

  const jumpToScene = (sceneIndex: number) => {
    if (snapTimeoutRef.current) {
      clearTimeout(snapTimeoutRef.current);
      snapTimeoutRef.current = null;
    }
    rawScene.set(clampScene(Math.round(sceneIndex)));
  };

  return { rawScene, smoothScene, smoothProgress, activeScene, jumpToScene, rigRotateX, rigRotateY, lightX, lightY, cursorX, cursorY, zDepthReadout };
}

export function useVirtualCameraScene(smoothScene: MotionValue<number>, sceneIndex: number) {
  const i = sceneIndex;
  const opacity = useTransform(smoothScene, [i - 0.65, i - 0.18, i, i + 0.18, i + 0.65], [0, 1, 1, 1, 0]);
  const scale = useTransform(smoothScene, [i - 0.8, i - 0.15, i, i + 0.15, i + 0.8], [0.75, 1, 1, 1, 1.85]);
  const z = useTransform(smoothScene, [i - 0.8, i, i + 0.8], [-350, 0, 450]);
  const visibility = useTransform(smoothScene, (value): "visible" | "hidden" => Math.abs(value - i) > 0.65 ? "hidden" : "visible");
  const pointerEvents = useTransform(smoothScene, (value): "auto" | "none" => Math.abs(value - i) > 0.18 ? "none" : "auto");
  return { scale, opacity, z, visibility, pointerEvents };
}
