"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { MEMORIES, type Memory } from "@/data/alumni";
import { AlumniFrame } from "@/components/alumni-frame";
import { AlumniBrand } from "@/components/alumni-brand";

/**
 * „Lanac” na računaru (po uzoru na savor.it/mission): sekcija se zalepi za
 * ekran, a skrol nadole pomera traku ulevo. Fotografije se talasasto penju
 * i spuštaju, a svaka je uska traka kad ulazi sa desne strane, otvori se do
 * pune visine na sredini ekrana i ponovo suzi dok izlazi levo.
 * Radi i na telefonu (veće slike za uzan ekran); samo uz „smanjeno
 * kretanje” ostaje obična traka koja se prevlači.
 */
const CHAIN_QUERY = "(prefers-reduced-motion: no-preference)";
/** koliko px skrola nadole po px pomeranja trake ulevo (veće = sporije) */
const CHAIN_PACE = 0.85;
/** najveće pomeranje gore/dole, u delovima visine ekrana */
const CHAIN_WAVE = 0.13;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smoothstep = (e0: number, e1: number, v: number) => {
  const t = clamp01((v - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

/**
 * „Trenuci koji ostaju” — galerija uspomena kao kontakt-list, ne kao mreža:
 * okviri su različitih oblika i blago pomereni po vertikali, sa dopisanom
 * beleškom ispod, kao u albumu.
 *
 * Traka se pomera vodoravno — trackpadom i strelicama sama od sebe
 * (`overflow-x`), mišem i prevlačenjem. Vertikalni skrol stranice se nigde
 * ne presreće; točkić miša radi kao i inače. Sledeća fotografija se uvek
 * malo nazire, da bude jasno da traka ima nastavak.
 *
 * Klik otvara uvećan prikaz: strelice levo/desno, `Escape` zatvara, fokus
 * ostaje zarobljen unutar prikaza i vraća se na fotografiju sa koje se pošlo.
 *
 * Fotografije se dodaju u `data/alumni.ts` (niz `MEMORIES`).
 */

/**
 * Medij u traci: fotografija, ili snimak koji se sam pušta (bez zvuka, u petlji)
 * dok je na ekranu, a stoji kao sličica kad je van ekrana ili uz „smanjeno
 * kretanje”.
 */
function StripMedia({ memory }: { memory: Memory }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.3 }
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  if (!memory.video) {
    return (
      <AlumniFrame
        src={memory.src}
        alt={memory.alt}
        sizes="(min-width: 1024px) 40vw, 80vw"
      />
    );
  }

  return (
    <div className="al-frame">
      <video
        ref={videoRef}
        className="al-frame__video"
        src={memory.video}
        poster={memory.src ?? undefined}
        muted
        loop
        playsInline
        preload="none"
        aria-label={memory.alt}
      />
      <span className="al-frame__play" aria-hidden="true">
        <Play className="size-3.5" fill="currentColor" />
      </span>
    </div>
  );
}

/** Preko koliko piksela prevlačenja se klik više ne računa kao klik. */
const DRAG_SLOP = 6;

export function AlumniMemories() {
  const railRef = useRef<HTMLUListElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const draggedRef = useRef(false);
  const chainRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState<number | null>(null);

  /* ---------- prevlačenje mišem ---------- */
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    let down = false;
    let startX = 0;
    let startLeft = 0;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true;
      draggedRef.current = false;
      startX = e.clientX;
      startLeft = rail.scrollLeft;
    };

    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > DRAG_SLOP) {
        draggedRef.current = true;
        rail.dataset.dragging = "true";
      }
      if (draggedRef.current) rail.scrollLeft = startLeft - dx;
    };

    const onUp = () => {
      down = false;
      delete rail.dataset.dragging;
    };

    rail.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      rail.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  /* ---------- lanac: lepljiva traka koja klizi ulevo dok se skroluje ---------- */
  useEffect(() => {
    const chain = chainRef.current;
    const rail = railRef.current;
    if (!chain || !rail) return;

    const mq = window.matchMedia(CHAIN_QUERY);
    const items = Array.from(rail.querySelectorAll<HTMLElement>(".al-strip__item"));
    const movers = items.map((li) => li.querySelector<HTMLElement>(".al-strip__move")!);
    const clips = items.map((li) => li.querySelector<HTMLElement>(".al-strip__clip")!);

    // blagi, uvek isti nagib svake slike (kao uspomene nasumice poređane na stolu)
    const tilts = items.map((_, i) => ((i * 5 + 2) % 7 - 3) * 0.85);

    let on = false;
    let travel = 0;
    let railLeft = 0;
    let base: number[] = [];
    let widths: number[] = [];
    let target = 0;
    let shown = 0;
    let raf = 0;
    let last = 0;
    let lastWidth = 0;

    const measure = () => {
      lastWidth = window.innerWidth;
      rail.style.transform = "";
      railLeft = rail.getBoundingClientRect().left;
      base = items.map((li) => li.offsetLeft);
      widths = items.map((li) => li.offsetWidth);
      travel = Math.max(0, rail.scrollWidth - window.innerWidth);
      chain.style.height = `${Math.round(travel * CHAIN_PACE + window.innerHeight)}px`;
    };

    const progress = () => {
      const r = chain.getBoundingClientRect();
      return clamp01(-r.top / Math.max(1, r.height - window.innerHeight));
    };

    const paint = (p: number) => {
      const vw = window.innerWidth;
      const amp = window.innerHeight * CHAIN_WAVE;
      const x = -p * travel;
      rail.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
      items.forEach((_, i) => {
        const cx = railLeft + base[i] + x + widths[i] / 2;
        // slike daleko van ekrana se ne crtaju — ništa se ne vidi, a štedi se posao
        if (Math.abs(cx - vw / 2) > vw / 2 + widths[i] + 40) return;
        // 0 na sredini (malo levo od centra), 1 na ivicama ekrana
        const d = Math.abs(cx - vw * 0.45) / (vw * 0.55);
        const inset = 30 * smoothstep(0.3, 1, d);
        // koliko je slika blizu sredine: tamo se ispravi, dobije boju i traku
        const f = 1 - smoothstep(0.05, 0.85, d);
        const rot = tilts[i] * (1 - 0.8 * f);
        // talas: visina zavisi od mesta na ekranu, pa se menja dok slika putuje
        const y = amp * Math.sin((cx / vw) * Math.PI * 1.7 + i * 1.25);
        movers[i].style.transform = `translate3d(0, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg)`;
        movers[i].style.setProperty("--f", f.toFixed(3));
        clips[i].style.clipPath = `inset(${inset.toFixed(2)}% -1px)`;
      });
    };

    // glatko praćenje skrola (kao „smooth scroll” na savor.it), petlja se odmara
    const tick = (now: number) => {
      const dt = Math.min(100, now - (last || now));
      last = now;
      shown += (target - shown) * (1 - Math.pow(1 - 0.12, dt / 16.667));
      const settled = Math.abs(target - shown) < 0.0004;
      if (settled) shown = target;
      paint(shown);
      if (settled) {
        raf = 0;
        last = 0;
      } else {
        raf = requestAnimationFrame(tick);
      }
    };
    const onScroll = () => {
      target = progress();
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onResize = () => {
      // na telefonu traka adrese menja samo visinu dok se skroluje: tada se
      // ne meri ponovo (visina sekcije bi skočila), samo se iscrta
      if (window.innerWidth !== lastWidth) measure();
      target = shown = progress();
      paint(shown);
    };

    const enable = () => {
      if (on) return;
      on = true;
      chain.dataset.chain = "on";
      measure();
      target = shown = progress();
      paint(shown);
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize);
    };
    const disable = () => {
      if (!on) return;
      on = false;
      delete chain.dataset.chain;
      chain.style.height = "";
      rail.style.transform = "";
      movers.forEach((m) => {
        m.style.transform = "";
        m.style.removeProperty("--f");
      });
      clips.forEach((c) => (c.style.clipPath = ""));
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    const apply = () => (mq.matches ? enable() : disable());
    mq.addEventListener("change", apply);
    apply();
    // fontovi i slike mogu malo da pomere širine posle prvog crtanja
    const settle = window.setTimeout(() => on && onResize(), 600);

    return () => {
      window.clearTimeout(settle);
      mq.removeEventListener("change", apply);
      disable();
    };
  }, []);

  /* ---------- uvećan prikaz ---------- */
  const close = useCallback(() => {
    setOpen(null);
    openerRef.current?.focus();
    openerRef.current = null;
  }, []);

  const step = useCallback((delta: number) => {
    setOpen((prev) =>
      prev === null ? prev : (prev + delta + MEMORIES.length) % MEMORIES.length
    );
  }, []);

  useEffect(() => {
    if (open === null) return;

    closeRef.current?.focus();

    // stranica ispod ne sme da se skroluje dok je prikaz otvoren
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        step(1);
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-1);
        return;
      }
      if (e.key !== "Tab") return;

      // fokus kruži samo unutar prikaza
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>("button");
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, close, step]);

  const current = open === null ? null : MEMORIES[open];

  return (
    <section className="al-memories" aria-labelledby="uspomene-naslov">
      <div className="al-memories__intro">
        <h2 id="uspomene-naslov" className="al-memories__title">
          Trenuci koji ostaju
        </h2>
        <p className="al-memories__lead">
          <AlumniBrand>
            Projekti, putovanja, timovi i prijateljstva koja su obeležila godine
            provedene u SEFA-i.
          </AlumniBrand>
        </p>
      </div>

      <div ref={chainRef} className="al-chain">
      <div className="al-chain__sticky">
      <ul ref={railRef} className="al-strip" tabIndex={0} aria-label="Traka fotografija">
        {MEMORIES.map((memory, i) => (
          <li key={`${memory.title}-${i}`} className="al-strip__item" data-shape={memory.shape}>
            <div className="al-strip__move">
            <div className="al-strip__clip">
            <button
              type="button"
              className="al-strip__shot"
              onClick={(e) => {
                if (draggedRef.current) return;
                openerRef.current = e.currentTarget;
                setOpen(i);
              }}
              aria-label={`${memory.video ? "Pusti" : "Uvećaj"}: ${memory.alt}`}
            >
              <StripMedia memory={memory} />
            </button>
            </div>
            </div>
          </li>
        ))}
      </ul>
      </div>
      </div>

      {current && (
        <div
          className="al-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${current.title}${current.year ? `, ${current.year}` : ""}`}
          ref={dialogRef}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <button
            ref={closeRef}
            type="button"
            className="al-lightbox__close"
            onClick={close}
            aria-label="Zatvori"
          >
            <X className="size-5" />
          </button>

          <button
            type="button"
            className="al-lightbox__nav al-lightbox__nav--prev"
            onClick={() => step(-1)}
            aria-label="Prethodna uspomena"
          >
            <ChevronLeft className="size-6" />
          </button>

          <figure className="al-lightbox__figure">
            <div className="al-lightbox__frame" data-shape={current.shape}>
              {current.video ? (
                <video
                  key={current.video}
                  className="al-lightbox__video"
                  src={current.video}
                  poster={current.src ?? undefined}
                  controls
                  autoPlay
                  loop
                  playsInline
                  aria-label={current.alt}
                />
              ) : current.src ? (
                <Image
                  src={current.src}
                  alt={current.alt}
                  fill
                  sizes="90vw"
                  className="al-lightbox__img"
                />
              ) : (
                <span className="al-frame__empty" aria-hidden="true">
                  <span className="al-frame__corner" />
                  <span className="al-frame__corner" />
                  <span className="al-frame__corner" />
                  <span className="al-frame__corner" />
                </span>
              )}
            </div>
            <figcaption className="al-lightbox__caption">
              {current.year && (
                <span className="al-lightbox__caption-year">{current.year}</span>
              )}
              {current.description && (
                <span className="al-lightbox__caption-desc">{current.description}</span>
              )}
            </figcaption>
          </figure>

          <button
            type="button"
            className="al-lightbox__nav al-lightbox__nav--next"
            onClick={() => step(1)}
            aria-label="Sledeća uspomena"
          >
            <ChevronRight className="size-6" />
          </button>
        </div>
      )}
    </section>
  );
}
