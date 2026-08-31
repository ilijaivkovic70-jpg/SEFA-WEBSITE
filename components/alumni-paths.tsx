"use client";

import { useEffect, useRef, useState } from "react";
import { CAREER_PATHS } from "@/data/alumni";
import { AlumniBrand } from "@/components/alumni-brand";

/**
 * „Put nakon SEFE” — mapa karijernih puteva, u stilu konstelacije: SEFA je
 * čvor iz kog izlaze tri linije, svaka vodi ka jednom pravcu i završava se
 * malim čvorom (tačka + prsten), uz rasute sitne tačke u pozadini kao
 * teksturu zvezdane mape. Naziv i opis stoje slobodno uz kraj linije, bez
 * okvira i bez kartice.
 *
 * Desktop (≥1024px): linije se iscrtavaju REDOM, jedna za drugom, tek kad
 * sekcija uđe u vidno polje — sledeća kreće tačno kad prethodna stigne do
 * svog čvora (kumulativno kašnjenje u `START`). Tekst i čvor na kraju linije
 * se pojavljuju u tom istom trenutku. Prelaskom miša jedna linija postaje
 * malo svetlija, ostale malo tiše.
 *
 * Ispod 1024px ista lista prelazi u vertikalnu putanju koja se prati
 * skrolovanjem — linija je jedna uspravna nit koja se izvlači odozgo naniže.
 *
 * Tekst se menja u `data/alumni.ts`.
 */

/**
 * Krajevi linija u procentima okvira (viewBox 0 0 1000 560).
 * Isti brojevi stoje u `d` atributima ispod — ako se putanja menja,
 * treba pomeriti i ove vrednosti da tekst ostane na kraju linije.
 */
const ENDS = [
  { left: "60%", top: "17.9%" },
  { left: "64.6%", top: "53.6%" },
  { left: "54.8%", top: "83.9%" },
];

/** Iste tačke kao ENDS, u SVG koordinatama (viewBox 1000×560) — za čvorove. */
const NODE_POINTS = [
  { x: 600, y: 100 },
  { x: 646, y: 300 },
  { x: 548, y: 470 },
];

/** Polazna tačka „SEFA” u SVG koordinatama — isto mesto gde počinju krive. */
const HUB_POINT = { x: 94, y: 282 };

/**
 * Rasute sitne tačke u pozadini — čisto dekorativne, teksturu „zvezdane
 * mape” daju bez ijedne dodatne animacije osim zajedničkog fade-in-a.
 */
const SPARKS = [
  { x: 760, y: 40, r: 2.5, o: 0.35 },
  { x: 860, y: 90, r: 2, o: 0.25 },
  { x: 930, y: 60, r: 2.5, o: 0.4 },
  { x: 650, y: 60, r: 2, o: 0.25 },
  { x: 800, y: 180, r: 2, o: 0.3 },
  { x: 910, y: 220, r: 3, o: 0.45 },
  { x: 970, y: 160, r: 2, o: 0.25 },
  { x: 780, y: 380, r: 2.5, o: 0.3 },
  { x: 890, y: 420, r: 3, o: 0.4 },
  { x: 950, y: 360, r: 2, o: 0.25 },
  { x: 820, y: 500, r: 2.5, o: 0.35 },
  { x: 900, y: 530, r: 2, o: 0.3 },
  { x: 660, y: 480, r: 2, o: 0.25 },
];

/**
 * Putanje su namerno nejednake dužine i ne granaju se simetrično —
 * treba da liče na puteve koji se razdvajaju, a ne na organigram.
 */
const CURVES = [
  "M 92 276 C 190 264, 232 168, 330 138 C 424 110, 512 102, 600 100",
  "M 96 282 C 220 292, 300 262, 404 282 C 520 304, 570 300, 646 300",
  "M 92 288 C 186 306, 206 400, 310 442 C 400 478, 470 474, 548 470",
];

/** Trajanje iscrtavanja svake linije (ms) — duža linija se crta duže. */
const DURATION = [550, 620, 680];
/**
 * Trenutak kad svaka linija KREĆE (ms od otkrivanja sekcije) — kumulativno,
 * pa sledeća linija uvek kreće tačno kad prethodna stigne do svog čvora.
 * Ovo je ono što pravi utisak „jedna po jedna”, ne samo različito trajanje.
 */
