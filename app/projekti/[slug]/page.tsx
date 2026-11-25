import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { ImageReveal } from "@/components/image-reveal";
import { LineReveal } from "@/components/line-reveal";
import { ProjectGallery } from "@/components/project-gallery";
import { ProjectVideo } from "@/components/project-video";
import { ProjectLetter } from "@/components/project-letter";
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
    return { title: "Projekat nije pronađen" };
  }

  return {
    title: projekat.naziv,
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
            <LineReveal text={projekat.naziv} />
          </h1>

          {projekat.video ? (
            <ProjectVideo
              src={projekat.video.src}
              poster={projekat.video.poster}
              label={`${projekat.naziv}: promo video`}
              textId="projekat-tekst"
            />
          ) : (
            <ImageReveal className={`mx-auto mt-6 flex aspect-video items-center justify-center rounded-xl ring-1 ring-border bg-gradient-to-br from-accent/40 to-primary/20`}>
              {projekat.slika && (
                <Image
                  src={projekat.slika}
                  alt={projekat.naziv}
                  width={400}
                  height={100}
                  unoptimized
                  className="h-4/5 w-1/2 object-contain"
                />
              )}
            </ImageReveal>
          )}

          <ProjectLetter
            id="projekat-tekst"
            paragraphs={projekat.opis}
            logo={projekat.slika}
            logoAlt={projekat.naziv}
            label={`${projekat.naziv}: pismo o projektu`}
          />

          <ProjectGallery
            images={projekat.galerija ?? []}
            alt={projekat.naziv}
          />

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
