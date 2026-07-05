"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const SECTION_COUNT = 8;

/**
 * The editorial layer. Eight invisible spacers give the page its 800vh of
 * scroll; the visible panels are fixed to the viewport and choreographed by
 * ScrollTrigger against those spacers — rising, unblurring, dissolving as the
 * camera walks from room to room behind them.
 */
export default function Overlay() {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const spacers = gsap.utils.toArray<HTMLElement>("[data-spacer]");
      const panels = gsap.utils.toArray<HTMLElement>("[data-panel]");

      panels.forEach((panel) => {
        const index = Number(panel.dataset.panel);
        const spacer = spacers[index];
        const reveals = panel.querySelectorAll<HTMLElement>("[data-rv]");

        if (index === 0) {
          // hero: visible on load, dissolves upward as the walk begins
          gsap.set(panel, { autoAlpha: 1 });
          gsap
            .timeline({
              scrollTrigger: { trigger: spacer, start: "top top", end: "bottom 20%", scrub: true },
            })
            .to(reveals, {
              y: -70,
              opacity: 0,
              filter: "blur(12px)",
              stagger: 0.04,
              ease: "power2.in",
            })
            .set(panel, { autoAlpha: 0 });
          return;
        }

        gsap.set(panel, { autoAlpha: 0 });
        const isLast = index === SECTION_COUNT - 1;
        // start/end offsets tuned so each panel is visible while the camera
        // is inside that panel's room, with no crossfade between neighbors
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: spacer,
            start: "top 40%",
            end: isLast ? "bottom bottom" : "bottom 40%",
            scrub: true,
          },
        });
        tl.to(panel, { autoAlpha: 1, duration: 0.25, ease: "none" }).fromTo(
          reveals,
          { y: 80, opacity: 0, filter: "blur(14px)" },
          { y: 0, opacity: 1, filter: "blur(0px)", stagger: 0.07, duration: 0.4, ease: "power2.out" },
          "<",
        );
        if (!isLast) {
          tl.to({}, { duration: 0.35 }) // hold while the visitor crosses the room
            .to(reveals, {
              y: -60,
              opacity: 0,
              filter: "blur(12px)",
              stagger: 0.04,
              duration: 0.35,
              ease: "power2.in",
            })
            .to(panel, { autoAlpha: 0, duration: 0.1 }, "<80%");
        }
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={root}>
      {/* ——— scroll track ——— */}
      <div aria-hidden>
        {Array.from({ length: SECTION_COUNT }).map((_, i) => (
          <div key={i} data-spacer className="h-screen w-px" />
        ))}
      </div>

      {/* ——— 0 · hero, at the museum doors ——— */}
      <section data-panel="0" className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center">
        <div className="flex max-w-4xl flex-col items-center px-6 text-center">
          <p data-rv className="museum-label mb-8">
            Welcome to Muse
          </p>
          <h1 data-rv className="headline text-bone" style={{ fontSize: "clamp(3rem, 8.5vw, 7.5rem)" }}>
            Your Art.
            <br />
            <span className="italic text-bone/90">Your Digital Museum.</span>
          </h1>
          <p data-rv className="mt-8 max-w-md text-sm font-light leading-relaxed tracking-wide text-bone/60 md:text-base">
            Transform your artwork into immersive digital exhibitions powered by AI.
          </p>
          <div data-rv className="pointer-events-auto mt-12 flex flex-col items-center gap-4 sm:flex-row">
            <a href="#" className="btn-primary">
              Start Your Museum
            </a>
            <a href="#" className="btn-ghost">
              Explore Demo Exhibition
            </a>
          </div>
          <div data-rv className="mt-16 flex flex-col items-center gap-3">
            <span className="text-[0.625rem] uppercase tracking-[0.4em] text-bone/40">Scroll to enter</span>
            <div className="scroll-line" />
          </div>
        </div>
      </section>

      {/* ——— 1 · the space ——— */}
      <section data-panel="1" className="pointer-events-none fixed inset-0 z-20 flex items-center">
        <div className="max-w-xl px-8 md:px-[9vw]">
          <p data-rv className="museum-label mb-6">
            01 — The Space
          </p>
          <h2 data-rv className="headline text-bone" style={{ fontSize: "clamp(2.2rem, 4.6vw, 4.2rem)" }}>
            Architecture for the digital age.
          </h2>
          <div data-rv className="gilt-rule my-8 w-24" />
          <p data-rv className="max-w-md text-sm font-light leading-relaxed text-bone/60 md:text-base">
            Every Muse museum is a real place — light, stone, and silence rendered for the browser.
            Your visitors don&rsquo;t scroll a feed. They walk your halls.
          </p>
        </div>
      </section>

      {/* ——— 2 · exhibitions ——— */}
      <section data-panel="2" className="pointer-events-none fixed inset-0 z-20 flex items-center justify-end">
        <div className="max-w-xl px-8 text-right md:px-[9vw]">
          <p data-rv className="museum-label mb-6">
            02 — Exhibitions
          </p>
          <h2 data-rv className="headline text-bone" style={{ fontSize: "clamp(2.2rem, 4.6vw, 4.2rem)" }}>
            Every collection deserves a wing of its own.
          </h2>
          <div data-rv className="gilt-rule my-8 ml-auto w-24" />
          <p data-rv className="ml-auto max-w-md text-sm font-light leading-relaxed text-bone/60 md:text-base">
            Compose unlimited rooms. Sequence the walk. Decide what your visitor sees first, and
            what they discover last — the way a curator would.
          </p>
        </div>
      </section>

      {/* ——— 3 · the work (interactive wall) ——— */}
      <section data-panel="3" className="pointer-events-none fixed inset-0 z-20 flex items-end">
        <div className="max-w-xl px-8 pb-[14vh] md:px-[9vw]">
          <p data-rv className="museum-label mb-6">
            03 — The Work
          </p>
          <h2 data-rv className="headline text-bone" style={{ fontSize: "clamp(2.2rem, 4.6vw, 4.2rem)" }}>
            Closer than any gallery allows.
          </h2>
          <div data-rv className="gilt-rule my-8 w-24" />
          <p data-rv className="max-w-md text-sm font-light leading-relaxed text-bone/60 md:text-base">
            Deep zoom, provenance, and the story behind every piece.
          </p>
          <p data-rv className="mt-5 text-[0.6875rem] uppercase tracking-[0.3em] text-gilt/80">
            Move your cursor across the wall — click a piece to step closer
          </p>
        </div>
      </section>

      {/* ——— 4 · the AI curator ——— */}
      <section data-panel="4" className="pointer-events-none fixed inset-0 z-20 flex items-end justify-center">
        <div className="max-w-2xl px-8 pb-[12vh] text-center">
          <p data-rv className="museum-label mb-6">
            04 — The Curator
          </p>
          <h2 data-rv className="headline text-bone" style={{ fontSize: "clamp(2.2rem, 4.6vw, 4.2rem)" }}>
            An AI that hangs your show.
          </h2>
          <div data-rv className="gilt-rule mx-auto my-8 w-24" />
          <p data-rv className="mx-auto max-w-lg text-sm font-light leading-relaxed text-bone/60 md:text-base">
            Muse reads palette, texture, and theme across your entire body of work — then arranges
            it into exhibitions with a narrative arc. Watch it think.
          </p>
        </div>
      </section>

      {/* ——— 5 · the store ——— */}
      <section data-panel="5" className="pointer-events-none fixed inset-0 z-20 flex items-center justify-end">
        <div className="max-w-xl px-8 text-right md:px-[9vw]">
          <p data-rv className="museum-label mb-6">
            05 — The Store
          </p>
          <h2 data-rv className="headline text-bone" style={{ fontSize: "clamp(2.2rem, 4.6vw, 4.2rem)" }}>
            From admiration to acquisition.
          </h2>
          <div data-rv className="gilt-rule my-8 ml-auto w-24" />
          <p data-rv className="ml-auto max-w-md text-sm font-light leading-relaxed text-bone/60 md:text-base">
            Sell originals, editions, and prints from inside the exhibition itself. Muse handles
            checkout, fulfillment, and payouts — you keep the wall label.
          </p>
        </div>
      </section>

      {/* ——— 6 · membership ——— */}
      <section data-panel="6" className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center">
        <div className="w-full max-w-5xl px-6 pt-16 md:pt-0">
          <div className="mb-6 text-center md:mb-14">
            <p data-rv className="museum-label mb-5">
              06 — Membership
            </p>
            <h2 data-rv className="headline text-bone" style={{ fontSize: "clamp(2rem, 4vw, 3.6rem)" }}>
              Choose your wing.
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3 md:gap-6">
            {[
              {
                tier: "Resident",
                price: "Free",
                cadence: "forever",
                copy: "One exhibition room, twenty artworks, the full architecture.",
                features: ["1 exhibition room", "20 artworks", "Muse subdomain"],
                featured: false,
              },
              {
                tier: "Curator",
                price: "$19",
                cadence: "per month",
                copy: "The working artist's museum — unlimited rooms, AI curation, your own door.",
                features: ["Unlimited rooms", "AI curator", "Custom domain", "Visitor analytics"],
                featured: true,
              },
              {
                tier: "Patron",
                price: "$49",
                cadence: "per month",
                copy: "For studios and estates. Integrated store, team seats, white glove onboarding.",
                features: ["Everything in Curator", "Integrated store", "5 team seats", "Priority support"],
                featured: false,
              },
            ].map((p) => (
              <div
                key={p.tier}
                data-rv
                className={`pointer-events-auto rounded-sm border p-5 backdrop-blur-md transition-colors duration-500 md:p-9 ${
                  p.featured
                    ? "border-gilt/60 bg-[#141210]/70 shadow-[0_0_60px_-20px_rgba(201,169,110,0.35)]"
                    : "border-bone/10 bg-[#0e0e10]/60 hover:border-bone/25"
                }`}
              >
                <p className={`text-[0.625rem] uppercase tracking-[0.35em] ${p.featured ? "text-gilt" : "text-bone/50"}`}>
                  {p.tier}
                </p>
                <p className="font-display mt-3 text-4xl font-light text-bone md:mt-5 md:text-5xl">
                  {p.price}
                  <span className="ml-2 align-middle text-xs tracking-widest text-bone/40">{p.cadence}</span>
                </p>
                <p className="mt-3 text-[0.8125rem] font-light leading-relaxed text-bone/55 md:mt-4 md:min-h-14">{p.copy}</p>
                <ul className="mt-6 hidden space-y-2.5 border-t border-bone/10 pt-6 md:block">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-baseline gap-3 text-[0.8125rem] font-light text-bone/70">
                      <span className="text-[0.5rem] text-gilt">◆</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#"
                  className={`mt-5 block rounded-full py-3 text-center text-[0.6875rem] uppercase tracking-[0.28em] transition-all duration-500 md:mt-8 ${
                    p.featured
                      ? "bg-linear-to-r from-[#ddc294] to-[#b9945c] text-[#0c0b09] hover:brightness-110"
                      : "border border-bone/20 text-bone/80 hover:border-gilt/60 hover:text-gilt"
                  }`}
                >
                  {p.price === "Free" ? "Open Your Room" : `Become a ${p.tier}`}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— 7 · final room ——— */}
      <section data-panel="7" className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center">
        <div className="flex max-w-3xl flex-col items-center px-6 text-center">
          <p data-rv className="museum-label mb-8">
            The doors are open
          </p>
          <h2 data-rv className="headline text-bone" style={{ fontSize: "clamp(2.6rem, 6vw, 5.5rem)" }}>
            Build the museum
            <br />
            <span className="italic">your work deserves.</span>
          </h2>
          <div data-rv className="pointer-events-auto mt-12 flex flex-col items-center gap-4 sm:flex-row">
            <a href="#" className="btn-primary">
              Start Your Museum
            </a>
            <a href="#" className="btn-ghost">
              Talk to a Human Curator
            </a>
          </div>
          <p data-rv className="mt-16 text-[0.625rem] uppercase tracking-[0.35em] text-bone/30">
            Muse © 2026 — Free forever for your first room. No card required.
          </p>
        </div>
      </section>
    </div>
  );
}
