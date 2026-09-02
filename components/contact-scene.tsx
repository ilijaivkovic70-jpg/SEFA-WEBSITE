"use client";

import Image from "next/image";
import { type ReactNode, useEffect, useRef, useState } from "react";

/**
 * Sekcija „Javi nam se” — kontakt scena u kojoj se ekran telefona odzumira.
 *
 * KONTAKT PODACI SE MENJAJU U NIZU `APPS` ISPOD. Ovde je sve ostalo samo
 * kretanje i raspored.
 *
 * Ideja: ono što se na početku vidi preko cele stranice — veliki SEFA logo i
 * „JAVI NAM SE” — zapravo je ekran telefona, samo jako uveličan. Skrol taj
 * kadar odzumira: telefon se pojavljuje u ruci, sve se smanjuje i sedne u
 * sredinu ekrana, pa se tek onda pali početni ekran sa aplikacijama.
 *
 * Telefon je fotografija (`public/kontakt-telefon.webp`, ruka koja drži telefon
 * praznog ekrana, Unsplash licenca), a preko njenog ekrana stoji naš pravi HTML
 * sadržaj — zato su aplikacije klikabilne i oštre na svakoj veličini. Fotografija
 * je nakrivljena 0.66°, pa je CSS uspravlja (`.cs__photo`); mere ekrana na tako
 * uspravljenoj slici su u `PHOTO` ispod, i ako se fotografija ikad zameni,
 * menjaju se samo ti brojevi (i ugao).
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
 *      Telefon stoji u svojoj veličini, sa svim aplikacijama. Bez sticky
 *      kadra, bez uvećanja i bez pomeranja — sadržaj je odmah čitljiv.
 *
 * Jedan `requestAnimationFrame` ciklus i jedan slušalac skrola; animiraju se
 * samo `transform` i `opacity`.
 */

/* ---------- aplikacije na ekranu ----------
   Sve što je na ekranu telefona je aplikacija: četiri mreže i tri prečice do
   kontakta. Isti nalozi kao u traci u podnožju (`components/footer.tsx`) — ako
   se neki podatak promeni, menja se `href` (i `detail`) ovde.

   Crteži su inline SVG, bez fajlova i bez mreže, da ostanu oštri i kada je
   ekran uvećan preko cele stranice. Boju pločice daje `data-app` u
   `app/globals.css`. */

type App = {
  /** Bira boju pločice u CSS-u i služi kao ključ u listi. */
  id: string;
  /** Ime ispod ikonice, kao na početnom ekranu telefona. */
  name: string;
  /** Nalog, adresa ili broj — stoji u `title` i u opisu za čitač ekrana. */
  detail: string;
  href: string;
  /** Mreže i mapa se otvaraju u novoj kartici; mailto i tel ostaju u istoj. */
  external?: boolean;
  /** Stoji u traci pri dnu ekrana, bez imena — kao dok na pravom telefonu. */
  dock?: boolean;
  icon: ReactNode;
};

const APPS: App[] = [
  {
    id: "instagram",
    name: "Instagram",
    detail: "@sefa_org",
    href: "https://www.instagram.com/sefa_org/",
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect
          x="3.7"
          y="3.7"
          width="16.6"
          height="16.6"
          rx="5"
          stroke="#fff"
          strokeWidth="1.9"
        />
        <circle cx="12" cy="12" r="3.9" stroke="#fff" strokeWidth="1.9" />
        <circle cx="17.1" cy="6.9" r="1.2" fill="#fff" />
      </svg>
    ),
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    detail: "SEFA",
    href: "https://www.linkedin.com/company/sefa-org/",
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#fff"
          d="M6.94 8.9v11.2H3.2V8.9h3.74Zm.24-3.46a2.06 2.06 0 1 1-4.12 0 2.06 2.06 0 0 1 4.12 0Zm13.22 8.24v6.42h-3.73v-5.99c0-1.5-.54-2.53-1.89-2.53-1.03 0-1.64.69-1.91 1.36-.1.24-.12.57-.12.9v6.26H9.02V8.9h3.73v1.6c.5-.77 1.38-1.87 3.37-1.87 2.46 0 4.28 1.6 4.28 5.05Z"
        />
      </svg>
    ),
  },
  {
    id: "facebook",
    name: "Facebook",
    detail: "sefa.org",
    href: "https://www.facebook.com/sefa.org/",
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#fff"
          d="M15.12 5.32H17V2.14A26.11 26.11 0 0 0 14.26 2C11.54 2 9.68 3.66 9.68 6.7v2.62H6.61v3.56h3.07V22h3.68v-9.12h3.06l.46-3.56h-3.52V7.05c0-1.05.28-1.73 1.76-1.73Z"
        />
      </svg>
    ),
  },
  {
    id: "youtube",
    name: "YouTube",
    detail: "@sefa-org",
    href: "https://www.youtube.com/@sefa-org",
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#f00"
          d="M22.54 7.42a2.78 2.78 0 0 0-1.95-1.97C18.88 5 12 5 12 5s-6.88 0-8.59.45a2.78 2.78 0 0 0-1.95 1.97A29.1 29.1 0 0 0 1 12a29.1 29.1 0 0 0 .46 4.58 2.78 2.78 0 0 0 1.95 1.97C5.12 19 12 19 12 19s6.88 0 8.59-.45a2.78 2.78 0 0 0 1.95-1.97A29.1 29.1 0 0 0 23 12a29.1 29.1 0 0 0-.46-4.58Z"
        />
        <path fill="#fff" d="M9.75 15.02 15.52 12 9.75 8.98v6.04Z" />
      </svg>
    ),
  },
  {
    id: "posta",
    name: "Pošta",
    detail: "office@sefa.org.rs",
    href: "mailto:office@sefa.org.rs",
    dock: true,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2.6" y="5.6" width="18.8" height="12.8" rx="2.8" fill="#fff" />
        <path
          d="M4.9 8.4 12 13.3l7.1-4.9"
          fill="none"
          stroke="#0b62dd"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "telefon",
    name: "Telefon",
    detail: "+381 63 1521141",
    href: "tel:+381631521141",
    dock: true,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#fff"
          d="M6.55 3.2a1.65 1.65 0 0 1 2.28.5l1.5 2.38a1.65 1.65 0 0 1-.32 2.15l-1.2.99a.6.6 0 0 0-.15.72 10.6 10.6 0 0 0 5.08 5.08.6.6 0 0 0 .72-.15l.99-1.2a1.65 1.65 0 0 1 2.15-.32l2.38 1.5c.72.46.94 1.4.5 2.28l-.86 1.36c-.5.8-1.46 1.2-2.38.98A17 17 0 0 1 3.9 6.4c-.22-.92.18-1.88.98-2.38l1.67-.82Z"
        />
      </svg>
    ),
  },
  {
    id: "mapa",
    name: "Mapa",
    detail: "Kamenička 6, Beograd",
    href: "https://maps.google.com/?q=Kamenička+6+Beograd",
    external: true,
    dock: true,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#fff"
          d="M12 2.4a6.9 6.9 0 0 0-6.9 6.9c0 4.9 5.98 11.6 6.24 11.88a.9.9 0 0 0 1.32 0c.26-.29 6.24-6.98 6.24-11.88A6.9 6.9 0 0 0 12 2.4Zm0 9.6a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4Z"
        />
      </svg>
    ),
  },
];

