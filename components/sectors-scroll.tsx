"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * Sekcija „Sektori” — naslovni „layer” i tri sektora se smenjuju dok
 * korisnik skroluje, svaki prelaz je krug koji izraste iz sredine ekrana
 * i otkrije sledeći ekran (ista ideja kao „kupola” u components/dome-reveal.tsx,
 * samo pojednostavljena na čist clip-path krug, pošto se sve dešava unutar
 * jednog sticky kadra).
 *
 * Kako radi:
 *  - Redosled ekrana je fiksan niz STOPS: layer, sektor, layer, sektor,
 *    layer, sektor, layer — isti naslovni „layer” se vraća između svaka
 *    dva sektora.
 *  - Sekcija je visoka onoliko vh koliko ima prelaza (jedan pun ekran
 *    skrola po prelazu), a unutar nje jedan `sticky` kadar od 100vh.
 *  - Slušalac skrola računa napredak kroz sekciju (0 → 1), pretvara ga u
 *    trenutni prelaz (`--stage`, 0…STOPS.length-2) i napredak kruga unutar
 *    njega (`--cp`, 0 → 1, sa mirnim periodom na oba kraja da se sadržaj
 *    stigne pročitati). Sve ostalo radi CSS: trenutni ekran stoji pun
 *    (bez isecanja), sledeći raste iz kruga u sredini.
 *
 * Bez JS-a i uz „smanjeno kretanje” (data-mode="static") nema sticky kadra
 * ni kruga — ekrani stoje jedan ispod drugog, a ponovljeni naslovni layer
 * se prikazuje samo jednom, na vrhu.
 */

type Sector = {
  num: string;
  title: string;
  description: string;
  keywords: [string, string, string];
  Illustration: () => React.ReactElement;
};

/* ---------- ilustracije: originalni line-art, crta se pri aktivaciji ---------- */

const ILLO_PROPS = {
  viewBox: "0 0 400 400",
  className: "sc-illo",
  "aria-hidden": true,
  focusable: "false",
} as const;

/** Komunikacije: kolaž plakata i fotografija sa nastupa. */
function IllustrationKomunikacije() {
  return (
    <Image
      src="/komunikacije-glas.png"
      alt=""
      width={1214}
      height={1295}
      className="sc-illo"
    />
  );
}

/** Sponzorstva: dve strane koje jedna neprekidna linija spaja. */
function IllustrationSponzorstva() {
  return (
    <svg {...ILLO_PROPS}>
      {/* leva strana */}
      <path
        className="sc-illo__draw sc-illo__ink"
        pathLength={1}
        d="M156 92 C 96 92 84 118 84 158 L84 242 C 84 282 96 308 156 308"
        style={{ "--d": "60ms" } as React.CSSProperties}
      />
      {/* desna strana */}
      <path
        className="sc-illo__draw sc-illo__ink"
        pathLength={1}
        d="M244 308 C 304 308 316 282 316 242 L316 158 C 316 118 304 92 244 92"
        style={{ "--d": "220ms" } as React.CSSProperties}
      />
      {/* jedna neprekidna linija koja ih povezuje */}
      <path
        className="sc-illo__draw sc-illo__accent sc-illo__link"
        pathLength={1}
        d="M156 308 C 212 308 186 200 200 200 C 214 200 188 92 244 92"
        style={{ "--d": "520ms" } as React.CSSProperties}
      />
      <circle
        className="sc-illo__node sc-illo__accent-fill"
        cx={156}
        cy={308}
        r={5}
        style={{ "--d": "460ms" } as React.CSSProperties}
      />
      <circle
        className="sc-illo__node sc-illo__accent-fill"
        cx={244}
        cy={92}
        r={5}
        style={{ "--d": "1180ms" } as React.CSSProperties}
      />
    </svg>
  );
}

/** Ljudski resursi: kolaž fotografija tima. */
function IllustrationLjudskiResursi() {
  return (
    <Image
      src="/ljudski-resursi-glas.png"
      alt=""
      width={1384}
      height={1136}
      className="sc-illo"
    />
  );
}

