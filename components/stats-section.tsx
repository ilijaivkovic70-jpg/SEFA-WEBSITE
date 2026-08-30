"use client";

import { Fragment, useEffect, useRef, useState } from "react";

type Stat = {
  value: number;
  suffix?: string;
  label: string;
};

const STATS: Stat[] = [
  { value: 70, suffix: "+", label: "Aktivnih članova" },
  { value: 50, suffix: "+", label: "Članova alumni kluba" },
  { value: 6, label: "Aktivnih projekata" },
];

const DURATION = 1800;
const STAGGER = 130;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Sekcija "SEFA u brojevima". Brojevi broje od 0 do svoje vrednosti tek
 * kad sekcija postane vidljiva (IntersectionObserver), sa blagim
 * zakašnjenjem po stavci. Brojanje ide direktno preko DOM-a (bez
 * re-rendera po frejmu) da ne bi uticalo na performanse skrola.
 */
export function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const numberRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const reducedMotionRef = useRef(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotionRef.current) {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!revealed || reducedMotionRef.current) return;

    const rafIds: number[] = [];
    STATS.forEach((stat, i) => {
      const el = numberRefs.current[i];
      if (!el) return;
      el.textContent = "0";

      const start = performance.now() + i * STAGGER;
      const tick = (now: number) => {
        const elapsed = now - start;
        if (elapsed < 0) {
          rafIds[i] = requestAnimationFrame(tick);
          return;
        }
        const t = Math.min(1, elapsed / DURATION);
        el.textContent = String(Math.round(easeOutCubic(t) * stat.value));
        if (t < 1) rafIds[i] = requestAnimationFrame(tick);
      };
      rafIds[i] = requestAnimationFrame(tick);
    });

    return () => rafIds.forEach((id) => id && cancelAnimationFrame(id));
  }, [revealed]);

  return (
    <section
      ref={sectionRef}
      className="stats-section"
      aria-label="SEFA u brojevima"
    >
      <div className="stats-section__inner">
        <p className={`stats-section__kicker${revealed ? " is-in" : ""}`}>
          SEFA u brojevima
        </p>

        <div className="stats-section__grid">
          {STATS.map((stat, i) => (
            <Fragment key={stat.label}>
              {i > 0 && (
                <span
                  className={`stats-section__divider${revealed ? " is-in" : ""}`}
                  style={{ transitionDelay: `${i * 90}ms` }}
                  aria-hidden="true"
                />
              )}
              <div className="stats-section__col">
                <p className="stats-section__number">
                  <span
                    ref={(el) => {
                      numberRefs.current[i] = el;
                    }}
                  >
                    {stat.value}
                  </span>
                  {stat.suffix && <span className="stats-section__suffix">{stat.suffix}</span>}
                </p>
                <p
                  className={`stats-section__label${revealed ? " is-in" : ""}`}
                  style={{ transitionDelay: `${DURATION * 0.72 + i * STAGGER}ms` }}
                >
                  {stat.label}
                </p>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
