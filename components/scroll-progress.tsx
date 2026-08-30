"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Traka na donjoj ivici zaglavlja koja se puni sleva nadesno srazmerno
 * tome koliko je trenutna stranica proskrolovana.
 *
 * Namerno ide preko `width`, ne `transform: scaleX()` — zaglavlje ima
 * `backdrop-blur`, a transformisan potomak unutar elementa sa
 * `backdrop-filter` u ovom render pipeline-u ume da se uopšte ne
 * iscrta (potvrđeno probom: identična traka bez transformacije se
 * vidi, sa transformacijom nestane). `width` na traci ove veličine
 * nema merljivu cenu po performansama, pa je jednostavnije samo
 * zaobići čitav slučaj.
 *
 * Vrednost ide direktno u DOM preko rafa, bez React state-a po frejmu
 * skrola (isti trik kao --p u sectors-scroll.tsx). Nema tranzicije:
 * traka prati skrol 1:1, bez kašnjenja, pa ne zavisi od
 * `prefers-reduced-motion` (nije animacija koja sama kreće, samo
 * direktan odgovor na skrol).
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    let frame = 0;

    const paint = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max <= 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / max));
      bar.style.width = `${p * 100}%`;
    };

    const request = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    paint();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[3px] overflow-hidden">
      <div ref={barRef} className="h-full w-0 bg-primary shadow-[0_0_10px_2px_var(--primary)]" />
    </div>
  );
}
