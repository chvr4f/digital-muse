"use client";

import { useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { getArtworkCanvas } from "@/lib/artworks";
import { Plinth } from "./Museum";

/** Store gallery (z −88…−104): leaning framed prints and pedestal editions. */
export function StoreGallery() {
  const printTextures = useMemo(
    () =>
      [1, 4, 6, 9].map((id) => {
        const tex = new THREE.CanvasTexture(getArtworkCanvas(id));
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
      }),
    [],
  );

  return (
    <group>
      {/* a shelf rail of leaning prints along the left wall */}
      <mesh position={[-12.6, 2.1, -96]} rotation-z={0}>
        <boxGeometry args={[0.5, 0.06, 12]} />
        <meshStandardMaterial color="#2b2118" roughness={0.5} />
      </mesh>
      {printTextures.map((tex, i) => {
        const h = 1.7 + (i % 2) * 0.3;
        const w = h * 0.78;
        return (
          <group
            key={i}
            position={[-12.45, 2.13 + h / 2 - 0.06, -91.5 - i * 3]}
            rotation-y={Math.PI / 2}
            rotation-x={-0.06}
          >
            <mesh castShadow>
              <boxGeometry args={[w + 0.1, h + 0.1, 0.05]} />
              <meshStandardMaterial color="#1a1712" roughness={0.4} metalness={0.3} />
            </mesh>
            <mesh position-z={0.03}>
              <planeGeometry args={[w, h]} />
              <meshStandardMaterial map={tex} roughness={0.85} />
            </mesh>
          </group>
        );
      })}

      {/* pedestal editions in the middle of the room */}
      {[
        { x: 3.5, z: -94, geo: <dodecahedronGeometry args={[0.42, 0]} /> },
        { x: 5.5, z: -98, geo: <octahedronGeometry args={[0.45, 0]} /> },
      ].map((p, i) => (
        <PedestalEdition key={i} x={p.x} z={p.z}>
          {p.geo}
        </PedestalEdition>
      ))}
    </group>
  );
}

function PedestalEdition({ x, z, children }: { x: number; z: number; children: ReactNode }) {
  const spotTarget = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(0, 1.6, 0);
    return o;
  }, []);
  return (
    <group position={[x, 0, z]}>
      <Plinth position={[0, 0, 0]} height={1.15} size={0.8} />
      <mesh position-y={1.62} castShadow>
        {children}
        <meshPhysicalMaterial color="#d8b478" roughness={0.25} metalness={0.85} />
      </mesh>
      <primitive object={spotTarget} />
      <spotLight
        position={[0, 5, 1.5]}
        target={spotTarget}
        angle={0.4}
        penumbra={0.7}
        intensity={12}
        color="#ffe0ac"
        distance={9}
        decay={2}
      />
    </group>
  );
}

/** Membership room (z −104…−122): three lit plinths, one per tier. */
export function MembershipRoom() {
  const shapes = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    shapes.current.forEach((m, i) => {
      if (!m) return;
      m.rotation.y = t * (0.25 + i * 0.08);
      m.position.y = 2.15 + Math.sin(t * 0.8 + i * 2.1) * 0.08;
    });
  });

  const tiers = [
    { x: -4.5, geo: <tetrahedronGeometry args={[0.4, 0]} />, glow: 0.5 },
    { x: 0, geo: <icosahedronGeometry args={[0.48, 0]} />, glow: 1 },
    { x: 4.5, geo: <torusKnotGeometry args={[0.3, 0.11, 90, 16]} />, glow: 0.7 },
  ];

  return (
    <group position-z={-114}>
      {tiers.map((tier, i) => (
        <group key={i} position-x={tier.x}>
          <Plinth position={[0, 0, 0]} height={1.5} size={1} />
          <mesh ref={(el) => void (shapes.current[i] = el)} position-y={2.15} castShadow>
            {tier.geo}
            <meshPhysicalMaterial
              color="#e2c088"
              roughness={0.2}
              metalness={0.9}
              emissive="#8a6a34"
              emissiveIntensity={tier.glow * 0.5}
            />
          </mesh>
          <pointLight position-y={2.2} intensity={3 * tier.glow} color="#e0b878" distance={6} decay={2} />
        </group>
      ))}
    </group>
  );
}

/** Final room (z −122…−144): a monumental gold ring, doors-are-open moment. */
export function FinalRoom() {
  const ring = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ring.current) ring.current.rotation.z = t * 0.05;
    if (inner.current) {
      inner.current.rotation.z = -t * 0.08;
      const mat = inner.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.55 + Math.sin(t * 0.9) * 0.15;
    }
  });

  return (
    <group position={[0, 4.6, -138]}>
      <mesh ref={ring}>
        <torusGeometry args={[3.6, 0.09, 24, 128]} />
        <meshStandardMaterial
          color="#c9a96e"
          roughness={0.25}
          metalness={0.9}
          emissive="#c9a96e"
          emissiveIntensity={1.6}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={inner}>
        <torusGeometry args={[3.1, 0.02, 12, 128]} />
        <meshBasicMaterial color="#f2ddb0" transparent opacity={0.6} toneMapped={false} />
      </mesh>
      {/* glow disc behind the ring */}
      <mesh position-z={-0.6}>
        <circleGeometry args={[3.4, 64]} />
        <meshBasicMaterial
          color="#3a2f1c"
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <pointLight intensity={30} color="#e0b878" distance={26} decay={2} />
    </group>
  );
}
