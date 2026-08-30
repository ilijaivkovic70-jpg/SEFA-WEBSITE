import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroIntro } from "@/components/hero-intro";
import { TeamHero } from "@/components/team-hero";
import { LogoDrop } from "@/components/logo-drop";
import { StatsSection } from "@/components/stats-section";
import { SectorsScroll } from "@/components/sectors-scroll";
import { Reveal } from "@/components/reveal";
import { TextMarker } from "@/components/text-marker";

export default function Home() {
  return (
    <div>
      <div className="env" aria-hidden="true">
        <div className="env__glow" />
        <div className="env__grain" />
      </div>

      <div className="relative z-[1]">
      <HeroIntro />
      <LogoDrop />

      <TeamHero />

      <div className="living-bg-wrap">
        <div className="living-bg" aria-hidden="true">
          <div className="living-bg__blob living-bg__blob--a" />
          <div className="living-bg__blob living-bg__blob--b" />
          <div className="living-bg__grain" />
          <div className="living-bg__seam" />
        </div>

        <Reveal>
          <section className="relative mx-auto px-4 py-24 text-center">
            <div className="mx-auto max-w-3xl">
              <p className="font-mono text-xs uppercase tracking-widest text-primary">
                O organizaciji
              </p>
              <h2 className="font-heading mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Studentska organizacija Ekonomskog fakulteta
              </h2>
              <p className="mt-4 text-muted-foreground">
                <TextMarker>
                  SEFA okuplja preko 70 aktivnih članova posvećenih ličnom i
                  profesionalnom razvoju kroz projekte, edukacije i saradnju sa
                  privredom. Kroz rad u sektorima komunikacija, sponzorstava i
                  prodaje i ljudskih resursa, članovi stiču praktično iskustvo
                  koje ih priprema za tržište rada.
                </TextMarker>
              </p>
            </div>
          </section>
        </Reveal>

        <StatsSection />
      </div>

      <SectorsScroll />

      <Reveal>
        <section className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-24 text-center">
          <h2 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
            Pogledaj šta smo do sada uradili
          </h2>
          <p className="max-w-xl text-muted-foreground">
            Od REPSUS konferencije do EKOF-a u pokretu: istraži projekte kroz
            koje članovi stiču iskustvo i grade zajednicu.
          </p>
          <Button size="lg" nativeButton={false} render={<Link href="/projekti" />}>
            Pogledaj projekte
            <ArrowRight className="size-4" />
          </Button>
        </section>
      </Reveal>
      </div>
    </div>
  );
}
