"use client";

import {
  ContactShadows,
  Environment,
  Html,
  PerformanceMonitor,
  useProgress,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, memo, useMemo, useState } from "react";
import type { MutableRefObject } from "react";

import type { ScrollAnimationState } from "./ScrollAnimation";
import { Mascot } from "./Mascot";

type SceneProps = {
  isMobile: boolean;
  scrollStateRef: MutableRefObject<ScrollAnimationState>;
};

function ModelLoader() {
  const { progress } = useProgress();
  const roundedProgress = Math.min(100, Math.round(progress));

  return (
    <Html center className="pointer-events-none">
      <div className="hero-loader" role="status" aria-live="polite">
        <span className="hero-loader__ring" />
        <span className="hero-loader__label">{roundedProgress}%</span>
      </div>
    </Html>
  );
}

function SceneComponent({ isMobile, scrollStateRef }: SceneProps) {
  const [dpr, setDpr] = useState<[number, number]>(
    isMobile ? [0.75, 1.15] : [1, 1.75],
  );
  const camera = useMemo(
    () => ({
      fov: isMobile ? 43 : 39,
      position: [0, isMobile ? 0.12 : 0.08, isMobile ? 6.2 : 5.6] as [
        number,
        number,
        number,
      ],
    }),
    [isMobile],
  );

  return (
    <Canvas
      camera={camera}
      dpr={dpr}
      gl={{
        alpha: true,
        antialias: !isMobile,
        powerPreference: isMobile ? "low-power" : "high-performance",
      }}
      shadows
      style={{ background: "transparent", height: "100%", width: "100%" }}
    >
      <PerformanceMonitor
        bounds={(refreshRate) =>
          isMobile ? [24, Math.min(45, refreshRate)] : [45, refreshRate]
        }
        onDecline={() => setDpr(isMobile ? [0.65, 1] : [0.8, 1.3])}
        onIncline={() => setDpr(isMobile ? [0.75, 1.15] : [1, 1.75])}
      />
      <ambientLight intensity={isMobile ? 0.72 : 0.62} />
      <directionalLight
        castShadow
        color="#dffbff"
        intensity={isMobile ? 1.45 : 1.85}
        position={[3.8, 4.8, 3.2]}
        shadow-bias={-0.0008}
        shadow-mapSize-height={isMobile ? 512 : 1024}
        shadow-mapSize-width={isMobile ? 512 : 1024}
      />
      <Suspense fallback={<ModelLoader />}>
        <Mascot isMobile={isMobile} scrollStateRef={scrollStateRef} />
        <Environment preset="city" resolution={isMobile ? 64 : 128} />
        <ContactShadows
          blur={isMobile ? 1.8 : 2.8}
          far={isMobile ? 3.2 : 4}
          opacity={isMobile ? 0.22 : 0.34}
          position={[0, isMobile ? -1.54 : -1.62, 0]}
          resolution={isMobile ? 256 : 512}
          scale={isMobile ? 4.5 : 5.6}
        />
      </Suspense>
    </Canvas>
  );
}

export const Scene = memo(SceneComponent);
