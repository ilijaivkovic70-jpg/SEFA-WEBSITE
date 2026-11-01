"use client";

import { useEffect, useRef } from "react";

/**
 * Prelaz „kupolom” između sekcije tima (kolaž) i sledeće sekcije, po uzoru
 * na savor.it/process. Sledeća sekcija izranja odozdo kao uska kupola koja
 * raste i spljoštava se, zatim se okrene u obrnuti luk, pa od prethodne
 * sekcije ostane samo elipsa na vrhu koja se smanjuje i nestaje. Za to
 * vreme naslov tima stoji u mestu (sticky).
 *
 * Kako radi: sekcija tima postaje dva ekrana visoka (sadržaj je lepljiv),
 * a omotač sledeće sekcije se podvlači preko nje (negativna margina) i
 * iseca se clip-path oblikom koji se računa iz skrola. Bez JS-a i uz
 * „smanjeno kretanje” raspored ostaje običan, bez prelaza.
 *
 * Komponenta se stavlja kao prvo dete omotača sledeće sekcije.
 */
export function DomeReveal({ targetId = "team-hero-section" }: { targetId?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrap = ref.current?.parentElement;
    const team = document.getElementById(targetId);
    if (!wrap || !team) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const edge = ref.current?.nextElementSibling?.querySelector("path") ?? null;
    let on = false;
    let vh = 0;
    let lastWidth = 0;
    let frame = 0;
    let lastQ = -1;

    const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
    const ease = (t: number) => t * t * (3 - 2 * t);

    const measure = () => {
      vh = window.innerHeight;
      lastWidth = window.innerWidth;
      wrap.style.setProperty("--dome-vh", `${vh}px`);
      team.style.setProperty("--dome-vh", `${vh}px`);
    };

    let edgeD = "";
    /** Oblik u koordinatama omotača: vrh luka je uvek na visini jednog ekrana. */
    const shape = (q: number) => {
      const w = wrap.clientWidth;
      const h = wrap.offsetHeight;
      const cx = w / 2;
      const apex = vh;
      const zoneEnd = vh * 2;
      // B > 0: kupola (krajevi niže od vrha), B < 0: obrnuti luk
      const B = vh * 1.1 * (1 - 2 * q);
      const f = (n: number) => n.toFixed(1);

      if (B >= 0) {
        const t = ease(clamp01(q / 0.5));
        const rx = w * (0.38 + 0.95 * t * t);
        const ry = Math.max(0.5, B);
        const y = apex + ry;
        edgeD = `M${f(cx - rx)} ${f(y)} A${f(rx)} ${f(ry)} 0 0 1 ${f(cx + rx)} ${f(y)}`;
        return (
          `path(nonzero, "M${f(cx - rx)} ${f(y)} A${f(rx)} ${f(ry)} 0 0 1 ${f(cx + rx)} ${f(y)} ` +
          `L${f(cx + rx)} ${f(zoneEnd)} L${f(w)} ${f(zoneEnd)} L${f(w)} ${f(h)} L0 ${f(h)} ` +
          `L0 ${f(zoneEnd)} L${f(cx - rx)} ${f(zoneEnd)} Z")`
        );
      }
      const t = ease(clamp01((1 - q) / 0.5));
      const rx = w * (0.38 + 0.95 * t * t);
      const ry = Math.max(0.5, -B);
      const y = apex - ry;
      // otvor je samo DONJA polovina elipse, produžena pravo do vrha
      // omotača — inače bi se pri dnu ekrana video i gornji luk elipse
      edgeD = `M${f(cx - rx)} ${f(y)} A${f(rx)} ${f(ry)} 0 0 0 ${f(cx + rx)} ${f(y)}`;
      return (
        `path(evenodd, "M0 0 L${f(w)} 0 L${f(w)} ${f(h)} L0 ${f(h)} Z ` +
        `M${f(cx - rx)} ${f(Math.min(0, y))} L${f(cx - rx)} ${f(y)} ` +
        `A${f(rx)} ${f(ry)} 0 0 0 ${f(cx + rx)} ${f(y)} L${f(cx + rx)} ${f(Math.min(0, y))} Z")`
      );
    };

    const paint = () => {
      frame = 0;
      // q: 0 kad sekcija tima stigne do vrha ekrana, 1 ekran skrola kasnije
      const q = clamp01(-team.getBoundingClientRect().top / vh);
      if (Math.abs(q - lastQ) < 0.0008) return;
      lastQ = q;
      wrap.style.clipPath = q >= 1 ? "none" : shape(q);
      // tanka svetla ivica duž luka, da se oblik vidi i na tamnom kolažu
      edge?.setAttribute("d", q >= 1 || q <= 0 ? "" : edgeD);
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const onResize = () => {
      // traka adrese na telefonu menja samo visinu: tada se ne meri ponovo
      if (window.innerWidth !== lastWidth) measure();
      lastQ = -1;
      request();
    };

    const enable = () => {
      if (on) return;
      on = true;
      measure();
      wrap.dataset.dome = "on";
      team.dataset.dome = "on";
      lastQ = -1;
      paint();
      window.addEventListener("scroll", request, { passive: true });
      window.addEventListener("resize", onResize);
    };
    const disable = () => {
      if (!on) return;
      on = false;
      delete wrap.dataset.dome;
      delete team.dataset.dome;
      wrap.style.clipPath = "";
      edge?.setAttribute("d", "");
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", onResize);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };
    const apply = () => (reduce.matches ? disable() : enable());
    reduce.addEventListener("change", apply);
    apply();

    return () => {
      reduce.removeEventListener("change", apply);
      disable();
    };
  }, [targetId]);

  return (
    <>
      <span ref={ref} hidden />
      <svg className="dome-edge" aria-hidden="true">
        <path d="" />
      </svg>
    </>
  );
}
