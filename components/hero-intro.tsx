"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const LETTERS = ["S", "E", "F", "A"];
const MOTTO_WORDS = ["Prave", "stvari", "na", "pravi", "način."];

const LETTERS_END = 0.55;

export function HeroIntro() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mql.matches);
    setReady(true);

    if (mql.matches) return;

    let frame = 0;

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const node = containerRef.current;
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const scrollable = rect.height - window.innerHeight;
        const p = scrollable > 0 ? -rect.top / scrollable : 0;
        setProgress(Math.min(1, Math.max(0, p)));
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  if (!ready) {
    return <div className="h-screen" />;
  }

  if (reducedMotion) {
    return (
      <section className="flex min-h-[80vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <h1 className="font-heading text-6xl font-extrabold tracking-tight sm:text-8xl">
          SEFA
        </h1>
        <p className="max-w-md text-lg text-muted-foreground">
          Prave stvari na pravi način.
        </p>
      </section>
    );
  }

  return (
    <div ref={containerRef} className="relative h-[400vh]">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center gap-8 overflow-hidden px-4 text-center">
        <h1 className="font-heading flex text-6xl font-extrabold tracking-tight sm:text-8xl">
          {LETTERS.map((letter, i) => {
            const start = (i / LETTERS.length) * LETTERS_END;
            const end = ((i + 1) / LETTERS.length) * LETTERS_END;
            const letterProgress = Math.min(
              1,
              Math.max(0, (progress - start) / (end - start))
            );
            return (
              <span
                key={i}
                className="inline-block transition-none"
                style={{
                  opacity: letterProgress,
                  transform: `translateY(${(1 - letterProgress) * 24}px)`,
                }}
              >
                {letter}
              </span>
            );
          })}
        </h1>

        <p className="flex max-w-lg flex-wrap justify-center gap-x-2 text-lg text-muted-foreground sm:text-2xl">
          {MOTTO_WORDS.map((word, i) => {
            const start = LETTERS_END + (i / MOTTO_WORDS.length) * (1 - LETTERS_END);
            const end =
              LETTERS_END + ((i + 1) / MOTTO_WORDS.length) * (1 - LETTERS_END);
            const wordProgress = Math.min(
              1,
              Math.max(0, (progress - start) / (end - start))
            );
            return (
              <span
                key={i}
                style={{
                  opacity: wordProgress,
                  transform: `translateY(${(1 - wordProgress) * 12}px)`,
                }}
              >
                {word}
              </span>
            );
          })}
        </p>

        <div
          className={cn(
            "absolute bottom-10 flex flex-col items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground transition-opacity duration-300",
            progress > 0.05 ? "opacity-0" : "opacity-100"
          )}
        >
          <span>Skroluj</span>
          <span className="h-8 w-px bg-border" />
        </div>
      </div>
    </div>
  );
}
