"use client";

import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ARTWORKS, getArtworkCanvas } from "@/lib/artworks";

/**
 * Fullscreen viewing room. Clicking a painting on the wall zooms the piece
 * out of the museum and into a private dark room with its wall text.
 */
export default function ArtworkModal({
  artworkId,
  onClose,
}: {
  artworkId: number | null;
  onClose: () => void;
}) {
  const art = artworkId !== null ? ARTWORKS[artworkId] : null;
  const src = useMemo(
    () => (artworkId !== null ? getArtworkCanvas(artworkId).toDataURL("image/jpeg", 0.92) : ""),
    [artworkId],
  );

  useEffect(() => {
    if (artworkId === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [artworkId, onClose]);

  return (
    <AnimatePresence>
      {art && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#060606]/97 backdrop-blur-xl"
          onClick={onClose}
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-6 top-6 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-bone/20 text-bone/70 transition-all duration-300 hover:border-gilt/60 hover:text-gilt md:right-10 md:top-10"
          >
            ✕
          </button>

          <div
            className="flex h-full w-full max-w-6xl flex-col items-center gap-8 overflow-y-auto px-6 py-20 md:flex-row md:items-center md:gap-16 md:overflow-visible md:px-16"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0.45, opacity: 0, y: 60 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="shrink-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={art.title}
                className="max-h-[52vh] w-auto border-[6px] border-[#181510] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)] md:max-h-[70vh]"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.45, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-md"
            >
              <p className="museum-label mb-5">
                {art.artist} — {art.year}
              </p>
              <h3 className="headline text-4xl text-bone md:text-5xl">{art.title}</h3>
              <p className="mt-3 text-xs uppercase tracking-[0.25em] text-bone/40">{art.medium}</p>
              <div className="gilt-rule my-7 w-20" />
              <p className="text-sm font-light leading-[1.9] text-bone/65 md:text-[0.9375rem]">{art.story}</p>
              <a
                href="#"
                className="mt-9 inline-block border-b border-gilt/50 pb-1 text-[0.6875rem] uppercase tracking-[0.3em] text-gilt transition-colors duration-300 hover:border-gilt"
              >
                Acquire this piece
              </a>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
