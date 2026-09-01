"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildTrail,
  buildWorld,
  pointAtLength,
  WORLD_W,
  type World,
} from "@/lib/road-path";
import { historyMilestones } from "@/lib/history-milestones";

/**
 * Sekcija „Naš put” — istorija SEFA-e kao putovanje vijugavim putem.
 *
 * SADRŽAJ SE MENJA U `lib/history-milestones.ts`. Ovde je samo kretanje.
 *
 * Dva režima, bira se posle montiranja:
 *
 *  „cinema” (desktop, ≥1024px, bez „smanjenog kretanja”)
 *      Sekcija je visoka (uvod + stanica × N + kraj), a unutar nje stoji jedan
 *      `sticky` kadar od 100vh. Napredak skrola pomera kameru duž putanje:
 *      SVG `viewBox` se svaki kadar pomera tako da trenutna tačka na putu
 *      ostane blizu sredine ekrana, pa se svet kreće oko korisnika umesto da
 *      se linija samo iscrtava. Ceo kadar se blago rotira u smeru krivine
 *      (najviše ±3.4°). Nema scroll-jackinga — skrol ostaje potpuno normalan.
 *
 *  „flow” (mobilni, tablet, `prefers-reduced-motion`, i SSR)
 *      Obična vertikalna lista. Iza nje stoji vijugava linija koja se iscrtava
 *      dok se skroluje, a stanice se otkrivaju jedna po jedna
 *      (IntersectionObserver). Bez pomeranja kamere, rotacije i paralakse.
 *
 * Sve vrednosti kretanja idu u CSS promenljive na korenu sekcije
 * (`--cx`, `--cy`, `--rot`, `--travel`, `--intro`, `--outro`), a izgled radi
 * CSS u `app/globals.css`. Jedan `requestAnimationFrame` ciklus, jedan slušalac
 * skrola.
 */

/* ---------- tempo putovanja (udeo napretka kroz sekciju, 0 → 1) ---------- */

/** Do ovog napretka traje uvod i polako se povlači. */
const INTRO_END = 0.13;
/** Od ovog napretka put izlazi iz kadra i pojavljuje se završetak. */
const OUTRO_START = 0.87;
/** Koliki deo svog „slota” stanica ostaje vidljiva (ostatak je putovanje). */
const WINDOW_FACTOR = 0.38;
/**
 * Koliko se kadar rotira u odnosu na nagib putanje, i najviše koliko.
 * 0.12 je izabrano merenjem: najveći nagib duž cele putanje je tada 3.46°,
 * pa granica praktično nikad ne stupa na snagu i kamera stalno „upravlja”
 * umesto da stoji priklještena u krajnjem nagibu.
 */
const STEER = 0.12;
const STEER_MAX = 3.4;

/** Dužina jednog ciklusa poskakivanja (u jedinicama sveta), kao ovešeni oslonac na neravnom putu. */
const BOB_CYCLE = 48;
/** Najveće poskakivanje, u pikselima. */
const BOB_MAX = 2.4;

const clamp = (v: number, lo: number, hi: number) =>
  v < lo ? lo : v > hi ? hi : v;

/** Smootherstep — usporava na krajevima, pa kamera „prikoči” uz stanicu. */
const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

type Phase = "before" | "in" | "after";

