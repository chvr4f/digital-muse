"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { world } from "@/lib/world";

/**
 * Cinematic entry: the doors stay closed for a beat while the museum warms
 * up, a hairline gold meter fills, then the whole veil lifts and the camera
 * cranes down into the lobby (CameraRig watches `world.revealedAt`).
 */
export default function Loader() {
  const [pct, setPct] = useState(0);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const start = performance.now();
    const DURATION = 2200;
    let raf = 0;
    const tick = () => {
      const t = Math.min((performance.now() - start) / DURATION, 1);
      // ease that lingers near the end, like a held breath
      const eased = 1 - Math.pow(1 - t, 2.4);
      setPct(Math.round(eased * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else {
        world.revealedAt = performance.now();
        setGone(true);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          className="fixed inset-0 z-60 flex flex-col items-center justify-center"
          style={{ background: "#09090b" }}
          exit={{ opacity: 0, transition: { duration: 1.4, ease: [0.65, 0, 0.35, 1] } }}
        >
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.6em" }}
            animate={{ opacity: 1, letterSpacing: "0.42em" }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-4xl text-bone md:text-5xl"
            style={{ marginRight: "-0.42em" }}
          >
            MUSE
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mt-4 text-[0.625rem] uppercase tracking-[0.5em] text-bone/40"
            style={{ marginRight: "-0.5em" }}
          >
            Preparing the galleries
          </motion.p>

          <div className="mt-12 h-px w-48 overflow-hidden bg-bone/10">
            <div
              className="h-full bg-linear-to-r from-gilt-deep to-gilt transition-none"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-4 font-display text-sm italic text-bone/35 tabular-nums">{pct}%</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
