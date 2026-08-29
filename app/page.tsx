import Link from "next/link";
import { ArrowRight, Handshake, Megaphone, ClipboardList, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HeroIntro } from "@/components/hero-intro";
import { Reveal } from "@/components/reveal";

const STATS = [
  { value: "70+", label: "Aktivnih članova" },
  { value: "50+", label: "Članova alumni kluba" },
  { value: "6", label: "Aktivnih projekata" },
];

const SECTORS = [
  {
    icon: Megaphone,
    title: "Komunikacije",
    description:
      "Kreiranje sadržaja, društvene mreže i komunikacija sa javnošću za sve projekte organizacije.",
  },
  {
    icon: Handshake,
    title: "Sponzorstva i prodaja",
    description:
      "Izgradnja i održavanje partnerstava sa kompanijama koje podržavaju rad SEFA-e.",
  },
  {
    icon: ClipboardList,
    title: "Upravljanje projektima",
    description:
      "Planiranje, organizacija i realizacija projekata od ideje do izvedbe.",
  },
  {
    icon: Users,
    title: "Ljudski resursi",
    description:
      "Regrutacija, razvoj i briga o članovima kroz mentorstvo i edukacije.",
  },
];

export default function Home() {
  return (
    <div>
      <HeroIntro />

      <Reveal>
        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-24 md:grid-cols-2 md:items-center md:gap-16">
          <div className="aspect-video rounded-2xl bg-gradient-to-br from-accent/40 to-primary/20 ring-1 ring-border" />
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-primary">
              Ko smo mi
            </p>
            <h2 className="font-heading mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Studentska organizacija Ekonomskog fakulteta
            </h2>
            <p className="mt-4 text-muted-foreground">
              SEFA okuplja preko 70 aktivnih članova posvećenih ličnom i
              profesionalnom razvoju kroz projekte, edukacije i saradnju sa
              privredom. Kroz rad u sektorima komunikacija, sponzorstava i
              prodaje, upravljanja projektima i ljudskih resursa, članovi
              stiču praktično iskustvo koje ih priprema za tržište rada.
            </p>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="border-y bg-card/40">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-16 sm:grid-cols-3">
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
            Sektori
          </p>
          <h2 className="font-heading mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Kako je organizacija strukturirana
          </h2>

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
        <section className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-24 text-center">
          <h2 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
            Pogledaj šta smo do sada uradili
          </h2>
          <p className="max-w-xl text-muted-foreground">
            Od REPSUS konferencije do EKOF-a u pokretu — istraži projekte kroz
            koje članovi stiču iskustvo i grade zajednicu.
          </p>
          <Button size="lg" nativeButton={false} render={<Link href="/projekti" />}>
            Pogledaj projekte
            <ArrowRight className="size-4" />
          </Button>
        </section>
      </Reveal>
    </div>
  );
}
