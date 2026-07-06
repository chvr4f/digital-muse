"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useCursor, useTexture } from "@react-three/drei";
import { ARTWORKS, getArtworkCanvas } from "@/lib/artworks";
import { world, damp } from "@/lib/world";
import { PAINTING_MODELS, PAINTING_IMAGES, imageUrl } from "@/lib/customModels";
import UploadedModel from "./UploadedModel";

/** The picture surface, painted procedurally at runtime. */
function ProceduralPicture({ id, width, height }: { id: number; width: number; height: number }) {
  const texture = useMemo(() => {
    const tex = new THREE.CanvasTexture(getArtworkCanvas(id));
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }, [id]);
  return (
    <mesh position-z={0.052}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial map={texture} roughness={0.85} metalness={0} />
    </mesh>
  );
}

/** The picture surface, showing one of your uploaded images. */
function ImagePicture({ url, width, height }: { url: string; width: number; height: number }) {
  const texture = useTexture(url, (t) => {
    const tex = t as THREE.Texture;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
  });
  return (
    <mesh position-z={0.052}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial map={texture as THREE.Texture} roughness={0.72} metalness={0} />
    </mesh>
  );
}

const frameMaterial = new THREE.MeshStandardMaterial({
  color: "#1a1712",
  roughness: 0.35,
  metalness: 0.4,
});
const frameGoldMaterial = new THREE.MeshStandardMaterial({
  color: "#8a6f42",
  roughness: 0.3,
  metalness: 0.8,
});

/** Radial soft-shadow texture faked behind each frame (cheap contact shadow). */
function useShadowTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(64, 64, 8, 64, 64, 64);
    g.addColorStop(0, "rgba(0,0,0,0.55)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(c);
    return tex;
  }, []);
}

/** Radial gold glow shown behind a hovered painting. */
function useGlowTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
    g.addColorStop(0, "rgba(230, 200, 140, 0.9)");
    g.addColorStop(0.55, "rgba(210, 175, 115, 0.28)");
    g.addColorStop(1, "rgba(200, 165, 100, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);
}

