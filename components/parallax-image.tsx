"use client";

import { useEffect, useRef } from "react";
import Image, { type ImageProps } from "next/image";

/**
 * Slika se pomera sporije od sadržaja dok se skroluje (paralaksa), što
 * stvara utisak da stoji "dublje" u sajtu, iza sadržaja. Slika je veća
 * od svog kontejnera (kontejner ima overflow:hidden), pa je pomeranje
 * uvek unutar bezbedne zone i nikad ne otkriva prazninu.
 */
export function ParallaxImage(props: Omit<ImageProps, "fill" | "style">) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const section = wrap?.closest("section");
    if (!wrap || !section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // koliko je slika veća od kontejnera (u % visine kontejnera) i time
    // koliko prostora ima za pomeranje pre nego što se otkrije praznina
    const OVERSCAN = 14;

    let frame = 0;
    const paint = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      // 0 kad sekcija tek ulazi odozdo, 1 kad izlazi odozgo
      const p = Math.min(
        1,
        Math.max(0, (window.innerHeight - rect.top) / (window.innerHeight + rect.height))
      );
      const offset = (p - 0.5) * OVERSCAN;
      wrap.style.transform = `translate3d(0, ${offset.toFixed(2)}%, 0)`;
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
  }, []);

  return (
    <div ref={wrapRef} className="parallax-image__wrap">
      <Image {...props} fill className="parallax-image__img" />
    </div>
  );
}
