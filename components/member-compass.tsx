"use client";

import { useEffect, useRef } from "react";

/**
 * Sekcija „Briga o članovima” — Članski kompas.
 *
 * Umesto tri jednake kartice, kompozicija je mapa: u sredini stoji član, a iz
 * njega izlaze tri organske linije ka onome što članstvo donosi. Sekcija je
 * isključivo informativna — ništa nije link niti dugme.
 *
 * Dva rasporeda, oba u istom markupu:
 *   ≥1024px — asimetrična kompozicija; blokovi su apsolutno postavljeni u
 *             procentima nad pozornicom fiksnog odnosa stranica (10 : 7), pa
 *             se poklapaju sa SVG putanjama koje dele isti koordinatni sistem
 *             (viewBox 1000 × 700).
 *   <1024px — vertikalna putanja: čvor na vrhu, ispod njega tri bloka
 *             nanizana uz tanku liniju sa leve strane.
 *
 * Animacija ide jednom, traje ~1,75s i vođena je CSS-om. Osnovno stanje u CSS-u
 * je _završno_ (vidljivo), pa sadržaj stoji i bez JS-a; tek `data-anim="on"`
 * (postavlja JS, i to samo ako je kretanje dozvoljeno) uvodi početno stanje, a
 * `data-in="true"` pušta otkrivanje. Kašnjenja su CSS promenljive na sekciji.
 */

/** Kraj linije za svaki pravac, u koordinatama pozornice (viewBox 1000 × 700). */
const DIRECTIONS = [
  {
    n: "01",
    kicker: "Oslonac",
    title: "Program mentorstva",
    description:
      "Podrška starijih kolega u savladavanju studija, donošenju odluka i prevazilaženju izazova tokom školovanja.",
    /* linija kreće od ivice čvora i blago vijuga naviše-levo */
    path: "M 437 225 C 420 178 442 132 380 96",
    pin: [380, 96],
  },
  {
    n: "02",
    kicker: "Napredak",
    title: "Edukacije",
    description:
      "Radionice, predavanja i praktična iskustva kroz koja članovi razvijaju znanja i veštine van fakultetske nastave.",
    path: "M 514 231 C 536 186 566 168 614 72",
    pin: [614, 72],
  },
  {
    n: "03",
    kicker: "Zajednica",
    title: "Druženja",
    description:
      "Karaoke, beer pong, krstarenja, izleti i druga okupljanja kroz koja se grade prijateljstva i pravi timski duh.",
    path: "M 502 375 C 512 424 502 466 556 500",
    pin: [556, 500],
  },
] as const;

/* ---------- sitne line-art oznake, sve u istom ključu (44 × 44, potez 1.5) ---------- */

/** 01 — dve tačke povezane jednom linijom: prenošenje iskustva. */
function MarkSupport() {
  return (
    <svg className="compass__mark" viewBox="0 0 44 44" aria-hidden="true">
      <circle className="compass__mark-a" cx="10" cy="14" r="5.2" />
      <path className="compass__mark-link" d="M 14.6 16.6 C 21 21.4 25 22.4 31.6 27.4" />
      <circle className="compass__mark-b" cx="34" cy="30" r="3.4" />
    </svg>
  );
}

/** 02 — tri stepenika i tačka na vrhu: postepen napredak. */
function MarkProgress() {
  return (
    <svg className="compass__mark" viewBox="0 0 44 44" aria-hidden="true">
      <path
        className="compass__mark-steps"
        d="M 6 35 L 15 35 L 15 26.5 L 24 26.5 L 24 18 L 32 18"
      />
      <path className="compass__mark-link" d="M 32.6 17.4 L 35.4 13.8" />
      <circle className="compass__mark-b" cx="37" cy="11" r="3" />
    </svg>
  );
}

/** 03 — tri nepravilna kruga oko zajedničkog centra: okupljanje. */
function MarkCommunity() {
  return (
    <svg className="compass__mark" viewBox="0 0 44 44" aria-hidden="true">
      <circle className="compass__mark-c1" cx="16.5" cy="17" r="9" />
      <circle className="compass__mark-c2" cx="28" cy="19" r="7.4" />
      <circle className="compass__mark-c3" cx="21.5" cy="29" r="8.2" />
      <circle className="compass__mark-core" cx="22" cy="21.5" r="1.5" />
    </svg>
  );
}

