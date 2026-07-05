"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { world, damp } from "@/lib/world";
import { SCULPTURE_POS } from "./Museum";

/** Monumental marble knot on the left of the lobby, under the oculus. */
export default function Sculpture() {
  const knot = useRef<THREE.Mesh>(null);
  const sway = useRef(0);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20);
    if (!knot.current) return;
    // perpetual slow rotation + a few degrees of cursor influence
    sway.current = damp(sway.current, world.mouse.x * 0.14, 2.5, dt);
    knot.current.rotation.y = state.clock.elapsedTime * 0.07 + sway.current;
    knot.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.11) * 0.04;
  });

  return (
    <group position={SCULPTURE_POS}>
      {/* stepped stone base */}
      <mesh position-y={0.25} castShadow receiveShadow>
        <cylinderGeometry args={[2.4, 2.6, 0.5, 48]} />
        <meshStandardMaterial color="#1c1b1f" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position-y={0.9} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.7, 0.8, 48]} />
        <meshStandardMaterial color="#232227" roughness={0.6} metalness={0.15} />
      </mesh>

      <mesh ref={knot} position-y={3.15} castShadow>
        <torusKnotGeometry args={[1.15, 0.36, 260, 40]} />
        <meshPhysicalMaterial
          color="#e6e1d6"
          roughness={0.26}
          metalness={0.02}
          clearcoat={0.5}
          clearcoatRoughness={0.5}
          sheen={0.4}
          sheenColor="#fff2dd"
          envMapIntensity={0.9}
        />
      </mesh>

      {/* faint gold accent ring floating around the base */}
      <mesh position-y={1.34} rotation-x={Math.PI / 2}>
        <torusGeometry args={[2.05, 0.012, 12, 96]} />
        <meshBasicMaterial color="#c9a96e" toneMapped={false} transparent opacity={0.85} />
      </mesh>
    </group>
  );
}
