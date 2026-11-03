"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * Sekcija „Sektori” — naslovni „layer” se prikaže jednom, a zatim tri
 * sektora idu direktno jedan za drugim dok korisnik skroluje. Ekrani se
 * ređaju kao 3D stek kartica: sledeći ekran klizi odozdo i prekriva
 * prethodni, koji u tom trenutku blago tone u dubinu (smanjuje se,
 * zamagljuje i bledi) — direktna, 1:1 veza sa skrolom, bez odvojenih
 * ulaz/izlaz animacija koje mogu da se razminu.
 *
 * Kako radi:
 *  - Redosled ekrana je fiksan niz STOPS: layer, pa sektor, sektor, sektor
 *    — bez vraćanja na layer između sektora. Svaki ekran dobija svoje
 *    mesto u steku kao CSS promenljiva `--stop` (0, 1, 2…).
 *  - Sekcija je visoka onoliko vh koliko ima prelaza (jedan pun ekran
 *    skrola po prelazu), a unutar nje jedan `sticky` kadar od 100vh.
 *  - Slušalac skrola računa napredak kroz sekciju (0 → 1) i pretvara ga u
 *    `--raw`: kontinuiranu poziciju steka (0…STOPS.length-1), sa mirnim
 *    periodom na oba kraja svakog prelaza da se sadržaj stigne pročitati.
 *    CSS iz razlike `--stop - --raw` (u globals.css: `--rel`) izvodi dva
 *    broja 0→1 — `--posT` (ekran se penje odozdo) i `--negT` (ekran tone
 *    u dubinu) — i njima pogoni translateY/scale/opacity/blur. Razlika je
 *    uvek tačna, pa nema moguće neusklađenosti.
 *  - `--stage` (ceo broj, trenutni prelaz) upisuje se posebno — koristi
 *    ga brojač napretka i crtanje linije ilustracije sektora.
 *
 * Bez JS-a i uz „smanjeno kretanje” (data-mode="static") nema sticky kadra
 * ni klizanja — ekrani stoje jedan ispod drugog.
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
  { kind: "sector", sector: SECTORS[1] },
  { kind: "sector", sector: SECTORS[2] },
];
/** Broj prelaza (jedan manje od broja ekrana). */
const UNITS = STOPS.length - 1;
/** Kratak mir na oba kraja prelaza (da se pročita), a stek-prelaz se
 * razvlači preko skoro cele sredine skrola — što je prelaz duži (u
 * poređenju sa mirom), to je kretanje mekše, bez naglog "skoka". */
const STACK_FROM = 0.12;
const STACK_TO = 0.88;

/** Glatkija kriva od obične smoothstep (t²(3-2t)) — brzina kreće i
 * završava se na nuli još mekše, pa se prelaz oseća kao da "diše", a ne
 * da naglo kreće/staje. */
const smootherstep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

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
  const [meterNow, setMeterNow] = useState("00");

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

  // sticky režim: napredak kroz sekciju → --raw (kontinuirana pozicija
  // klizanja, 0…STOPS.length-1) i trenutni prelaz (--stage, za brojač i
  // crtanje ilustracije)
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || mode !== "scroll") return;

    let frame = 0;
    let lastStage = -1;
    let lastMeter = "";

    const paint = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const travel = section.offsetHeight - window.innerHeight;
      const p = travel <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / travel));

      const raw = Math.min(UNITS - 1e-4, Math.max(0, p * UNITS));
      const unit = Math.floor(raw);
      const localT = raw - unit;
      // ekran miruje na oba kraja prelaza (lakše se čita), stek-prelaz se
      // dešava samo u sredini skrola — CSS ovo pretvara u posT/negT koji
      // pogone translateY/scale/opacity/blur
      const cp = smootherstep(
        localT <= STACK_FROM
          ? 0
          : localT >= STACK_TO
            ? 1
            : (localT - STACK_FROM) / (STACK_TO - STACK_FROM)
      );
      const visualRaw = unit + cp;

      section.style.setProperty("--p", p.toFixed(4));
      section.style.setProperty("--raw", visualRaw.toFixed(4));
      if (unit !== lastStage) {
        lastStage = unit;
        setStage(unit);
      }
      // brojač prati koji je ekran trenutno DOMINANTAN na ekranu (posle
      // pola klizanja, to je onaj koji se otkriva), ne samo indeks prelaza —
      // inače bi ostao na prethodnom broju dok se poslednji sektor čita
      const meter =
        cp >= 0.5
          ? (sectorNumAt(unit + 1) ?? sectorNumAt(unit) ?? "00")
          : (sectorNumAt(unit) ?? sectorNumAt(unit + 1) ?? "00");
      if (meter !== lastMeter) {
        lastMeter = meter;
        setMeterNow(meter);
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
      section.style.removeProperty("--raw");
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

  // indikator napretka: koliko je sektora „otvoreno” prati isti broj koji
  // upisuje efekat iznad (meterNow), pa rail ne zaostaje na kraju sekcije
  const litCount = meterNow === "00" ? 0 : Number(meterNow);
  const rail = [1, 2, 3].map((n) => n <= litCount);

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
              <div
                key={i}
                className="sc__stop"
                data-stop={i}
                data-kind="layer"
                style={{ "--stop": i } as React.CSSProperties}
              >
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
              <div
                key={i}
                className="sc__stop"
                data-stop={i}
                data-kind="sector"
                style={{ "--stop": i } as React.CSSProperties}
              >
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
