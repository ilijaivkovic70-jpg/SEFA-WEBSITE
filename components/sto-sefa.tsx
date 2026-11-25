"use client";

import { useEffect, useRef } from "react";
import { SEKTORI, type SektorId } from "@/data/postani-clan";

/**
 * Okrugli sto SEFA-e, pogled odozgo. Oko stola sede članovi, podeljeni u
 * tri sektora, i u svakom sektoru ima jedno prazno mesto. Jedna isprekidana
 * stolica („ti”) čeka ispod stola; dok posetilac odgovara na kviz, ona
 * kruži oko stola ka sektoru koji mu najviše leži, a na kraju sedne
 * na prazno mesto.
 *
 * Tačke su simbol zajednice, ne broj članova.
 */

export type StoFaza = "ceka" | "bira" | "sedi";

type Props = {
  sektor: SektorId | null;
  faza: StoFaza;
  /** Mala verzija (u kvizu na telefonu): bez natpisa sektora. */
  mali?: boolean;
  className?: string;
};

/* ---------- geometrija (centar stola je 200, 200) ---------- */

const C = 200; // centar stola
const R_STO = 110; // poluprečnik stola
const R_MESTA = 150; // gde stoje stolice
const R_LEBDI = 184; // stolica „ti” dok bira, malo dalje od stola
const R_CEKA = 196; // stolica „ti” na početku, ispod stola
const R_NATPIS = 240;

/** Ugao centra svakog sektora (0° je desno, raste u smeru kazaljke). */
const UGAO: Record<SektorId, number> = {
  "ljudski-resursi": 270,
  sponzorstva: 30,
  komunikacije: 150,
};
const UGAO_CEKA = 90;
const RAZMAK = 15; // stepeni između dve stolice
const MESTA_PO_STRANI = 3; // stolica levo i desno od praznog mesta

const rad = (u: number) => (u * Math.PI) / 180;
const tacka = (u: number, r: number) => ({ x: C + r * Math.cos(rad(u)), y: C + r * Math.sin(rad(u)) });

/** Stolica „ti” se samo pomera, ne okreće, da natpis uvek stoji uspravno. */
const transformTi = (u: number, r: number) => {
  const { x, y } = tacka(u, r);
  return `translate(${x.toFixed(2)} ${y.toFixed(2)})`;
};

/** Stolica okrenuta ka centru stola. */
const transformStolice = (u: number, r: number) => {
  const { x, y } = tacka(u, r);
  return `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${(u + 90).toFixed(2)})`;
};

