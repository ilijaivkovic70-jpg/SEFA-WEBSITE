"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * Zatvorena zelena koverta sa markicom (logo projekta). Klikom se preklop
 * podigne, papir se izvuče i razvije u ceo tekst; dugme „Zatvori pismo“
 * sve vraća unazad. Papir je običan blok u toku stranice (tekst ostaje pravi
 * tekst), a koverta ga samo „drži“.
 *
 * Geometrija je u odnosu na širinu koverte (viewBox 600 x 520).
 */

const VB_W = 600;
const VB_H = 520;
/** linija preloma preklopa, u odnosu na visinu koverte */
const FLAP_Y = 120 / VB_H;
/** gde je gornja ivica papira kad je izvučen */
const PAPER_TOP = 0.2;
/** gde je gornja ivica papira dok je skriven u koverti */
const PAPER_HIDDEN_TOP = 0.55;
/** do kuda se papir vidi iznad dna koverte dok nije razvijen */
const CLOSED_VISIBLE_BOTTOM = 0.9;

/** 0 zatvorena, 1 papir izvučen, 2 razvijen u ceo tekst, 3 se vraća u kovertu */
type Stage = 0 | 1 | 2 | 3;

export function ProjectLetter({
  id,
  paragraphs,
  label,
  logo,
  logoAlt,
}: {
  id?: string;
  paragraphs: string[];
  label: string;
  logo?: string;
  logoAlt: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<Stage>(0);
  const [size, setSize] = useState({ art: 0, paper: 0 });
  const [reduced, setReduced] = useState(false);

  // merenje: visina koverte zavisi od širine, visina papira od teksta
  useEffect(() => {
    const root = rootRef.current;
    const paper = paperRef.current;
    if (!root || !paper) return;
    const measure = () =>
      setSize({
        art: (root.clientWidth * VB_H) / VB_W,
        paper: paper.offsetHeight,
      });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    ro.observe(paper);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true);
    }
  }, []);

  // papir izvučen -> razvija se; vraćanje -> preklop se zatvara
  useEffect(() => {
    if (stage === 1) {
      const t = window.setTimeout(() => setStage(2), reduced ? 0 : 1700);
      return () => window.clearTimeout(t);
    }
    if (stage === 3) {
      const t = window.setTimeout(() => setStage(0), reduced ? 0 : 1300);
      return () => window.clearTimeout(t);
    }
  }, [stage, reduced]);

  const { art, paper } = size;
  const ready = art > 0 && paper > 0;
  const paperTop = art * PAPER_TOP;
  const closedShift = art * (PAPER_HIDDEN_TOP - PAPER_TOP);
  const cutFrom = (top: number) =>
    Math.max(0, paper - (art * CLOSED_VISIBLE_BOTTOM - top));
  const cut =
    stage === 2 || !ready
      ? 0
      : cutFrom(stage === 0 ? art * PAPER_HIDDEN_TOP : paperTop);
  const openHeight = paperTop + paper + 32;

  const ease = "cubic-bezier(0.22, 1, 0.36, 1)";
  const t = (s: number) => (reduced ? 0 : s);

  // otvaranje ide: preklop, pa papir; zatvaranje obrnuto
  const flapOpen = stage !== 0;
  const paperDelay = stage === 1 ? 0.85 : 0;
  const closedFlapStyle = {
    transform: `scaleY(${flapOpen ? 0 : 1})`,
    transition: `transform ${t(0.45)}s ease-in-out ${t(flapOpen ? 0 : 1.15)}s`,
  };
  const openFlapStyle = {
    transform: `scaleY(${flapOpen ? 1 : 0})`,
    transition: `transform ${t(0.45)}s ease-in-out ${t(flapOpen ? 0.4 : 0.8)}s`,
  };

  return (
    <div
      id={id}
      ref={rootRef}
      className="relative mx-auto mt-10 w-full max-w-[560px] scroll-mt-24"
      style={{
        height: ready ? (stage === 2 ? openHeight : art) : undefined,
        transition: `height ${t(1.2)}s ${ease}`,
      }}
      role="group"
      aria-label={label}
    >
      {stage === 0 && (
        <button
          type="button"
          onClick={() => setStage(1)}
          className="group absolute inset-x-0 top-0 z-30 flex cursor-pointer items-end justify-center pb-[7%] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          style={{ height: art || undefined }}
          aria-label={`Otvori kovertu: ${label}`}
        >
          <span className="rounded-full bg-[#f2f0e9] px-5 py-2 text-sm font-medium text-[#1f2a22] shadow-md transition-transform duration-300 group-hover:-translate-y-1">
            Klikni da otvoriš
          </span>
        </button>
      )}

      {/* zadnja strana koverte */}
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="absolute inset-x-0 top-0 z-0 block w-full drop-shadow-[0_18px_28px_rgba(0,0,0,0.22)]"
        aria-hidden
      >
        <rect x="0" y="120" width="600" height="400" rx="3" fill="#245c37" />
      </svg>

      {/* otvoren preklop (iza papira), podiže se kad se koverta otvori */}
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="absolute inset-x-0 top-0 z-0 block w-full"
        style={{ ...openFlapStyle, transformOrigin: `50% ${FLAP_Y * 100}%` }}
        aria-hidden
      >
        <path d="M18 121 L268 18 Q300 4 332 18 L582 121 Z" fill="#1d5230" />
        <path
          d="M18 121 L268 18 Q300 4 332 18 L582 121"
          fill="none"
          stroke="#2c6b41"
          strokeWidth="1.5"
          opacity="0.6"
        />
      </svg>

      {/* papir */}
      <div
        className="relative z-10 mx-auto w-[82%]"
        style={{
          marginTop: paperTop,
          transform: `translateY(${stage === 0 && ready ? closedShift : 0}px)`,
          clipPath: `inset(0 0 ${cut}px 0)`,
          transition: `transform ${t(1.5)}s ${ease} ${t(paperDelay)}s, clip-path ${t(1.5)}s ${ease} ${t(paperDelay)}s, visibility 0s linear ${t(stage === 0 ? 1.4 : stage === 1 ? 0.8 : 0)}s`,
          visibility: stage === 0 && ready ? "hidden" : "visible",
        }}
      >
        <div
          ref={paperRef}
          className="rounded-[3px] bg-[#f2f0e9] px-6 pb-8 pt-9 text-[#1f2a22] shadow-[0_2px_10px_rgba(0,0,0,0.18)] sm:px-9 sm:pt-11"
          style={{
            backgroundImage:
              "radial-gradient(rgba(60,50,30,0.045) 1px, transparent 1.2px)",
            backgroundSize: "5px 5px",
          }}
        >
          <div className="space-y-4 text-[15px] leading-relaxed sm:text-base sm:leading-[1.7]">
            {paragraphs.map((pasus, i) => (
              <p key={i}>{pasus}</p>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => {
                setStage(3);
                rootRef.current?.scrollIntoView({
                  behavior: reduced ? "auto" : "smooth",
                  block: "center",
                });
              }}
              tabIndex={stage === 2 ? 0 : -1}
              className="cursor-pointer rounded-full border border-[#1f2a22]/30 px-5 py-2 text-sm font-medium transition-colors hover:bg-[#1f2a22] hover:text-[#f2f0e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245c37]"
            >
              Zatvori pismo
            </button>
          </div>
        </div>
      </div>

      {/* smotuljak na donjoj ivici papira: papir se odvija (a pri zatvaranju savija) */}
      <div
        className={`pointer-events-none absolute z-[15] h-[26px] -translate-y-full rounded-[13px] shadow-[0_6px_10px_rgba(0,0,0,0.25)] ${stage === 2 && !reduced ? "animate-[roll-fade_1.5s_linear_forwards]" : ""}`}
        style={{
          left: "9%",
          width: "82%",
          top: ready
            ? paperTop + (stage === 0 ? closedShift : 0) + paper - cut
            : 0,
          opacity: stage === 3 && !reduced ? 1 : 0,
          background:
            "linear-gradient(to bottom, #cfcabb 0%, #f7f5ef 35%, #e9e5d9 62%, #b9b4a3 100%)",
          transition: `top ${t(1.5)}s ${ease} ${t(paperDelay)}s, opacity 0.15s linear`,
        }}
        aria-hidden
      />

      {/* prednji džep koverte (ispred papira) */}
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="pointer-events-none absolute inset-x-0 top-0 z-20 block w-full"
        style={{
          opacity: stage === 2 ? 0 : 1,
          transition: `opacity ${t(0.9)}s ease`,
        }}
        aria-hidden
      >
        <path d="M0 120 L222 300 L0 520 Z" fill="#2b6a3e" />
        <path d="M600 120 L378 300 L600 520 Z" fill="#2b6a3e" />
        <path
          d="M222 300 Q232 292 248 292 L352 292 Q368 292 378 300 L600 520 L0 520 Z"
          fill="#2f7344"
        />
        <path
          d="M0 120 L222 300 M600 120 L378 300"
          stroke="#3b8250"
          strokeWidth="1.5"
          opacity="0.55"
          fill="none"
        />
      </svg>

      {/* zatvoren preklop sa markicom: sklapa se kad se koverta otvori */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[25]"
        style={{
          height: art || undefined,
          ...closedFlapStyle,
          transformOrigin: `50% ${FLAP_Y * 100}%`,
        }}
        aria-hidden
      >
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="absolute inset-0 block h-full w-full"
        >
          <path d="M0 120 L600 120 L300 330 Z" fill="#33784a" />
          <path
            d="M0 120 L300 330 L600 120"
            fill="none"
            stroke="#44905c"
            strokeWidth="1.5"
            opacity="0.7"
          />
        </svg>
        <div className="absolute left-1/2 top-[27%] w-[21%] -translate-x-1/2 rotate-[4deg] bg-[#f2f0e9] p-[1.6%] shadow-[0_3px_8px_rgba(0,0,0,0.35)] outline-[3px] outline-offset-[2px] outline-[#f2f0e9] [outline-style:dotted]">
          <div className="flex aspect-[4/5] items-center justify-center bg-zinc-800 p-[12%]">
            {logo && (
              <Image
                src={logo}
                alt={logoAlt}
                width={160}
                height={160}
                unoptimized
                className="h-full w-full object-contain"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
