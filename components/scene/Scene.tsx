"use client";

import { Suspense } from "react";
import { Environment, Lightformer, ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom, DepthOfField, Noise, Vignette, N8AO, SMAA } from "@react-three/postprocessing";
import Museum from "./Museum";
import Sculpture from "./Sculpture";
import Paintings from "./Paintings";
import CuratorRoom from "./CuratorRoom";
import { StoreGallery, MembershipRoom, FinalRoom } from "./FinalRooms";
import { LightShaft, DustParticles, Lights } from "./Atmosphere";
import CameraRig from "./CameraRig";
import { world } from "@/lib/world";

export default function Scene() {
  return (
    <>
      <color attach="background" args={["#09090b"]} />
      <fogExp2 attach="fog" args={["#0a0908", 0.017]} />

      <CameraRig />
      <Lights />

      {/*
       * IBL: a baked environment built from museum-shaped light panels — a
       * warm skylight card overhead, dim cool side fills, a faint floor
       * bounce. Gives every PBR material soft "global illumination" and
       * physically plausible reflections without shipping an HDRI file.
       */}
      <Environment frames={1} resolution={256} environmentIntensity={0.55}>
        <color attach="background" args={["#0b0a0c"]} />
        <Lightformer
          intensity={5}
          rotation-x={Math.PI / 2}
          position={[0, 8, -6]}
          scale={[9, 12, 1]}
          color="#fff1d6"
        />
        <Lightformer intensity={0.7} rotation-y={Math.PI / 2} position={[-12, 3, 0]} scale={[40, 5, 1]} color="#4a4238" />
        <Lightformer intensity={0.7} rotation-y={-Math.PI / 2} position={[12, 3, 0]} scale={[40, 5, 1]} color="#3a3a46" />
        <Lightformer intensity={1.1} rotation-x={-Math.PI / 2} position={[0, -4, -8]} scale={[24, 50, 1]} color="#221d15" />
        <Lightformer intensity={0.5} position={[0, 4, -30]} scale={[18, 8, 1]} color="#2e2a22" />
      </Environment>

      <Suspense fallback={null}>
        <Museum />
        <Sculpture />
        <Paintings />
        <CuratorRoom />
        <StoreGallery />
        <MembershipRoom />
        <FinalRoom />

        {/* soft baked contact shadows grounding the lobby set pieces */}
        <ContactShadows
          position={[-5.5, 0.02, -13]}
          scale={14}
          far={4.5}
          blur={2.4}
          opacity={0.6}
          resolution={512}
          frames={1}
          color="#000000"
        />
        <ContactShadows
          position={[0, 0.02, -40]}
          scale={13}
          far={3}
          blur={2.6}
          opacity={0.5}
          resolution={256}
          frames={1}
          color="#000000"
        />

        {/* layered god rays falling through the oculus, leaning with the sunset */}
        <group position={[-5.5, 6, -13]} rotation-z={0.075}>
          <LightShaft position={[0, 0, 0]} topRadius={3.3} bottomRadius={5} height={12} intensity={0.16} color="#ffd9a4" />
          <LightShaft position={[0, 0, 0]} topRadius={1.7} bottomRadius={2.9} height={12} intensity={0.24} color="#ffe6bc" />
        </group>
        <LightShaft position={[0, 6, -60]} topRadius={1.2} bottomRadius={2.6} height={12} intensity={0.13} />
        <LightShaft
          position={[0, 6, -96]}
          topRadius={1.1}
          bottomRadius={2.4}
          height={12}
          intensity={0.12}
          color="#ffddaa"
        />

        <DustParticles count={world.isMobile ? 500 : 1100} />
      </Suspense>

      {world.isMobile ? (
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.5} luminanceThreshold={0.75} luminanceSmoothing={0.25} mipmapBlur />
          <Noise premultiply opacity={0.45} />
          <Vignette eskil={false} offset={0.16} darkness={0.72} />
          <SMAA />
        </EffectComposer>
      ) : (
        <EffectComposer multisampling={0}>
          <N8AO aoRadius={1.4} intensity={2.8} distanceFalloff={0.6} quality="medium" halfRes color="black" />
          <DepthOfField focusDistance={0.028} focalLength={0.085} bokehScale={1.8} height={480} />
          <Bloom intensity={0.55} luminanceThreshold={0.72} luminanceSmoothing={0.25} mipmapBlur />
          <Noise premultiply opacity={0.42} />
          <Vignette eskil={false} offset={0.16} darkness={0.72} />
          <SMAA />
        </EffectComposer>
      )}
    </>
  );
}
