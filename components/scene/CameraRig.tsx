"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { world, clamp01, damp } from "@/lib/world";

/**
 * Dolly path through the museum. Scroll progress (smoothed) maps to
 * arc-length position on the curve; a parallel curve provides the gaze
 * target so the camera drifts and turns like a steadicam operator.
 */
const PATH_POINTS = [
  new THREE.Vector3(0, 3.2, 11),
  new THREE.Vector3(0, 2.6, 2),
  new THREE.Vector3(-2.4, 2.4, -6),
  new THREE.Vector3(-3.4, 2.5, -14),
  new THREE.Vector3(0, 2.3, -30),
  new THREE.Vector3(0, 2.2, -40),
  new THREE.Vector3(0, 2.3, -50),
  new THREE.Vector3(2.4, 2.2, -61),
  new THREE.Vector3(0.5, 2.4, -72),
  new THREE.Vector3(0, 2.7, -84),
  new THREE.Vector3(0, 2.4, -103),
  new THREE.Vector3(0, 2.3, -120),
  new THREE.Vector3(0, 2.7, -130),
];

const LOOK_POINTS = [
  new THREE.Vector3(0, 2.6, 0),
  new THREE.Vector3(0.4, 2.8, -11),
  new THREE.Vector3(0.8, 3.2, -14),
  new THREE.Vector3(0.4, 2.4, -28),
  new THREE.Vector3(0, 2.2, -39),
  new THREE.Vector3(0, 2.3, -48),
  new THREE.Vector3(2.0, 2.4, -58),
  new THREE.Vector3(6.5, 2.3, -64),
  new THREE.Vector3(0, 2.6, -80),
  new THREE.Vector3(0, 3.1, -88),
  new THREE.Vector3(-2, 2.5, -110),
  new THREE.Vector3(0, 3.0, -132),
  new THREE.Vector3(0, 4.2, -138),
];

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function CameraRig() {
  const path = useMemo(() => new THREE.CatmullRomCurve3(PATH_POINTS, false, "centripetal", 0.5), []);
  const lookPath = useMemo(() => new THREE.CatmullRomCurve3(LOOK_POINTS, false, "centripetal", 0.5), []);

  const smoothed = useRef(0);
  const mouse = useRef({ x: 0, y: 0 });
  const pos = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const introFrom = useMemo(() => new THREE.Vector3(0, 6.5, 15.5), []);
  const introLook = useMemo(() => new THREE.Vector3(0, 4.2, -6), []);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20);
    const cam = state.camera;

    // ——— scroll → arc-length position, critically damped ———
    smoothed.current = damp(smoothed.current, world.progress, 2.4, dt);
    const t = clamp01(smoothed.current);
    path.getPointAt(t, pos);
    lookPath.getPointAt(t, look);

    // ——— cinematic entrance: crane down from above once the loader lifts ———
    if (world.revealedAt > 0) {
      const elapsed = (performance.now() - world.revealedAt) / 1000;
      const e = easeInOutCubic(clamp01(elapsed / 3.2));
      pos.lerpVectors(introFrom, pos, e);
      look.lerpVectors(introLook, look, e);
    } else {
      pos.copy(introFrom);
      look.copy(introLook);
    }

    // ——— breathing: the camera is held, not locked ———
    const bt = state.clock.elapsedTime;
    pos.y += Math.sin(bt * 0.5) * 0.045;
    pos.x += Math.sin(bt * 0.33 + 1.7) * 0.035;

    cam.position.copy(pos);
    cam.lookAt(look);

    // ——— subtle cursor parallax, applied after lookAt ———
    mouse.current.x = damp(mouse.current.x, world.mouse.x, 3.2, dt);
    mouse.current.y = damp(mouse.current.y, world.mouse.y, 3.2, dt);
    cam.rotation.y -= mouse.current.x * 0.032;
    cam.rotation.x -= mouse.current.y * 0.022;
  });

  return null;
}
