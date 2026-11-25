"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StoFaza } from "@/components/sto-sefa";
import { Sto3D } from "@/components/sto-3d";
import { KVIZ, PRIJAVE, SEKTORI, type SektorId } from "@/data/postani-clan";
import { PROJEKTI } from "@/data/projekti";
import "./postani-clan.css";

/**
 * Gornji deo stranice Postani član: uvod i kviz. Pored njih stoji okrugli
 * sto SEFA-e sa praznom stolicom („ti”) koja se sa svakim odgovorom
 * primiče sektoru koji posetiocu najviše leži. Na desktopu sto stoji
 * zalepljen desno dok se skroluje, na telefonu je u uvodu i u malom
 * obliku pored brojača pitanja.
 */

type Faza = "uvod" | "pitanja" | "rezultat";

const PRAZNI_POENI: Record<SektorId, number> = {
  pr: 0,
  dizajn: 0,
  sponzorstva: 0,
  "ljudski-resursi": 0,
};

/** Sektor sa najviše poena; kod nerešenog vraća oba vodeća. */
function vodeci(poeni: Record<SektorId, number>) {
  const max = Math.max(...Object.values(poeni));
  if (max === 0) return [] as SektorId[];
  return (Object.keys(poeni) as SektorId[]).filter((id) => poeni[id] === max);
}

/** Da li je ekran desktop (sto desno) ili telefon (sto u uvodu). */
function useDesktop() {
  const [desktop, setDesktop] = useState<boolean | null>(null);
  useEffect(() => {
    const q = window.matchMedia("(min-width: 1024px)");
    const sync = () => setDesktop(q.matches);
    sync();
    q.addEventListener("change", sync);
    return () => q.removeEventListener("change", sync);
  }, []);
  return desktop;
}

function skrolujDo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const smanjeno = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: smanjeno ? "auto" : "smooth", block: "start" });
}

