"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Slika se "otvara" dok skroluješ: kreće kao uska horizontalna traka
 * (clip-path: inset(30% 0)) i širi se do pune visine, a usput blago klizi
 * različitom brzinom od ostatka strane (parallax). Tehnika po uzoru na
 * savor.it/mission.
 *
 * mode="hero": bez otvaranja, pozadina samo blago zaostaje i uvećava se
 * dok sekcija odlazi sa ekrana.
 *
 * Sve elemente pokreće jedna zajednička petlja (jedan scroll listener +
 * requestAnimationFrame), a ažuriraju se samo oni koji su na ekranu.
 */

type Mode = "reveal" | "hero";
type Item = { el: HTMLElement; mode: Mode; parallax: number; visible: boolean };

const items = new Set<Item>();
let frame = 0;
let listening = false;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function update() {
  frame = 0;
  const vh = window.innerHeight;
  for (const item of items) {
    if (!item.visible) continue;
    const r = item.el.getBoundingClientRect();

    if (item.mode === "hero") {
      const p = clamp(-r.top / r.height, 0, 1);
      item.el.style.setProperty("--ir-y", `${(p * r.height * item.parallax).toFixed(1)}px`);
      item.el.style.setProperty("--ir-scale", (1 + p * 0.08).toFixed(4));
      continue;
    }

    // 0 kad gornja ivica tek uđe u ekran, 1 kad pređe ~55% visine ekrana
    const p = easeOut(clamp((vh - r.top) / (vh * 0.55), 0, 1));
    item.el.style.setProperty("--ir-clip", `${((1 - p) * 30).toFixed(2)}%`);

    if (item.parallax) {
      // pomeraj u odnosu na trenutak kad je slika na sredini ekrana
      const offset = (r.top + r.height / 2 - vh / 2) / vh;
      item.el.style.setProperty("--ir-y", `${(-offset * item.parallax).toFixed(1)}px`);
    }
  }
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(update);
}

const observer =
  typeof window !== "undefined" && "IntersectionObserver" in window
    ? new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            for (const item of items) {
              if (item.el === entry.target) item.visible = entry.isIntersecting;
            }
          }
          schedule();
        },
        { rootMargin: "20% 0px" }
      )
    : null;

export function ImageReveal({
  children,
  className,
  parallax = 0,
  mode = "reveal",
}: {
  children: React.ReactNode;
  className?: string;
  /** jačina parallax pomeraja u px (može i negativno) */
  parallax?: number;
  mode?: Mode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !observer) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const item: Item = { el, mode, parallax, visible: false };
    items.add(item);
    observer.observe(el);
    if (!listening) {
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
      listening = true;
    }
    // slike koje su već na ekranu se otvore glatkim prelazom, a posle
    // toga stanje direktno prati skrol (bez kašnjenja)
    el.dataset.ir = "intro";
    void el.offsetWidth;
    item.visible = true;
    update();
    const timer = window.setTimeout(() => {
      el.dataset.ir = "live";
    }, 1100);

    return () => {
      window.clearTimeout(timer);
      observer.unobserve(el);
      items.delete(item);
      if (items.size === 0 && listening) {
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
        listening = false;
      }
    };
  }, [mode, parallax]);

  return (
    <div ref={ref} className={cn(mode === "hero" ? "ir-hero" : "ir", className)}>
      {children}
    </div>
  );
}
