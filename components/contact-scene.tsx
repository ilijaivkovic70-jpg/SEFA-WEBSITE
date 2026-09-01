"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * Sekcija „Javi nam se” — kontakt scena u kojoj se ekran telefona odzumira.
 *
 * KONTAKT PODACI SE MENJAJU U NIZU `CONTACTS` ISPOD. Ovde je sve ostalo samo
 * kretanje i raspored.
 *
 * Ideja: ono što se na početku vidi preko cele stranice — veliki SEFA logo i
 * „JAVI NAM SE” — zapravo je ekran telefona, samo jako uveličan. Skrol taj
 * kadar odzumira: telefon se pojavljuje u ruci, sve se smanjuje i sedne u
 * sredinu ekrana, pa se tek onda pale kontakti.
 *
 * Telefon je fotografija (`public/kontakt-telefon.webp`, ruka koja drži telefon
 * praznog ekrana, Unsplash licenca), a preko njenog ekrana stoji naš pravi HTML
 * sadržaj — zato su kontakti klikabilni i oštri na svakoj veličini. Mere ekrana
 * na fotografiji su u `PHOTO` ispod; ako se fotografija ikad zameni, menjaju se
 * samo ti brojevi.
 *
 * Dva režima, bira se posle montiranja:
 *
 *  „scroll” (podrazumevano, i na mobilnom)
 *      Sekcija je visoka ~3 ekrana, a unutar nje stoji jedan `sticky` kadar od
 *      100svh. Napredak skrola (0 → 1) pretvara se u CSS promenljive na korenu
 *      sekcije (`--s`, `--ty`, `--frame`, `--note`, `--p`), a CSS u
 *      `app/globals.css` od njih pravi sliku. Nema scroll-jackinga — skrol
 *      ostaje normalan i animacija ide u oba smera.
 *
 *  „static” (`prefers-reduced-motion`, i SSR pre nego što se JS izvrši)
 *      Telefon stoji u svojoj veličini, sa svim kontaktima. Bez sticky kadra,
 *      bez uvećanja i bez pomeranja — sadržaj je odmah čitljiv.
 *
 * Jedan `requestAnimationFrame` ciklus i jedan slušalac skrola; animiraju se
 * samo `transform` i `opacity`.
 */

/* ---------- podaci ----------
   Isti nalozi kao u traci u podnožju (`components/footer.tsx`) — ako se
   neki nalog ili podatak promeni, menja se `href` i `value` ovde. */

type Contact = {
  /** Naziv u listi, npr. „Instagram”. */
  label: string;
  /** Ono što se prikazuje ispod naziva: nalog, adresa, broj. */
  value: string;
  href: string;
  /** Mreže i mapa se otvaraju u novoj kartici; mailto i tel ostaju u istoj. */
  external?: boolean;
};

const CONTACTS: Contact[] = [
  {
    label: "Instagram",
    value: "@sefa_org",
    href: "https://www.instagram.com/sefa_org/",
    external: true,
  },
  {
    label: "LinkedIn",
    value: "SEFA",
    href: "https://www.linkedin.com/company/sefa-org/",
    external: true,
  },
  {
    label: "Facebook",
    value: "sefa.org",
    href: "https://www.facebook.com/sefa.org/",
    external: true,
  },
  {
    label: "YouTube",
    value: "@sefa-org",
    href: "https://www.youtube.com/@sefa-org",
    external: true,
  },
  {
    label: "Email",
    value: "office@sefa.org.rs",
    href: "mailto:office@sefa.org.rs",
  },
  {
    label: "Telefon",
    value: "+381 63 1521141",
    href: "tel:+381631521141",
  },
  {
    label: "Lokacija",
    value: "Kamenička 6, Beograd",
    href: "https://maps.google.com/?q=Kamenička+6+Beograd",
    external: true,
  },
];

/* ---------- mere sa fotografije ----------
   Izmereno na `public/kontakt-telefon.webp` (2000 × 2000): ekran zauzima
   x 663–1370, y 186–1715, a vrh telefona je na y 147. Sve kao udeo slike. */

const PHOTO = {
  /** Vidljivi ekran telefona. */
  screenLeft: 0.3315,
  screenTop: 0.093,
  screenWidth: 0.354,
  screenHeight: 0.765,
  /** Gornja ivica telefona — od nje zavisi koliko uvećanja treba na početku. */
  phoneTop: 0.0735,
} as const;

/* ---------- tempo scene (udeo napretka kroz sekciju, 0 → 1) ---------- */

