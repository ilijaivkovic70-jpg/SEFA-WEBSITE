"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
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

        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

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
              <nav className="flex flex-col px-2">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center rounded-md px-2 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
