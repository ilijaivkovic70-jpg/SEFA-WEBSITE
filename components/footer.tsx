"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/* Adrese naloga — ako se neki nalog promeni, menja se samo `href`. */
const SOCIAL_LINKS = [
  {
    href: "https://www.instagram.com/sefa_org/",
    label: "Instagram",
    brand: "instagram",
    icon: InstagramGlyph,
  },
  {
    href: "https://www.youtube.com/@sefa-org",
    label: "YouTube",
    brand: "youtube",
    icon: YouTubeGlyph,
  },
  {
    href: "https://www.linkedin.com/company/sefa-org/",
    label: "LinkedIn",
    brand: "linkedin",
    icon: LinkedInGlyph,
  },
];

/* Traka se vrti tako što se ista grupa linkova iscrta dva puta jednu do
   druge, a ceo koloseg se pomera za tačno svoju polovinu — u trenutku kad
   prva grupa isklizne, druga je na njenom mestu i skok se ne vidi.
   Unutar jedne grupe lista se ponavlja tri puta da bi bila šira od ekrana
   i na velikim monitorima. */
const MARQUEE_GROUP = [...SOCIAL_LINKS, ...SOCIAL_LINKS, ...SOCIAL_LINKS];

/* ---------- talas ----------
   Traka ne ide ravno: linkovi i rombovi „jašu” po nevidljivom sinusnom
   talasu koji i sam polako putuje. Talas je vezan za ekran, ne za linkove, pa se svaki
   link penje i spušta dok prolazi kroz brežuljke i doline. */
/** Dužina jednog talasa, u pikselima; kraća na telefonu da se vidi bar jedan ceo. */
const WAVE_LENGTH = 760;
const WAVE_LENGTH_SMALL = 420;
/** Visina talasa (od sredine do vrha), u pikselima; manja na telefonu. */
const WAVE_HEIGHT = 16;
const WAVE_HEIGHT_SMALL = 10;
/** Brzina kojom se sam talas pomera (radijana u sekundi). */
const WAVE_SPEED = 0.9;

function MarqueeGroup({ hidden }: { hidden?: boolean }) {
  return (
    <ul className="marquee__group" aria-hidden={hidden || undefined}>
      {MARQUEE_GROUP.map((link, index) => (
        <li key={`${link.label}-${index}`} className="marquee__item">
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={hidden ? -1 : undefined}
            className="marquee__link"
            data-wave
          >
            <span className="marquee__icon" data-brand={link.brand}>
              <link.icon />
            </span>
            <span className="marquee__label">{link.label}</span>
            <span aria-hidden="true" className="marquee__arrow">
              ↗
            </span>
          </a>
          <span aria-hidden="true" className="marquee__sep" data-wave />
        </li>
      ))}
    </ul>
  );
}

function useWave(rootRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const riders = Array.from(root.querySelectorAll<HTMLElement>("[data-wave]"));
    let frame = 0;
    let visible = false;
    let hovered = false;
    let clock = 0;
    let last = 0;

    const tick = (now: number) => {
      frame = 0;
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      if (!hovered) clock += dt;

      const box = root.getBoundingClientRect();
      const amp = box.width < 640 ? WAVE_HEIGHT_SMALL : WAVE_HEIGHT;
      const k =
        (Math.PI * 2) / (box.width < 640 ? WAVE_LENGTH_SMALL : WAVE_LENGTH);
      const shift = clock * WAVE_SPEED;
      const yAt = (x: number) => amp * Math.sin(k * x - shift);

      for (const el of riders) {
        const r = el.getBoundingClientRect();
        const x = r.left + r.width / 2 - box.left;
        if (x < -200 || x > box.width + 200) continue;
        const y = yAt(x);
        // nagib talasa u toj tački — link se blago naginje uz brdo i niz njega
        const tilt = (Math.atan(amp * k * Math.cos(k * x - shift)) * 180) / Math.PI;
        el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) rotate(${(tilt * 0.35).toFixed(2)}deg)`;
      }

      if (visible) frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (!frame) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    io.observe(root);

    const enter = () => (hovered = true);
    const leave = () => (hovered = false);
    root.addEventListener("pointerenter", enter);
    root.addEventListener("pointerleave", leave);

    return () => {
      io.disconnect();
      root.removeEventListener("pointerenter", enter);
      root.removeEventListener("pointerleave", leave);
      if (frame) cancelAnimationFrame(frame);
      riders.forEach((el) => (el.style.transform = ""));
    };
  }, [rootRef]);
}

function Marquee() {
  const rootRef = useRef<HTMLDivElement>(null);
  useWave(rootRef);

  return (
    <div className="marquee" ref={rootRef}>
      <div className="marquee__track">
        <MarqueeGroup />
        <MarqueeGroup hidden />
      </div>
    </div>
  );
}

export function Footer() {
  /* Kontakt stranica već pokazuje iste naloge kao ikonice na ekranu
     telefona — traka bi tu bila dupla, pa se na njoj ne prikazuje. */
  const isKontakt = usePathname() === "/kontakt";

  return (
    <footer className="border-t">
      {isKontakt ? null : <Marquee />}

      <div className="border-t">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} SEFA. Sva prava zadržana.
        </p>
      </div>
    </footer>
  );
}

/* ---------- znaci mreža ----------
   Pravi logotipi u bojama brendova, nacrtani kao mali inline `<svg>`.
   Pozadina pločice (gradijent Instagrama, plava LinkedIna) je u CSS-u. */

function InstagramGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.7" y="3.7" width="16.6" height="16.6" rx="5" stroke="#fff" strokeWidth="1.9" />
      <circle cx="12" cy="12" r="3.9" stroke="#fff" strokeWidth="1.9" />
      <circle cx="17.1" cy="6.9" r="1.2" fill="#fff" />
    </svg>
  );
}

function YouTubeGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#f00"
        d="M22.54 7.42a2.78 2.78 0 0 0-1.95-1.97C18.88 5 12 5 12 5s-6.88 0-8.59.45a2.78 2.78 0 0 0-1.95 1.97A29.1 29.1 0 0 0 1 12a29.1 29.1 0 0 0 .46 4.58 2.78 2.78 0 0 0 1.95 1.97C5.12 19 12 19 12 19s6.88 0 8.59-.45a2.78 2.78 0 0 0 1.95-1.97A29.1 29.1 0 0 0 23 12a29.1 29.1 0 0 0-.46-4.58Z"
      />
      <path fill="#fff" d="M9.75 15.02 15.52 12 9.75 8.98v6.04Z" />
    </svg>
  );
}

function LinkedInGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#fff"
        d="M6.94 8.9v11.2H3.2V8.9h3.74Zm.24-3.46a2.06 2.06 0 1 1-4.12 0 2.06 2.06 0 0 1 4.12 0Zm13.22 8.24v6.42h-3.73v-5.99c0-1.5-.54-2.53-1.89-2.53-1.03 0-1.64.69-1.91 1.36-.1.24-.12.57-.12.9v6.26H9.02V8.9h3.73v1.6c.5-.77 1.38-1.87 3.37-1.87 2.46 0 4.28 1.6 4.28 5.05Z"
      />
    </svg>
  );
}