export function Painting({
  id,
  position,
  rotationY = 0,
  height = 3,
  interactive = false,
}: {
  id: number;
  position: [number, number, number];
  rotationY?: number;
  height?: number;
  interactive?: boolean;
}) {
  const art = ARTWORKS[id];
  const customModel = PAINTING_MODELS[id];
  const customImage = PAINTING_IMAGES[id];
  const width = height * (customImage?.aspect ?? art.aspect);
  const showFrame = customImage?.frame ?? true;
  const inner = useRef<THREE.Group>(null);
  const glow = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered && interactive);
  const spotTarget = useMemo(() => new THREE.Object3D(), []);

  const shadowTex = useShadowTexture();
  const glowTex = useGlowTexture();

  useFrame((_, rawDt) => {
    if (!inner.current) return;
    const dt = Math.min(rawDt, 1 / 20);
    const lift = hovered && interactive ? 0.14 : 0;
    const scale = hovered && interactive ? 1.025 : 1;
    inner.current.position.z = damp(inner.current.position.z, lift, 8, dt);
    const s = damp(inner.current.scale.x, scale, 8, dt);
    inner.current.scale.setScalar(s);
    if (glow.current) {
      const mat = glow.current.material as THREE.MeshBasicMaterial;
      mat.opacity = damp(mat.opacity, hovered && interactive ? 0.55 : 0, 7, dt);
    }
  });

  return (
    <group position={position} rotation-y={rotationY}>
      {/* fake contact shadow cast on the wall */}
      <mesh position={[0, -0.12, 0.005]}>
        <planeGeometry args={[width * 1.5, height * 1.5]} />
        <meshBasicMaterial map={shadowTex} transparent depthWrite={false} opacity={0.8} />
      </mesh>
      {/* hover halo */}
      <mesh ref={glow} position={[0, 0, 0.01]}>
        <planeGeometry args={[width * 1.9, height * 1.9]} />
        <meshBasicMaterial map={glowTex} transparent depthWrite={false} opacity={0} toneMapped={false} />
      </mesh>

      <group
        ref={inner}
        position={[0, 0, 0.06]}
        onPointerOver={interactive ? (e) => (e.stopPropagation(), setHovered(true)) : undefined}
        onPointerOut={interactive ? () => setHovered(false) : undefined}
        onClick={
          interactive
            ? (e) => {
                e.stopPropagation();
                world.openArtwork?.(id);
              }
            : undefined
        }
      >
        {customModel ? (
          // your uploaded model, mounted on the wall in place of the canvas
          <Suspense fallback={null}>
            <UploadedModel model={customModel} targetSize={height} />
          </Suspense>
        ) : (
          <>
            {showFrame && (
              <>
                {/* frame */}
                <mesh material={frameMaterial} castShadow>
                  <boxGeometry args={[width + 0.16, height + 0.16, 0.09]} />
                </mesh>
                {/* thin gold fillet */}
                <mesh material={frameGoldMaterial} position-z={0.005}>
                  <boxGeometry args={[width + 0.06, height + 0.06, 0.088]} />
                </mesh>
              </>
            )}
            {/* picture surface: your uploaded image, or the procedural canvas */}
            {customImage ? (
              <Suspense fallback={null}>
                <ImagePicture url={imageUrl(customImage.file)} width={width} height={height} />
              </Suspense>
            ) : (
              <ProceduralPicture id={id} width={width} height={height} />
            )}
            {/* wall label */}
            <mesh position={[width / 2 + 0.42, -height / 2 + 0.32, 0]}>
              <planeGeometry args={[0.5, 0.22]} />
              <meshStandardMaterial color="#e8e3d8" roughness={0.9} />
            </mesh>
          </>
        )}
      </group>

      {/* picture light above interactive pieces */}
      {interactive && (
        <>
          <primitive object={spotTarget} position={[0, 0, 0]} />
          <spotLight
            position={[0, height / 2 + 1.6, 2.2]}
            target={spotTarget}
            angle={0.7}
            penumbra={0.8}
            intensity={hovered ? 26 : 14}
            color="#ffe6bc"
            distance={8}
            decay={2}
          />
        </>
      )}
    </group>
  );
}

const WALL_X = 12.94; // inner face of the side walls

/** All paintings hung through the museum. */
export default function Paintings() {
  return (
    <group>
      {/* ——— lobby: two monumental canvases per side ——— */}
      <Painting id={0} position={[-WALL_X, 4.6, -8]} rotationY={Math.PI / 2} height={5} />
      <Painting id={2} position={[-WALL_X, 4.4, -20]} rotationY={Math.PI / 2} height={4.4} />
      <Painting id={1} position={[WALL_X, 4.6, -12]} rotationY={-Math.PI / 2} height={5} />
      <Painting id={7} position={[WALL_X, 4.4, -24]} rotationY={-Math.PI / 2} height={4.4} />

      {/* ——— exhibition room: the interactive artwork wall (right side) ——— */}
      <Painting id={3} position={[WALL_X, 2.9, -55.5]} rotationY={-Math.PI / 2} height={2.6} interactive />
      <Painting id={4} position={[WALL_X, 2.9, -59.5]} rotationY={-Math.PI / 2} height={2.9} interactive />
      <Painting id={5} position={[WALL_X, 2.9, -63.8]} rotationY={-Math.PI / 2} height={2.7} interactive />
      <Painting id={6} position={[WALL_X, 2.9, -68]} rotationY={-Math.PI / 2} height={2.5} interactive />
      {/* on the freestanding partial wall */}
      <Painting id={8} position={[-6.55, 3.1, -58]} rotationY={Math.PI / 2} height={2.8} interactive />
      {/* left wall single piece */}
      <Painting id={9} position={[-WALL_X, 3.0, -66]} rotationY={Math.PI / 2} height={2.7} interactive />
    </group>
  );
}
