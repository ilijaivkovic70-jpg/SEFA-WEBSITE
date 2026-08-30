import type { Metadata } from "next";
import { MapPin, Mail, Phone, Mic2, ArrowUpRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Kontakt — SEFA",
  description:
    "Kontakt podaci i društvene mreže Studentske ekonomske fakultetske asocijacije.",
};

const SOCIAL_LINKS = [
  { href: "https://facebook.com", label: "Facebook" },
  { href: "https://instagram.com", label: "Instagram" },
  { href: "https://x.com", label: "X" },
  { href: "https://linkedin.com", label: "LinkedIn" },
  { href: "https://youtube.com", label: "YouTube" },
];

export default function KontaktPage() {
  return (
    <div>
      <Reveal>
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-24 text-center sm:pt-32">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">
            Kontakt
          </p>
          <h1 className="font-heading mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Javi nam se
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-muted-foreground">
            Sva pitanja, predlozi i saradnje su dobrodošli — pronađi nas na
            društvenim mrežama ili prođi kroz kontakt podatke ispod.
          </p>
        </section>
      </Reveal>

      <Reveal>
        <section className="mx-auto max-w-6xl px-4 pb-24">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <a
              href="https://maps.google.com/?q=Kamenička+6+Beograd"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Card className="ring-border transition-colors hover:border-primary">
                <CardHeader>
                  <MapPin className="size-6 text-primary" />
                  <CardTitle className="mt-3">Adresa</CardTitle>
                  <CardDescription>Kamenička 6, Beograd</CardDescription>
                </CardHeader>
              </Card>
            </a>

            <a href="mailto:office@sefa.org.rs" className="block">
              <Card className="ring-border transition-colors hover:border-primary">
                <CardHeader>
                  <Mail className="size-6 text-primary" />
                  <CardTitle className="mt-3">Email</CardTitle>
                  <CardDescription>office@sefa.org.rs</CardDescription>
                </CardHeader>
              </Card>
            </a>

            <a href="tel:+381631521141" className="block">
              <Card className="ring-border transition-colors hover:border-primary">
                <CardHeader>
                  <Phone className="size-6 text-primary" />
                  <CardTitle className="mt-3">Telefon</CardTitle>
                  <CardDescription>+381 63 1521141</CardDescription>
                </CardHeader>
              </Card>
            </a>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="border-t bg-card/40">
          <div className="mx-auto max-w-6xl px-4 py-24">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">
              Društvene mreže
            </p>
            <h2 className="font-heading mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Prati nas
            </h2>

            <div className="mt-10 flex flex-wrap gap-4">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                >
                  {link.label}
                  <ArrowUpRight className="size-4" />
                </a>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="mx-auto max-w-6xl px-4 py-24">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Card className="ring-border hover:-translate-y-1 hover:bg-card/70 hover:shadow-lg">
              <CardHeader className="flex-row items-center gap-4 space-y-0">
                <Mic2 className="size-8 shrink-0 text-primary" />
                <div>
                  <CardTitle>SEFA Talks — podkast</CardTitle>
                  <CardDescription>
                    Prati epizode i najave na Instagram nalogu podkasta.
                  </CardDescription>
                </div>
                <ArrowUpRight className="ml-auto size-5 shrink-0 text-primary" />
              </CardHeader>
            </Card>
          </a>
        </section>
      </Reveal>
    </div>
  );
}
