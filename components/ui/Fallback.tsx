"use client";

/**
 * Graceful degradation when WebGL is unavailable: a quiet editorial page in
 * the same voice, no 3D. The fixed backdrop suggests the skylight with pure
 * CSS gradients.
 */
export default function Fallback() {
  return (
    <div className="relative">
      <div
        className="fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% -5%, rgba(255,228,175,0.14), transparent 70%), radial-gradient(ellipse 80% 60% at 50% 110%, rgba(201,169,110,0.06), transparent 70%), #09090b",
        }}
      />

      <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="museum-label mb-8">Welcome to Muse</p>
        <h1 className="headline text-bone" style={{ fontSize: "clamp(3rem, 8.5vw, 7.5rem)" }}>
          Your Art.
          <br />
          <span className="italic text-bone/90">Your Digital Museum.</span>
        </h1>
        <p className="mt-8 max-w-md text-sm font-light leading-relaxed tracking-wide text-bone/60 md:text-base">
          Transform your artwork into immersive digital exhibitions powered by AI.
        </p>
        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
          <a href="#" className="btn-primary">
            Start Your Museum
          </a>
          <a href="#" className="btn-ghost">
            Explore Demo Exhibition
          </a>
        </div>
        <p className="mt-16 max-w-sm text-[0.625rem] uppercase leading-relaxed tracking-[0.3em] text-bone/30">
          Your browser can&rsquo;t render the full museum — the galleries await on a WebGL-enabled
          device.
        </p>
      </section>

      {[
        {
          label: "01 — The Space",
          title: "Architecture for the digital age.",
          copy: "Every Muse museum is a real place — light, stone, and silence rendered for the browser. Your visitors don't scroll a feed. They walk your halls.",
        },
        {
          label: "02 — The Curator",
          title: "An AI that hangs your show.",
          copy: "Muse reads palette, texture, and theme across your entire body of work — then arranges it into exhibitions with a narrative arc.",
        },
        {
          label: "03 — The Store",
          title: "From admiration to acquisition.",
          copy: "Sell originals, editions, and prints from inside the exhibition itself. Muse handles checkout, fulfillment, and payouts.",
        },
      ].map((s) => (
        <section key={s.label} className="mx-auto max-w-2xl px-6 py-28 text-center">
          <p className="museum-label mb-6">{s.label}</p>
          <h2 className="headline text-bone" style={{ fontSize: "clamp(2rem, 4.5vw, 3.8rem)" }}>
            {s.title}
          </h2>
          <div className="gilt-rule mx-auto my-8 w-24" />
          <p className="text-sm font-light leading-relaxed text-bone/60 md:text-base">{s.copy}</p>
        </section>
      ))}

      <section className="flex flex-col items-center px-6 pb-40 pt-16 text-center">
        <p className="museum-label mb-8">The doors are open</p>
        <h2 className="headline text-bone" style={{ fontSize: "clamp(2.6rem, 6vw, 5rem)" }}>
          Build the museum
          <br />
          <span className="italic">your work deserves.</span>
        </h2>
        <a href="#" className="btn-primary mt-12">
          Start Your Museum
        </a>
      </section>
    </div>
  );
}
