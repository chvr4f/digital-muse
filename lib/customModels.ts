/**
 * Your own 3D models, dropped into `public/models/` and wired into the scene.
 *
 * HOW TO USE
 * ----------
 * 1. Put your `.glb` / `.gltf` files in `public/models/`.
 * 2. Point a slot below at the filename. Leave a slot `null` / unset to keep
 *    the built-in procedural piece.
 * 3. Reload — the model is auto-centered and auto-scaled to fit its spot.
 *    Nudge it with the optional fields if needed.
 *
 * Nothing else in the app needs to change.
 */

export type CustomModel = {
  /** Filename in `public/models/` (e.g. "muse.glb"), or an absolute "/path". */
  file: string;
  /**
   * Which dimension `targetSize` matches when auto-fitting. Default "max"
   * (largest of width/height/depth). Use "height" to fit a statue's height.
   */
  fitAxis?: "height" | "width" | "depth" | "max";
  /** Extra uniform scale on top of the auto-fit (1 = as fitted). Default 1. */
  scale?: number;
  /** Nudge up/down in world units after fitting. Default 0. */
  offsetY?: number;
  /** Extra spin in radians to face the model the right way. Default 0. */
  rotationY?: number;
};

/**
 * The monumental sculpture in the lobby (under the oculus, on the stone dais).
 * Set to a model to replace the built-in marble knot; keep `null` to keep it.
 *
 *   export const SCULPTURE_MODEL: CustomModel | null = { file: "muse.glb", fitAxis: "height" };
 */
export const SCULPTURE_MODEL: CustomModel | null = {
  file: "fallen_angel.glb",
  fitAxis: "height",
};

/**
 * Replace paintings by their artwork id (see `lib/artworks.ts`). Any id you
 * don't list keeps its procedurally-painted canvas. The model is mounted on
 * the wall in place of the framed canvas and scaled to the frame's height.
 *
 *   export const PAINTING_MODELS: Record<number, CustomModel> = {
 *     3: { file: "relief.glb" },
 *     4: { file: "bust.glb", rotationY: Math.PI },
 *   };
 */
export const PAINTING_MODELS: Record<number, CustomModel> = {};

/**
 * The four plinths in the sculpture corridor (between the lobby and the
 * exhibition), in the order the camera passes them. Set an entry to a model to
 * replace that plinth's built-in marble study; leave `null` to keep it.
 *
 *   export const CORRIDOR_MODELS: (CustomModel | null)[] = [
 *     { file: "bust.glb" }, { file: "torso.glb" }, null, { file: "figure.glb" },
 *   ];
 */
export const CORRIDOR_MODELS: (CustomModel | null)[] = [
  // plinth 1 (z −34, left) — Nike, a dramatic full figure to open the corridor
  { file: "nike.glb", fitAxis: "height", scale: 1.1 },
  // plinth 2 (z −38.5, right) — Venus, the classical standing ideal
  { file: "venus.glb", fitAxis: "height" },
  // plinth 3 (z −43, left) — Rodin's Thinker (seated), sized down a touch
  { file: "thinker.glb", fitAxis: "height", scale: 0.92 },
  // plinth 4 (z −46.5, right) — Antinous, a bust: much smaller than the figures
  { file: "antinous.glb", fitAxis: "height", scale: 0.6 },
];

/**
 * The two pedestals in the Store room, shown as sculpture "editions" for sale.
 * Any of the existing statues (or a new upload) works; leave null to keep the
 * abstract gold shape.
 */
export const STORE_MODELS: (CustomModel | null)[] = [
  { file: "fallen_angel.glb", fitAxis: "height" },
  { file: "angel_wings.glb", fitAxis: "height" },
];

/**
 * Replace paintings with your own flat images (jpg/png) — the natural fit for
 * real artwork. Keyed by artwork id (see `lib/artworks.ts`). The image is hung
 * in the frame; the optional text overrides what the detail view shows when the
 * piece is clicked. Any id you don't list keeps its procedural canvas.
 */
export type CustomImage = {
  /** Path under `public/` (e.g. "models/paintings/x.jpg"), or an absolute URL. */
  file: string;
  /** Image width ÷ height, so the frame matches the picture. */
  aspect: number;
  /** Draw the wooden frame around it? Default true. */
  frame?: boolean;
  // Optional wall text shown in the click-to-open detail view:
  title?: string;
  artist?: string;
  year?: string;
  medium?: string;
  story?: string;
};

