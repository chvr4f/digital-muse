"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { MeshReflectorMaterial } from "@react-three/drei";
import { getMarbleMaps, getConcreteMaps } from "@/lib/textures";

/**
 * Museum plan (all rooms share long side walls at x = ±13, ceiling y = 12):
 *
 *   z  +14 … -30   Grand lobby (skylight, monumental sculpture, benches)
 *   z  -30 … -48   Sculpture corridor (plinths, narrowed by inner walls)
 *   z  -48 … -70   Exhibition room (interactive painting wall)
 *   z  -70 … -88   AI curator room (dark, holographic)
 *   z  -88 … -104  Store gallery (warm, leaning prints)
 *   z -104 … -122  Membership room (three plinths)
 *   z -122 … -144  Final room (gold ring)
 *
 * Partition walls with a central doorway separate the rooms so each scroll
 * section reveals the next space through an opening.
 */

export const HALL = {
  width: 26,
  height: 12,
  zStart: 14,
  zEnd: -144,
  doorways: [-30, -48, -70, -88, -104, -122],
};

type MuseumMats = {
  concreteWall: THREE.MeshStandardMaterial;
  concretePartition: THREE.MeshStandardMaterial;
  concreteDark: THREE.MeshStandardMaterial;
  woodDark: THREE.MeshStandardMaterial;
  marbleWhite: THREE.MeshPhysicalMaterial;
};

let mats: MuseumMats | null = null;

/** Textured PBR material set, built lazily on the client (canvas-generated maps). */
export function getMaterials(): MuseumMats {
  if (mats) return mats;
  const concrete = getConcreteMaps();

  const cloneSet = (repeatX: number, repeatY: number) => {
    const set = {
      map: concrete.map.clone(),
      roughnessMap: concrete.roughnessMap.clone(),
      normalMap: concrete.normalMap.clone(),
    };
    for (const t of Object.values(set)) {
      t.repeat.set(repeatX, repeatY);
      t.needsUpdate = true;
    }
    return set;
  };

  // long side walls: 158 m × 12 m, concrete tile ≈ 6.5 m
  const wallSet = cloneSet(24, 1.85);
  // partitions and end walls: faces 10–28 m wide
  const partSet = cloneSet(2.2, 1.85);

  mats = {
    concreteWall: new THREE.MeshStandardMaterial({
      ...wallSet,
      normalScale: new THREE.Vector2(0.7, 0.7),
      roughness: 1,
      metalness: 0.02,
      envMapIntensity: 0.35,
    }),
    concretePartition: new THREE.MeshStandardMaterial({
      ...partSet,
      normalScale: new THREE.Vector2(0.7, 0.7),
      roughness: 1,
      metalness: 0.02,
      envMapIntensity: 0.35,
    }),
    concreteDark: new THREE.MeshStandardMaterial({
      color: "#232227",
      roughness: 0.96,
      metalness: 0.0,
      envMapIntensity: 0.2,
    }),
    woodDark: new THREE.MeshStandardMaterial({
      color: "#2b2118",
      roughness: 0.45,
      metalness: 0.05,
      envMapIntensity: 0.55,
    }),
    marbleWhite: new THREE.MeshPhysicalMaterial({
      color: "#dad4c8",
      roughness: 0.3,
      metalness: 0.0,
      clearcoat: 0.3,
      clearcoatRoughness: 0.55,
      envMapIntensity: 0.85,
    }),
  };
  return mats;
}

function PartitionWall({ z }: { z: number }) {
  const { concretePartition, concreteDark } = getMaterials();
  // two blocks leaving a 6-unit-wide, 7-unit-tall doorway in the middle
  const sideW = (HALL.width - 6) / 2; // 10
  return (
    <group position-z={z}>
      <mesh position={[-(3 + sideW / 2), HALL.height / 2, 0]} material={concretePartition}>
        <boxGeometry args={[sideW, HALL.height, 1]} />
      </mesh>
      <mesh position={[3 + sideW / 2, HALL.height / 2, 0]} material={concretePartition}>
        <boxGeometry args={[sideW, HALL.height, 1]} />
      </mesh>
      {/* lintel above the doorway */}
      <mesh position={[0, 7 + (HALL.height - 7) / 2, 0]} material={concreteDark}>
        <boxGeometry args={[6.06, HALL.height - 7, 1]} />
      </mesh>
      {/* thin gold reveal strip framing the opening */}
      <mesh position={[0, 7.02, 0.52]}>
        <boxGeometry args={[6.1, 0.05, 0.02]} />
        <meshBasicMaterial color="#8a7148" />
      </mesh>
    </group>
  );
}

