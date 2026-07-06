"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import {
  createHeroScrollAnimation,
  createInitialScrollState,
  type ScrollAnimationState,
} from "./ScrollAnimation";

const MOBILE_QUERY = "(max-width: 767px), (pointer: coarse)";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const update = () => setIsMobile(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

  return isMobile;
};

export const useScrollAnimation = (
  sectionRef: RefObject<HTMLElement | null>,
) => {
  const isMobile = useIsMobile();
  const scrollStateRef = useRef<ScrollAnimationState>(
    createInitialScrollState(false),
  );

  useEffect(() => {
    Object.assign(scrollStateRef.current, createInitialScrollState(isMobile));
  }, [isMobile]);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return undefined;
    }

    const context = createHeroScrollAnimation({
      isMobile,
      target: scrollStateRef.current,
      trigger: section,
    });

    return () => context.revert();
  }, [isMobile, sectionRef]);

  return { isMobile, scrollStateRef };
};
