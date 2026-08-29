import type { Metadata } from "next";
import { Building2, Briefcase, Rocket } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Alumni — SEFA",
  description:
    "Alumni klub Studentske ekonomske fakultetske asocijacije — bivši članovi i njihova dostignuća.",
};

const PATHS = [
  {
    icon: Building2,
    title: "Državne institucije",
    description:
      "Deo alumni mreže danas gradi karijeru u državnim institucijama, primenjujući iskustvo stečeno kroz rad u SEFA-i.",
  },
  {
    icon: Briefcase,
    title: "Velike korporacije",
    description:
      "Mnogi bivši članovi su zaposleni u vodećim domaćim i međunarodnim kompanijama.",
  },
  {
    icon: Rocket,
    title: "Preduzetništvo",
    description:
      "Deo alumni zajednice je pokrenuo sopstvene poslovne poduhvate i danas su mladi preduzetnici.",
  },
];

export default function AlumniPage() {
  return (
    <div>
      <Reveal>
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-24 text-center sm:pt-32">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">
            Alumni
          </p>
          <h1 className="font-heading mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Zajednica koja traje i posle SEFA-e
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-muted-foreground">
            Alumni klub okuplja bivše članove SEFA-e koji su svoje iskustvo iz
            organizacije preneli dalje u profesionalni svet, ostajući deo naše
            zajednice i podrška generacijama koje dolaze.
          </p>
        </section>
      </Reveal>

      <Reveal>
        <section className="border-y bg-card/40">
          <div className="mx-auto max-w-6xl px-4 py-16 text-center">
            <p className="font-heading text-5xl font-extrabold tracking-tight text-primary sm:text-6xl">
              50+
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Članova u alumni klubu
            </p>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="mx-auto max-w-6xl px-4 py-24">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">
            Gde su danas
          </p>
          <h2 className="font-heading mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Put nakon SEFA-e
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Iskustvo stečeno kroz rad u sektorima SEFA-e otvara vrata ka
            različitim karijernim putevima.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {PATHS.map((path) => (
              <Card key={path.title} className="ring-border">
                <CardHeader>
                  <path.icon className="size-6 text-primary" />
                  <CardTitle className="mt-3">{path.title}</CardTitle>
                  <CardDescription>{path.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      </Reveal>
    </div>
  );
}