function Bench({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  const { woodDark, concreteDark } = getMaterials();
  return (
    <group position={position} rotation-y={rotationY}>
      <mesh position-y={0.42} castShadow material={woodDark}>
        <boxGeometry args={[2.6, 0.12, 0.62]} />
      </mesh>
      <mesh position={[-1.05, 0.18, 0]} castShadow material={concreteDark}>
        <boxGeometry args={[0.14, 0.36, 0.5]} />
      </mesh>
      <mesh position={[1.05, 0.18, 0]} castShadow material={concreteDark}>
        <boxGeometry args={[0.14, 0.36, 0.5]} />
      </mesh>
    </group>
  );
}

export function Plinth({
  position,
  height = 1.3,
  size = 0.9,
}: {
  position: [number, number, number];
  height?: number;
  size?: number;
}) {
  const { concreteDark } = getMaterials();
  return (
    <mesh position={[position[0], position[1] + height / 2, position[2]]} castShadow material={concreteDark}>
      <boxGeometry args={[size, height, size]} />
    </mesh>
  );
}

/** Small marble studies lining the sculpture corridor. */
function CorridorSculptures() {
  const { marbleWhite } = getMaterials();
  const pieces = useMemo(
    () => [
      { z: -34, x: -4.6, geo: <icosahedronGeometry args={[0.55, 0]} /> },
      { z: -38.5, x: 4.6, geo: <torusGeometry args={[0.42, 0.18, 24, 48]} /> },
      { z: -43, x: -4.6, geo: <coneGeometry args={[0.45, 1.1, 5]} /> },
      { z: -46.5, x: 4.6, geo: <sphereGeometry args={[0.5, 32, 32]} /> },
    ],
    [],
  );
  return (
    <group>
      {pieces.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]}>
          <Plinth position={[0, 0, 0]} />
          <mesh position-y={1.85} castShadow material={marbleWhite} rotation={[0.3 * i, 0.8 * i, 0]}>
            {p.geo}
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function Museum() {
  const { concreteWall, concretePartition, concreteDark } = getMaterials();
  const marble = useMemo(() => {
    const maps = getMarbleMaps();
    // floor is 30 × 170 m; one texture tile (4 slabs) ≈ 7.5 m
    for (const t of [maps.map, maps.roughnessMap, maps.normalMap]) t.repeat.set(4, 22.5);
    return maps;
  }, []);

  const length = HALL.zStart - HALL.zEnd; // 158
  const zMid = (HALL.zStart + HALL.zEnd) / 2; // -65

  return (
    <group>
      {/* ——— polished dark marble floor, one continuous planar reflection ——— */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, zMid]} receiveShadow>
        <planeGeometry args={[HALL.width + 4, length + 8]} />
        <MeshReflectorMaterial
          map={marble.map}
          roughnessMap={marble.roughnessMap}
          normalMap={marble.normalMap}
          normalScale={[0.45, 0.45]}
          resolution={1024}
          mirror={0.5}
          blur={[350, 90]}
          mixBlur={1}
          mixStrength={1.5}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          roughness={1}
          metalness={0.25}
          color="#ffffff"
          envMapIntensity={0.5}
        />
      </mesh>

      {/* ——— long side walls ——— */}
      <mesh position={[-(HALL.width / 2 + 0.5), HALL.height / 2, zMid]} material={concreteWall} receiveShadow>
        <boxGeometry args={[1, HALL.height, length]} />
      </mesh>
      <mesh position={[HALL.width / 2 + 0.5, HALL.height / 2, zMid]} material={concreteWall} receiveShadow>
        <boxGeometry args={[1, HALL.height, length]} />
      </mesh>

      {/* ——— entrance wall behind the camera start ——— */}
      <mesh position={[0, HALL.height / 2, HALL.zStart + 1]} material={concretePartition}>
        <boxGeometry args={[HALL.width + 2, HALL.height, 1]} />
      </mesh>
      {/* ——— far end wall ——— */}
      <mesh position={[0, HALL.height / 2, HALL.zEnd - 1]} material={concretePartition}>
        <boxGeometry args={[HALL.width + 2, HALL.height, 1]} />
      </mesh>

      {/* ——— ceiling, with a skylight opening over the lobby (x −4..4, z −18..−8) ——— */}
      {/* strip before skylight */}
      <mesh rotation-x={Math.PI / 2} position={[0, HALL.height, (HALL.zStart + -8) / 2]} material={concreteDark}>
        <planeGeometry args={[HALL.width + 2, HALL.zStart - -8]} />
      </mesh>
      {/* strips beside skylight */}
      <mesh rotation-x={Math.PI / 2} position={[-((HALL.width + 2) / 4 + 2), HALL.height, -13]} material={concreteDark}>
        <planeGeometry args={[(HALL.width + 2) / 2 - 4, 10]} />
      </mesh>
      <mesh rotation-x={Math.PI / 2} position={[(HALL.width + 2) / 4 + 2, HALL.height, -13]} material={concreteDark}>
        <planeGeometry args={[(HALL.width + 2) / 2 - 4, 10]} />
      </mesh>
      {/* rest of ceiling to the end */}
      <mesh rotation-x={Math.PI / 2} position={[0, HALL.height, (-18 + HALL.zEnd) / 2]} material={concreteDark}>
        <planeGeometry args={[HALL.width + 2, -18 - HALL.zEnd]} />
      </mesh>

      {/* glowing skylight plane (bloom picks this up) */}
      <mesh rotation-x={Math.PI / 2} position={[0, HALL.height + 0.02, -13]}>
        <planeGeometry args={[8, 10]} />
        <meshBasicMaterial color="#fff4e0" toneMapped={false} />
      </mesh>
      {/* skylight mullions */}
      {[-2, 0, 2].map((x) => (
        <mesh key={x} position={[x, HALL.height - 0.04, -13]} material={concreteDark}>
          <boxGeometry args={[0.12, 0.12, 10]} />
        </mesh>
      ))}

      {/* smaller skylight glows above later rooms */}
      <mesh rotation-x={Math.PI / 2} position={[0, HALL.height - 0.02, -60]}>
        <planeGeometry args={[3, 12]} />
        <meshBasicMaterial color="#f5e8ce" toneMapped={false} />
      </mesh>
      <mesh rotation-x={Math.PI / 2} position={[0, HALL.height - 0.02, -96]}>
        <planeGeometry args={[3, 10]} />
        <meshBasicMaterial color="#f2dfbe" toneMapped={false} />
      </mesh>

      {/* ——— partition walls with doorways ——— */}
      {HALL.doorways.map((z) => (
        <PartitionWall key={z} z={z} />
      ))}

      {/* ——— corridor: inner walls narrow the passage ——— */}
      <mesh position={[-8.5, HALL.height / 2 - 1.5, -39]} material={concretePartition}>
        <boxGeometry args={[3, HALL.height - 3, 18]} />
      </mesh>
      <mesh position={[8.5, HALL.height / 2 - 1.5, -39]} material={concretePartition}>
        <boxGeometry args={[3, HALL.height - 3, 18]} />
      </mesh>

      {/* ——— lobby furniture ——— */}
      <Bench position={[-6.5, 0, -10]} rotationY={Math.PI / 2} />
      <Bench position={[6.5, 0, -16]} rotationY={Math.PI / 2} />
      <Bench position={[0, 0, -26]} />
      {/* exhibition room bench */}
      <Bench position={[-3, 0, -62]} rotationY={Math.PI / 2.3} />

      <CorridorSculptures />

      {/* ——— freestanding partial wall inside exhibition room (adds depth) ——— */}
      <mesh position={[-7, 3.2, -58]} material={concretePartition} castShadow>
        <boxGeometry args={[0.8, 6.4, 10]} />
      </mesh>
    </group>
  );
}
