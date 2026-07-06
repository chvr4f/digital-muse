"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { type CustomModel, modelUrl } from "@/lib/customModels";

/**
 * Loads one of your uploaded `.glb` / `.gltf` files and drops it into the
 * scene, auto-centered and auto-scaled to `targetSize`. It measures the raw
 * model's bounding box, recenters it on the origin, then scales so the chosen
 * axis matches the target — so any model, whatever units it was exported in,
 * lands at the right size in the right place.
 */
export default function UploadedModel({
  model,
  targetSize,
  /** When true the model sits on the ground (its base at y=0); else centered. */
  ground = false,
  castShadow = true,
  receiveShadow = true,
}: {
  model: CustomModel;
  targetSize: number;
  ground?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
}) {
  const { scene } = useGLTF(modelUrl(model.file));

  const object = useMemo(() => {
    // clone so the same file can be reused in multiple slots without conflict
    const root = scene.clone(true);

    const box = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const basis =
      model.fitAxis === "height"
        ? size.y
        : model.fitAxis === "width"
          ? size.x
          : model.fitAxis === "depth"
            ? size.z
            : Math.max(size.x, size.y, size.z);
    const fitScale = basis > 1e-6 ? targetSize / basis : 1;
    const scale = fitScale * (model.scale ?? 1);

    // recenter the raw model on the origin (base on the floor if `ground`)
    root.position.x = -center.x;
    root.position.z = -center.z;
    root.position.y = ground ? -box.min.y : -center.y;

    const wrapper = new THREE.Group();
    wrapper.add(root);
    wrapper.scale.setScalar(scale);
    wrapper.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = castShadow;
        mesh.receiveShadow = receiveShadow;
      }
    });
    return wrapper;
  }, [scene, targetSize, ground, castShadow, receiveShadow, model.scale, model.fitAxis]);

  return <primitive object={object} position-y={model.offsetY ?? 0} rotation-y={model.rotationY ?? 0} />;
}
