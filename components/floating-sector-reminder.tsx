"use client";

import { useEffect, useRef, useState } from "react";

const ENTER_MS = 1000;
const LEAVE_MS = 800;

type Phase = "closed" | "enter" | "settled" | "leave";

export type SectorReminderProps = {
  /** Interni naziv sektora — ide u data-atribut, ne prikazuje se. */
  sector: string;
  /** Kratka poruka ispisana u oblačiću. */
  message: string;
  /** Kad pređe u true, oblačić kreće da se pojavljuje (posle `delay`). */
  trigger: boolean;
  /** Pauza pre pojavljivanja, u ms, pošto `trigger` postane true. */
  delay?: number;
  /** Koliko dugo oblačić ostaje na ekranu, u ms, pre nego što se sam povuče. */
  duration?: number;
  /** Poziva se kad oblačić potpuno nestane — i posle isteka i posle ručnog zatvaranja. */
  onDismiss?: () => void;
};

/**
 * Mali oblačić-podsetnik: uđe sa desne ivice ekrana, blago lebdi dok
 * stoji, i sam se posle `duration` povuče. Ne pojavljuje se sam od
 * sebe — roditelj određuje tempo preko `trigger`.
 */
export function SectorReminder({
  sector,
  message,
  trigger,
  delay = 0,
  duration = 10000,
  onDismiss,
}: SectorReminderProps) {
  const [phase, setPhase] = useState<Phase>("closed");
  const [motionOn, setMotionOn] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMotionOn(!query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!trigger) return;

    const after = (ms: number, fn: () => void) => {
      timersRef.current.push(setTimeout(fn, ms));
    };

    after(delay, () => {
      setPhase("enter");
      after(ENTER_MS, () => setPhase("settled"));
      after(duration, () => setPhase("leave"));
    });

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [trigger, delay, duration]);

  // "leave" se dešava i kad istekne vreme i kad se ručno zatvori —
  // ovde na jednom mestu sačekamo da animacija izlaska završi.
  useEffect(() => {
    if (phase !== "leave") return;
    const t = setTimeout(() => {
      setPhase("closed");
      onDismissRef.current?.();
    }, LEAVE_MS);
    return () => clearTimeout(t);
  }, [phase]);

  const handleClose = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setPhase((p) => (p === "closed" || p === "leave" ? p : "leave"));
  };

  if (phase === "closed") return null;

  return (
    <div
      className="reminder-cloud"
      data-phase={phase}
      data-motion={motionOn ? "on" : "off"}
      data-sector={sector}
    >
      <div className="reminder-cloud__slide">
        <div className="reminder-cloud__float">
          <div className="reminder-cloud__shape">
            <svg
              className="reminder-cloud__svg"
              viewBox="10 12 300 185"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M 304.33 102.56 C 300.68 108.52 282.00 112.92 272.27 117.92 C 262.53 122.91 255.80 127.87 245.92 132.53 C 236.03 137.19 225.80 143.21 212.97 145.87 C 200.14 148.54 183.14 149.05 168.94 148.51 C 154.74 147.98 141.90 144.13 127.79 142.67 C 113.68 141.21 97.08 142.44 84.29 139.76 C 71.50 137.08 59.49 131.80 51.05 126.60 C 42.61 121.40 37.72 114.69 33.66 108.56 C 29.59 102.44 29.06 96.30 26.68 89.85 C 24.31 83.40 16.45 75.99 19.41 69.87 C 22.37 63.75 34.96 58.02 44.44 53.15 C 53.91 48.27 65.71 45.02 76.24 40.64 C 86.78 36.25 95.22 30.06 107.64 26.81 C 120.05 23.56 136.71 20.57 150.72 21.13 C 164.74 21.70 177.63 28.29 191.71 30.20 C 205.80 32.11 221.94 30.20 235.24 32.58 C 248.54 34.95 263.76 39.17 271.50 44.45 C 279.24 49.73 277.92 57.99 281.69 64.27 C 285.46 70.55 290.36 75.75 294.13 82.13 C 297.90 88.51 307.97 96.59 304.33 102.56 Z" />
              <path d="M 152 144 C 140 162, 118 178, 104 190 C 126 186, 150 174, 164 158 C 168 153, 166 147, 158 144 Z" />
            </svg>
            <div className="reminder-cloud__body" role="status" aria-live="polite">
              <button
                type="button"
                className="reminder-cloud__close"
                onClick={handleClose}
                aria-label="Zatvori podsetnik"
              >
                ×
              </button>
              {message}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- jedan podsetnik, jednom po poseti ---------- */

const APPEAR_AFTER_MS = 6000;
const HOLD_MS = 10000;
const MESSAGE =
  "Psst... znaš li da SEFA ima tri sektora? Komunikacije, Sponzorstva i Ljudski resursi.";

/**
 * Montira se jednom, na stranici Postani član. Posle nekoliko
 * sekundi pusti jedan oblačić koji podseti da postoje tri sektora
 * i nabroji ih — i to je to, ne ponavlja se.
 */
export function SectorReminderOnce() {
  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setTrigger(true), APPEAR_AFTER_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <SectorReminder
      sector="sektori"
      message={MESSAGE}
      trigger={trigger}
      duration={HOLD_MS}
    />
  );
}