/** Jedna ikonica: pločica sa crtežom, a u mreži i ime ispod nje. */
function AppLink({
  app,
  index,
  withName = true,
}: {
  app: App;
  index: number;
  withName?: boolean;
}) {
  return (
    <a
      className="cs__app-link"
      data-app={app.id}
      style={{ "--i": index } as React.CSSProperties}
      href={app.href}
      title={app.detail}
      aria-label={`${app.name} — ${app.detail}`}
      {...(app.external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      <span className="cs__tile">{app.icon}</span>
      {withName ? <span className="cs__app-name">{app.name}</span> : null}
    </a>
  );
}

/* ---------- mere sa fotografije ----------
   Izmereno na `public/kontakt-telefon.webp` (2000 × 2000), pošto CSS uspravi
   nagib od 0.66°: ekran zauzima x 662–1370, y 182–1720, a vrh telefona je na
   y 145. Ovde su iste vrednosti kao u `.cs__screen` (sa jednim pikselom
   preklopa), sve kao udeo slike. */

const PHOTO = {
  /** Vidljivi ekran telefona. */
  screenLeft: 0.3305,
  screenTop: 0.0905,
  screenWidth: 0.355,
  screenHeight: 0.77,
  /** Gornja ivica telefona — od nje zavisi koliko uvećanja treba na početku. */
  phoneTop: 0.0725,
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
    // pre prvog crtanja lista je vidljiva (takvo je osnovno stanje, da radi i
    // bez JS-a) — zato se polazi od stvarnog stanja, inače bi ostala upaljena
    // preko uvećanog ekrana na vrhu sekcije
    let lastRows = section.dataset.rows === "in";

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
            {/* `unoptimized`: fotografija je već pripremljen webp sa providnom
                pozadinom (77 KB), a Next-ov optimizator joj u ovom projektu
                izbaci alfa kanal — providno postane crno, pa telefon i ruka
                nestanu u crnom kvadratu. Ovako se šalje original. */}
            <Image
              src="/kontakt-telefon.webp"
              alt=""
              width={2000}
              height={2000}
              priority
              unoptimized
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
                    unoptimized
                    className="cs__logo"
                  />
                  <h1 id="kontakt-naslov" className="cs__title" ref={titleRef}>
                    Javi nam se
                  </h1>
                </div>

                <div className="cs__apps">
                  {APPS.map((app, i) =>
                    app.dock ? null : (
                      <AppLink key={app.id} app={app} index={i} />
                    )
                  )}
                </div>

                <div className="cs__dock">
                  {APPS.map((app, i) =>
                    app.dock ? (
                      <AppLink key={app.id} app={app} index={i} withName={false} />
                    ) : null
                  )}
                </div>

                <span className="cs__home" aria-hidden="true" />
              </div>

              <span className="cs__glass" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="cs__note">
          <p className="cs__lead">
            Sva pitanja, predlozi i saradnje su dobrodošli, pronađi nas na
            društvenim mrežama ili nam se javi preko aplikacija na ekranu.
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
