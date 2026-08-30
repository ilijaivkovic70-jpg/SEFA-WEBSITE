"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Marker koji sam oboji tekst reč po reč čim pasus uđe u prikaz —
 * ne zavisi od skrolovanja, kreće automatski tempom običnog čitanja
 * (~200 reči/min), a duže reči dobijaju i malo više vremena.
 */
const MS_PER_CHAR = 45;
const MIN_WORD_PAUSE = 55;

export function TextMarker({ children }: { children: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActive(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const words = children.trim().split(/\s+/);

  let elapsed = 0;
  const delays = words.map((word) => {
    const d = elapsed;
    elapsed += word.length * MS_PER_CHAR + MIN_WORD_PAUSE;
    return d;
  });

  return (
    <span ref={ref} className={active ? "hl-marked" : undefined}>
      {words.map((word, i) => (
        <span
          key={i}
          className="hl-word"
          style={{ transitionDelay: `${delays[i]}ms` }}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}
