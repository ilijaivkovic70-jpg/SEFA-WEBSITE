import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { PROJEKTI, getProjekatBySlug } from "@/data/projekti";

export function generateStaticParams() {
  return PROJEKTI.map((projekat) => ({ slug: projekat.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const projekat = getProjekatBySlug(slug);

  if (!projekat) {
    return { title: "Projekat nije pronađen — SEFA" };
  }

  return {
    title: `${projekat.naziv} — SEFA`,
    description: projekat.kratakOpis,
  };
}

export default async function ProjekatPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const projekat = getProjekatBySlug(slug);

  if (!projekat) {
    notFound();
  }

  return (
    <div>
      <Reveal>
        <section className="mx-auto max-w-3xl px-4 pb-16 pt-24 sm:pt-32">
          <Button
            variant="ghost"
            className="-ml-4 mb-8"
            nativeButton={false}
            render={<Link href="/projekti" />}
          >
            <ArrowLeft className="size-4" />
            Nazad na projekte
          </Button>

          <p className="font-mono text-xs uppercase tracking-widest text-primary">
            Projekat
          </p>
          <h1 className="font-heading mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            {projekat.naziv}
          </h1>

          <div className="mx-auto mt-6 aspect-video rounded-xl bg-gradient-to-br from-accent/40 to-primary/20 ring-1 ring-border" />

          {projekat.lokacije && (
            <div className="mt-6 flex flex-wrap gap-2">
              {projekat.lokacije.map((lokacija) => (
                <span
                  key={lokacija}
                  className="rounded-full border border-border px-3 py-1 font-mono text-xs uppercase tracking-wide text-muted-foreground"
                >
                  {lokacija}
                </span>
              ))}
            </div>
          )}

          <div className="mt-8 space-y-4">
            {projekat.opis.map((pasus, i) => (
              <p key={i} className="text-muted-foreground">
                {pasus}
              </p>
            ))}
          </div>

          {projekat.sekcije?.map((sekcija) => (
            <div key={sekcija.naslov} className="mt-10">
              <h2 className="font-heading text-xl font-bold tracking-tight">
                {sekcija.naslov}
              </h2>
              <ul className="mt-4 space-y-2">
                {sekcija.stavke.map((stavka) => (
                  <li
                    key={stavka}
                    className="border-l-2 border-border pl-4 text-sm text-muted-foreground"
                  >
                    {stavka}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <Button
            variant="outline"
            className="mt-12"
            nativeButton={false}
            render={<Link href="/projekti" />}
          >
            <ArrowLeft className="size-4" />
            Nazad na projekte
          </Button>
        </section>
      </Reveal>
    </div>
  );
}
