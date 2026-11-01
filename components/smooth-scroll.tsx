"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Mekan, „inercijalni” skrol točkićem i touchpadom: stranica ne skače za
 * ceo korak, nego klizi i lagano se zaustavlja. Na telefonu ostaje prirodan
 * skrol prsta (bez ometanja). Ne radi uz „smanjeno kretanje”.
 *
 * Ručke: `lerp` (manje = mekše i sporije stizanje, 0.06–0.12) i
 * `wheelMultiplier` (manje = kraći korak po okretu točkića).
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 0.85,
      smoothWheel: true,
    });

    let frame = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return null;
}
