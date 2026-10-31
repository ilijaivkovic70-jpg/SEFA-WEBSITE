"use client";

import { usePathname } from "next/navigation";

/* Adrese naloga — ako se neki nalog promeni, menja se samo `href`. */
const SOCIAL_LINKS = [
  {
    href: "https://www.instagram.com/sefa_org/",
    label: "Instagram",
    icon: InstagramGlyph,
  },
  {
    href: "https://www.youtube.com/@sefa-org",
    label: "YouTube",
    icon: YouTubeGlyph,
  },
  {
    href: "https://www.linkedin.com/company/sefa-org/",
    label: "LinkedIn",
    icon: LinkedInGlyph,
  },
];

/* Traka se vrti tako što se ista grupa linkova iscrta dva puta jednu do
   druge, a ceo koloseg se pomera za tačno svoju polovinu — u trenutku kad
   prva grupa isklizne, druga je na njenom mestu i skok se ne vidi.
   Unutar jedne grupe lista se ponavlja tri puta da bi bila šira od ekrana
   i na velikim monitorima. */
const MARQUEE_GROUP = [...SOCIAL_LINKS, ...SOCIAL_LINKS, ...SOCIAL_LINKS];

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
          >
            <span className="marquee__icon">
              <link.icon />
            </span>
            <span className="marquee__label">{link.label}</span>
            <span aria-hidden="true" className="marquee__arrow">
              ↗
            </span>
          </a>
          <span aria-hidden="true" className="marquee__sep" />
        </li>
      ))}
    </ul>
  );
}

export function Footer() {
  /* Kontakt stranica već pokazuje iste naloge kao ikonice na ekranu
     telefona — traka bi tu bila dupla, pa se na njoj ne prikazuje. */
  const isKontakt = usePathname() === "/kontakt";

  return (
    <footer className="border-t">
      {isKontakt ? null : (
        <div className="marquee">
          <div className="marquee__track">
            <MarqueeGroup />
            <MarqueeGroup hidden />
          </div>
        </div>
      )}

      <div className="border-t">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} SEFA. Sva prava zadržana.
        </p>
      </div>
    </footer>
  );
}

/* ---------- znaci mreža ----------
   Lucide više ne isporučuje logotipe brendova, pa svaki stoji ovde kao
   mali inline `<svg>`. Boja se nasleđuje preko `currentColor`. */

function InstagramGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YouTubeGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="4.5" />
      <path d="M10.2 9.3l5 2.7-5 2.7V9.3z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M7.8 10.4V17" />
      <path d="M11.6 17v-3.6c0-1.2.8-2 1.9-2s1.9.8 1.9 2V17" />
      <path d="M11.6 10.4V17" />
      <circle cx="7.8" cy="7.4" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}
