"use client";

import { useEffect, useRef } from "react";

const LETTERS = ["s", "e", "f", "a"] as const;

/**
 * Slova S-E-F-A iz uvodnog logoa "padaju" tačno na svoja mesta u naslovu
 * tima dok korisnik skroluje: S -> STUDENTI, E -> EKONOMSKOG, F i A ->
 * FAKULTETA. Klonovi slova se pomeraju 1:1 sa skrolom (nema pinovanja):
 * na scrollY=0 stoje tačno preko pravih slova iz logoa, a kad scrollY
 * dostigne tačku na kojoj sekcija sa timom stigne do vrha ekrana, stoje
 * tačno preko pravih (sakrivenih) slova u naslovu.
 */
export function LogoDrop() {
  const cloneRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const team = document.getElementById("team-hero-section");
    if (!team) return;

    type Rig = {
      clone: HTMLSpanElement;
      sourceGlyph: HTMLElement;
      sourceLetter: HTMLElement;
      target: HTMLElement;
      sTop: number;
      sLeft: number;
      sSize: number;
      tTop: number;
      tLeft: number;
      tSize: number;
    };

    const rigs: Rig[] = [];
    LETTERS.forEach((key, i) => {
      const clone = cloneRefs.current[i];
      const sourceGlyph = document.getElementById(`logo-${key}-source`);
      const sourceLetter = sourceGlyph?.parentElement ?? null;
      const target = document.getElementById(`logo-${key}-target`);
      if (clone && sourceGlyph && sourceLetter && target) {
        rigs.push({
          clone,
          sourceGlyph,
          sourceLetter,
          target,
          sTop: 0,
          sLeft: 0,
          sSize: 100,
          tTop: 0,
          tLeft: 0,
          tSize: 20,
        });
      }
    });
    if (!rigs.length) return;

    let disposed = false;
    const cleanupFns: Array<() => void> = [];

    (async () => {
      // sačekaj da se ulazna animacija (padanje slova) potpuno smiri —
      // dok traje, transform hvata "u letu" poziciju, ne konačnu, pa bi
      // merenje pre toga dalo pogrešne koordinate
      await Promise.all(
        rigs.flatMap((rig) =>
          rig.sourceLetter.getAnimations().map((a) => a.finished.catch(() => {}))
        )
      );
      if (disposed) return;

      let travel = 1;

      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
      // bela (--foreground, boja logoa na početku) -> mint (--primary),
      // slova postaju zelena kako slaju na svoja mesta
      const lerpColor = (t: number) => {
        const r = Math.round(lerp(234, 102, t));
        const g = Math.round(lerp(242, 198, t));
        const b = Math.round(lerp(240, 179, t));
        return `rgb(${r}, ${g}, ${b})`;
      };

      const measure = () => {
        const scrollY = window.scrollY;
        const teamRect = team!.getBoundingClientRect();
        travel = Math.max(1, teamRect.top + scrollY);

        for (const rig of rigs) {
          const sRect = rig.sourceGlyph.getBoundingClientRect();
          const tRect = rig.target.getBoundingClientRect();

          rig.sTop = sRect.top + scrollY;
          rig.sLeft = sRect.left;
          rig.sSize = parseFloat(getComputedStyle(rig.sourceGlyph).fontSize);

          rig.tTop = tRect.top + scrollY;
          rig.tLeft = tRect.left;
          rig.tSize = parseFloat(getComputedStyle(rig.target).fontSize);
        }
      };

      let frame = 0;
      const paint = () => {
        frame = 0;
        const scrollY = window.scrollY;
        const p = Math.min(1, Math.max(0, scrollY / travel));
        const justStarted = p <= 0.004;
        const landed = p >= 0.995;
        const color = lerpColor(p);

        for (const rig of rigs) {
          const top = lerp(rig.sTop, rig.tTop, p) - scrollY;
          const left = lerp(rig.sLeft, rig.tLeft, p);
          const size = lerp(rig.sSize, rig.tSize, p);

          rig.clone.style.transform = `translate3d(${left.toFixed(2)}px, ${top.toFixed(2)}px, 0)`;
          rig.clone.style.fontSize = `${size.toFixed(2)}px`;
          rig.clone.style.color = color;
          rig.clone.style.opacity = justStarted || landed ? "0" : "1";

          // "important" je nužan jer ulazna CSS animacija slova (koja
          // opstaje sa "forwards") inače nadjačava običan inline opacity
          rig.sourceLetter.style.setProperty("opacity", justStarted ? "1" : "0", "important");
          rig.target.style.opacity = landed ? "1" : "0";
        }
      };

      const request = () => {
        if (!frame) frame = requestAnimationFrame(paint);
      };

      const onResize = () => {
        measure();
        paint();
      };

      measure();
      for (const rig of rigs) rig.target.style.opacity = "0";
      paint();

      // dodatna sigurnosna mera za kasne pomeraje layouta (npr. font swap)
      const remeasure = () => {
        if (disposed) return;
        measure();
        paint();
      };
      document.fonts?.ready?.then(remeasure);
      const settleTimer = window.setTimeout(remeasure, 300);

      window.addEventListener("scroll", request, { passive: true });
      window.addEventListener("resize", onResize);

      cleanupFns.push(() => {
        window.removeEventListener("scroll", request);
        window.removeEventListener("resize", onResize);
        window.clearTimeout(settleTimer);
        if (frame) cancelAnimationFrame(frame);
        for (const rig of rigs) {
          rig.sourceLetter.style.removeProperty("opacity");
          rig.target.style.opacity = "";
        }
      });
    })();

    return () => {
      disposed = true;
      cleanupFns.forEach((fn) => fn());
    };
  }, []);

  return (
    <>
      {LETTERS.map((key, i) => (
        <span
          key={key}
          ref={(el) => {
            cloneRefs.current[i] = el;
          }}
          className="logo-drop-clone"
          aria-hidden="true"
        >
          {key.toUpperCase()}
        </span>
      ))}
    </>
  );
}
