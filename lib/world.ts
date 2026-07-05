/**
 * Shared mutable world state, written by the DOM layer (Lenis, pointer events,
 * loader) and read every frame inside the R3F loop. Kept outside React state
 * so scroll/mouse updates never trigger re-renders.
 */
export const world = {
  /** Global scroll progress, 0..1 across the whole walk-through. */
  progress: 0,
  /** Normalized pointer, -1..1 from viewport center. */
  mouse: { x: 0, y: 0 },
  /** Set when the preloader has fully revealed the scene (ms timestamp). */
  revealedAt: 0,
  /** Coarse pointer / small screen — used to dial effects down. */
  isMobile: false,
  /** DOM callback the 3D layer invokes when a painting is clicked. */
  openArtwork: null as ((id: number) => void) | null,
};

export function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/** Frame-rate independent exponential damping. */
export function damp(current: number, target: number, lambda: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}
