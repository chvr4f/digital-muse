# Your 3D models

Drop your own `.glb` or `.gltf` files in this folder, then point the manifest
at them in [`lib/customModels.ts`](../../lib/customModels.ts).

## Replace the lobby sculpture

```ts
// lib/customModels.ts
export const SCULPTURE_MODEL: CustomModel | null = {
  file: "my-statue.glb",
  fitAxis: "height", // fit the statue's height to the dais
};
```

## Replace paintings with models

Keyed by artwork id (0–9, see `lib/artworks.ts`):

```ts
export const PAINTING_MODELS: Record<number, CustomModel> = {
  3: { file: "relief.glb" },
  4: { file: "bust.glb", rotationY: Math.PI }, // spin 180° to face the room
};
```

Each model is auto-centered and auto-scaled to its spot. Fine-tune with the
optional fields: `scale` (multiplier), `offsetY` (nudge up/down), `rotationY`
(turn to face the right way), `fitAxis` (`"height" | "width" | "depth" | "max"`).

**Tips**
- Prefer `.glb` (single file, textures embedded). Keep it reasonably light
  (< ~15 MB) so it loads fast in the browser.
- If your model looks black, it has no baked lighting — that's fine, the scene
  lights it; make sure it uses PBR/standard materials.
- Draco-compressed models are supported automatically.
