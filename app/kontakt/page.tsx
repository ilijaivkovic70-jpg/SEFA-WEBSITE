import type { Metadata } from "next";
import { MapPin, Mail, Phone } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Kontakt podaci i društvene mreže Studentske ekonomske fakultetske asocijacije.",
};

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
            Sva pitanja, predlozi i saradnje su dobrodošli, pronađi nas na
            društvenim mrežama ili prođi kroz kontakt podatke ispod.
          </p>
        </section>
      </Reveal>

      <Reveal>
        <section className="mx-auto max-w-6xl px-4 pb-16">
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
    </div>
  );
}