/* ---------- sadržaj ---------- */

const SECTORS: Sector[] = [
  {
    num: "01",
    title: "Komunikacije",
    description:
      "Kreiramo sadržaj, vodimo društvene mreže i gradimo prepoznatljiv glas SEFA-e.",
    keywords: ["Sadržaj", "Mediji", "Javnost"],
    Illustration: IllustrationKomunikacije,
  },
  {
    num: "02",
    title: "Sponzorstva",
    description:
      "Gradimo partnerstva sa kompanijama, i pretvaramo dobre ideje u podršku projektima SEFA-e.",
    keywords: ["Partnerstva", "Saradnja", "Kompanije"],
    Illustration: IllustrationSponzorstva,
  },
  {
    num: "03",
    title: "Ljudski resursi",
    description:
      "Okupljamo, razvijamo i povezujemo članove kroz mentorstvo, edukacije i snažnu timsku atmosferu.",
    keywords: ["Članovi", "Mentorstvo", "Razvoj"],
    Illustration: IllustrationLjudskiResursi,
  },
];

/* ---------- redosled ekrana: layer, sektor, layer, sektor, layer, sektor, layer ---------- */

type Stop = { kind: "layer" } | { kind: "sector"; sector: Sector };

const STOPS: Stop[] = [
  { kind: "layer" },
  { kind: "sector", sector: SECTORS[0] },
  { kind: "layer" },
  { kind: "sector", sector: SECTORS[1] },
  { kind: "layer" },
  { kind: "sector", sector: SECTORS[2] },
  { kind: "layer" },
];
/** Broj prelaza (jedan manje od broja ekrana). */
const UNITS = STOPS.length - 1;
/** Ekran miruje na oba kraja prelaza — krug raste samo u sredini skrola. */
const CIRCLE_FROM = 0.3;
const CIRCLE_TO = 0.7;

function sectorNumAt(i: number) {
  const stop = STOPS[i];
  return stop?.kind === "sector" ? stop.sector.num : null;
}

/* ---------- komponenta ---------- */

