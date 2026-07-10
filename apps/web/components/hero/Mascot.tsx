"use client";

import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { memo, useEffect, useMemo, useRef } from "react";
import type { AnimationClip, Group, Object3D } from "three";
import type { MutableRefObject } from "react";
import { MathUtils } from "three";

import type { ScrollAnimationState } from "./ScrollAnimation";

const MODEL_URL = "/models/cute-robot.glb";

type MascotProps = {
  isMobile: boolean;
  scrollStateRef: MutableRefObject<ScrollAnimationState>;
};

type LoadedGltf = ReturnType<typeof useGLTF> & {
  scene: Object3D;
  animations: AnimationClip[];
};

const enableModelPerformanceDefaults = (object: Object3D) => {
  object.traverse((child) => {
    child.frustumCulled = true;

    if ("castShadow" in child) {
      child.castShadow = true;
    }

    if ("receiveShadow" in child) {
      child.receiveShadow = true;
    }
  });
};

function MascotComponent({ isMobile, scrollStateRef }: MascotProps) {
  const outerGroupRef = useRef<Group>(null);
  const modelGroupRef = useRef<Group>(null);
  const frameAccumulatorRef = useRef(0);
  const gltf = useGLTF(MODEL_URL) as LoadedGltf;
  const { actions, names } = useAnimations(gltf.animations, modelGroupRef);
  const damping = isMobile ? 0.085 : 0.1;
  const minFrameTime = isMobile ? 1 / 40 : 0;

  const preparedScene = useMemo(() => {
    const scene = gltf.scene.clone(true);

    enableModelPerformanceDefaults(scene);
    return scene;
  }, [gltf.scene]);

  useEffect(() => {
    const firstAnimationName = names[0];

    if (!firstAnimationName) {
      return undefined;
    }

    const action = actions[firstAnimationName];
    action?.reset().fadeIn(0.4).play();

    return () => {
      action?.fadeOut(0.25);
    };
  }, [actions, names]);

  useFrame((_, delta) => {
    const outerGroup = outerGroupRef.current;

    if (!outerGroup) {
      return;
    }

    frameAccumulatorRef.current += delta;

    if (minFrameTime > 0 && frameAccumulatorRef.current < minFrameTime) {
      return;
    }

    frameAccumulatorRef.current = 0;

    const target = scrollStateRef.current;
    const smooth = 1 - Math.pow(1 - damping, delta * 60);

    // Scroll transforms live on the outer group so embedded GLB clips can keep
    // animating the child model without fighting rotation or position values.
    outerGroup.rotation.x = MathUtils.lerp(
      outerGroup.rotation.x,
      target.rotationX,
      smooth,
    );
    outerGroup.rotation.y = MathUtils.lerp(
      outerGroup.rotation.y,
      target.rotationY,
      smooth,
    );
    outerGroup.rotation.z = MathUtils.lerp(
      outerGroup.rotation.z,
      target.rotationZ,
      smooth,
    );
    outerGroup.position.y = MathUtils.lerp(
      outerGroup.position.y,
      target.positionY,
      smooth,
    );
    outerGroup.position.z = MathUtils.lerp(
      outerGroup.position.z,
      target.positionZ,
      smooth,
    );
    outerGroup.scale.setScalar(
      MathUtils.lerp(outerGroup.scale.x, target.scale, smooth),
    );
  });

  return (
    <group ref={outerGroupRef} dispose={null}>
      <group
        ref={modelGroupRef}
        position={[isMobile ? 0.58 : 0, isMobile ? -0.96 : -0.28, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        scale={isMobile ? 1.08 : 2.05}
      >
        <primitive object={preparedScene} />
      </group>
    </group>
  );
}

export const Mascot = memo(MascotComponent);

useGLTF.preload(MODEL_URL);
