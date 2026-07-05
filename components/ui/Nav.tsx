"use client";

import { motion } from "framer-motion";

const LINKS = ["Exhibitions", "Artists", "Collections", "Pricing", "About"];

export default function Nav() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.6, duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-6 md:px-12 md:py-8"
    >
      <a href="#" className="font-display text-2xl tracking-[0.32em] text-bone">
        MUSE
      </a>

      <nav className="hidden items-center gap-9 lg:flex">
        {LINKS.map((link) => (
          <a
            key={link}
            href="#"
            className="nav-link text-[0.6875rem] uppercase tracking-[0.28em] text-bone/70 transition-colors duration-300 hover:text-bone"
          >
            {link}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-4 md:gap-7">
        <a
          href="#"
          className="nav-link text-[0.6875rem] uppercase tracking-[0.28em] text-bone/70 transition-colors duration-300 hover:text-bone"
        >
          Login
        </a>
        <a
          href="#"
          className="rounded-full border border-gilt/50 px-5 py-2.5 text-[0.6875rem] uppercase tracking-[0.28em] text-gilt transition-all duration-500 hover:border-gilt hover:bg-gilt/10 hover:shadow-[0_0_24px_-6px_rgba(201,169,110,0.5)]"
        >
          Start Free
        </a>
      </div>
    </motion.header>
  );
}