/** Dok traje ovo, kadar mirno stoji na uvećanom ekranu. */
const ZOOM_START = 0.1;
/** Do ovde se ekran odzumira i telefon je na svom mestu. */
const ZOOM_END = 0.64;
/** Telefon (fotografija) se pojavljuje oko sadržaja u ovom rasponu. */
const FRAME_IN_START = 0.1;
const FRAME_IN_END = 0.32;
/** Tekst oko telefona (nadnaslov, opis, „Skroluj”) se povlači. */
const NOTE_OUT_START = 0.04;
const NOTE_OUT_END = 0.2;
/** Kontakti na ekranu se otkrivaju iznad ovog praga, sakrivaju ispod donjeg. */
const ROWS_ON = 0.66;
const ROWS_OFF = 0.6;

/**
 * Telefon prvo sedne malo manji od svoje veličine, pa se u završnom delu
 * primakne na tačno 1 — kratko „sleganje” na kraju putovanja. Krajnje stanje
 * je tačno 1 da bi tekst na ekranu ostao oštar dok se čita.
 */
const LAND_SCALE = 0.975;
const SETTLE_END = 0.82;

/** Granice početnog uvećanja — pravu vrednost daje merenje kadra. */
const ZOOM_MIN = 1.35;
const ZOOM_MAX = 7;

/** Koliko slika kasni za skrolom (manje = mekše, više = zalepljeno za skrol). */
const SCRUB = 0.16;

const clamp = (v: number, lo: number, hi: number) =>
  v < lo ? lo : v > hi ? hi : v;

/** Smootherstep — miran start, brza sredina, meko zaustavljanje. */
const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

/** Rastojanje od vrha okvira do elementa, u merama rasporeda (bez uvećanja). */
const offsetInside = (el: HTMLElement, root: HTMLElement) => {
  let top = 0;
  for (
    let node: HTMLElement | null = el;
    node && node !== root;
    node = node.offsetParent as HTMLElement | null
  ) {
    top += node.offsetTop;
  }
  return top;
};