export function SectorsScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const [stage, setStage] = useState(0);
  const [mode, setMode] = useState<"static" | "scroll">("static");
  const [animated, setAnimated] = useState(false);

  // uključi animacije tek posle montiranja — bez JS-a i uz „smanjeno
  // kretanje” sadržaj ostaje odmah vidljiv i čitljiv
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () => {
      setAnimated(!reduced.matches);
      setMode(!reduced.matches ? "scroll" : "static");
    };

    sync();
    reduced.addEventListener("change", sync);
    return () => reduced.removeEventListener("change", sync);
  }, []);

  // sticky režim: napredak kroz sekciju → trenutni prelaz (--stage) i
  // napredak kruga unutar njega (--cp)
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || mode !== "scroll") return;

    let frame = 0;
    let lastStage = -1;

    const ease = (t: number) => t * t * (3 - 2 * t);

    const paint = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const travel = section.offsetHeight - window.innerHeight;
      const p = travel <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / travel));

      const raw = Math.min(UNITS - 1e-4, Math.max(0, p * UNITS));
      const unit = Math.floor(raw);
      const localT = raw - unit;
      const cp = ease(
        localT <= CIRCLE_FROM
          ? 0
          : localT >= CIRCLE_TO
            ? 1
            : (localT - CIRCLE_FROM) / (CIRCLE_TO - CIRCLE_FROM)
      );

      section.style.setProperty("--p", p.toFixed(4));
      section.style.setProperty("--cp", cp.toFixed(4));
      if (unit !== lastStage) {
        lastStage = unit;
        setStage(unit);
      }
    };

    const request = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    paint();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      if (frame) cancelAnimationFrame(frame);
      section.style.removeProperty("--p");
      section.style.removeProperty("--cp");
    };
  }, [mode]);

  // pozadina reaguje na pokret miša (ili prsta na telefonu) — blagi 3D nagib
  // daje utisak dubine umesto ravne slike zalepljene za ekran
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || mode !== "scroll") return;

    let frame = 0;
    let mx = 0;
    let my = 0;

    const paint = () => {
      frame = 0;
      section.style.setProperty("--mx", mx.toFixed(3));
      section.style.setProperty("--my", my.toFixed(3));
    };

    const onMove = (e: PointerEvent) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      mx = t.clientX / window.innerWidth - 0.5;
      my = t.clientY / window.innerHeight - 0.5;
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const onLeave = () => {
      mx = 0;
      my = 0;
      if (!frame) frame = requestAnimationFrame(paint);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchend", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onLeave);
      window.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
      section.style.removeProperty("--mx");
      section.style.removeProperty("--my");
    };
  }, [mode]);

  // uvodni naslov se otkriva liniju po liniju kad sekcija uđe u vidno polje
  const [headIn, setHeadIn] = useState(false);
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !animated) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeadIn(true);
          observer.disconnect();
        }
      },
      { rootMargin: "-10% 0px -30% 0px" }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [animated]);

  // indikator napretka: broj sektora ka kome trenutni prelaz vodi (ili iz
  // koga dolazi, kad smo na poslednjem naslovnom „layer”-u)
  const meterNow = sectorNumAt(stage + 1) ?? sectorNumAt(stage) ?? "00";
  const SECTOR_STOP_INDEX = [1, 3, 5];
  const rail = SECTOR_STOP_INDEX.map((idx) => stage + 1 >= idx);

  return (
    <section
      ref={sectionRef}
      className="sc"
      data-stage={stage}
      data-mode={mode}
      data-anim={animated ? "on" : undefined}
      data-head={headIn ? "in" : undefined}
      aria-labelledby="sektori-naslov"
    >
      <div className="sc__cont" aria-hidden="true">
        <div className="sc__cont-tilt">
          <div className="sc__cont-move">
            <div className="sc__cont-glow" />
            <div className="sc__cont-grain" />
          </div>
        </div>
        <div className="sc__cont-fade" />
      </div>

      <div className="sc__stage">
        <div className="sc__stops">
          {STOPS.map((stop, i) =>
            stop.kind === "layer" ? (
              <div key={i} className="sc__stop" data-stop={i} data-kind="layer">
                <div className="sc__layer">
                  <p className="sc__kicker">Sektori</p>
                  <h2
                    {...(i === 0 ? { id: "sektori-naslov" } : {})}
                    className="sc__title"
                  >
                    <span className="sc__line">
                      <span>Tri sektora.</span>
                    </span>
                    <span className="sc__line">
                      <span>Jedna organizacija.</span>
                    </span>
                  </h2>
                  <p className="sc__lead">
                    Različite uloge, znanja i ljudi povezani zajedničkim ciljem.
                  </p>
                </div>
              </div>
            ) : (
              <div key={i} className="sc__stop" data-stop={i} data-kind="sector">
                <div className="sc__sector">
                  <div className="sc__num-wrap" aria-hidden="true">
                    <span className="sc__num">{stop.sector.num}</span>
                  </div>
                  <div className="sc__body">
                    <p className="sc__index" aria-hidden="true">
                      {stop.sector.num}
                    </p>
                    <h3 className="sc__name">{stop.sector.title}</h3>
                    <p className="sc__desc">{stop.sector.description}</p>
                    <ul className="sc__keys">
                      {stop.sector.keywords.map((word, k) => (
                        <li key={word} style={{ "--k": k } as React.CSSProperties}>
                          {word}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="sc__illo">
                    <stop.sector.Illustration />
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        <div className="sc__meter" aria-hidden="true">
          <span className="sc__meter-count">
            <span className="sc__meter-now">{meterNow}</span>
            <span className="sc__meter-sep">/</span>
            <span>03</span>
          </span>
          <span className="sc__meter-rail">
            {rail.map((on, i) => (
              <i key={i} data-on={on || undefined} />
            ))}
          </span>
        </div>
      </div>
    </section>
  );
}
