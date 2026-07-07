"use client";

import { Suspense, useMemo } from "react";
import * as THREE from "three";
import { MeshReflectorMaterial } from "@react-three/drei";
import { getMarbleMaps, getStoneWallMaps } from "@/lib/textures";
import { CORRIDOR_MODELS } from "@/lib/customModels";
import UploadedModel from "./UploadedModel";

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

// refined furniture accents (no textures needed — reused across the museum)
const leatherMat = new THREE.MeshStandardMaterial({
  color: "#1d1815",
  roughness: 0.5,
  metalness: 0.06,
  envMapIntensity: 0.5,
});
const bronzeMat = new THREE.MeshStandardMaterial({
  color: "#8a7148",
  roughness: 0.32,
  metalness: 0.92,
  envMapIntensity: 1.0,
});

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
  const stone = getStoneWallMaps();

  const cloneSet = (repeatX: number, repeatY: number) => {
    const set = {
      map: stone.map.clone(),
      roughnessMap: stone.roughnessMap.clone(),
      normalMap: stone.normalMap.clone(),
    };
    for (const t of Object.values(set)) {
      t.repeat.set(repeatX, repeatY);
      t.needsUpdate = true;
    }
    return set;
  };

  // long side walls: 158 m long — reveals every ≈ 2.5 m, full-height panels
  const wallSet = cloneSet(16, 1);
  // partitions and end walls: faces 10–28 m wide
  const partSet = cloneSet(2.4, 1);

  mats = {
    concreteWall: new THREE.MeshStandardMaterial({
      ...wallSet,
      color: "#c8bda8",
      normalScale: new THREE.Vector2(0.9, 0.9),
      roughness: 1,
      metalness: 0.0,
      envMapIntensity: 0.5,
    }),
    concretePartition: new THREE.MeshStandardMaterial({
      ...partSet,
      color: "#c8bda8",
      normalScale: new THREE.Vector2(0.9, 0.9),
      roughness: 1,
      metalness: 0.0,
      envMapIntensity: 0.45,
    }),
    concreteDark: new THREE.MeshStandardMaterial({
      color: "#2a2620",
      roughness: 0.94,
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

/** A gallery bench — recessed stone base, walnut body, bronze reveal, leather top. */
function Bench({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  const { woodDark, concreteDark } = getMaterials();
  return (
    <group position={position} rotation-y={rotationY}>
      {/* recessed stone base — reads as a shadow gap that floats the bench */}
      <mesh position-y={0.08} castShadow receiveShadow material={concreteDark}>
        <boxGeometry args={[2.24, 0.16, 0.5]} />
      </mesh>
      {/* walnut body */}
      <mesh position-y={0.3} castShadow material={woodDark}>
        <boxGeometry args={[2.5, 0.32, 0.64]} />
      </mesh>
      {/* thin bronze reveal under the cushion */}
      <mesh position-y={0.475} material={bronzeMat}>
        <boxGeometry args={[2.52, 0.02, 0.66]} />
      </mesh>
      {/* dark leather cushion, slightly inset */}
      <mesh position-y={0.55} castShadow material={leatherMat}>
        <boxGeometry args={[2.4, 0.13, 0.58]} />
      </mesh>
      {/* stitched center seam down the leather */}
      <mesh position-y={0.617}>
        <boxGeometry args={[2.34, 0.006, 0.018]} />
        <meshStandardMaterial color="#0d0a08" roughness={0.6} />
      </mesh>
    </group>
  );
}

/** A refined pedestal — recessed toe kick, stone shaft, thin bronze top reveal.
 *  The top surface stays at `position.y + height`, so anything on it aligns. */
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
  const [x, y, z] = position;
  const toe = 0.08;
  const cap = 0.02;
  return (
    <group position={[x, y, z]}>
      {/* recessed toe kick — a shadow line that lifts the plinth off the floor */}
      <mesh position-y={toe / 2} material={concreteDark}>
        <boxGeometry args={[size - 0.16, toe, size - 0.16]} />
      </mesh>
      {/* shaft */}
      <mesh position-y={toe + (height - toe - cap) / 2} castShadow receiveShadow material={concreteDark}>
        <boxGeometry args={[size, height - toe - cap, size]} />
      </mesh>
      {/* thin bronze reveal at the top edge */}
      <mesh position-y={height - cap / 2} material={bronzeMat}>
        <boxGeometry args={[size + 0.03, cap, size + 0.03]} />
      </mesh>
    </group>
  );
}

/** A warm uplight at the skirting that grazes up the wall, revealing the panels. */
function WallWash({ x, z }: { x: number; z: number }) {
  const target = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(x + Math.sign(x) * 2, 9.5, z);
    return o;
  }, [x, z]);
  return (
    <group>
      <primitive object={target} />
      <spotLight
        position={[x, 0.35, z]}
        target={target}
        angle={0.55}
        penumbra={1}
        intensity={11}
        color="#ffd7a0"
        distance={15}
        decay={2}
      />
    </group>
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
      {pieces.map((p, i) => {
        const model = CORRIDOR_MODELS[i];
        return (
          <group key={i} position={[p.x, 0, p.z]}>
            <Plinth position={[0, 0, 0]} />
            {model ? (
              // your uploaded statue, standing on the plinth (top at y = 1.3)
              <Suspense fallback={null}>
                <group position-y={1.3}>
                  <UploadedModel model={model} targetSize={1.8} ground />
                </group>
              </Suspense>
            ) : (
              <mesh position-y={1.85} castShadow material={marbleWhite} rotation={[0.3 * i, 0.8 * i, 0]}>
                {p.geo}
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

/** Where the monumental sculpture stands — the circular oculus sits above it. */
export const SCULPTURE_POS: [number, number, number] = [-5.5, 0, -13];
const OCULUS_R = 3.6;

export default function Museum() {
  const { concreteWall, concretePartition, concreteDark } = getMaterials();
  const marble = useMemo(() => {
    const maps = getMarbleMaps();
    // floor is 30 × 170 m; one texture tile (4 slabs) ≈ 7.5 m
    for (const t of [maps.map, maps.roughnessMap, maps.normalMap]) t.repeat.set(4, 22.5);
    return maps;
  }, []);

  // lobby ceiling slab with a circular oculus punched over the sculpture
  // (shape-local y maps to world z under the rotation below)
  const lobbyCeiling = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-14, -30);
    shape.lineTo(14, -30);
    shape.lineTo(14, 15);
    shape.lineTo(-14, 15);
    shape.closePath();
    const hole = new THREE.Path();
    hole.absarc(SCULPTURE_POS[0], SCULPTURE_POS[2], OCULUS_R, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    return new THREE.ShapeGeometry(shape, 48);
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
          normalScale={[0.4, 0.4]}
          resolution={2048}
          mirror={0.55}
          blur={[180, 60]}
          mixBlur={0.85}
          mixStrength={1.25}
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

      {/* ——— skirting / baseboard with a bronze reveal, both side walls ——— */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 12.9, 0.16, zMid]} material={concreteDark} receiveShadow castShadow>
            <boxGeometry args={[0.18, 0.32, length]} />
          </mesh>
          <mesh position={[s * 12.85, 0.33, zMid]} material={bronzeMat}>
            <boxGeometry args={[0.1, 0.015, length]} />
          </mesh>
        </group>
      ))}

      {/* ——— cornice where the side walls meet the ceiling ——— */}
      {[-1, 1].map((s) => (
        <group key={`c${s}`}>
          <mesh position={[s * 12.74, 11.55, zMid]} material={concreteDark} castShadow>
            <boxGeometry args={[0.52, 0.5, length]} />
          </mesh>
          <mesh position={[s * 12.84, 11.27, zMid]} material={bronzeMat}>
            <boxGeometry args={[0.1, 0.012, length]} />
          </mesh>
        </group>
      ))}

      {/* ——— entrance wall behind the camera start ——— */}
      <mesh position={[0, HALL.height / 2, HALL.zStart + 1]} material={concretePartition}>
        <boxGeometry args={[HALL.width + 2, HALL.height, 1]} />
      </mesh>
      {/* ——— far end wall ——— */}
      <mesh position={[0, HALL.height / 2, HALL.zEnd - 1]} material={concretePartition}>
        <boxGeometry args={[HALL.width + 2, HALL.height, 1]} />
      </mesh>

      {/* ——— lobby ceiling with circular oculus over the sculpture ——— */}
      <mesh geometry={lobbyCeiling} rotation-x={Math.PI / 2} position-y={HALL.height} material={concreteDark} />
      {/* rest of ceiling to the end */}
      <mesh rotation-x={Math.PI / 2} position={[0, HALL.height, (-30 + HALL.zEnd) / 2]} material={concreteDark}>
        <planeGeometry args={[HALL.width + 2, -30 - HALL.zEnd]} />
      </mesh>

      {/* glowing sky disc seen through the oculus (bloom picks this up) */}
      <mesh
        rotation-x={Math.PI / 2}
        position={[SCULPTURE_POS[0], HALL.height + 0.06, SCULPTURE_POS[2]]}
      >
        <circleGeometry args={[OCULUS_R - 0.05, 64]} />
        <meshBasicMaterial color="#ffeccb" toneMapped={false} />
      </mesh>
      {/* oculus rim + bronze reveal ring */}
      <mesh position={[SCULPTURE_POS[0], HALL.height - 0.02, SCULPTURE_POS[2]]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[OCULUS_R + 0.1, 0.12, 12, 64]} />
        <meshStandardMaterial color="#1c1b1f" roughness={0.8} />
      </mesh>
      <mesh position={[SCULPTURE_POS[0], HALL.height - 0.1, SCULPTURE_POS[2]]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[OCULUS_R - 0.12, 0.02, 8, 64]} />
        <meshBasicMaterial color="#8a7148" />
      </mesh>

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

      {/* ——— warm uplights grazing the lobby paneling ——— */}
      <WallWash x={-12.4} z={-9} />
      <WallWash x={-12.4} z={-22} />
      <WallWash x={12.4} z={-15} />

      {/* ——— lobby furniture (kept clear of the sculpture at x −5.5) ——— */}
      <Bench position={[-8.6, 0, -5.5]} rotationY={Math.PI / 2} />
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
