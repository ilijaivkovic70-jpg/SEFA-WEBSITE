import Link from "next/link";

const SOCIAL_LINKS = [
  { href: "https://facebook.com", label: "Facebook" },
  { href: "https://instagram.com", label: "Instagram" },
  { href: "https://x.com", label: "X" },
  { href: "https://linkedin.com", label: "LinkedIn" },
  { href: "https://youtube.com", label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-bold text-lg">SEFA</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Studentska ekonomska fakultetska asocijacija
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Kamenička 6</p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Društvene mreže</p>
          <div className="flex flex-wrap gap-4">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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
