"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export type ScrollAnimationState = {
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  positionY: number;
  positionZ: number;
  scale: number;
};

export type ScrollAnimationOptions = {
  isMobile: boolean;
  target: ScrollAnimationState;
  trigger: HTMLElement;
};

let isScrollTriggerRegistered = false;

const registerScrollTrigger = () => {
  if (isScrollTriggerRegistered) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  isScrollTriggerRegistered = true;
};

export const createInitialScrollState = (
  isMobile: boolean,
): ScrollAnimationState => ({
  rotationX: isMobile ? 0.04 : 0.08,
  rotationY: -0.24,
  rotationZ: isMobile ? -0.02 : -0.04,
  positionY: isMobile ? -0.34 : -0.22,
  positionZ: isMobile ? 0.18 : 0,
  scale: isMobile ? 0.86 : 1,
});

export const createHeroScrollAnimation = ({
  isMobile,
  target,
  trigger,
}: ScrollAnimationOptions) => {
  registerScrollTrigger();

  const endState: ScrollAnimationState = {
    rotationX: isMobile ? -0.1 : -0.16,
    rotationY: isMobile ? Math.PI * 1.15 : Math.PI * 1.85,
    rotationZ: isMobile ? 0.07 : 0.13,
    positionY: isMobile ? -0.2 : -0.04,
    positionZ: isMobile ? -0.22 : -0.52,
    scale: isMobile ? 0.92 : 1.08,
  };

  return gsap.context(() => {
    gsap.to(target, {
      ...endState,
      ease: "none",
      scrollTrigger: {
        trigger,
        start: "top top",
        end: "bottom top",
        scrub: 0.85,
        invalidateOnRefresh: true,
      },
    });
  }, trigger);
};
