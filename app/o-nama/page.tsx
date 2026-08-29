import type { Metadata } from "next";
import { Megaphone, Handshake, ClipboardList, Users, GraduationCap, BookOpen, PartyPopper } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "O nama — SEFA",
  description:
    "Misija, struktura i brojke Studentske ekonomske fakultetske asocijacije.",
};

const STATS = [
  { value: "70+", label: "Aktivnih članova" },
  {
    value: "50+",
    label:
      "Alumni klub — danas zaposleni u državnim institucijama, velikim korporacijama, kao i mladi preduzetnici",
  },
];

const SECTORS = [
  {
    icon: Megaphone,
    title: "Sektor komunikacija",
    description: "PR i marketinške aktivnosti.",
  },
  {
    icon: Handshake,
    title: "Sektor sponzorstva i prodaje",
    description:
      "Izgradnja i održavanje partnerstava sa kompanijama koje podržavaju rad SEFA-e.",
  },
  {
    icon: ClipboardList,
    title: "Sektor upravljanja projektima",
    description:
      "Planiranje, organizacija i realizacija projekata od ideje do izvedbe.",
  },
  {
    icon: Users,
    title: "Sektor upravljanja ljudskim resursima",
    description:
      "Regrutacija, razvoj i briga o članovima kroz mentorstvo i edukacije.",
  },
];

const CARE = [
  {
    icon: GraduationCap,
    title: "Program mentorstva",
    description:
      "Pomoć u savladavanju studija i prepreka tokom školovanja.",
  },
  {
    icon: BookOpen,
    title: "Edukacije",
    description: "Edukacije za unapređenje znanja i veština.",
  },
  {
    icon: PartyPopper,
    title: "Druženja",
    description:
      "Redovna druženja i jačanje timskog duha — karaoke, beer pong, krstarenja, izleti, sushi.",
  },
];

export default function ONamaPage() {
  return (
    <div>
      <Reveal>
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-24 text-center sm:pt-32">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">
            O nama
          </p>
          <h1 className="font-heading mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Prave stvari na pravi način
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
        </section>
      </Reveal>

      <Reveal>
        <section className="border-y bg-card/40">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-16 sm:grid-cols-2">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-heading text-5xl font-extrabold tracking-tight text-primary sm:text-6xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="mx-auto max-w-6xl px-4 py-24">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">
            Struktura
          </p>
          <h2 className="font-heading mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Četiri sektora
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            SEFA je organizovana po uzoru na strukturu jednog preduzeća —
            članovi rade po sektorima. Ovakva podela omogućava svakom članu da
            usmeri svoj talenat i interesovanja ka konkretnoj oblasti i kroz
            praktičan rad stekne novo iskustvo.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SECTORS.map((sector) => (
              <Card key={sector.title} className="ring-border">
                <CardHeader>
                  <sector.icon className="size-6 text-primary" />
                  <CardTitle className="mt-3">{sector.title}</CardTitle>
                  <CardDescription>{sector.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="border-t bg-card/40">
          <div className="mx-auto max-w-6xl px-4 py-24">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">
              Briga o članovima
            </p>
            <h2 className="font-heading mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Razvoj ne staje na projektima
            </h2>

            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {CARE.map((item) => (
                <Card key={item.title} className="ring-border">
                  <CardHeader>
                    <item.icon className="size-6 text-primary" />
                    <CardTitle className="mt-3">{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
