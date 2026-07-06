"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { ARTWORKS, getArtworkCanvas } from "@/lib/artworks";
import { world, smoothstep, damp } from "@/lib/world";
import { PAINTING_IMAGES, imageUrl } from "@/lib/customModels";

/** Aspect (w/h) for an artwork id — the uploaded image's, or the procedural default. */
function artAspect(id: number) {
  return PAINTING_IMAGES[id]?.aspect ?? ARTWORKS[id].aspect;
}

/**
 * The AI curator at work: twelve holographic artwork cards drift in disorder,
 * then — as the visitor walks in — glide into three curated columns while
 * gold threads connect the pieces of each exhibition.
 */

const ROOM_CENTER = new THREE.Vector3(0, 4.2, -79);
const CARD_COUNT = 12;
const CLUSTERS = 3;

// scroll window over which the "organization" happens
const ORGANIZE_START = 0.53;
const ORGANIZE_END = 0.64;

function seeded(i: number, salt: number) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

type CardData = {
  scatter: THREE.Vector3;
  cluster: THREE.Vector3;
  phase: number;
  artId: number;
  clusterIndex: number;
};

export default function CuratorRoom() {
  const cards = useMemo<CardData[]>(() => {
    const list: CardData[] = [];
    for (let i = 0; i < CARD_COUNT; i++) {
      const clusterIndex = i % CLUSTERS;
      const row = Math.floor(i / CLUSTERS);
      const scatter = new THREE.Vector3(
        (seeded(i, 1) - 0.5) * 16,
        2.2 + seeded(i, 2) * 5.5,
        ROOM_CENTER.z + (seeded(i, 3) - 0.5) * 12,
      );
      // three tidy columns, four cards each
      const cluster = new THREE.Vector3(
        (clusterIndex - 1) * 5.2,
        1.8 + row * 1.75,
        ROOM_CENTER.z - 2 + clusterIndex * 0.001,
      );
      list.push({ scatter, cluster, phase: seeded(i, 4) * Math.PI * 2, artId: i % 10, clusterIndex });
    }
    return list;
  }, []);

  const groupRefs = useRef<(THREE.Group | null)[]>([]);
  const organizeK = useRef(0);

  const textures = useMemo(() => {
    const loader = new THREE.TextureLoader();
    return cards.map((c) => {
      const custom = PAINTING_IMAGES[c.artId];
      // real uploaded image where we have one; procedural canvas otherwise
      const tex = custom
        ? loader.load(imageUrl(custom.file))
        : new THREE.CanvasTexture(getArtworkCanvas(c.artId));
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      return tex;
    });
  }, [cards]);

  // connection lines between consecutive cards of each cluster
  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    // 3 clusters × 3 segments × 2 points
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(CLUSTERS * 3 * 2 * 3), 3));
    return geo;
  }, []);
  const lineMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: "#c9a96e",
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  );

  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20);
    const time = state.clock.elapsedTime;
    const targetK = smoothstep(ORGANIZE_START, ORGANIZE_END, world.progress);
    organizeK.current = damp(organizeK.current, targetK, 4, dt);
    const k = organizeK.current;

    const positions = lineGeometry.attributes.position.array as Float32Array;
    let li = 0;

    for (let ci = 0; ci < CLUSTERS; ci++) {
      let prev: THREE.Vector3 | null = null;
      for (let i = 0; i < CARD_COUNT; i++) {
        if (cards[i].clusterIndex !== ci) continue;
        const g = groupRefs.current[i];
        if (!g) continue;
        const c = cards[i];
        tmp.lerpVectors(c.scatter, c.cluster, k);
        // idle float — stronger while scattered, calmer once curated
        const bob = 0.35 * (1 - k * 0.75);
        tmp.y += Math.sin(time * 0.6 + c.phase) * bob;
        tmp.x += Math.sin(time * 0.4 + c.phase * 2) * bob * 0.6;
        g.position.copy(tmp);
        // scattered cards tumble slightly; curated cards face the visitor
        g.rotation.y = (seeded(i, 9) - 0.5) * 1.2 * (1 - k) + Math.sin(time * 0.3 + c.phase) * 0.05 * (1 - k);
        g.rotation.x = (seeded(i, 7) - 0.5) * 0.5 * (1 - k);

        if (prev) {
          positions[li++] = prev.x;
          positions[li++] = prev.y;
          positions[li++] = prev.z;
          positions[li++] = g.position.x;
          positions[li++] = g.position.y;
          positions[li++] = g.position.z;
        }
        prev = g.position;
      }
    }
    lineGeometry.attributes.position.needsUpdate = true;
    lineMaterial.opacity = k * 0.55;
  });

  return (
    <group>
      {cards.map((c, i) => {
        // card sized to the artwork's real aspect, ~1.45 tall, uniform border
        const h = 1.45;
        const w = h * artAspect(c.artId);
        return (
          <group key={i} ref={(el) => void (groupRefs.current[i] = el)}>
            {/* hologram canvas */}
            <mesh>
              <planeGeometry args={[w, h]} />
              <meshBasicMaterial
                map={textures[i]}
                transparent
                opacity={0.88}
                side={THREE.DoubleSide}
                toneMapped={false}
              />
            </mesh>
            {/* gold hologram frame */}
            <lineSegments>
              <edgesGeometry args={[new THREE.PlaneGeometry(w + 0.08, h + 0.08)]} />
              <lineBasicMaterial color="#c9a96e" transparent opacity={0.8} toneMapped={false} />
            </lineSegments>
            {/* soft under-glow */}
            <mesh position-z={-0.02}>
              <planeGeometry args={[w + 0.3, h + 0.3]} />
              <meshBasicMaterial
                color="#c9a96e"
                transparent
                opacity={0.06}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        );
      })}

      <lineSegments geometry={lineGeometry} material={lineMaterial} frustumCulled={false} />

      {/* the "curator" — a quiet gold core pulsing at the heart of the room */}
      <CuratorCore />
    </group>
  );
}

function CuratorCore() {
  const core = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (core.current) {
      core.current.rotation.y = t * 0.4;
      core.current.rotation.x = t * 0.17;
      const s = 1 + Math.sin(t * 1.4) * 0.06;
      core.current.scale.setScalar(s);
    }
    if (halo.current) halo.current.rotation.z = t * 0.12;
  });
  return (
    <group position={[0, 7.6, -79]}>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.42, 1]} />
        <meshBasicMaterial color="#e8c98a" wireframe toneMapped={false} />
      </mesh>
      <mesh ref={halo} rotation-x={Math.PI / 2.4}>
        <torusGeometry args={[0.85, 0.008, 8, 64]} />
        <meshBasicMaterial color="#c9a96e" transparent opacity={0.6} toneMapped={false} />
      </mesh>
      <pointLight intensity={6} color="#e0b878" distance={12} decay={2} />
    </group>
  );
}
