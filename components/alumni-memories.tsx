"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { MEMORIES } from "@/data/alumni";
import { AlumniFrame } from "@/components/alumni-frame";
import { AlumniBrand } from "@/components/alumni-brand";

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

/** Preko koliko piksela prevlačenja se klik više ne računa kao klik. */
const DRAG_SLOP = 6;

export function AlumniMemories() {
  const railRef = useRef<HTMLUListElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const draggedRef = useRef(false);

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
        <p className="al-eyebrow">Uspomene</p>
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

      <ul ref={railRef} className="al-strip" tabIndex={0} aria-label="Traka fotografija">
        {MEMORIES.map((memory, i) => (
          <li key={`${memory.title}-${i}`} className="al-strip__item" data-shape={memory.shape}>
            <button
              type="button"
              className="al-strip__shot"
              onClick={(e) => {
                if (draggedRef.current) return;
                openerRef.current = e.currentTarget;
                setOpen(i);
              }}
              aria-label={`Uvećaj: ${memory.alt}`}
            >
              <AlumniFrame
                src={memory.src}
                alt={memory.alt}
                sizes="(min-width: 1024px) 26vw, 60vw"
              />
            </button>
            <p className="al-strip__note">
              <span className="al-strip__note-title">{memory.title}</span>
              {memory.year && <span className="al-strip__note-year">{memory.year}</span>}
            </p>
          </li>
        ))}
      </ul>

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
            aria-label="Prethodna fotografija"
          >
            <ChevronLeft className="size-6" />
          </button>

          <figure className="al-lightbox__figure">
            <div className="al-lightbox__frame" data-shape={current.shape}>
              {current.src ? (
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
              <span className="al-lightbox__caption-title">{current.title}</span>
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
            aria-label="Sledeća fotografija"
          >
            <ChevronRight className="size-6" />
          </button>
        </div>
      )}
    </section>
  );
}
