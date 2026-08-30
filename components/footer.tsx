import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

const SOCIAL_LINKS = [
  { href: "https://facebook.com", label: "Facebook" },
  { href: "https://instagram.com", label: "Instagram" },
  { href: "https://x.com", label: "X" },
  { href: "https://linkedin.com", label: "LinkedIn" },
  { href: "https://youtube.com", label: "YouTube" },
];

const CONTACT_LINKS = [
  {
    icon: Phone,
    label: "+381 63 1521141",
    href: "tel:+381631521141",
  },
  {
    icon: Mail,
    label: "office@sefa.org.rs",
    href: "mailto:office@sefa.org.rs",
  },
  {
    icon: MapPin,
    label: "Kamenička 6, Beograd",
    href: "https://maps.google.com/?q=Kamenička+6+Beograd",
  },
];

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="font-heading text-lg font-bold">SEFA</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Studentska ekonomska fakultetska asocijacija
          </p>
          <Link
            href="/kontakt"
            className="group mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-foreground"
          >
            Upoznaj celu priču
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium">Kontakt</p>
          <div className="flex flex-col gap-2.5">
            {CONTACT_LINKS.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border/70 text-primary transition-colors group-hover:border-primary group-hover:bg-primary/10">
                  <Icon className="size-3.5" />
                </span>
                {label}
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium">Društvene mreže</p>
          <div className="flex flex-wrap gap-2">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-border/70 px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} SEFA. Sva prava zadržana.
        </p>
      </div>
    </footer>
  );
}
