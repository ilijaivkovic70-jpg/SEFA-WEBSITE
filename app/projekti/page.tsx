import type { Metadata } from "next";
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
    <div>
      <Reveal>
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-24 text-center sm:pt-32">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">
            Projekti
          </p>
          <h1 className="font-heading mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Šta gradimo kroz rad SEFA-e
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-muted-foreground">
            Od konferencija do humanitarnih akcija — svaki projekat je prilika
            da članovi steknu praktično iskustvo i grade zajednicu.
          </p>
        </section>
      </Reveal>

      <Reveal>
        <section className="mx-auto max-w-6xl px-4 pb-24">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PROJEKTI.map((projekat) => (
              <Link key={projekat.slug} href={`/projekti/${projekat.slug}`}>
                <Card className="ring-border h-full transition-colors hover:bg-card/70">
                  <div className="mx-4 aspect-video rounded-lg bg-gradient-to-br from-accent/40 to-primary/20 ring-1 ring-border" />
                  <CardHeader>
                    <CardTitle className="text-lg">{projekat.naziv}</CardTitle>
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