const MARKS = [MarkSupport, MarkProgress, MarkCommunity];

/* ---------- centralni čvor ---------- */

/** Nepravilna kružna linija — poluprečnici 76,5–80 umesto savršenog kruga. */
const RING =
  "M 179 100 C 179 143.6 142.5 177 100 177 C 57.5 177 20 144.2 20 100 C 20 55.8 57.7 23.5 100 23.5 C 142.3 23.5 179 56.4 179 100 Z";

/** Sitni markeri oko prstena, na svakih 30°; svaki treći je duži. */
const TICKS = Array.from({ length: 12 }, (_, i) => {
  const a = (i * 30 * Math.PI) / 180;
  const long = i % 3 === 0;
  const r1 = 83;
  const r2 = long ? 91 : 87;
  return {
    x1: 100 + Math.cos(a) * r1,
    y1: 100 + Math.sin(a) * r1,
    x2: 100 + Math.cos(a) * r2,
    y2: 100 + Math.sin(a) * r2,
    long,
  };
});

export function MemberCompass() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // uz „smanjeno kretanje” ostaje osnovno (završno) stanje — bez otkrivanja
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // stanje ide pravo u DOM: samo CSS ga čita, pa nema razloga za ponovni render
    node.dataset.anim = "on";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        node.dataset.in = "true";
        observer.disconnect();
      },
      { threshold: 0.2 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="compass"
      aria-labelledby="briga-o-clanovima-naslov"
    >
      <div className="compass__inner">
        <p className="compass__eyebrow">Briga o članovima</p>

        <h2 id="briga-o-clanovima-naslov" className="compass__title">
          <span className="compass__title-mask">
            <span>Razvoj ne staje na projektima</span>
          </span>
        </h2>

        <p className="compass__lead">
          SEFA članstvo donosi više od projektnog iskustva — podršku starijih
          kolega, nova znanja i ljude sa kojima nastaju uspomene.
        </p>

        <div className="compass__stage">
          {/* organske linije — samo desktop kompozicija */}
          <svg
            className="compass__web"
            viewBox="0 0 1000 700"
            fill="none"
            aria-hidden="true"
          >
            {DIRECTIONS.map((d, i) => (
              <g key={d.n} className="compass__thread" data-i={i + 1}>
                <path className="compass__line" d={d.path} pathLength={1} />
                <path className="compass__spark" d={d.path} pathLength={1} />
                <circle className="compass__pin" cx={d.pin[0]} cy={d.pin[1]} r={3.2} />
              </g>
            ))}
          </svg>

          {/* vertikalna linija — mobilni i tablet raspored */}
          <span className="compass__rail" aria-hidden="true">
            <span className="compass__rail-spark" />
          </span>

          {/* ---------- centralni čvor ---------- */}
          <div className="compass__node">
            <svg
              className="compass__dial"
              viewBox="0 0 200 200"
              fill="none"
              aria-hidden="true"
            >
              <path className="compass__ring" d={RING} pathLength={1} />
              <g className="compass__ticks">
                {TICKS.map((t, i) => (
                  <line
                    key={i}
                    x1={t.x1.toFixed(2)}
                    y1={t.y1.toFixed(2)}
                    x2={t.x2.toFixed(2)}
                    y2={t.y2.toFixed(2)}
                    data-long={t.long || undefined}
                  />
                ))}
              </g>
              {/* oznaka koja veoma sporo obilazi krug — različiti pravci razvoja */}
              <g className="compass__needle">
                <line x1="100" y1="41" x2="100" y2="29" />
                <circle cx="100" cy="24" r="2.2" />
              </g>
            </svg>
            <p className="compass__node-text">
              <span className="compass__node-small">Član</span>
              <span className="compass__node-name">SEFA-e</span>
            </p>
          </div>

          {/* ---------- tri pravca ---------- */}
          {DIRECTIONS.map((d, i) => {
            const Mark = MARKS[i];
            return (
              <article key={d.n} className="compass__dir" data-i={i + 1}>
                <p className="compass__meta">
                  <span className="compass__n">{d.n}</span>
                  <span className="compass__kicker">{d.kicker}</span>
                </p>
                <Mark />
                <h3 className="compass__dir-title">{d.title}</h3>
                <p className="compass__desc">{d.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