const START = [0, DURATION[0], DURATION[0] + DURATION[1]];
/** Trenutak kad se čvor na kraju linije pojavljuje — tačno kad linija stigne. */
const NODE_DELAY = START.map((s, i) => s + DURATION[i]);
/** Tekst kreće da se pojavljuje malo pre nego što linija sasvim stigne. */
const STOP_DELAY = NODE_DELAY.map((d) => Math.max(0, d - 150));

export function AlumniPaths() {
  const sectionRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  /* Prigušivanje ostalih linija radi samo za miš — na dodir bi ostalo
     zaglavljeno posle tapa, a sadržaj i bez toga stoji potpuno čitljiv. */
  const hoverProps = (id: string) => ({
    onPointerEnter: (e: React.PointerEvent) => {
      if (e.pointerType === "mouse") setActive(id);
    },
    onPointerLeave: (e: React.PointerEvent) => {
      if (e.pointerType === "mouse") setActive(null);
    },
  });

  return (
    <section
      ref={sectionRef}
      className="al-map"
      data-in={revealed || undefined}
      data-active={active ?? undefined}
      aria-labelledby="put-nakon-sefe"
    >
      <div className="al-map__intro">
        <p className="al-eyebrow">Gde su danas</p>
        <h2 id="put-nakon-sefe" className="al-map__title">
          <AlumniBrand>Put nakon SEFE</AlumniBrand>
        </h2>
        <p className="al-map__lead">
          <AlumniBrand>
            Iskustvo stečeno kroz rad u sektorima SEFE otvara vrata ka
            različitim karijernim putevima.
          </AlumniBrand>
        </p>
      </div>

      <div className="al-map__stage">
        {/* polazna tačka — ista i na desktopu i na mobilnom */}
        <p className="al-map__origin" aria-hidden="true">
          <span className="al-map__origin-dot" />
          SEFA
        </p>

        {/* desktop: konstelacija — pozadinske tačke, čvor, tri linije, čvorovi na kraju */}
        <svg
          className="al-map__fan"
          viewBox="0 0 1000 560"
          fill="none"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          {SPARKS.map((s, i) => (
            <circle
              key={i}
              className="al-map__spark"
              cx={s.x}
              cy={s.y}
              r={s.r}
              style={{ "--spark-delay": `${(i % 6) * 90}ms` } as React.CSSProperties}
              fillOpacity={s.o}
            />
          ))}

          <circle className="al-map__hub-ring" cx={HUB_POINT.x} cy={HUB_POINT.y} r={40} />
          <circle className="al-map__hub-fill" cx={HUB_POINT.x} cy={HUB_POINT.y} r={40} />

          {CURVES.map((d, i) => (
            <path
              key={CAREER_PATHS[i].id}
              className="al-map__curve"
              data-path={CAREER_PATHS[i].id}
              d={d}
              pathLength={1}
              style={
                {
                  "--delay": `${START[i]}ms`,
                  "--dur": `${DURATION[i]}ms`,
                } as React.CSSProperties
              }
            />
          ))}

          {NODE_POINTS.map((p, i) => (
            <g
              key={CAREER_PATHS[i].id}
              className="al-map__node"
              data-path={CAREER_PATHS[i].id}
              style={{ "--node-delay": `${NODE_DELAY[i]}ms` } as React.CSSProperties}
            >
              <circle className="al-map__node-ring" cx={p.x} cy={p.y} r={16} />
              <circle className="al-map__node-dot" cx={p.x} cy={p.y} r={7} />
            </g>
          ))}
        </svg>

        {/* mobilni: ista putanja, samo uspravna nit koja se izvlači naniže */}
        <span className="al-map__spine" aria-hidden="true" />

        <ol className="al-map__list">
          {CAREER_PATHS.map((path, i) => (
            <li
              key={path.id}
              className="al-map__stop"
              data-path={path.id}
              style={
                {
                  "--left": ENDS[i].left,
                  "--top": ENDS[i].top,
                  "--delay": `${STOP_DELAY[i]}ms`,
                  "--i": i,
                } as React.CSSProperties
              }
              {...hoverProps(path.id)}
            >
              <span className="al-map__bead" aria-hidden="true" />
              <h3 className="al-map__stop-title">{path.title}</h3>
              {path.count !== null && (
                <p className="al-map__stop-count">
                  {path.count} <span>alumnista</span>
                </p>
              )}
              <p className="al-map__stop-desc">{path.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