export function HistoryRoad() {
  const stops = historyMilestones;
  const count = stops.length;

  const world = useMemo<World>(() => buildWorld(count), [count]);
  const trail = useMemo(() => buildTrail(count), [count]);

  /** Napredak na kome je svaka stanica u punom kadru. */
  const centers = useMemo(() => {
    const span = OUTRO_START - INTRO_END;
    return stops.map((_, i) => INTRO_END + ((i + 0.5) * span) / count);
  }, [stops, count]);
  const half = useMemo(
    () => ((OUTRO_START - INTRO_END) / count) * WINDOW_FACTOR,
    [count]
  );

  const sectionRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const carRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<"flow" | "cinema">("flow");
  const [animated, setAnimated] = useState(false);
  const [active, setActive] = useState(-1);
  const [passed, setPassed] = useState(0);
  const [seen, setSeen] = useState<boolean[]>(() => stops.map(() => false));

  /* ---------- izbor režima ---------- */
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia("(min-width: 1024px)");

    const sync = () => {
      setAnimated(!reduced.matches);
      setMode(!reduced.matches && wide.matches ? "cinema" : "flow");
    };

    sync();
    reduced.addEventListener("change", sync);
    wide.addEventListener("change", sync);
    return () => {
      reduced.removeEventListener("change", sync);
      wide.removeEventListener("change", sync);
    };
  }, []);

  /* ---------- „cinema”: kamera putuje putanjom ---------- */
  useEffect(() => {
    const section = sectionRef.current;
    const svg = svgRef.current;
    if (!section || !svg || mode !== "cinema") return;

    // trenutne (ublažene) vrednosti kamere — bez ovoga slika podrhtava
    let len = 0;
    let rot = 0;
    let primed = false;

    let box = { w: svg.clientWidth, h: svg.clientHeight };
    let frame = 0;
    let lastActive = -2;
    let lastPassed = -1;

    /** Dužina puta koja odgovara napretku `p`, sa usporavanjem uz stanice. */
    const lengthAt = (p: number) => {
      const keys: [number, number][] = [
        [0, 0],
        ...centers.map((c, i): [number, number] => [c, world.stopLengths[i]]),
        [1, world.total],
      ];
      for (let i = 0; i < keys.length - 1; i++) {
        const [p0, l0] = keys[i];
        const [p1, l1] = keys[i + 1];
        if (p <= p1 || i === keys.length - 2) {
          const t = p1 > p0 ? clamp((p - p0) / (p1 - p0), 0, 1) : 1;
          return l0 + (l1 - l0) * ease(t);
        }
      }
      return world.total;
    };

    const paint = () => {
      frame = 0;

      const rect = section.getBoundingClientRect();
      const travel = section.offsetHeight - window.innerHeight;
      const p = travel <= 0 ? 0 : clamp(-rect.top / travel, 0, 1);

      const targetLen = lengthAt(p);
      const targetPt = pointAtLength(world, targetLen);
      const targetRot = clamp(
        -(targetPt.angle - 90) * STEER,
        -STEER_MAX,
        STEER_MAX
      );

      if (!primed) {
        len = targetLen;
        rot = targetRot;
        primed = true;
      } else {
        len += (targetLen - len) * 0.17;
        rot += (targetRot - rot) * 0.11;
      }

      const cam = pointAtLength(world, len);

      // auto: okreće se u pravcu vožnje (tangenta puta), poskakuje
      // srazmerno pređenoj dužini, ne vremenu — miruje kad se ne skroluje
      const car = carRef.current;
      if (car) {
        const phase = (len / BOB_CYCLE) * Math.PI * 2;
        const bounce = Math.abs(Math.sin(phase));
        // nos je nacrtan na -y u lokalnim koordinatama, a `.road__car` je van
        // rotiranog `.road__world`, pa treba +180° u odnosu na hodačevu formulu
        // da bi nos gledao u pravcu vožnje umesto unazad
        const driveRot = cam.angle + 90 + rot;
        const style = car.style;
        style.setProperty("--bob", (bounce * BOB_MAX).toFixed(2));
        style.setProperty("--drive-rot", driveRot.toFixed(2));
      }

      // koliko je kamera blizu neke stanice (0 → 1) — put se tu blago primakne
      let near = 0;
      for (let i = 0; i < centers.length; i++) {
        near = Math.max(near, 1 - clamp(Math.abs(p - centers[i]) / half, 0, 1));
      }

      const zoom = clamp(box.w / 1250, 0.78, 1.75) * (1 + near * 0.03);
      const vw = box.w / zoom;
      const vh = box.h / zoom;
      svg.setAttribute(
        "viewBox",
        `${(cam.x - vw / 2).toFixed(1)} ${(cam.y - vh * 0.52).toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}`
      );

      const style = section.style;
      style.setProperty("--rot", rot.toFixed(3));
      style.setProperty("--travel", (len / world.total).toFixed(4));
      style.setProperty("--intro", (1 - clamp(p / INTRO_END, 0, 1)).toFixed(3));
      style.setProperty(
        "--outro",
        clamp((p - OUTRO_START) / (1 - OUTRO_START), 0, 1).toFixed(3)
      );

      let nextActive = -1;
      let nextPassed = 0;
      for (let i = 0; i < centers.length; i++) {
        if (Math.abs(p - centers[i]) <= half) nextActive = i;
        if (p > centers[i]) nextPassed = i + 1;
      }
      if (nextActive !== lastActive) {
        lastActive = nextActive;
        setActive(nextActive);
      }
      if (nextPassed !== lastPassed) {
        lastPassed = nextPassed;
        setPassed(nextPassed);
      }

      // nastavi da crtaš dok se ublažene vrednosti ne slegnu
      const settled =
        Math.abs(targetLen - len) < 0.4 && Math.abs(targetRot - rot) < 0.01;
      if (!settled) frame = requestAnimationFrame(paint);
    };

    const request = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const observer = new ResizeObserver(() => {
      box = { w: svg.clientWidth, h: svg.clientHeight };
      request();
    });
    observer.observe(svg);

    paint();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      section.style.removeProperty("--rot");
      section.style.removeProperty("--travel");
      section.style.removeProperty("--intro");
      section.style.removeProperty("--outro");
    };
  }, [mode, world, centers, half]);

  /* ---------- „flow”: linija se iscrtava, stanice se otkrivaju redom ---------- */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || mode !== "flow" || !animated) return;

    let frame = 0;
    const paint = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const p = clamp(
        (window.innerHeight * 0.78 - rect.top) / Math.max(rect.height, 1),
        0,
        1
      );
      section.style.setProperty("--travel", p.toFixed(4));
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const i = Number((entry.target as HTMLElement).dataset.stop);
          setSeen((prev) =>
            prev[i] ? prev : prev.map((v, j) => (j === i ? true : v))
          );
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.25, rootMargin: "0px 0px -12% 0px" }
    );
    section
      .querySelectorAll<HTMLElement>("[data-stop]")
      .forEach((el) => observer.observe(el));

    paint();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      section.style.removeProperty("--travel");
    };
  }, [mode, animated]);

  const phaseOf = (i: number): Phase => {
    if (mode === "flow") return !animated || seen[i] ? "in" : "before";
    if (i === active) return "in";
    return i < passed ? "after" : "before";
  };

  const meterYear =
    active >= 0 ? stops[active].year : passed >= count ? "Danas" : "";

  return (
    <section
      ref={sectionRef}
      className="road"
      data-mode={mode}
      data-anim={animated ? "on" : undefined}
      style={{ "--road-stops": count } as React.CSSProperties}
      aria-labelledby="nas-put-naslov"
    >
      <div className="road__stage">
        {/* ---------- pozadina: vidljiva samo dok je kadar prikačen (cinema),
             utapa se u ravnu pozadinu na ulazu i izlazu preko --intro/--outro ---------- */}
        <div className="road__backdrop" aria-hidden="true">
          <Image
            src="/put-pozadina.jpg"
            alt=""
            fill
            sizes="100vw"
            className="road__backdrop-img"
          />
          <div className="road__backdrop-tint" />
        </div>

        {/* ---------- put: desktop kadar ---------- */}
        <div className="road__world" aria-hidden="true">
          <svg
            ref={svgRef}
            className="road__map"
            viewBox={`0 0 ${WORLD_W} ${world.height}`}
            fill="none"
          >
            <path className="road__bed" d={world.d} pathLength={1} />
            <path
              className="road__bed road__bed--lit"
              d={world.d}
              pathLength={1}
            />
            <path className="road__spine" d={world.d} pathLength={1} />

            {world.stops.map((stop, i) => (
              <g
                key={i}
                className="road__pin"
                data-phase={phaseOf(i)}
                transform={`translate(${stop.x} ${stop.y})`}
              >
                <circle className="road__pin-ring" r={17} />
                <circle className="road__pin-dot" r={4.5} />
              </g>
            ))}
          </svg>
          <div className="road__grain" />
        </div>

        {/* ---------- uvod ---------- */}
        <div className="road__intro">
          <p className="road__eyebrow road__eyebrow--hero">Naš put</p>
          <h2 id="nas-put-naslov" className="road__title">
            Od 2015. do danas.
          </h2>
          <p className="road__lead">
            Neke priče se ne mogu ispričati odjednom. Zato krenimo od početka.
          </p>
          <p className="road__hint">
            <span>Skroluj da kreneš putem</span>
            <span className="road__hint-line" aria-hidden="true" />
          </p>
        </div>

        {/* ---------- stanice ---------- */}
        <div className="road__stops-wrap">
          {/* put: mobilna linija, rasteže se preko cele liste */}
          <div className="road__trail" aria-hidden="true">
            <svg
              viewBox="0 0 100 1000"
              preserveAspectRatio="none"
              fill="none"
              className="road__trail-svg"
            >
              <path className="road__trail-bed" d={trail.d} />
              <path className="road__trail-ink" d={trail.d} pathLength={1} />
            </svg>
          </div>

          <ol className="road__stops">
            {stops.map((stop, i) => (
              <li
                key={`${stop.year}-${i}`}
                className="road__stop"
                data-stop={i}
                data-phase={phaseOf(i)}
                data-align={stop.alignment}
                data-shape={i % 3}
                /* položaj tačke na krivini mobilne linije (0–100 širine trake) */
                style={
                  { "--bead": trail.xs[i].toFixed(2) } as React.CSSProperties
                }
              >
                <span className="road__bead" aria-hidden="true" />

                <div className="road__body">
                  <p className="road__stop-eyebrow">{stop.eyebrow}</p>
                  <p className="road__year" aria-hidden="true">
                    {stop.year}
                  </p>
                  <h3 className="road__stop-title">
                    <span className="road__sr">{stop.year} — </span>
                    <span className="road__line">
                      <span>{stop.title}</span>
                    </span>
                  </h3>
                  <p className="road__desc">{stop.description}</p>
                </div>

                <figure className="road__figure">
                  <div className="road__frame">
                    {stop.image ? (
                      <Image
                        src={stop.image}
                        alt={stop.imageAlt}
                        fill
                        sizes="(min-width: 1024px) 38vw, 90vw"
                        priority={i === 0}
                        className="road__photo"
                      />
                    ) : (
                      <div className="road__placeholder">
                        <span>Fotografija iz {stop.year}.</span>
                      </div>
                    )}
                  </div>
                  <figcaption className="road__caption">
                    {stop.imageCaption}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ol>
        </div>

        {/* ---------- kraj putovanja ---------- */}
        <div className="road__outro">
          <p className="road__eyebrow">Danas</p>
          <p className="road__outro-title">Priča se nastavlja.</p>
          <p className="road__lead">
            Svaka nova generacija ostavlja svoj trag.
          </p>
        </div>

        {/* ---------- indikator napretka ---------- */}
        <div className="road__meter" aria-hidden="true">
          <span className="road__meter-year">{meterYear}</span>
          <span className="road__meter-rail">
            {stops.map((stop, i) => (
              <i key={`${stop.year}-${i}`} data-on={i < passed || undefined} />
            ))}
          </span>
        </div>

        {/* auto koji prati kameru po putu, iz ptičje perspektive — šiljati
            „nos” (vrh, kod y ≈ -21) okrenut u pravcu vožnje, zadnji deo ravan */}
        <div className="road__car" ref={carRef} aria-hidden="true">
          <svg viewBox="-14 -24 28 42" className="road__car-svg" fill="none">
            <path
              className="road__car-body"
              d="M 0 -21 L 7 -12 L 7 9 L 4 13 L -4 13 L -7 9 L -7 -12 Z"
            />
            <line
              className="road__car-windshield"
              x1="-4"
              y1="-6"
              x2="4"
              y2="-6"
            />
            <circle className="road__car-wheel" cx="-8.5" cy="-9" r="2.6" />
            <circle className="road__car-wheel" cx="8.5" cy="-9" r="2.6" />
            <circle className="road__car-wheel" cx="-8.5" cy="7" r="2.6" />
            <circle className="road__car-wheel" cx="8.5" cy="7" r="2.6" />
          </svg>
        </div>
      </div>
    </section>
  );
}
