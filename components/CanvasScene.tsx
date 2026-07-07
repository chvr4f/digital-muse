"use client";

import { Canvas } from "@react-three/fiber";
import Scene from "./scene/Scene";
import { world } from "@/lib/world";

/** The fixed 3D layer behind the editorial overlay. Loaded lazily, client-only. */
export default function CanvasScene() {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        shadows="soft"
        camera={{ fov: 55, near: 0.1, far: 170, position: [0, 6.5, 15.5] }}
        dpr={world.isMobile ? [1, 1.75] : [1, 2]}
        gl={{
          antialias: false, // MSAA is done on the EffectComposer instead
          powerPreference: "high-performance",
          stencil: false,
        }}
        onCreated={({ gl }) => {
          // filmic exposure lift — ACES tone mapping is the R3F default
          gl.toneMappingExposure = 1.12;
        }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
