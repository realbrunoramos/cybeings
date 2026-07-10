"use client";

import { useRef } from "react";

import { Scene } from "./Scene";
import { useScrollAnimation } from "./useScrollAnimation";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { isMobile, scrollStateRef } = useScrollAnimation(sectionRef);

  return (
    <section ref={sectionRef} className="hero-section relative overflow-hidden">
      <div className="glow-bg pointer-events-none absolute inset-0" />
      <div className="grid-bg pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--void)] to-transparent" />
      <div className="hero-canvas-wrap" aria-hidden="true">
        <Scene isMobile={isMobile} scrollStateRef={scrollStateRef} />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl items-center px-6 py-16 lg:py-20">
        <div className="max-w-2xl pt-4 text-center lg:text-left">
          <span className="hero-badge">Now in early development</span>
          <h1 className="mt-8 font-display text-5xl font-extrabold leading-[1.05] tracking-[-0.04em] md:text-7xl">
            <span className="block text-[var(--text-1)]">
              Living AI beings
            </span>
            <span className="text-gradient block">on an infinite world</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--text-2)]">
            Mint a Cybeing — a unique, AI-powered digital being with a real
            functional ability. Settle it on an island, grow it through use, and
            turn its skill into value.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
            <button type="button" className="btn-primary">
              Mint your first Cybeing
            </button>
            <button type="button" className="btn-ghost">
              Explore the world
            </button>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-wider text-[var(--text-3)] lg:justify-start">
            <span>Unique on-chain identity</span>
            <span>Real functional skills</span>
            <span>Infinite world map</span>
          </div>
        </div>
      </div>
    </section>
  );
}
