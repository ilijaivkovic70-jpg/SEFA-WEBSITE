import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { SectorReminderOnce } from "@/components/floating-sector-reminder";

export const metadata: Metadata = {
  title: "Postani član",
  description:
    "Pridruži se SEFA-i i izaberi sektor koji ti najviše odgovara: komunikacije, sponzorstva i prodaja ili ljudski resursi.",
};

const PRIJAVE_OTVORENE = false;
const PRIJAVA_LINK = "/kontakt";

export default function PostaniClanPage() {
  return (
    <div>
      <Reveal>
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-24 text-center sm:pt-32">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">
            Postani član
          </p>
          <h1 className="font-heading mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Izaberi sektor, gradi iskustvo
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-muted-foreground">
            SEFA je organizovana po uzoru na strukturu jednog preduzeća,
            članovi rade po sektorima. Ovakva podela omogućava svakom članu da
            usmeri svoj talenat i interesovanja ka konkretnoj oblasti i kroz
            praktičan rad stekne novo iskustvo.
          </p>
        </section>
      </Reveal>

      <Reveal>
        <section className="border-t bg-card/40">
          <div className="mx-auto max-w-6xl px-4 py-24 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">
              Prijave
            </p>
            <h2 className="font-heading mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {PRIJAVE_OTVORENE ? "Prijavi se odmah" : "Prijave uskoro"}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              {PRIJAVE_OTVORENE
                ? "Popuni prijavni formular i postani deo naredne generacije SEFA-e."
                : "Prijave trenutno nisu otvorene. Javi nam se za sva pitanja u međuvremenu, a čim prijave krenu, link ćemo staviti ovde."}
            </p>

            <div className="mt-8">
              {PRIJAVE_OTVORENE ? (
                <Button
                  size="lg"
                  nativeButton={false}
                  render={<Link href={PRIJAVA_LINK} />}
                >
                  Prijavi se
                </Button>
              ) : (
                <Button
                  size="lg"
                  nativeButton={false}
                  render={<Link href="/kontakt" />}
                >
                  Kontaktiraj nas
                </Button>
              )}
            </div>
          </div>
        </section>
      </Reveal>

      <SectorReminderOnce />
    </div>
  );
}
