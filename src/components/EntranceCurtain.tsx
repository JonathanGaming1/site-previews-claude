"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const GOLD = "#C8A97E";

export function EntranceCurtain({ name, ready }: { name: string; ready: boolean }) {
  const [visible, setVisible] = useState(true);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!ready) return;
    if (reduceMotion) {
      setVisible(false);
      return;
    }
    // The 450ms hold plus 350ms parting transition completes in exactly 0.8s.
    const timer = window.setTimeout(() => setVisible(false), 450);
    return () => window.clearTimeout(timer);
  }, [ready, reduceMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div className="pointer-events-none fixed inset-0 z-[300000] overflow-hidden" aria-hidden="true" exit={{ transition: { duration: 0.35 } }}>
          <motion.div className="absolute inset-x-0 top-0 h-1/2 bg-black" exit={{ y: "-100%" }} transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }} />
          <motion.div className="absolute inset-x-0 bottom-0 h-1/2 bg-black" exit={{ y: "100%" }} transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }} />
          <motion.div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center" exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }} className="font-frank text-3xl font-light leading-tight tracking-[0.04em] text-[#F4F1EB] sm:text-5xl">
              {name || "PRIVATE ARRIVAL"}
            </motion.p>
            <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="mt-6 h-px w-[min(240px,58vw)] origin-center" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
