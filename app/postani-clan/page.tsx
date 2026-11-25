import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { PostaniClanStudio } from "@/components/postani-clan-studio";
import { KORACI, PITANJA, PRIJAVE } from "@/data/postani-clan";

export const metadata: Metadata = {
  title: "Postani član",
  description:
    "Pronađi svoj sektor u SEFA-i kroz kratak kviz i upiši se na listu čekanja za prijave.",
};

/* Sav tekst i linkovi za ovu stranicu su u data/postani-clan.ts */

export default function PostaniClanPage() {
  // kad su prijave otvorene vodi na formular za prijavu, inače na listu čekanja;
  // dok link nije upisan, dugme vodi na kontakt
  const link = PRIJAVE.otvorene ? PRIJAVE.prijavaLink : PRIJAVE.listaCekanjaLink;
  const spoljni = link.length > 0;

  return (
    <div className="pc-strana">
      <PostaniClanStudio />

      {KORACI.length > 0 && (
        <section className="border-t">
          <div className="mx-auto max-w-3xl px-4 py-24 sm:py-28">
            <Reveal>
              <h2 className="pc-h2 font-heading">Kako postaješ član</h2>
            </Reveal>
            <ol className="pc-koraci">
              {KORACI.map((k, i) => (
                <li key={k.naslov} className="pc-korak">
                  <Reveal delay={i * 80}>
                    <h3 className="font-heading text-xl font-bold">{k.naslov}</h3>
                    <p className="mt-2 text-muted-foreground">{k.opis}</p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {PITANJA.length > 0 && (
        <section className="border-t">
          <div className="mx-auto max-w-3xl px-4 py-24 sm:py-28">
            <Reveal>
              <h2 className="pc-h2 font-heading">Pitanja koja nam često stižu</h2>
            </Reveal>
            <div className="mt-10 border-t">
              {PITANJA.map((p) => (
                <details key={p.pitanje} className="pc-pitanje">
                  <summary>
                    {p.pitanje}
                    <span className="pc-pitanje__znak" aria-hidden="true" />
                  </summary>
                  <p>{p.odgovor}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="prijava" className="pc-kraj">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:py-32">
          <h2 className="pc-h2 font-heading">
            {PRIJAVE.otvorene ? "Prijave su otvorene." : `Vidimo se ${PRIJAVE.termin}.`}
          </h2>
          <p className="pc-tekst mx-auto">
            {PRIJAVE.otvorene
              ? "Popuni prijavni formular i postani deo naredne generacije SEFA-e."
              : "Nove članove primamo jednom godišnje. Upiši se na listu čekanja i javićemo ti mejlom čim prijave krenu."}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            {spoljni ? (
              <Button
                size="lg"
                className="pc-dugme"
                nativeButton={false}
                render={<a href={link} target="_blank" rel="noopener noreferrer" />}
              >
                {PRIJAVE.otvorene ? "Prijavi se" : "Upiši se na listu čekanja"}
                <ArrowUpRight />
              </Button>
            ) : (
              <Button size="lg" className="pc-dugme" nativeButton={false} render={<Link href="/kontakt" />}>
                Javi nam se
              </Button>
            )}
            {spoljni && (
              <Button
                size="lg"
                variant="outline"
                className="pc-dugme"
                nativeButton={false}
                render={<Link href="/kontakt" />}
              >
                Imaš pitanje?
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
