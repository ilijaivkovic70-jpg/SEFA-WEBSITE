import type { Metadata } from "next";
import Image from "next/image";
import { Reveal } from "@/components/reveal";
import { MarkerHeading } from "@/components/marker-heading";
import { HistoryRoad } from "@/components/history-road";
import { MemberCompass } from "@/components/member-compass";

export const metadata: Metadata = {
  title: "O nama — SEFA",
  description:
    "Misija, struktura i brojke Studentske ekonomske fakultetske asocijacije.",
};

export default function ONamaPage() {
  return (
    <div>
      <Reveal>
        <section className="relative isolate overflow-hidden pb-20 pt-28 text-center sm:pt-36 sm:pb-28">
          {/* pozadina: fotografija članova, zatamnjena i zamućena da tekst ostane najupečatljiviji */}
          <div className="absolute inset-0 -z-10">
            <Image
              src="/o-nama-pozadina.jpg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="scale-110 object-cover object-[center_28%] blur-[2px]"
            />
            {/* jako zatamnjenje tačno iza teksta, fotografija ostaje vidljiva ka ivicama */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_62%_75%_at_50%_38%,rgba(7,16,15,0.9)_0%,rgba(7,16,15,0.6)_55%,rgba(7,16,15,0.22)_100%)]" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
          </div>

          <div className="mx-auto max-w-6xl px-4">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">
              O nama
            </p>
            <h1 className="font-heading mt-3 text-4xl font-extrabold tracking-tight text-balance drop-shadow-[0_2px_24px_rgba(7,16,15,0.8)] sm:text-5xl">
              <MarkerHeading>Prave stvari na pravi način</MarkerHeading>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-muted-foreground">
              „Studenti Ekonomskog fakulteta – SEFA” je studentska organizacija
              na Ekonomskom fakultetu Univerziteta u Beogradu, osnovana 2015.
              godine. Moto organizacije glasi „Prave stvari na pravi način” i
              opisuje njenu misiju: da studentima kroz vannastavne aktivnosti
              omogući unapređenje znanja i veština, uz fokus na timski duh,
              humanost, efikasnost, kolegijalnost i zajedništvo među studentima
              i studentskim organizacijama.
            </p>
          </div>
        </section>
      </Reveal>

      {/* HistoryRoad ima sopstveni sticky kadar — ne sme u <Reveal> */}
      <HistoryRoad />

      {/* MemberCompass sam vodi svoje otkrivanje — ne sme u <Reveal> */}
      <MemberCompass />
    </div>
  );
}