export function ContactScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  /** Kad fokus (tastatura) uđe u telefon, scena odmah ide u završno stanje. */
  const focusedRef = useRef(false);
  const requestRef = useRef<() => void>(() => {});

  const [mode, setMode] = useState<"static" | "scroll">("static");
  const [rows, setRows] = useState(false);

  // bez JS-a i uz „smanjeno kretanje” ostaje statični raspored
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMode(reduced.matches ? "static" : "scroll");

    sync();
    reduced.addEventListener("change", sync);
    return () => reduced.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const phone = phoneRef.current;
    const screen = screenRef.current;
    const brand = brandRef.current;
    const title = titleRef.current;
    if (!section || !stage || !phone || !screen || !brand || !title) return;

    if (mode !== "scroll") {
      setRows(true);
      return;
    }

    /**
     * Početni kadar se ne pogađa fiksnim brojem nego se izmeri, jer zavisi i od
     * veličine telefona i od oblika prozora. Tri uslova:
     *   1. ekran telefona mora da pokrije širinu kadra,
     *   2. gornja ivica telefona treba da ostane iznad kadra,
     *   3. naslov mora ceo da stane u širinu kadra.
     * Prva dva guraju uvećanje naviše, treći ga ograničava odozgo.
     */
    let zoom = ZOOM_MIN;
    /** Koliko se telefon spusti na početku da bi naslov bio u sredini kadra. */
    let drop = 0;

    const measure = () => {
      const vw = stage.clientWidth;
      const vh = stage.clientHeight;
      const boxH = phone.offsetHeight;
      const screenW = screen.offsetWidth || 1;
      // sredina bloka sa logom i naslovom, mereno od vrha okvira sa slikom
      const brandMid = offsetInside(brand, phone) + brand.offsetHeight / 2 || 1;
      // `offsetWidth` ne oseća transformaciju, pa je ovo prava širina reda
      const titleW = title.offsetWidth || 1;
      // sredina okvira u kadru i vrh samog telefona na fotografiji
      const boxMid = offsetInside(phone, stage) + boxH / 2;
      const phoneTop = PHOTO.phoneTop * boxH;
      // koliko je naslov ispod vrha telefona — od toga zavisi uvećanje na kome
      // vrh telefona izlazi iznad kadra dok je naslov u sredini
      const reach = Math.max(brandMid - phoneTop, 1);

      const cover = (vw / screenW) * 1.04;
      const hideTop = (vh / 2 / reach) * 1.05;
      const titleFits = (vw * 0.86) / titleW;

      zoom = clamp(
        Math.min(Math.max(cover, hideTop), Math.max(titleFits, cover)),
        ZOOM_MIN,
        ZOOM_MAX
      );
      // prvi sabirak podigne naslov tačno u sredinu kadra (okvir sa slikom nije
      // centriran, nego zakačen za vrh), drugi ga drži tamo dok traje uvećanje
      drop = vh / 2 - boxMid + (boxH / 2 - brandMid) * zoom;
    };

    // trenutni (ublaženi) napredak — zaostaje za skrolom i tako daje osećaj
    // težine, ali uvek stiže tačno tamo gde je skrol stao
    let p = 0;
    let primed = false;
    let frame = 0;
    let lastRows = false;

    const paint = () => {
      frame = 0;

      const travel = section.offsetHeight - stage.offsetHeight;
      const raw =
        travel <= 0
          ? 0
          : clamp(-section.getBoundingClientRect().top / travel, 0, 1);
      const target = focusedRef.current ? 1 : raw;

      if (!primed) {
        p = target;
        primed = true;
      } else {
        p += (target - p) * SCRUB;
      }

      const out = ease(clamp((p - ZOOM_START) / (ZOOM_END - ZOOM_START), 0, 1));
      const settle = ease(clamp((p - ZOOM_END) / (SETTLE_END - ZOOM_END), 0, 1));
      const frameIn = ease(
        clamp((p - FRAME_IN_START) / (FRAME_IN_END - FRAME_IN_START), 0, 1)
      );
      const note = ease(
        clamp((p - NOTE_OUT_START) / (NOTE_OUT_END - NOTE_OUT_START), 0, 1)
      );

      const style = section.style;
      style.setProperty(
        "--s",
        (
          LAND_SCALE +
          (zoom - LAND_SCALE) * (1 - out) +
          (1 - LAND_SCALE) * settle
        ).toFixed(4)
      );
      style.setProperty("--ty", (drop * (1 - out)).toFixed(1));
      style.setProperty("--frame", frameIn.toFixed(3));
      style.setProperty("--note", note.toFixed(3));
      style.setProperty("--p", p.toFixed(4));

      // prag sa razmakom (0.60 / 0.66) da se lista ne pali i gasi na granici
      const nextRows = p > ROWS_ON ? true : p < ROWS_OFF ? false : lastRows;
      if (nextRows !== lastRows) {
        lastRows = nextRows;
        setRows(nextRows);
      }

      // crtaj dok ublaženi napredak ne stigne do skrola
      if (Math.abs(target - p) > 0.0004) frame = requestAnimationFrame(paint);
    };

    const request = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    requestRef.current = request;

    const remeasure = () => {
      measure();
      request();
    };

    measure();
    paint();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", remeasure);
    // veličina telefona zavisi od visine kadra, a fontovi stižu naknadno
    const observer = new ResizeObserver(remeasure);
    observer.observe(phone);
    return () => {
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", remeasure);
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      ["--s", "--ty", "--frame", "--note", "--p"].forEach((name) =>
        section.style.removeProperty(name)
      );
    };
  }, [mode]);

  return (
    <section
      ref={sectionRef}
      className="cs"
      data-mode={mode}
      data-rows={rows ? "in" : undefined}
      aria-labelledby="kontakt-naslov"
    >
      <div className="cs__stage" ref={stageRef}>
        <div className="cs__grain" aria-hidden="true" />

        <p className="cs__kicker">Kontakt</p>

        <div
          className="cs__scene"
          onFocus={() => {
            focusedRef.current = true;
            requestRef.current();
          }}
          onBlur={() => {
            focusedRef.current = false;
            requestRef.current();
          }}
        >
          <div className="cs__phone" ref={phoneRef}>
            <Image
              src="/kontakt-telefon.webp"
              alt=""
              width={2000}
              height={2000}
              priority
              className="cs__photo"
            />

            <div className="cs__screen" ref={screenRef}>
              <span className="cs__notch" aria-hidden="true" />

              <div className="cs__app">
                <div className="cs__brand" ref={brandRef}>
                  <Image
                    src="/logo.png"
                    alt="SEFA"
                    width={2453}
                    height={900}
                    priority
                    className="cs__logo"
                  />
                  <h1 id="kontakt-naslov" className="cs__title" ref={titleRef}>
                    Javi nam se
                  </h1>
                </div>

                <ul className="cs__list">
                  {CONTACTS.map((contact, i) => (
                    <li
                      key={contact.label}
                      className="cs__row"
                      style={{ "--i": i } as React.CSSProperties}
                    >
                      <a
                        className="cs__link"
                        href={contact.href}
                        {...(contact.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        <span className="cs__label">{contact.label}</span>
                        <span className="cs__value">{contact.value}</span>
                        <span className="cs__arrow" aria-hidden="true">
                          ↗
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <span className="cs__glass" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="cs__note">
          <p className="cs__lead">
            Sva pitanja, predlozi i saradnje su dobrodošli, pronađi nas na
            društvenim mrežama ili prođi kroz kontakt podatke ispod.
          </p>
          <p className="cs__hint" aria-hidden="true">
            <span className="cs__hint-line" />
            Skroluj
          </p>
        </div>
      </div>
    </section>
  );
}
