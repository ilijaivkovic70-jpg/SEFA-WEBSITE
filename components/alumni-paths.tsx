"use client";

import { useState } from "react";
import { CAREER_PATHS, CAREER_PATHS_INTRO } from "@/data/alumni";
import { AlumniBrand } from "@/components/alumni-brand";
import { AlumniRack, type RackBadge, type RackLayout } from "@/components/alumni-rack";
import { COLORS, drawPassBack, drawPathFront, type Stock } from "@/lib/alumni-badges/draw";

/**
 * „Put nakon SEFA-E” — tri akreditacije, po jedna za svaki karijerni put,
 * vise sa iste šipke na različitim dužinama trake: isto iskustvo, tri
 * pravca. Opis svakog puta stoji u HTML-u ispod njegove kartice.
 *
 * Tekst se menja u `data/alumni.ts` (CAREER_PATHS_INTRO, CAREER_PATHS).
 */

const PATHS = CAREER_PATHS.slice(0, 3);

/** tri vrste kartona — svaka akreditacija druge boje */
const STOCKS: (Stock & { edge: string })[] = [
  { stock: COLORS.ink, ink: COLORS.canvas, band: COLORS.mint, bandInk: COLORS.canvas, edge: "#ffffff" },
  { stock: COLORS.mintDeep, ink: COLORS.ink, band: COLORS.canvas, bandInk: COLORS.mint, edge: "#5a9e91" },
  { stock: COLORS.canvas2, ink: COLORS.mint, band: COLORS.mint, bandInk: COLORS.canvas, edge: "#2a3d3a" },
];

const BADGES: RackBadge[] = PATHS.map((path, i) => {
  const s = STOCKS[i % STOCKS.length];
  return {
    id: path.id,
    stock: s.stock,
    edge: s.edge,
    front: (ctx, w, h, f) =>
      drawPathFront(ctx, w, h, f, s, {
        kicker: CAREER_PATHS_INTRO.eyebrow,
        title: path.title,
        band: CAREER_PATHS_INTRO.band,
        footer: CAREER_PATHS_INTRO.title,
      }),
    back: (ctx, w, h, f) =>
      drawPassBack(ctx, w, h, f, s, { label: CAREER_PATHS_INTRO.eyebrow, line: path.description }),
  };
});

/** Ista raspodela kao kolone teksta ispod: šestine širine. */
const X = [1 / 6, 1 / 2, 5 / 6];
const DROP = [0.42, 0.95, 0.66];

export const rackLayout =
  (drops: number[]): RackLayout =>
  (w, h) => {
    const mobile = w < 768;
    const width = mobile ? Math.min(w * 0.29, 150) : Math.min(w * 0.22, 290, (h - 60) / 1.42 / 1.15);
    const free = Math.max(30, h - 24 - width * 1.42 - width * 0.12 - 18);
    return {
      width,
      slots: X.map((x, i) => ({ x: w * x, y: 18, length: 24 + free * drops[i % drops.length] })),
    };
  };

const layout = rackLayout(DROP);

export function AlumniPaths() {
  const [gl, setGl] = useState<"on" | "off">("on");

  return (
    <section className="ak-section" aria-labelledby="put-nakon-sefe" data-gl={gl}>
      <div className="ak-wrap">
        <header className="ak-head">
          <h2 id="put-nakon-sefe" className="ak-h2">
            <AlumniBrand>{CAREER_PATHS_INTRO.title}</AlumniBrand>
          </h2>
          <p className="ak-lead">
            <AlumniBrand>{CAREER_PATHS_INTRO.lead}</AlumniBrand>
          </p>
        </header>

        <div className="ak-stand">
          <div className="ak-stand__bar" aria-hidden="true" />
          <AlumniRack
            badges={BADGES}
            layout={layout}
            strapText="SEFA alumni"
            showHooks
            onGl={(ok) => setGl(ok ? "on" : "off")}
          />
        </div>

        <ol className="ak-cols">
          {PATHS.map((path) => (
            <li key={path.id} className="ak-cols__item">
              <h3 className="ak-cols__name">{path.title}</h3>
              {path.count !== null && (
                <p className="ak-cols__count">
                  {path.count} {CAREER_PATHS_INTRO.countUnit}
                </p>
              )}
              <p className="ak-cols__text">{path.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
