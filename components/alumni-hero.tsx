"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { ALUMNI_HERO, ALUMNI_PASS } from "@/data/alumni";
import { AlumniBrand } from "@/components/alumni-brand";
import { AlumniRack, type RackBadge, type RackLayout } from "@/components/alumni-rack";
import { COLORS, drawHeroBack, drawHeroFront } from "@/lib/alumni-badges/draw";

/**
 * Hero Alumni stranice: naslov i uvod levo, a desno sa vrha ekrana visi
 * velika mint alumni akreditacija na traci (3D, components/alumni-rack.tsx).
 * Kartica uleti sa strane, ljulja se i može da se uhvati i zavrti.
 *
 * Na telefonu kartica visi na sredini iznad teksta.
 * Sav tekst je u `data/alumni.ts` (ALUMNI_HERO, ALUMNI_PASS).
 */

const BADGES: RackBadge[] = [
  {
    id: "alumni",
    stock: COLORS.mint,
    edge: "#d6efe9",
    front: (ctx, w, h, f) =>
      drawHeroFront(ctx, w, h, f, {
        label: ALUMNI_PASS.label,
        title: ALUMNI_PASS.title,
        count: ALUMNI_HERO.count,
        countSuffix: ALUMNI_HERO.countSuffix,
        countLabel: ALUMNI_HERO.countLabel,
        nameField: ALUMNI_PASS.nameField,
        sinceField: ALUMNI_PASS.sinceField,
        sinceValue: ALUMNI_PASS.sinceValue,
        validField: ALUMNI_PASS.validField,
        validValue: ALUMNI_PASS.validValue,
        footer: ALUMNI_PASS.footer,
      }),
    back: (ctx, w, h, f) =>
      drawHeroBack(ctx, w, h, f, {
        label: `${ALUMNI_PASS.label} · ${ALUMNI_HERO.count}${ALUMNI_HERO.countSuffix}`,
        line: ALUMNI_PASS.footer.replace(" · ", ". ") + ".",
      }),
  },
];

/** Granica telefon / računar — ista kao u globals.css (48rem). */
const MOBILE = 768;

const layout: RackLayout = (w, h) => {
  if (w < MOBILE) {
    const width = Math.min(190, w * 0.46);
    return { width, slots: [{ x: w * 0.5, y: -40, length: 110 }] };
  }
  const width = Math.min(340, Math.max(220, w * 0.21));
  const bh = width * 1.42;
  return {
    width,
    slots: [{ x: w * 0.76, y: -40, length: Math.max(120, h * 0.56 - bh * 0.5) }],
  };
};

export function AlumniHero() {
  const [gl, setGl] = useState<"on" | "off">("on");

  return (
    <section className="ak-hero" aria-labelledby="alumni-naslov" data-gl={gl}>
      <AlumniRack
        className="ak-hero__rack"
        badges={BADGES}
        layout={layout}
        strapText={ALUMNI_PASS.strap}
        strapWidth={0.12}
        onGl={(ok) => setGl(ok ? "on" : "off")}
      />

      <div className="ak-hero__inner">
        <h1 id="alumni-naslov" className="ak-hero__title">
          {ALUMNI_HERO.titleLines.map((line) => (
            <span key={line} className="ak-hero__line">
              <AlumniBrand>{line}</AlumniBrand>
            </span>
          ))}
        </h1>

        <p className="ak-hero__lead">
          <AlumniBrand>{ALUMNI_HERO.lead}</AlumniBrand>
        </p>

        <div className="ak-hero__foot">
          <Link href={ALUMNI_HERO.cta.href} className="ak-btn btn btn-primary">
            {ALUMNI_HERO.cta.label}
            <ArrowRight className="ak-btn__icon" aria-hidden="true" />
          </Link>
          {/* broj članova je odštampan na akreditaciji; tekst ostaje samo bez WebGL-a */}
          {gl === "off" && (
            <p className="ak-hero__count">
              <strong>
                {ALUMNI_HERO.count}
                {ALUMNI_HERO.countSuffix}
              </strong>{" "}
              {ALUMNI_HERO.countLabel.toLowerCase()}
            </p>
          )}
        </div>

      </div>
    </section>
  );
}
