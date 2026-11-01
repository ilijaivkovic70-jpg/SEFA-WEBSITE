"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollProgress } from "@/components/scroll-progress";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV_LINKS = [
  { href: "/", label: "Početna" },
  { href: "/o-nama", label: "O nama" },
  { href: "/projekti", label: "Projekti" },
  { href: "/alumni", label: "Alumni" },
  { href: "/postani-clan", label: "Postani član" },
  { href: "/kontakt", label: "Kontakt" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [pastIntro, setPastIntro] = useState(!isHome);

  // meni je kapsula sa klizećim „liquid” isticanjem — prati hover, a kad
  // miš ode, vraća se na stranicu na kojoj se trenutno nalazimo
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [hovered, setHovered] = useState<string | null>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

  const activeHref =
    NAV_LINKS.find((link) =>
      link.href === "/"
        ? pathname === "/"
        : pathname === link.href || pathname.startsWith(`${link.href}/`)
    )?.href ?? null;
  const targetHref = hovered ?? activeHref;

  useEffect(() => {
    const measure = () => {
      const el = targetHref ? linkRefs.current[targetHref] : null;
      if (!el) {
        setIndicator((s) => ({ ...s, ready: false }));
        return;
      }
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth, ready: true });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [targetHref]);

  useEffect(() => {
    if (!isHome) {
      setPastIntro(true);
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPastIntro(true);
      return;
    }

    setPastIntro(false);

    // navigacija se pojavljuje tek kad uvod skoro izađe iz kadra
    const onScroll = () => {
      const intro = document.getElementById("sefa-intro");
      if (!intro) {
        setPastIntro(true);
        return;
      }
      setPastIntro(intro.getBoundingClientRect().bottom <= window.innerHeight * 0.3);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isHome]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur transition-all duration-500",
        isHome &&
          (pastIntro
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0")
      )}
    >
      <ScrollProgress />

      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="SEFA"
            width={2453}
            height={900}
            priority
            unoptimized
            className="h-8 w-auto"
          />
        </Link>

        <nav
          onMouseLeave={() => setHovered(null)}
          className="relative hidden items-center gap-0.5 rounded-full border border-border/70 bg-card/50 p-1 shadow-[inset_0_1px_0_rgb(255_255_255/0.05)] backdrop-blur-sm md:flex"
        >
          <span
            aria-hidden
            className="absolute inset-y-1 rounded-full bg-primary/15 shadow-[0_0_0_1px_rgb(var(--mint)/0.4),0_6px_16px_-6px_rgb(var(--mint)/0.55)] transition-[left,width,opacity] duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)]"
            style={{
              left: indicator.left,
              width: indicator.width,
              opacity: indicator.ready ? 1 : 0,
            }}
          />
          {NAV_LINKS.map((link) => {
            const isActive = link.href === activeHref;
            return (
              <Link
                key={link.href}
                href={link.href}
                ref={(el) => {
                  linkRefs.current[link.href] = el;
                }}
                onMouseEnter={() => setHovered(link.href)}
                onFocus={() => setHovered(link.href)}
                onBlur={() => setHovered(null)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative z-10 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200",
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-11"
                  aria-label="Otvori meni"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>SEFA</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-2">
                {NAV_LINKS.map((link) => {
                  const isActive = link.href === activeHref;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex items-center justify-between rounded-full px-4 py-3 text-base font-medium transition-colors",
                        isActive
                          ? "bg-primary/15 text-foreground shadow-[inset_0_0_0_1px_rgb(var(--mint)/0.4)]"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {link.label}
                      {isActive && (
                        <span className="size-1.5 rounded-full bg-primary" aria-hidden />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
        </div>
      </div>
    </header>
  );
}
