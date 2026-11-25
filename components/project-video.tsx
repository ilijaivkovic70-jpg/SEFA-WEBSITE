"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Play, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Promo video projekta: kad se stranica otvori, video se glatko uvećava iz
 * kolone teksta u široki kadar i sam kreće. Kad se završi, stranica se sama
 * lagano spusti tako da se vidi početak teksta ispod videa.
 *
 * Ručke:
 *  - `EXPANDED_WIDTH`: koliko se video širi (najviše do ove širine, ili 92% ekrana)
 *  - `START_DELAY`: koliko se čeka pre nego što krene uvećavanje (ms)
 *  - `END_SCROLL_DELAY`: pauza posle kraja videa pre spuštanja (ms)
 *  - `TEXT_PEEK`: koliki deo ekrana ostaje iznad teksta posle spuštanja (0.55 = tekst počinje na 55% visine)
 *
 * Ako korisnik sam skroluje ili dodirne ekran dok video traje, automatsko
 * spuštanje se preskače. Uz „smanjeno kretanje” nema uvećavanja ni samog
 * pokretanja, samo dugme za puštanje. Ako pregledač ne dozvoli zvuk bez
 * klika (direktno otvaranje stranice), video kreće bez zvuka uz dugme
 * „Uključi zvuk”.
 */

const EXPANDED_WIDTH = 1200;
const START_DELAY = 650;
const END_SCROLL_DELAY = 700;
const TEXT_PEEK = 0.55;
const HEADER_OFFSET = 88;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Ručni glatki skrol (radi i uz Lenis, jer menja samo pravi položaj stranice). */
function scrollToY(y: number, ms: number, isCancelled: () => boolean) {
  const from = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const to = Math.max(0, Math.min(max, y));
  if (Math.abs(to - from) < 2) return;
  const t0 = performance.now();
  const step = (now: number) => {
    if (isCancelled()) return;
    const p = Math.min(1, (now - t0) / ms);
    window.scrollTo(0, from + (to - from) * easeInOut(p));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

type Phase = "idle" | "playing" | "ended";

export function ProjectVideo({
  src,
  poster,
  label,
  textId,
}: {
  src: string;
  poster: string;
  label: string;
  /** id elementa sa tekstom ispod videa (cilj automatskog spuštanja) */
  textId: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const userMoved = useRef(false);
  const reduced = useRef(false);
  const [expanded, setExpanded] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [needsSound, setNeedsSound] = useState(false);

  const start = useCallback(async () => {
    const video = videoRef.current;
    const wrap = wrapRef.current;
    if (!video || !wrap) return;

    userMoved.current = false;
    setExpanded(true);

    // kamera: video dolazi u središte pogleda dok se uvećava
    if (!reduced.current) {
      const top = wrap.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
      scrollToY(top, 1000, () => userMoved.current);
    }

    video.currentTime = 0;
    video.muted = false;
    try {
      await video.play();
      setNeedsSound(false);
    } catch {
      // bez klika pregledač ne pušta zvuk: kreni bez zvuka
      video.muted = true;
      try {
        await video.play();
        setNeedsSound(true);
      } catch {
        setPhase("idle");
        return;
      }
    }
    setPhase("playing");
  }, []);

  // automatski start po otvaranju stranice
  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced.current) return;
    const id = window.setTimeout(() => void start(), START_DELAY);
    return () => window.clearTimeout(id);
  }, [start]);

  // ako korisnik sam skroluje ili dodirne ekran, ne vuci ga automatski
  useEffect(() => {
    const mark = () => {
      userMoved.current = true;
    };
    const opts = { passive: true } as const;
    window.addEventListener("wheel", mark, opts);
    window.addEventListener("touchmove", mark, opts);
    window.addEventListener("keydown", mark);
    return () => {
      window.removeEventListener("wheel", mark);
      window.removeEventListener("touchmove", mark);
      window.removeEventListener("keydown", mark);
    };
  }, []);

  const scrollToText = useCallback(() => {
    const el = document.getElementById(textId);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - window.innerHeight * TEXT_PEEK;
    scrollToY(y, 1300, () => false);
  }, [textId]);

  const onEnded = useCallback(() => {
    setPhase("ended");
    if (reduced.current) return;
    userMoved.current = false; // pomeranje tokom videa ne važi za kraj
    window.setTimeout(() => {
      if (!userMoved.current) scrollToText();
    }, END_SCROLL_DELAY);
  }, [scrollToText]);

  const unmute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    setNeedsSound(false);
  };

  return (
    <div className="mt-6">
      <div ref={wrapRef} className="relative w-full">
        <div
          className={cn(
            "relative left-1/2 -translate-x-1/2 overflow-hidden rounded-xl bg-black ring-1 ring-border",
            "transition-[width,box-shadow] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
            expanded && "shadow-[0_30px_90px_-20px_rgba(0,0,0,0.65)]"
          )}
          style={{ width: expanded ? `min(92vw, ${EXPANDED_WIDTH}px)` : "100%" }}
        >
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            preload="metadata"
            playsInline
            controls={phase === "playing"}
            onEnded={onEnded}
            aria-label={label}
            className="block aspect-video w-full"
          />

          {phase !== "playing" && (
            <button
              type="button"
              onClick={() => void start()}
              aria-label={phase === "ended" ? "Pusti video ponovo" : "Pusti video"}
              className="group absolute inset-0 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/30 focus-visible:outline-none"
            >
              <span className="btn-sjaj flex size-16 items-center justify-center rounded-full group-hover:scale-105 group-focus-visible:scale-105 sm:size-20">
                <Play className="size-7 translate-x-0.5 fill-current sm:size-8" />
              </span>
            </button>
          )}

          {needsSound && phase === "playing" && (
            <button
              type="button"
              onClick={unmute}
              className="absolute right-3 top-3 flex items-center gap-2 rounded-full border border-white/15 bg-black/55 px-4 py-2 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_8px_20px_-10px_rgb(0_0_0/0.7)] backdrop-blur-md transition-colors hover:border-[rgb(var(--mint)/0.5)] hover:bg-black/70"
            >
              <Volume2 className="size-4" />
              Uključi zvuk
            </button>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={scrollToText}
        className={cn(
          "mx-auto mt-5 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-opacity duration-500 hover:text-foreground",
          phase === "playing" ? "opacity-0" : "opacity-100"
        )}
        aria-label="Spusti se do teksta"
      >
        Više o projektu
        <ChevronDown className="size-4 animate-bounce" />
      </button>
    </div>
  );
}
