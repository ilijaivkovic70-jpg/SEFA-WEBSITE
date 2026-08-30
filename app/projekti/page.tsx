import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Reveal } from "@/components/reveal";
import { PROJEKTI } from "@/data/projekti";

export const metadata: Metadata = {
  title: "Projekti — SEFA",
  description: "Pregled projekata Studentske ekonomske fakultetske asocijacije.",
};

export default function ProjektiPage() {
  return (
    <div className="relative">
      {/* pozadina cele stranice: zatamnjena fotografija drveta, fiksirana iza sadržaja */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/projekti-pozadina.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-background/80" />
      </div>

      <Reveal>
        <section className="mx-auto max-w-6xl px-4 pb-12 pt-20 text-center sm:pt-24">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">
            Projekti
          </p>
          <h1 className="font-heading mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Ono po čemu nas pamte
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-muted-foreground">
            Od konferencija do humanitarnih akcija, svaki projekat je prilika
            da članovi steknu praktično iskustvo i grade zajednicu.
          </p>
        </section>
      </Reveal>

      <Reveal>
        <section className="mx-auto max-w-6xl px-4 pb-24">
          {/* osam projekata u četiri kolone — dva puna reda, sve na jednom mestu */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROJEKTI.map((projekat) => (
              <Link key={projekat.slug} href={`/projekti/${projekat.slug}`}>
                <Card className="ring-border h-full hover:-translate-y-1 hover:bg-card/70 hover:shadow-lg">
                  <div className="mx-4 flex aspect-video items-center justify-center rounded-lg bg-zinc-800 ring-1 ring-border">
                    {projekat.slika && (
                      <Image
                        src={projekat.slika}
                        alt={projekat.naziv}
                        width={200}
                        height={50}
                        unoptimized
                        className="w-2/3 object-contain"
                      />
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle
                    className="w-fit rounded-md bg-no-repeat px-1.5 py-0.5 text-lg [background-image:linear-gradient(var(--primary),var(--primary))] [background-position:0_0] [background-size:0%_100%] transition-[background-size,color] duration-500 ease-out group-hover/card:[background-size:100%_100%] group-hover/card:text-primary-foreground"
                  >
                    {projekat.naziv}
                  </CardTitle>
                    <CardDescription>{projekat.kratakOpis}</CardDescription>
                  </CardHeader>
                  <div className="mt-auto flex items-center gap-1.5 px-4 pb-1 text-sm font-medium text-primary">
                    Saznaj više
                    <ArrowRight className="size-4" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </Reveal>
    </div>
  );
}
