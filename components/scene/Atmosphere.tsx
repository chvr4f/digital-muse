"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { world } from "@/lib/world";

/** Soft volumetric shaft of sunlight falling from a skylight. */
export function LightShaft({
  position,
  topRadius = 2.2,
  bottomRadius = 4.2,
  height = 12,
  color = "#ffe9c4",
  intensity = 0.16,
}: {
  position: [number, number, number];
  topRadius?: number;
  bottomRadius?: number;
  height?: number;
  color?: string;
  intensity?: number;
}) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: {
          uColor: { value: new THREE.Color(color) },
          uIntensity: { value: intensity },
          uTime: { value: 0 },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vViewDir;
          void main() {
            vUv = uv;
            vec4 world = modelMatrix * vec4(position, 1.0);
            vNormal = normalize(mat3(modelMatrix) * normal);
            vViewDir = normalize(cameraPosition - world.xyz);
            gl_Position = projectionMatrix * viewMatrix * world;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor;
          uniform float uIntensity;
          uniform float uTime;
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vViewDir;
          void main() {
            // brighter at the top, dissolving toward the floor
            float vertical = pow(vUv.y, 1.6);
            // soften the silhouette edges of the cone
            float facing = abs(dot(normalize(vNormal), normalize(vViewDir)));
            float edge = smoothstep(0.0, 0.55, facing);
            // slow shimmer, like dust drifting through the beam
            float shimmer = 0.86 + 0.14 * sin(uTime * 0.35 + vUv.y * 5.0);
            float a = vertical * edge * shimmer * uIntensity;
            gl_FragColor = vec4(uColor, a);
          }
        `,
      }),
    [color, intensity],
  );

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh position={position} material={material}>
      <cylinderGeometry args={[topRadius, bottomRadius, height, 24, 1, true]} />
    </mesh>
  );
}

/** Fine dust suspended in the air through the whole museum. */
export function DustParticles({ count = 1100 }: { count?: number }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0, 0) },
        },
        vertexShader: /* glsl */ `
          attribute float aScale;
          attribute vec3 aRand;
          uniform float uTime;
          uniform vec2 uMouse;
          varying float vAlpha;
          void main() {
            vec3 p = position;
            // slow individual drift
            p.x += sin(uTime * (0.08 + aRand.x * 0.12) + aRand.y * 40.0) * 0.6;
            p.y += sin(uTime * (0.05 + aRand.y * 0.10) + aRand.z * 40.0) * 0.45;
            p.z += cos(uTime * (0.06 + aRand.z * 0.10) + aRand.x * 40.0) * 0.5;
            // faint response to the cursor
            p.x += uMouse.x * aRand.x * 0.35;
            p.y -= uMouse.y * aRand.y * 0.25;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            float dist = -mv.z;
            gl_PointSize = aScale * 70.0 / dist;
            // fade out very near and very far motes
            vAlpha = smoothstep(28.0, 14.0, dist) * smoothstep(0.6, 3.0, dist);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          varying float vAlpha;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.08, d) * vAlpha * 0.34;
            gl_FragColor = vec4(vec3(1.0, 0.95, 0.85), a);
          }
        `,
      }),
    [],
  );

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const scale = new Float32Array(count);
    const rand = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 24;
      pos[i * 3 + 1] = 0.3 + Math.random() * 10;
      pos[i * 3 + 2] = 14 - Math.random() * 162;
      scale[i] = 0.35 + Math.random() * 0.85;
      rand[i * 3] = Math.random();
      rand[i * 3 + 1] = Math.random();
      rand[i * 3 + 2] = Math.random();
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aScale", new THREE.BufferAttribute(scale, 1));
    geo.setAttribute("aRand", new THREE.BufferAttribute(rand, 3));
    return geo;
  }, [count]);

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    const m = material.uniforms.uMouse.value as THREE.Vector2;
    m.x += (world.mouse.x - m.x) * 0.03;
    m.y += (world.mouse.y - m.y) * 0.03;
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}

/** All static lights for the museum. */
export function Lights() {
  // light targets must live in the scene graph or their matrices never update
  const sunTarget = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(0, 0, -14);
    return o;
  }, []);

  return (
    <group>
      <primitive object={sunTarget} />
      {/* the environment map now carries the ambient term; these are trims */}
      <ambientLight intensity={0.22} color="#cfc8bc" />
      <hemisphereLight intensity={0.18} color="#e8dcc4" groundColor="#0d0c0e" />

      {/* key sun through the lobby skylight */}
      <directionalLight
        castShadow
        position={[4, 18, -9]}
        target={sunTarget}
        intensity={2.8}
        color="#ffe3b4"
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={4}
        shadow-camera-far={40}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-bias={-0.0004}
      />

      {/* room fills — warm, dim, no shadows */}
      <pointLight position={[0, 8, -2]} intensity={28} color="#ffdfae" distance={30} decay={2} />
      <pointLight position={[0, 7, -39]} intensity={18} color="#f5d9a8" distance={24} decay={2} />
      <pointLight position={[0, 8, -60]} intensity={24} color="#ffe6bc" distance={28} decay={2} />
      {/* curator room — cooler, moodier */}
      <pointLight position={[0, 7, -79]} intensity={10} color="#9db4d4" distance={26} decay={2} />
      <pointLight position={[0, 3, -82]} intensity={7} color="#c9a96e" distance={18} decay={2} />
      {/* store gallery — warm boutique light */}
      <pointLight position={[0, 8, -96]} intensity={18} color="#ffd9a0" distance={24} decay={2} />
      {/* membership room */}
      <pointLight position={[0, 7, -113]} intensity={12} color="#e8cfa0" distance={22} decay={2} />
      {/* final room — the ring provides most light; low warm fill */}
      <pointLight position={[0, 5, -134]} intensity={10} color="#d8b478" distance={24} decay={2} />
    </group>
  );
}
