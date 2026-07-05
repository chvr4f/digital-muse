/**
 * Procedurally generated "collection". Every painting on the museum walls is
 * painted at runtime onto a canvas with a seeded RNG, so the site ships zero
 * image assets yet every piece is unique and stable between visits.
 */

export type Artwork = {
  id: number;
  title: string;
  artist: string;
  year: string;
  medium: string;
  story: string;
  style: "field" | "gesture" | "geo" | "ink";
  /** width / height */
  aspect: number;
  seed: number;
  palette: string[];
};

export const ARTWORKS: Artwork[] = [
  {
    id: 0,
    title: "Aurora Descending",
    artist: "Mara Voss",
    year: "2025",
    medium: "Digital pigment on light",
    story:
      "Painted during a winter residency north of the Arctic Circle, Voss layered forty translucent veils of color until the surface began to breathe. She calls it a portrait of the three minutes before sunrise.",
    style: "field",
    aspect: 0.8,
    seed: 11,
    palette: ["#1c2a4a", "#3e5c8a", "#c96f4a", "#e8b04a", "#0d1120"],
  },
  {
    id: 1,
    title: "Terracotta Hymn",
    artist: "Elio Marchetti",
    year: "2024",
    medium: "Generative oil study",
    story:
      "Marchetti trained a model on the walls of his grandmother's house in Puglia — every crack, every sun-bleached layer of paint. This is what the machine remembered.",
    style: "field",
    aspect: 0.78,
    seed: 27,
    palette: ["#8a3b2a", "#c96f4a", "#e0a878", "#3a2420", "#e8ddc8"],
  },
  {
    id: 2,
    title: "Night Swimmers",
    artist: "Yuna Ishikawa",
    year: "2025",
    medium: "Ink and algorithm",
    story:
      "Ishikawa recorded the surface of Tokyo Bay for one full night, then let the tide draw its own calligraphy. The gold thread marks the path of a single fishing boat returning home.",
    style: "ink",
    aspect: 0.75,
    seed: 43,
    palette: ["#0a0e18", "#152238", "#2a4058", "#c9a96e", "#e8e4dc"],
  },
  {
    id: 3,
    title: "Meridian IV",
    artist: "Anselm Roth",
    year: "2023",
    medium: "Digital serigraph",
    story:
      "The fourth in Roth's series on borders that exist only on maps. Fields of color meet along a line that is mathematically perfect and, like all borders, entirely invented.",
    style: "geo",
    aspect: 0.82,
    seed: 58,
    palette: ["#d8cfc0", "#2a2a30", "#b8543a", "#c9a96e", "#465a6a"],
  },
  {
    id: 4,
    title: "The Weight of Pollen",
    artist: "Mara Voss",
    year: "2024",
    medium: "Digital pigment on light",
    story:
      "A meditation on things too small to see and too heavy to ignore. Voss suspended ten thousand particles in a virtual field and let spring wind decide the composition.",
    style: "gesture",
    aspect: 0.85,
    seed: 71,
    palette: ["#e8dfc8", "#d4a83a", "#8a9a5a", "#3a4030", "#f2ead6"],
  },
  {
    id: 5,
    title: "Static Bloom",
    artist: "Ondine Ferré",
    year: "2025",
    medium: "Signal painting",
    story:
      "Ferré paints with interference — radio static harvested from the space between stations. What looks like a flower is forty seconds of noise nobody was meant to hear.",
    style: "gesture",
    aspect: 0.8,
    seed: 88,
    palette: ["#1a1030", "#5a3a7a", "#b85a8a", "#e8a0b8", "#0d0a14"],
  },
  {
    id: 6,
    title: "Quarry Light",
    artist: "Anselm Roth",
    year: "2025",
    medium: "Digital serigraph",
    story:
      "Composed inside an abandoned marble quarry in Carrara, where Roth measured how daylight falls on cut stone. Every plane in the picture is an hour of the day.",
    style: "geo",
    aspect: 0.8,
    seed: 97,
    palette: ["#e8e4dc", "#b8b0a0", "#6a6458", "#2a2824", "#c9a96e"],
  },
  {
    id: 7,
    title: "Sea of Tranquility, Revisited",
    artist: "Yuna Ishikawa",
    year: "2024",
    medium: "Ink and algorithm",
    story:
      "Ishikawa mapped lunar elevation data onto handmade washi paper simulations. The dark sea in the lower half is exactly the size of the one you can see from your window tonight.",
    style: "ink",
    aspect: 0.76,
    seed: 104,
    palette: ["#10141c", "#1e2a38", "#3a4a58", "#8a9aa8", "#c9a96e"],
  },
  {
    id: 8,
    title: "Cadmium Sermon",
    artist: "Elio Marchetti",
    year: "2025",
    medium: "Generative oil study",
    story:
      "A loud painting about quiet faith. Marchetti let the reds argue with each other for three hundred generations and kept the composition where they finally agreed.",
    style: "gesture",
    aspect: 0.79,
    seed: 118,
    palette: ["#8a1e14", "#c94a2a", "#e8863a", "#2a1410", "#e8d8b8"],
  },
  {
    id: 9,
    title: "Winter Grid",
    artist: "Ondine Ferré",
    year: "2023",
    medium: "Signal painting",
    story:
      "Ferré's coldest work: the heating schedule of a Helsinki apartment block, one winter, one pixel per hour. The gold squares are the nights someone left the lights on.",
    style: "geo",
    aspect: 0.83,
    seed: 131,
    palette: ["#d8dce0", "#a8b4c0", "#4a5a6a", "#1c242c", "#c9a96e"],
  },
];

