import * as THREE from "three";

/**
 * Procedural PBR texture sets, painted once per session onto canvases:
 * dark veined marble slabs for the floor, board-formed architectural
 * concrete for the walls. Albedo + roughness + normal (derived from a
 * height pass via Sobel), so every surface responds to light the way
 * real material does — no image assets shipped.
 */

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

/** Layered value noise: tiny random canvases scaled up with smoothing. */
function paintNoise(
  ctx: CanvasRenderingContext2D,
  size: number,
  seed: number,
  octaves: { cells: number; alpha: number }[],
  composite: GlobalCompositeOperation = "overlay",
) {
  const rand = rng(seed);
  for (const { cells, alpha } of octaves) {
    const tiny = document.createElement("canvas");
    tiny.width = tiny.height = cells;
    const tctx = tiny.getContext("2d")!;
    const img = tctx.createImageData(cells, cells);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.floor(rand() * 256);
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    tctx.putImageData(img, 0, 0);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.globalCompositeOperation = composite;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(tiny, 0, 0, size, size);
    ctx.restore();
  }
}

/** Sobel height → tangent-space normal map. */
function heightToNormal(height: HTMLCanvasElement, strength: number): HTMLCanvasElement {
  const size = height.width;
  const src = height.getContext("2d")!.getImageData(0, 0, size, size).data;
  const out = document.createElement("canvas");
  out.width = out.height = size;
  const octx = out.getContext("2d")!;
  const img = octx.createImageData(size, size);
  const h = (x: number, y: number) => {
    const xi = ((x % size) + size) % size;
    const yi = ((y % size) + size) % size;
    return src[(yi * size + xi) * 4];
  };
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx =
        (h(x + 1, y - 1) + 2 * h(x + 1, y) + h(x + 1, y + 1) - h(x - 1, y - 1) - 2 * h(x - 1, y) - h(x - 1, y + 1)) /
        1020;
      const dy =
        (h(x - 1, y + 1) + 2 * h(x, y + 1) + h(x + 1, y + 1) - h(x - 1, y - 1) - 2 * h(x, y - 1) - h(x + 1, y - 1)) /
        1020;
      const nx = -dx * strength;
      const ny = -dy * strength;
      const nz = 1;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      const i = (y * size + x) * 4;
      img.data[i] = ((nx / len) * 0.5 + 0.5) * 255;
      img.data[i + 1] = ((ny / len) * 0.5 + 0.5) * 255;
      img.data[i + 2] = ((nz / len) * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  }
  octx.putImageData(img, 0, 0);
  return out;
}

function toTexture(canvas: HTMLCanvasElement, srgb: boolean): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export type PBRMaps = {
  map: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
};

/** One meandering marble vein with momentum and occasional branches. */
function drawVein(
  ctx: CanvasRenderingContext2D,
  rand: () => number,
  size: number,
  width: number,
  alpha: number,
  color: string,
) {
  let x = rand() * size;
  let y = rand() < 0.5 ? 0 : rand() * size;
  let angle = rand() * Math.PI * 2;
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, y);
  const steps = 30 + Math.floor(rand() * 40);
  for (let i = 0; i < steps; i++) {
    angle += (rand() - 0.5) * 0.9;
    const step = 12 + rand() * 30;
    x += Math.cos(angle) * step;
    y += Math.sin(angle) * step;
    ctx.lineTo(x, y);
  }
  ctx.stroke();
}

let marbleCache: PBRMaps | null = null;

