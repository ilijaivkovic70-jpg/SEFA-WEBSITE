"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AlumniBrand } from "@/components/alumni-brand";

/**
 * Završna poruka Alumni stranice. Jedna tanka linija se izvlači odozgo i
 * vraća pogled na početak alumni priče, a ispod nje stoji poruka i diskretan
 * link ka kontakt stranici. Bez kartice i bez pozadine.
 */
export function AlumniOutro() {
  const ref = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="al-outro" data-in={revealed || undefined}>
      <span className="al-outro__thread" aria-hidden="true" />
      <p className="al-outro__line">
        <AlumniBrand>Jednom deo SEFE. Uvek deo priče.</AlumniBrand>
      </p>
      <Link href="/kontakt" className="al-outro__link">
        Poveži se sa alumni zajednicom
        <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
