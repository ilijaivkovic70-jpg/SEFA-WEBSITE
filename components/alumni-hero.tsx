"use client";

import { useEffect, useRef, useState } from "react";
import { ALUMNI_SNAPSHOTS } from "@/data/alumni";
import { AlumniFrame } from "@/components/alumni-frame";
import { AlumniBrand } from "@/components/alumni-brand";

/**
 * Hero Alumni stranice — asimetrična kompozicija: tekst levo, broj „50+”
 * desno kao dominantan tipografski element, a oko njega tanka putanja
 * na kojoj stoji pet isečaka fotografija, kao stranica iz godišnjaka.
 *
 * Sve se pokreće jednom, kad sekcija uđe u vidno polje:
 *   naslov  — red po red ispod maske (overflow + pomeraj naviše)
 *   broj    — broji od 0 do 50 (rAF, upis direktno u DOM, bez re-rendera)
 *   putanja — iscrtava se preko stroke-dashoffset
 *   isečci  — pojavljuju se jedan po jedan, uz vrlo blag pomeraj
 *
 * Bez skrola: kad je `prefers-reduced-motion` uključen, sve stoji odmah
 * na svom mestu. Broj je i u HTML-u upisan kao „50”, pa je tačan i ako se
 * JavaScript nikada ne izvrši.
 */

const TARGET = 50;
const DURATION = 1700;

/**
 * Položaj isečaka u koordinatama putanje (viewBox 0 0 100 100, u procentima).
 * `w` je širina u procentima okvira, `ratio` proporcija stranica, `tilt` blagi
 * nagib u stepenima — namerno različiti, da ne izgleda kao mreža avatara.
 */
const SLOTS = [
  { x: 11, y: 38, w: 17, ratio: "3 / 4", tilt: -3 },
  { x: 41, y: 11, w: 23, ratio: "4 / 3", tilt: 2 },
  { x: 89, y: 47, w: 19, ratio: "3 / 4", tilt: -1.5 },
  { x: 68, y: 88, w: 16, ratio: "1 / 1", tilt: 3 },
  { x: 22, y: 84, w: 21, ratio: "3 / 2", tilt: -2.5 },
];

/** Zatvorena petlja koja prolazi kroz svih pet položaja — „krug zajednice”. */
const TRACE =
  "M 11 38 C 14 20, 26 11, 41 11 C 62 11, 85 26, 89 47 C 92 65, 82 82, 68 88 C 52 95, 32 93, 22 84 C 14 76, 9 58, 11 38";

/* Razmak na kraju prvog reda ostaje namerno — vizuelno se ne vidi (blok
   element ga saseca), ali bez njega bi čitač ekrana pročitao „trajei”. */
const TITLE_LINES = ["Zajednica koja traje ", "i posle SEFE"];

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function AlumniHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const reducedRef = useRef(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    // brojanje je jedina animacija koju vodi JS, pa se samo ona ovde gasi;
    // otkrivanje ostalog gasi CSS blok `prefers-reduced-motion` na dnu stilova
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = numberRef.current;
    if (!revealed || reducedRef.current || !el) return;

    el.textContent = "0";
    let frame = 0;
    const start = performance.now() + 260;

    const tick = (now: number) => {
      const elapsed = now - start;
      if (elapsed < 0) {
        frame = requestAnimationFrame(tick);
        return;
      }
      const t = Math.min(1, elapsed / DURATION);
      el.textContent = String(Math.round(easeOutCubic(t) * TARGET));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [revealed]);

  return (
    <section
      ref={sectionRef}
      className="al-hero"
      data-in={revealed || undefined}
      aria-labelledby="alumni-naslov"
    >
      <div className="al-grain" aria-hidden="true" />

      <div className="al-hero__inner">
        <div className="al-hero__text">
          <p className="al-hero__eyebrow">Alumni</p>

          <h1 id="alumni-naslov" className="al-hero__title">
            {TITLE_LINES.map((line, i) => (
              <span key={line} className="al-hero__line">
                <span style={{ transitionDelay: `${120 + i * 130}ms` }}>
                  <AlumniBrand>{line}</AlumniBrand>
                </span>
              </span>
            ))}
          </h1>

          <p className="al-hero__lead">
            <AlumniBrand>
              Alumni klub okuplja bivše članove SEFE koji su svoje iskustvo iz
              organizacije preneli dalje u profesionalni svet, ostajući deo naše
              zajednice i podrška generacijama koje dolaze.
            </AlumniBrand>
          </p>
        </div>

        <div className="al-hero__figure">
          <svg
            className="al-hero__trace"
            viewBox="0 0 100 100"
            fill="none"
            aria-hidden="true"
          >
            <path className="al-hero__trace-line" d={TRACE} pathLength={1} />
          </svg>

          <div className="al-hero__count-wrap">
            <p className="al-hero__count">
              <span ref={numberRef}>{TARGET}</span>
              <span className="al-hero__plus" aria-hidden="true">
                +
              </span>
            </p>
            <p className="al-hero__count-label">Članova u alumni klubu</p>
          </div>

          {ALUMNI_SNAPSHOTS.slice(0, SLOTS.length).map((shot, i) => {
            const slot = SLOTS[i];
            return (
              <figure
                key={shot.alt}
                className="al-hero__shot"
                style={
                  {
                    "--x": `${slot.x}%`,
                    "--y": `${slot.y}%`,
                    "--w": `${slot.w}%`,
                    "--ratio": slot.ratio,
                    "--tilt": `${slot.tilt}deg`,
                    transitionDelay: `${700 + i * 150}ms`,
                  } as React.CSSProperties
                }
              >
                <AlumniFrame
                  src={shot.src}
                  alt={shot.alt}
                  sizes="(min-width: 1024px) 10vw, 22vw"
                />
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
