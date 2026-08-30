"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * Sekcija „Sektori” — tri poglavlja koja se smenjuju dok korisnik skroluje.
 *
 * Kako radi:
 *  - Sekcija je visoka 300vh, a unutar nje jedan `sticky` kadar visine 100vh.
 *  - Slušalac skrola računa napredak kroz sekciju (0 → 1) i upisuje ga u CSS
 *    promenljivu `--p`, a redni broj trenutne etape u atribut `data-stage`.
 *  - Sve ostalo radi CSS: `data-stage` bira koje je poglavlje aktivno, a
 *    `--p` / `--lp` daju blago klizanje pozadine i velikog broja.
 *
 * Etape (data-stage): 0 uvod → 1, 2, 3 sektori → 4 zaključak.
 *
 * Na mobilnom i kad je uključeno „smanjeno kretanje” nema sticky animacije —
 * ista poglavlja se prikazuju jedno ispod drugog (vidi `data-mode` u CSS-u).
 *
 * Sadržaj sektora se menja u nizu SECTORS ispod.
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

/** Sponzorstva i prodaja: dve strane koje jedna neprekidna linija spaja. */
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
    title: "Sponzorstva i prodaja",
    description:
      "Gradimo partnerstva sa kompanijama i pretvaramo dobre ideje u podršku projektima SEFA-e.",
    keywords: ["Partnerstva", "Saradnja", "Prodaja"],
    Illustration: IllustrationSponzorstva,
  },
  {
    num: "03",
    title: "Ljudski resursi",
    description:
      "Okupljamo, razvijamo i povezujemo članove kroz mentorstvo, edukacije i snažnu timsku kulturu.",
    keywords: ["Članovi", "Mentorstvo", "Razvoj"],
    Illustration: IllustrationLjudskiResursi,
  },
];

/** Granice etapa u napretku kroz sekciju (0 = vrh, 1 = dno). */
const STAGE_BOUNDS = [0, 0.17, 0.4, 0.62, 0.85, 1];

function stageFor(p: number) {
  for (let i = 1; i < STAGE_BOUNDS.length; i++) {
    if (p < STAGE_BOUNDS[i]) return i - 1;
  }
  return STAGE_BOUNDS.length - 2;
}

/* ---------- komponenta ---------- */

export function SectorsScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const [stage, setStage] = useState(0);
  const [mode, setMode] = useState<"static" | "scroll">("static");
  const [animated, setAnimated] = useState(false);
  const [seen, setSeen] = useState<boolean[]>([false, false, false]);

  // uključi animacije tek posle montiranja — bez JS-a i uz „smanjeno kretanje”
  // sadržaj ostaje odmah vidljiv i čitljiv
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia("(min-width: 1024px)");

    const sync = () => {
      setAnimated(!reduced.matches);
      setMode(!reduced.matches && wide.matches ? "scroll" : "static");
    };

    sync();
    reduced.addEventListener("change", sync);
    wide.addEventListener("change", sync);
    return () => {
      reduced.removeEventListener("change", sync);
      wide.removeEventListener("change", sync);
    };
  }, []);

  // sticky režim: napredak kroz sekciju → --p, --lp i data-stage
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || mode !== "scroll") return;

    let frame = 0;
    let lastStage = -1;

    const paint = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const travel = section.offsetHeight - window.innerHeight;
      const p = travel <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / travel));

      const s = stageFor(p);
      const from = STAGE_BOUNDS[s];
      const to = STAGE_BOUNDS[s + 1];
      const lp = to > from ? (p - from) / (to - from) : 0;

      section.style.setProperty("--p", p.toFixed(4));
      section.style.setProperty("--lp", lp.toFixed(4));
      if (s !== lastStage) {
        lastStage = s;
        setStage(s);
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
      section.style.removeProperty("--lp");
    };
  }, [mode]);

  // statični režim (mobilni): poglavlje se otkriva kad uđe u vidno polje
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || mode !== "static" || !animated) return;

    const chapters = Array.from(
      section.querySelectorAll<HTMLElement>("[data-chapter]")
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const i = Number((entry.target as HTMLElement).dataset.chapter);
          setSeen((prev) =>
            prev[i] ? prev : prev.map((v, j) => (j === i ? true : v))
          );
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.3 }
    );
    chapters.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, [mode, animated]);

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

  const activeIndex = stage >= 1 && stage <= 3 ? stage - 1 : -1;
  const meterNow = stage === 0 ? "00" : stage === 4 ? "03" : `0${stage}`;

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
        <div className="sc__cont-move">
          <Image
            src="/sektori-pozadina.jpg"
            alt=""
            fill
            sizes="100vw"
            className="sc__cont-img"
          />
        </div>
        <div className="sc__cont-tint" />
        <div className="sc__cont-fade" />
      </div>

      <div className="sc__stage">
        <div className="sc__head">
          <p className="sc__kicker">Sektori</p>
          <h2 id="sektori-naslov" className="sc__title">
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

        <ol className="sc__chapters">
          {SECTORS.map((sector, i) => (
            <li
              key={sector.num}
              className="sc__chapter"
              data-chapter={i}
              data-active={
                (mode === "scroll" ? activeIndex === i : seen[i]) || undefined
              }
            >
              <div className="sc__num-wrap" aria-hidden="true">
                <span className="sc__num">{sector.num}</span>
              </div>

              <div className="sc__body">
                <p className="sc__index" aria-hidden="true">
                  {sector.num}
                </p>
                <h3 className="sc__name">{sector.title}</h3>
                <p className="sc__desc">{sector.description}</p>
                <ul className="sc__keys">
                  {sector.keywords.map((word, k) => (
                    <li key={word} style={{ "--k": k } as React.CSSProperties}>
                      {word}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="sc__illo">
                <sector.Illustration />
              </div>
            </li>
          ))}
        </ol>

        <div className="sc__finale" aria-hidden="true">
          {SECTORS.map((sector, i) => (
            <p
              key={sector.num}
              className="sc__finale-row"
              style={{ "--k": i } as React.CSSProperties}
            >
              <span className="sc__finale-num">{sector.num}</span>
              <span className="sc__finale-name">{sector.title}</span>
            </p>
          ))}
        </div>

        <div className="sc__meter" aria-hidden="true">
          <span className="sc__meter-count">
            <span className="sc__meter-now">{meterNow}</span>
            <span className="sc__meter-sep">/</span>
            <span>03</span>
          </span>
          <span className="sc__meter-rail">
            {SECTORS.map((sector, i) => (
              <i key={sector.num} data-on={activeIndex >= i || stage === 4 || undefined} />
            ))}
          </span>
        </div>
      </div>
    </section>
  );
}
