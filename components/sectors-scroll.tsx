"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Sekcija „Sektori” — naslovni „layer” se prikaže jednom, a zatim četiri
 * sektora idu direktno jedan za drugim dok korisnik skroluje. Ekrani se
 * ređaju kao 3D stek kartica: sledeći ekran klizi odozdo i prekriva
 * prethodni, koji u tom trenutku blago tone u dubinu (smanjuje se,
 * zamagljuje i bledi) — direktna, 1:1 veza sa skrolom, bez odvojenih
 * ulaz/izlaz animacija koje mogu da se razminu.
 *
 * Kako radi:
 *  - Redosled ekrana je fiksan niz STOPS: layer, pa četiri sektora
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
};

/* ---------- sadržaj ---------- */

const SECTORS: Sector[] = [
  {
    num: "01",
    title: "PR",
    description:
      "PR sektor je glas SEFA-e. Zadužen je za promociju organizacije, njenih projekata i aktivnosti, kao i za izgradnju pozitivnog imidža i prepoznatljivosti među studentima. Članovi vode društvene mreže, osmišljavaju promotivne kampanje i komuniciraju sa javnošću. Kroz kreativne ideje i savremene marketinške pristupe povećavamo vidljivost projekata, privlačimo nove članove i jačamo identitet organizacije, dok članovi razvijaju veštine marketinga, komunikacije i kreativnog razmišljanja.",
  },
  {
    num: "02",
    title: "Dizajn",
    description:
      "Dizajn sektor je zadužen za vizuelni identitet svih projekata. Članovi osmišljavaju i kreiraju objave za društvene mreže, plakate, flajere, prezentacije i promotivne materijale u alatima poput Canve i Illustratora, a video sadržaj montiraju u CapCutu i Premiere Pro-u. Cilj je da kreativno i originalno predstavimo aktivnosti organizacije i privučemo pažnju studenata, a članovi kroz rad razvijaju kreativnost i stiču praktična znanja iz grafičkog dizajna i marketinga.",
  },
  {
    num: "03",
    title: "Sponzorstva",
    description:
      "Sektor za sponzorstva i prodaju uspostavlja i održava saradnju sa kompanijama, institucijama i poslovnim partnerima, kako bi obezbedio finansijsku, materijalnu i logističku podršku projektima SEFA-e. Članovi istražuju tržište, pronalaze potencijalne sponzore, pripremaju sponzorske ponude i vode pregovore. Kroz rad na projektima kao što su CFO kongres, Greenfield i SEFA Talks gradimo dugoročna partnerstva i povezujemo akademsku i poslovnu zajednicu, a članovi stiču praktično iskustvo u pregovaranju, prodaji i poslovnoj komunikaciji.",
  },
  {
    num: "04",
    title: "Ljudski resursi",
    description:
      "HR sektor je posvećen ljudima, razvoju članova i stvaranju podsticajnog okruženja za rad. Bavi se regrutacijom i selekcijom novih članova, njihovim uključivanjem u organizaciju i praćenjem njihovog zadovoljstva i napretka. Kroz edukacije i team building druženja podstičemo timski duh, unapređujemo međusobnu komunikaciju i omogućavamo svakom članu da razvija svoje veštine i potencijale. Verujemo da su ljudi temelj svake uspešne organizacije i da se najbolji rezultati postižu zajedništvom i dobrom saradnjom.",
  },
];

/* ---------- redosled ekrana: layer, sektor, layer, sektor, layer, sektor, layer ---------- */

type Stop = { kind: "layer" } | { kind: "sector"; sector: Sector };

const STOPS: Stop[] = [
  { kind: "layer" },
  { kind: "sector", sector: SECTORS[0] },
  { kind: "sector", sector: SECTORS[1] },
  { kind: "sector", sector: SECTORS[2] },
  { kind: "sector", sector: SECTORS[3] },
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
  const rail = [1, 2, 3, 4].map((n) => n <= litCount);

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
                      <span>Četiri sektora.</span>
                    </span>
                    <span className="sc__line">
                      <span>Jedna organizacija.</span>
                    </span>
                  </h2>
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
            <span>04</span>
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