export const PAINTING_IMAGES: Record<number, CustomImage> = {
  // ——— lobby: four monumental canvases ———
  0: {
    file: "models/paintings/DP145898.jpg",
    aspect: 1.208,
    title: "Panoramic Landscape",
    medium: "Oil on canvas",
  },
  1: {
    file: "models/paintings/DP123844.jpg",
    aspect: 1.361,
    title: "Pastoral Landscape with Figures",
    medium: "Oil on canvas",
  },
  2: {
    file: "models/paintings/DP-17624-001.jpg",
    aspect: 1.44,
    title: "Classical Landscape",
    medium: "Oil on canvas",
  },
  7: {
    file: "models/paintings/DP-25464-001.jpg",
    aspect: 1.225,
    title: "Marine",
    medium: "Oil on canvas",
  },
  // ——— exhibition wall: clickable, opens the detail view ———
  3: {
    file: "models/paintings/DP-31527-001.jpg",
    aspect: 1.333,
    title: "Madonna and Child Enthroned with Saints",
    artist: "Italian (Florentine) painter",
    year: "14th century",
    medium: "Tempera and gold on panel",
    story:
      "A gold-ground devotional tabernacle: the Virgin and Child enthroned at the center, flanked by attendant saints beneath gilded arches. Painted to catch candlelight and hold it — the gold is not a color but a light source.",
  },
  4: {
    file: "models/paintings/rembrandt_aristotle.jpg",
    aspect: 0.948,
    title: "Aristotle with a Bust of Homer",
    artist: "Rembrandt van Rijn",
    year: "1653",
    medium: "Oil on canvas",
    story:
      "Aristotle rests a hand on the marble head of Homer — the philosopher touching the poet across three centuries. Rembrandt buries the figure in shadow and lets a single gold chain and the white sleeve carry the light.",
  },
  5: {
    file: "models/paintings/woman_painter_still_life.jpg",
    aspect: 0.844,
    title: "A Woman Painter with a Floral Still Life",
    artist: "Dutch School",
    year: "late 17th century",
    medium: "Oil on canvas",
    story:
      "A woman at her table — palette in hand, a bouquet half-arranged, an open book of studies. The still life is also a portrait of the act of painting itself.",
  },
  6: {
    file: "models/paintings/monet_water_lilies.jpg",
    aspect: 0.803,
    title: "Bridge over a Pond of Water Lilies",
    artist: "Claude Monet",
    year: "1899",
    medium: "Oil on canvas",
    story:
      "Monet's Japanese footbridge at Giverny, painted from his own garden. Up close it dissolves into pure touches of color; step back and the pond reassembles itself in the eye.",
  },
  8: {
    file: "models/paintings/vermeer_water_pitcher.jpg",
    aspect: 0.889,
    title: "Young Woman with a Water Pitcher",
    artist: "Johannes Vermeer",
    year: "ca. 1662",
    medium: "Oil on canvas",
    story:
      "Morning light through a leaded window, a silver basin, a moment of stillness before the day begins. One of Vermeer's quietest and most perfectly balanced interiors.",
  },
  9: {
    file: "models/paintings/turner_venice.jpg",
    aspect: 1.341,
    title: "Venice, from the Porch of Madonna della Salute",
    artist: "J. M. W. Turner",
    year: "ca. 1835",
    medium: "Oil on canvas",
    story:
      "Turner dissolves the Grand Canal into light and haze — architecture, water, and sky bleeding into one another. The city is less a place here than a weather of gold.",
  },
};

/** Resolve a `public/`-relative image path to a served URL. */
export function imageUrl(file: string): string {
  if (file.startsWith("/") || /^https?:\/\//.test(file)) return file;
  return `/${file}`;
}

/** All model files referenced above — used to preload them up front. */
export function customModelFiles(): string[] {
  const files: string[] = [];
  if (SCULPTURE_MODEL) files.push(SCULPTURE_MODEL.file);
  for (const m of Object.values(PAINTING_MODELS)) files.push(m.file);
  for (const m of CORRIDOR_MODELS) if (m) files.push(m.file);
  for (const m of STORE_MODELS) if (m) files.push(m.file);
  return files;
}

/** Resolve a manifest `file` to a URL Next serves from `public/`. */
export function modelUrl(file: string): string {
  return file.startsWith("/") ? file : `/models/${file}`;
}
