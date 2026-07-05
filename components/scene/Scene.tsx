"use client";

import { Suspense } from "react";
import { EffectComposer, Bloom, DepthOfField, Noise, Vignette } from "@react-three/postprocessing";
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

      <Suspense fallback={null}>
        <Museum />
        <Sculpture />
        <Paintings />
        <CuratorRoom />
        <StoreGallery />
        <MembershipRoom />
        <FinalRoom />

        {/* volumetric sunlight under each skylight */}
        <LightShaft position={[0, 6, -13]} topRadius={3.2} bottomRadius={5.4} height={12} intensity={0.2} />
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
        </EffectComposer>
      ) : (
        <EffectComposer multisampling={0}>
          <DepthOfField focusDistance={0.028} focalLength={0.085} bokehScale={1.8} height={480} />
          <Bloom intensity={0.55} luminanceThreshold={0.72} luminanceSmoothing={0.25} mipmapBlur />
          <Noise premultiply opacity={0.45} />
          <Vignette eskil={false} offset={0.16} darkness={0.72} />
        </EffectComposer>
      )}
    </>
  );
}
