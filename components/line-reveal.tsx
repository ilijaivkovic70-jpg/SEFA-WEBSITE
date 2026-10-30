"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Naslov čije reči izranjaju odozdo iz nevidljive maske, jedna za drugom
 * (po uzoru na savor.it/mission). Tekst ostaje običan tekst u DOM-u, pa ga
 * čitači ekrana i pretraživači vide normalno.
 */
export function LineReveal({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  /** kašnjenje pre prve reči, u ms */
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    // uz "smanji pokrete" CSS ionako prikazuje reči odmah
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const words = text.split(" ");

  return (
    <span ref={ref} className={cn("lr", visible && "is-in", className)}>
      {words.map((word, i) => (
        <span key={i}>
          <span className="lr__mask">
            <span
              className="lr__word"
              style={{ transitionDelay: `${delay + i * 70}ms` }}
            >
              {word}
            </span>
          </span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </span>
  );
}
