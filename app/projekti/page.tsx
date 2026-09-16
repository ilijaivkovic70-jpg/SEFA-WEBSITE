import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Reveal } from "@/components/reveal";
import { PROJEKTI } from "@/data/projekti";

export const metadata: Metadata = {
  title: "Projekti",
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
          {/* osam projekata u četiri kolone — dva puna reda, sve na jednom mestu;
              na telefonu kompaktni redovi: logo levo, tekst desno */}
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {PROJEKTI.map((projekat) => (
              <Link key={projekat.slug} href={`/projekti/${projekat.slug}`}>
                <Card className="ring-border h-full hover:-translate-y-1 hover:bg-card/70 hover:shadow-lg max-sm:grid max-sm:grid-cols-[5.5rem_minmax(0,1fr)] max-sm:gap-x-3 max-sm:gap-y-1.5 max-sm:p-3">
                  <div className="mx-4 flex aspect-video items-center justify-center rounded-lg bg-zinc-800 ring-1 ring-border max-sm:row-span-2 max-sm:mx-0 max-sm:aspect-square max-sm:self-center">
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
                  <CardHeader className="max-sm:px-0">
                    <CardTitle
                    className="w-fit rounded-md bg-no-repeat px-1.5 py-0.5 text-lg [background-image:linear-gradient(var(--primary),var(--primary))] [background-position:0_0] [background-size:0%_100%] transition-[background-size,color] duration-500 ease-out group-hover/card:[background-size:100%_100%] group-hover/card:text-primary-foreground"
                  >
                    {projekat.naziv}
                  </CardTitle>
                    <CardDescription className="max-sm:line-clamp-2">{projekat.kratakOpis}</CardDescription>
                  </CardHeader>
                  <div className="mt-auto flex items-center gap-1.5 px-4 pb-1 text-sm font-medium text-primary max-sm:col-start-2 max-sm:mt-0 max-sm:px-0 max-sm:pb-0">
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
