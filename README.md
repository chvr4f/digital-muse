# Muse — Your Art. Your Digital Museum.

An immersive, cinematic landing page for **Muse**, an AI-powered digital museum
platform for artists. Instead of scrolling a page, visitors walk through a
rendered contemporary museum: scrolling dollies the camera through seven rooms —
lobby, sculpture corridor, exhibition hall, AI curator room, store gallery,
membership hall, and a final gold-ring rotunda.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
# or
npm run build && npm start
```

## How it works

- **3D layer** — React Three Fiber renders one continuous procedural museum
  ([components/scene/Museum.tsx](components/scene/Museum.tsx)): planar-reflective
  marble floor (drei `MeshReflectorMaterial`), concrete walls with doorway
  partitions, skylights with custom volumetric light-shaft shaders, GPU dust
  particles, and a marble torus-knot sculpture.
- **Rendering** — full PBR pipeline: procedural texture sets (veined marble
  slabs, board-formed concrete with tie holes — albedo/roughness/normal maps
  generated on canvas, [lib/textures.ts](lib/textures.ts)), image-based
  lighting baked from museum-shaped light panels (drei `Environment` +
  `Lightformer`), N8AO screen-space ambient occlusion, baked soft contact
  shadows, ACES filmic tone mapping, and a post chain of depth of field,
  bloom, film grain, vignette, and SMAA anti-aliasing.
- **Camera** — scroll progress (smoothed by Lenis) maps to arc-length position
  on a Catmull-Rom dolly path with a parallel gaze curve
  ([components/scene/CameraRig.tsx](components/scene/CameraRig.tsx)), plus
  cursor parallax and idle "breathing".
- **Editorial layer** — eight invisible 100vh spacers give the page its scroll
  length; fixed panels are choreographed against them with GSAP ScrollTrigger
  ([components/ui/Overlay.tsx](components/ui/Overlay.tsx)).
- **Artwork** — every painting is generated at runtime from a seeded RNG
  ([lib/artworks.ts](lib/artworks.ts)); the site ships zero image assets.
  Interactive pieces lift and glow on hover and open a fullscreen viewing room
  with the work's story.
- **AI curator room** — holographic artwork cards drift in disorder and
  organize into three curated columns as you walk in, gold threads connecting
  each exhibition ([components/scene/CuratorRoom.tsx](components/scene/CuratorRoom.tsx)).
- **Resilience** — capability probe falls back to a static editorial page
  without WebGL; mobile gets reduced particle counts, DPR, and effects.

Stack: Next.js 16 · React 19 · TypeScript · Tailwind 4 · Three.js ·
React Three Fiber · @react-three/drei · postprocessing · GSAP ScrollTrigger ·
Lenis · Framer Motion.