export function PostaniClanStudio() {
  const [faza, setFaza] = useState<Faza>("uvod");
  const [korak, setKorak] = useState(0);
  const [izbori, setIzbori] = useState<number[]>([]);
  const [sektor, setSektor] = useState<SektorId | null>(null);
  const [projekat, setProjekat] = useState<string | null>(null);
  const desktop = useDesktop();

  // poeni po sektoru iz dosadašnjih odgovora
  const poeni = useMemo(() => {
    const p = { ...PRAZNI_POENI };
    izbori.forEach((izbor, i) => {
      const s = KVIZ[i]?.odgovori[izbor]?.sektor;
      if (s) p[s] += 1;
    });
    return p;
  }, [izbori]);

  const sektorPodaci = SEKTORI.find((s) => s.id === sektor) ?? null;
  const projekatPodaci = PROJEKTI.find((p) => p.slug === projekat) ?? null;
  const pitanje = KVIZ[korak];
  const stoFaza: StoFaza =
    faza === "rezultat" ? "sedi" : faza === "pitanja" && sektor ? "bira" : "ceka";
  const natpis =
    stoFaza === "sedi" && sektorPodaci
      ? `Tvoje mesto: ${sektorPodaci.naziv}.`
      : stoFaza === "bira" && sektorPodaci
        ? `Tvoja stolica se primiče sektoru ${sektorPodaci.naziv}…`
        : "Za ovim stolom ima mesta i za tebe.";

  /* ---------- kviz ---------- */

  const pocniKviz = (skroluj: boolean) => {
    setFaza("pitanja");
    setKorak(0);
    setIzbori([]);
    setSektor(null);
    if (skroluj) requestAnimationFrame(() => skrolujDo("kviz"));
  };

  const odgovori = (indeks: number) => {
    const novi = [...izbori.slice(0, korak), indeks];
    setIzbori(novi);
    const odgovor = pitanje.odgovori[indeks];
    if (odgovor.projekat) setProjekat(odgovor.projekat);

    // stolica odmah prati vodeći sektor
    const p = { ...PRAZNI_POENI };
    novi.forEach((izbor, i) => {
      const s = KVIZ[i]?.odgovori[izbor]?.sektor;
      if (s) p[s] += 1;
    });
    const vod = vodeci(p);
    if (vod.length) setSektor(odgovor.sektor && vod.includes(odgovor.sektor) ? odgovor.sektor : vod[0]);

    if (korak + 1 < KVIZ.length) setKorak(korak + 1);
    else setFaza("rezultat");
  };

  const nazad = () => {
    if (korak === 0) setFaza("uvod");
    else setKorak(korak - 1);
  };

  const naPrijavu = () => skrolujDo("prijava");

  const vod = vodeci(poeni);
  const drugi = vod.length > 1 ? SEKTORI.find((s) => s.id === vod.find((id) => id !== sektor)) : null;

  return (
    <div className="pc-studio">
      <div className="pc-studio__tok">
        {/* ---------- uvod ---------- */}
        <section className="pc-uvod" aria-labelledby="pc-naslov">
          <h1 id="pc-naslov" className="pc-uvod__naslov font-heading">
            Ovde ćeš naći <span className="text-primary">svoje ljude</span>
          </h1>

          <div className="pc-uvod__akcije">
            <Button size="lg" className="pc-dugme" onClick={() => pocniKviz(true)}>
              Pronađi svoj sektor
              <ArrowDown />
            </Button>
            <Button size="lg" variant="outline" className="pc-dugme" onClick={naPrijavu}>
              {PRIJAVE.otvorene ? "Prijavi se" : "Lista čekanja"}
            </Button>
          </div>

          <div className="pc-sto-okvir pc-sto-okvir--uvod lg:hidden">
            {desktop === false && <Sto3D sektor={sektor} faza={stoFaza} />}
            <p className="pc-sto__opis" aria-live="polite">{natpis}</p>
          </div>
        </section>

        {/* ---------- kviz ---------- */}
        <section id="kviz" className="pc-kviz" aria-labelledby="pc-kviz-naslov">
          {faza === "uvod" && (
            <div className="pc-kviz__panel" key="uvod">
              <h2 id="pc-kviz-naslov" className="pc-h2 font-heading">
                Ne znaš gde pripadaš?
              </h2>
              <p className="pc-tekst">
                Pet kratkih pitanja, manje od minuta. Na kraju ti predlažemo
                sektor i projekat, a tvoja stolica za stolom odmah kreće ka
                sektoru koji ti najviše leži.
              </p>
              <Button size="lg" className="pc-dugme mt-8" onClick={() => pocniKviz(false)}>
                Kreni
                <ArrowRight />
              </Button>
            </div>
          )}

          {faza === "pitanja" && pitanje && (
            <div className="pc-kviz__panel" key={`p-${korak}`}>
              {/* telefon: kratka oznaka gde ide tvoja stolica */}
              {sektorPodaci && (
                <div className="pc-kviz__napredak lg:hidden">
                  <span className="pc-kviz__oznaka">{sektorPodaci.naziv}</span>
                </div>
              )}
              <h2 id="pc-kviz-naslov" className="pc-h2 font-heading">
                {pitanje.pitanje}
              </h2>
              <ul className="pc-odgovori" data-mnogo={pitanje.odgovori.length > 4 ? "da" : "ne"}>
                {pitanje.odgovori.map((o, i) => (
                  <li key={i} style={{ "--i": i } as React.CSSProperties}>
                    <button
                      type="button"
                      className="pc-odgovor"
                      aria-pressed={izbori[korak] === i}
                      onClick={() => odgovori(i)}
                    >
                      <span>{o.tekst}</span>
                      <ArrowRight className="pc-odgovor__strelica" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
              <button type="button" className="pc-nazad" onClick={nazad}>
                <ArrowLeft className="size-4" aria-hidden="true" />
                Nazad
              </button>
            </div>
          )}

          {faza === "rezultat" && (
            <div className="pc-kviz__panel" key="rezultat" aria-live="polite">
              <p className="pc-tekst">Tvoje mesto je u sektoru</p>
              <h2 id="pc-kviz-naslov" className="pc-rezultat__sektor font-heading">
                {sektorPodaci?.naziv ?? "Bilo kom sektoru"}
              </h2>
              <p className="pc-tekst mt-4">
                {sektorPodaci?.opis}
                {drugi && ` Podjednako ti leže i ${drugi.naziv.toLowerCase()}, pa o tome možemo da pričamo na razgovoru.`}
              </p>

              {projekatPodaci && (
                <Link href={`/projekti/${projekatPodaci.slug}`} className="pc-projekat">
                  {projekatPodaci.slika && (
                    <span className="pc-projekat__slika">
                      <Image src={projekatPodaci.slika} alt="" width={160} height={160} />
                    </span>
                  )}
                  <span className="pc-projekat__tekst">
                    <span className="pc-projekat__naslov">
                      Projekat za tebe: <strong>{projekatPodaci.naziv}</strong>
                    </span>
                    <span>{projekatPodaci.kratakOpis}</span>
                  </span>
                  <ArrowRight className="pc-projekat__strelica" aria-hidden="true" />
                </Link>
              )}

              <div className="pc-uvod__akcije">
                <Button size="lg" className="pc-dugme" onClick={naPrijavu}>
                  {PRIJAVE.otvorene ? "Prijavi se" : "Upiši se na listu čekanja"}
                  <ArrowDown />
                </Button>
                <Button size="lg" variant="outline" className="pc-dugme" onClick={() => pocniKviz(false)}>
                  <RefreshCw />
                  Ponovi kviz
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* desktop: sto zalepljen desno, prati ceo tok */}
      <div className="pc-studio__scena">
        <div className="pc-studio__lepak pc-sto-okvir">
          {desktop && <Sto3D sektor={sektor} faza={stoFaza} />}
          <p className="pc-sto__opis" aria-live="polite">{natpis}</p>
        </div>
      </div>
    </div>
  );
}