function luk(u1: number, u2: number, r: number) {
  const a = tacka(u1, r);
  const b = tacka(u2, r);
  return `M${a.x.toFixed(2)} ${a.y.toFixed(2)} A${r} ${r} 0 0 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
}

const MESTA = SEKTORI.flatMap((s) =>
  Array.from({ length: MESTA_PO_STRANI * 2 }, (_, i) => {
    const pomak = i < MESTA_PO_STRANI ? i - MESTA_PO_STRANI : i - MESTA_PO_STRANI + 1;
    return { sektor: s.id, ugao: UGAO[s.id] + pomak * RAZMAK };
  })
);

const izi = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)); // ease-out expo

export function StoSefa({ sektor, faza, mali = false, className }: Props) {
  const tiRef = useRef<SVGGElement>(null);
  const poz = useRef({ u: UGAO_CEKA, r: R_CEKA });

  // stolica „ti” putuje po luku oko stola, nikad preko njega
  useEffect(() => {
    const g = tiRef.current;
    if (!g) return;
    const cilj =
      faza === "ceka" || !sektor
        ? { u: UGAO_CEKA, r: R_CEKA }
        : { u: UGAO[sektor], r: faza === "sedi" ? R_MESTA : R_LEBDI };

    const od = { ...poz.current };
    let razlika = ((cilj.u - od.u + 540) % 360) - 180; // najkraći put
    if (Math.abs(razlika) < 0.01) razlika = 0;

    const smanjeno = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (smanjeno) {
      poz.current = cilj;
      g.setAttribute("transform", transformTi(cilj.u, cilj.r));
      return;
    }

    const trajanje = 700 + Math.abs(razlika) * 5;
    const start = performance.now();
    let frame = 0;
    const korak = (sad: number) => {
      const t = Math.min(1, (sad - start) / trajanje);
      const e = izi(t);
      const u = od.u + razlika * e;
      // u sredini puta stolica se malo odmakne od stola, pa se vrati
      const r = od.r + (cilj.r - od.r) * e + Math.sin(Math.PI * t) * Math.min(18, Math.abs(razlika) / 6);
      poz.current = { u: (u + 360) % 360, r };
      g.setAttribute("transform", transformTi(u, r));
      if (t < 1) frame = requestAnimationFrame(korak);
      else poz.current = { u: (cilj.u + 360) % 360, r: cilj.r };
    };
    frame = requestAnimationFrame(korak);
    return () => cancelAnimationFrame(frame);
  }, [sektor, faza]);

  return (
    <div className={`pc-sto ${className ?? ""}`} data-faza={faza} data-mali={mali ? "da" : "ne"}>
      <svg viewBox={mali ? "-20 -20 440 440" : "-66 -60 532 492"} className="pc-sto__svg" aria-hidden="true">
        {/* sto */}
        <circle cx={C} cy={C} r={R_STO} className="pc-sto__ploca" />
        <circle cx={C} cy={C} r={R_STO - 14} className="pc-sto__rub" />
        <image href="/logo.png" x={C - 62} y={C - 23} width={124} height={45.5} className="pc-sto__logo" />

        {/* lukovi sektora uz ivicu stola */}
        {SEKTORI.map((s) => (
          <path
            key={s.id}
            d={luk(UGAO[s.id] - 52, UGAO[s.id] + 52, R_STO + 8)}
            className="pc-sto__luk"
            data-vodeci={sektor === s.id ? "da" : "ne"}
          />
        ))}

        {/* članovi */}
        {MESTA.map((m, i) => (
          <g key={i} transform={transformStolice(m.ugao, R_MESTA)}>
            <rect
              x={-13}
              y={-9}
              width={26}
              height={18}
              rx={6}
              className="pc-sto__clan"
              data-vodeci={sektor === m.sektor ? "da" : "ne"}
              style={{ "--d": `${(i % (MESTA_PO_STRANI * 2)) * 55 + Math.floor(i / 6) * 120}ms` } as React.CSSProperties}
            />
          </g>
        ))}

        {/* prazna mesta, po jedno u svakom sektoru */}
        {SEKTORI.map((s) => (
          <g key={s.id} transform={transformStolice(UGAO[s.id], R_MESTA)}>
            <rect
              x={-13}
              y={-9}
              width={26}
              height={18}
              rx={6}
              className="pc-sto__prazno"
              data-vodeci={sektor === s.id ? "da" : "ne"}
            />
          </g>
        ))}

        {/* natpisi sektora */}
        {!mali &&
          SEKTORI.map((s) => {
            const { x, y } = tacka(UGAO[s.id], R_NATPIS);
            return (
              <text
                key={s.id}
                x={x}
                y={y + 4}
                textAnchor="middle"
                className="pc-sto__natpis"
                data-vodeci={sektor === s.id ? "da" : "ne"}
              >
                {s.naziv}
              </text>
            );
          })}

        {/* ti */}
        <g ref={tiRef} transform={transformTi(UGAO_CEKA, R_CEKA)}>
          <g className="pc-sto__ti">
            <rect x={-14} y={-14} width={28} height={28} rx={9} />
            {!mali && (
              <text y={4.5} textAnchor="middle">
                ti
              </text>
            )}
          </g>
        </g>
      </svg>
    </div>
  );
}
