"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Potez flomastera iza naslova — nikad preko teksta.
 *
 * Redovi se ne pretpostavljaju unapred: naslov se drugačije lomi na
 * mobilnom nego na desktopu (posebno uz `text-balance`), pa se stvarne
 * linije mere u pretraživaču preko `Range.getClientRects()` nad tekst-
 * čvorom. Za svaki red se onda apsolutno postavi po jedan `<svg>` potez,
 * ponovo izmeren pri svakoj promeni veličine prozora.
 *
 * Iscrtavanje ide sleva nadesno preko `stroke-dasharray`/`stroke-dashoffset`
 * (isti trik kao `.road__spine` i `.compass__line`), pokreće se jednom čim
 * naslov uđe u prikaz, uz kratko kašnjenje da prvo „sedne” sam tekst.
 */

type LineRect = { left: number; top: number; width: number; height: number };

const REVEAL_DELAY = 150;

/** Dve blago različite krivine — da dva reda ne izgledaju kao kopija. */
const STROKES = [
  {
    main: "M1 13.5 C11 4.5, 21 16.5, 33 8 C44 2, 56 17, 68 9.5 C79 4, 90 15.5, 99 10",
    belly: "M23 12 C33 6.5, 45 15, 57 9 C66 5, 73 12.5, 79 10",
    tilt: -1.3,
  },
  {
    main: "M2 9 C13 17.5, 24 3.5, 36 11 C47 16.5, 58 4, 70 10.5 C81 15.5, 90 5, 98 11.5",
    belly: "M24 11.5 C35 5.5, 47 15, 59 9.5 C68 5.5, 75 12, 80 9.5",
    tilt: 1.1,
  },
];

export function MarkerHeading({ children }: { children: string }) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [lines, setLines] = useState<LineRect[]>([]);
  // računa se jednom pri montiranju, van efekta — ne kroz setState u efektu
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [intersected, setIntersected] = useState(false);
  const revealed = reducedMotion || intersected;

  // stvarni redovi teksta — radi i kad se naslov prelomi na mobilnom
  useEffect(() => {
    const wrap = wrapRef.current;
    const textEl = textRef.current;
    const textNode = textEl?.firstChild;
    if (!wrap || !textNode) return;

    const measure = () => {
      const range = document.createRange();
      range.selectNodeContents(textNode);
      const wrapRect = wrap.getBoundingClientRect();
      const rects = Array.from(range.getClientRects()).map((r) => ({
        left: r.left - wrapRect.left,
        top: r.top - wrapRect.top,
        width: r.width,
        height: r.height,
      }));
      setLines(rects);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [children]);

  // iscrtaj jednom, čim naslov uđe u prikaz — uz smanjeno kretanje se
  // ne posmatra ništa, marker je odmah u završnom stanju preko `reducedMotion`
  useEffect(() => {
    if (reducedMotion) return;
    const node = wrapRef.current;
    if (!node) return;

    let timeoutId: number | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        timeoutId = window.setTimeout(() => setIntersected(true), REVEAL_DELAY);
        observer.disconnect();
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [reducedMotion]);

  return (
    <span ref={wrapRef} className="marker">
      <span ref={textRef} className="marker__text">
        {children}
      </span>
      {lines.map((line, i) => {
        const stroke = STROKES[i % STROKES.length];
        return (
          <svg
            key={i}
            className="marker__svg"
            style={{
              left: line.left - line.width * 0.03,
              top: line.top + line.height * 0.42,
              width: line.width * 1.06,
              height: line.height * 0.5,
              transform: `rotate(${stroke.tilt}deg)`,
              transitionDelay: `${i * 130}ms`,
            }}
            viewBox="0 0 100 20"
            preserveAspectRatio="none"
            aria-hidden="true"
            data-drawn={revealed || undefined}
          >
            <path
              className="marker__stroke marker__stroke--texture"
              d={stroke.main}
              pathLength={1}
              transform="translate(1 1)"
            />
            <path className="marker__stroke" d={stroke.main} pathLength={1} />
            <path
              className="marker__stroke marker__stroke--belly"
              d={stroke.belly}
              pathLength={1}
            />
          </svg>
        );
      })}
    </span>
  );
}