/** mulberry32 — tiny seeded RNG so artwork is stable across renders. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const cache = new Map<number, HTMLCanvasElement>();

export function getArtworkCanvas(id: number): HTMLCanvasElement {
  const existing = cache.get(id);
  if (existing) return existing;

  const art = ARTWORKS[id];
  const W = 800;
  const H = Math.round(W / art.aspect);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const rand = rng(art.seed);
  const pick = () => art.palette[Math.floor(rand() * art.palette.length)];

  // ground
  ctx.fillStyle = art.palette[art.palette.length - 1];
  ctx.fillRect(0, 0, W, H);

  if (art.style === "field") {
    // Rothko-esque stacked color fields with soft breathing edges
    const bands = 3 + Math.floor(rand() * 2);
    let y = 0;
    for (let i = 0; i < bands; i++) {
      const h = (H / bands) * (0.7 + rand() * 0.6);
      const c = art.palette[i % art.palette.length];
      for (let l = 0; l < 14; l++) {
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = c;
        const jx = (rand() - 0.5) * 30;
        const jy = (rand() - 0.5) * 26;
        roundedBlob(ctx, jx - 20, y + jy, W + 40, h, 30 + rand() * 40);
      }
      y += h * 0.82;
    }
  } else if (art.style === "gesture") {
    // layered curved strokes
    for (let i = 0; i < 90; i++) {
      const c = pick();
      ctx.strokeStyle = c;
      ctx.globalAlpha = 0.14 + rand() * 0.3;
      ctx.lineWidth = 3 + rand() * 34;
      ctx.lineCap = "round";
      const x0 = rand() * W;
      const y0 = rand() * H;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.bezierCurveTo(
        x0 + (rand() - 0.5) * 300,
        y0 + (rand() - 0.5) * 300,
        x0 + (rand() - 0.5) * 300,
        y0 + (rand() - 0.5) * 300,
        x0 + (rand() - 0.5) * 400,
        y0 + (rand() - 0.5) * 400,
      );
      ctx.stroke();
    }
  } else if (art.style === "geo") {
    // hard-edged planes
    const cells = 5 + Math.floor(rand() * 4);
    for (let i = 0; i < cells * 3; i++) {
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = pick();
      const x = rand() * W;
      const y = rand() * H;
      const w = (0.1 + rand() * 0.5) * W;
      const h = (0.08 + rand() * 0.45) * H;
      if (rand() > 0.5) ctx.fillRect(x - w / 2, y - h / 2, w, h);
      else {
        ctx.beginPath();
        ctx.moveTo(x, y - h / 2);
        ctx.lineTo(x + w / 2, y + h / 2);
        ctx.lineTo(x - w / 2, y + h / 2);
        ctx.closePath();
        ctx.fill();
      }
    }
  } else {
    // ink — dark washes + one gold thread
    for (let i = 0; i < 26; i++) {
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = art.palette[Math.floor(rand() * 3)];
      const cx = rand() * W;
      const cy = rand() * H;
      const r = 60 + rand() * 280;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, ctx.fillStyle as string);
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    }
    // gold thread
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = "#c9a96e";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    let tx = W * 0.15;
    let ty = H * (0.3 + rand() * 0.4);
    ctx.moveTo(tx, ty);
    while (tx < W * 0.9) {
      tx += 20 + rand() * 50;
      ty += (rand() - 0.5) * 120;
      ctx.lineTo(tx, ty);
    }
    ctx.stroke();
  }

  // unifying grain + vignette
  ctx.globalAlpha = 1;
  const vg = ctx.createRadialGradient(
    W / 2,
    H / 2,
    Math.min(W, H) * 0.35,
    W / 2,
    H / 2,
    Math.max(W, H) * 0.75,
  );
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(0,0,0,0.38)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  const grain = ctx.getImageData(0, 0, W, H);
  const d = grain.data;
  const grand = rng(art.seed + 999);
  for (let i = 0; i < d.length; i += 4) {
    const n = (grand() - 0.5) * 14;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  ctx.putImageData(grain, 0, 0);

  cache.set(id, canvas);
  return canvas;
}

function roundedBlob(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  const rr = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
  ctx.fill();
}