export function getMarbleMaps(): PBRMaps {
  if (marbleCache) return marbleCache;
  const size = 2048;
  const rand = rng(4211);

  // ——— albedo ———
  const albedo = document.createElement("canvas");
  albedo.width = albedo.height = size;
  const a = albedo.getContext("2d")!;
  a.fillStyle = "#151318";
  a.fillRect(0, 0, size, size);

  // broad tonal clouds
  for (let i = 0; i < 46; i++) {
    const cx = rand() * size;
    const cy = rand() * size;
    const r = 200 + rand() * 700;
    const g = a.createRadialGradient(cx, cy, 0, cx, cy, r);
    const warm = rand() > 0.5;
    g.addColorStop(0, warm ? "rgba(58,52,60,0.05)" : "rgba(38,40,52,0.05)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    a.fillStyle = g;
    a.fillRect(cx - r, cy - r, r * 2, r * 2);
  }

  // height pass shares the veins so the normal map matches the albedo
  const heightC = document.createElement("canvas");
  heightC.width = heightC.height = 512;
  const hc = heightC.getContext("2d")!;
  hc.fillStyle = "#808080";
  hc.fillRect(0, 0, 512, 512);

  // clouded secondary veins
  a.save();
  a.filter = "blur(6px)";
  for (let i = 0; i < 26; i++) drawVein(a, rand, size, 6 + rand() * 14, 0.05 + rand() * 0.05, "#cfc8d4");
  a.restore();
  // crisp primary veins
  a.save();
  a.filter = "blur(1.5px)";
  for (let i = 0; i < 14; i++) drawVein(a, rand, size, 1 + rand() * 2.5, 0.1 + rand() * 0.14, "#ddd6e0");
  a.restore();

  // roughness starts as a copy target: polished stone, veins slightly matte
  const rough = document.createElement("canvas");
  rough.width = rough.height = size;
  const r = rough.getContext("2d")!;
  r.fillStyle = "#3c3c3c"; // base roughness ≈ 0.24
  r.fillRect(0, 0, size, size);
  const randR = rng(4211); // same sequence → veins land in the same places
  r.save();
  r.filter = "blur(6px)";
  for (let i = 0; i < 26; i++) drawVein(r, randR, size, 6 + randR() * 14, 0.05 + randR() * 0.05, "#6a6a6a");
  r.restore();
  r.save();
  r.filter = "blur(1.5px)";
  for (let i = 0; i < 14; i++) drawVein(r, randR, size, 1 + randR() * 2.5, 0.1 + randR() * 0.14, "#8a8a8a");
  r.restore();

  const randH = rng(4211);
  hc.save();
  hc.filter = "blur(2px)";
  for (let i = 0; i < 26; i++) drawVein(hc, randH, 512, (6 + randH() * 14) / 4, 0.04, "#6a6a6a");
  hc.restore();
  hc.save();
  hc.filter = "blur(0.8px)";
  for (let i = 0; i < 14; i++) drawVein(hc, randH, 512, (1 + randH() * 2.5) / 2, 0.12, "#5a5a5a");
  hc.restore();

  // slab grid: 4×4 slabs with seams and per-slab tone shift
  const slab = size / 4;
  for (let sy = 0; sy < 4; sy++) {
    for (let sx = 0; sx < 4; sx++) {
      a.globalAlpha = 0.03 + rand() * 0.03;
      a.globalCompositeOperation = rand() > 0.5 ? "lighten" : "darken";
      a.fillStyle = rand() > 0.5 ? "#3a3742" : "#0c0b0e";
      a.fillRect(sx * slab, sy * slab, slab, slab);
      a.globalCompositeOperation = "source-over";
    }
  }
  a.globalAlpha = 0.55;
  a.strokeStyle = "#08070a";
  a.lineWidth = 4;
  for (let i = 0; i <= 4; i++) {
    a.beginPath();
    a.moveTo(i * slab, 0);
    a.lineTo(i * slab, size);
    a.stroke();
    a.beginPath();
    a.moveTo(0, i * slab);
    a.lineTo(size, i * slab);
    a.stroke();
  }
  a.globalAlpha = 1;
  // seams in height (recessed) so they catch light
  hc.globalAlpha = 0.8;
  hc.strokeStyle = "#565656";
  hc.lineWidth = 1.5;
  for (let i = 0; i <= 4; i++) {
    hc.beginPath();
    hc.moveTo(i * 128, 0);
    hc.lineTo(i * 128, 512);
    hc.stroke();
    hc.beginPath();
    hc.moveTo(0, i * 128);
    hc.lineTo(512, i * 128);
    hc.stroke();
  }
  hc.globalAlpha = 1;

  paintNoise(a, size, 991, [
    { cells: 64, alpha: 0.05 },
    { cells: 256, alpha: 0.04 },
  ]);
  paintNoise(r, size, 992, [{ cells: 128, alpha: 0.1 }], "soft-light");

  marbleCache = {
    map: toTexture(albedo, true),
    roughnessMap: toTexture(rough, false),
    normalMap: toTexture(heightToNormal(heightC, 2.2), false),
  };
  return marbleCache;
}

let concreteCache: PBRMaps | null = null;

export function getConcreteMaps(): PBRMaps {
  if (concreteCache) return concreteCache;
  const size = 1024;
  const rand = rng(7817);

  const albedo = document.createElement("canvas");
  albedo.width = albedo.height = size;
  const a = albedo.getContext("2d")!;
  a.fillStyle = "#3a393f";
  a.fillRect(0, 0, size, size);

  const heightC = document.createElement("canvas");
  heightC.width = heightC.height = size;
  const hc = heightC.getContext("2d")!;
  hc.fillStyle = "#808080";
  hc.fillRect(0, 0, size, size);

  // cloudy tonal variation + fine aggregate
  paintNoise(a, size, 311, [
    { cells: 8, alpha: 0.1 },
    { cells: 32, alpha: 0.08 },
    { cells: 128, alpha: 0.06 },
    { cells: 512, alpha: 0.05 },
  ]);
  paintNoise(hc, size, 311, [
    { cells: 32, alpha: 0.1 },
    { cells: 256, alpha: 0.08 },
  ]);

  // pores and pinholes
  for (let i = 0; i < 900; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const rr = 0.5 + rand() * 2.2;
    a.globalAlpha = 0.1 + rand() * 0.2;
    a.fillStyle = "#1c1b20";
    a.beginPath();
    a.arc(x, y, rr, 0, Math.PI * 2);
    a.fill();
    hc.globalAlpha = 0.5;
    hc.fillStyle = "#5c5c5c";
    hc.beginPath();
    hc.arc(x, y, rr, 0, Math.PI * 2);
    hc.fill();
  }
  a.globalAlpha = 1;
  hc.globalAlpha = 1;

  // board-form banding (horizontal pour lines)
  for (let y = 0; y < size; y += 256) {
    a.globalAlpha = 0.16;
    a.fillStyle = "#242329";
    a.fillRect(0, y, size, 2.5);
    a.globalAlpha = 0.05;
    a.fillStyle = "#4c4a52";
    a.fillRect(0, y + 3, size, 10);
    a.globalAlpha = 1;
    hc.globalAlpha = 0.7;
    hc.fillStyle = "#646464";
    hc.fillRect(0, y, size, 2.5);
    hc.globalAlpha = 1;
  }

  // formwork tie holes on a grid
  for (let gy = 128; gy < size; gy += 256) {
    for (let gx = 128; gx < size; gx += 256) {
      const x = gx + (rand() - 0.5) * 8;
      const y = gy + (rand() - 0.5) * 8;
      a.globalAlpha = 0.5;
      a.fillStyle = "#211f25";
      a.beginPath();
      a.arc(x, y, 7, 0, Math.PI * 2);
      a.fill();
      a.globalAlpha = 0.18;
      a.strokeStyle = "#57555e";
      a.lineWidth = 2;
      a.beginPath();
      a.arc(x, y, 8.5, 0, Math.PI * 2);
      a.stroke();
      a.globalAlpha = 1;
      hc.globalAlpha = 0.9;
      hc.fillStyle = "#484848";
      hc.beginPath();
      hc.arc(x, y, 7, 0, Math.PI * 2);
      hc.fill();
      hc.globalAlpha = 1;
    }
  }

  // faint weathering streaks
  for (let i = 0; i < 30; i++) {
    const x = rand() * size;
    const w = 8 + rand() * 40;
    const g = a.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(0.5, `rgba(18,17,22,${0.03 + rand() * 0.05})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    a.fillStyle = g;
    a.fillRect(x, 0, w, size);
  }

  const rough = document.createElement("canvas");
  rough.width = rough.height = size;
  const r = rough.getContext("2d")!;
  r.fillStyle = "#dcdcdc"; // matte ≈ 0.86
  r.fillRect(0, 0, size, size);
  paintNoise(r, size, 313, [
    { cells: 32, alpha: 0.12 },
    { cells: 256, alpha: 0.08 },
  ], "soft-light");

  concreteCache = {
    map: toTexture(albedo, true),
    roughnessMap: toTexture(rough, false),
    normalMap: toTexture(heightToNormal(heightC, 1.1), false),
  };
  return concreteCache;
}
