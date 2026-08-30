/**
 * Geometrija vijugavog puta za sekciju „Naš put”.
 *
 * Sve je čista matematika, bez DOM-a: put se gradi kao Catmull-Rom kriva kroz
 * tačke stanica, a zatim se uzorkuje u tabelu (LUT) sa kumulativnom dužinom.
 * Zahvaljujući tome komponenta zna gde je „kamera” na putu bez `getPointAtLength`
 * i bez merenja u pretraživaču — isti rezultat na serveru i u pretraživaču.
 *
 * Koordinatni sistem („svet”) je u SVG jedinicama: širina 1000, visina zavisi
 * od broja stanica.
 */

export type Pt = { x: number; y: number };

export const WORLD_W = 1000;

/** Razmak između stanica po vertikali. Veći broj = duže „putovanje”. */
const SPACING = 1150;
/** Koliko puta ulazi u kadar iznad prve i izlazi ispod poslednje stanice. */
const TAIL = 950;
/** Y prve stanice. */
const FIRST_Y = 900;

/**
 * Vodoravni položaj stanica (udeo širine sveta). Namerno nije savršeno
 * naizmenično 0.3 / 0.7 — pravilna smena deluje mašinski, pa su amplitude
 * različite da bi krivine izgledale kao ručno povučena ruta.
 */
const SWAY = [0.31, 0.71, 0.35, 0.64, 0.27, 0.69, 0.4, 0.6];
/** Blago pomeranje po vertikali, da razmaci ne budu identični. */
const DRIFT = [0, 70, -55, 40, -30, 65, -20, 45];

function at<T>(list: T[], i: number): T {
  return list[i % list.length];
}

/** Kubna Bézier tačka za parametar t. */
function cubicAt(p1: Pt, c1: Pt, c2: Pt, p2: Pt, t: number): Pt {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return {
    x: a * p1.x + b * c1.x + c * c2.x + d * p2.x,
    y: a * p1.y + b * c1.y + c * c2.y + d * p2.y,
  };
}

/** Kontrolne tačke Catmull-Rom segmenta `i` (points[i] → points[i + 1]). */
function controls(points: Pt[], i: number) {
  const p0 = points[i - 1] ?? points[i];
  const p1 = points[i];
  const p2 = points[i + 1];
  const p3 = points[i + 2] ?? p2;
  return {
    p1,
    p2,
    c1: { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 },
    c2: { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 },
  };
}

export type World = {
  /** `d` atribut SVG putanje. */
  d: string;
  /** Tačke stanica u koordinatama sveta. */
  stops: Pt[];
  /** Dužina puta do svake stanice. */
  stopLengths: number[];
  /** Ukupna dužina puta. */
  total: number;
  /** Visina sveta (za viewBox). */
  height: number;
  /** Uzorci putanje sa kumulativnom dužinom. */
  samples: { x: number; y: number; len: number }[];
};

/** Gradi put kroz `count` stanica. */
export function buildWorld(count: number, samplesPerSegment = 48): World {
  const stops: Pt[] = Array.from({ length: count }, (_, i) => ({
    x: at(SWAY, i) * WORLD_W,
    y: FIRST_Y + i * SPACING + at(DRIFT, i),
  }));

  const first = stops[0];
  const last = stops[count - 1];
  // ulazna i izlazna tačka su van kadra — put „dolazi niotkuda” i nastavlja dalje
  const points: Pt[] = [
    { x: WORLD_W * 0.55, y: first.y - TAIL },
    ...stops,
    { x: WORLD_W * 0.63, y: last.y + TAIL },
  ];

  const d: string[] = [`M ${points[0].x} ${points[0].y}`];
  const samples: World["samples"] = [
    { x: points[0].x, y: points[0].y, len: 0 },
  ];
  const stopLengths: number[] = [];

  let len = 0;
  let prev = points[0];

  for (let i = 0; i < points.length - 1; i++) {
    const { p1, c1, c2, p2 } = controls(points, i);
    d.push(
      `C ${c1.x.toFixed(2)} ${c1.y.toFixed(2)} ${c2.x.toFixed(2)} ${c2.y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
    );

    for (let s = 1; s <= samplesPerSegment; s++) {
      const pt = cubicAt(p1, c1, c2, p2, s / samplesPerSegment);
      len += Math.hypot(pt.x - prev.x, pt.y - prev.y);
      samples.push({ x: pt.x, y: pt.y, len });
      prev = pt;
    }

    // points[i + 1] je stanica broj i (points[0] je ulazna tačka)
    if (i < count) stopLengths[i] = len;
  }

  return {
    d: d.join(" "),
    stops,
    stopLengths,
    total: len,
    height: last.y + TAIL,
    samples,
  };
}

/**
 * Tačka na putu za zadatu dužinu, plus ugao tangente u stepenima
 * (90° = pravo naniže).
 */
export function pointAtLength(world: World, len: number) {
  const { samples } = world;
  const target = Math.min(Math.max(len, 0), world.total);

  let lo = 0;
  let hi = samples.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (samples[mid].len <= target) lo = mid;
    else hi = mid;
  }

  const a = samples[lo];
  const b = samples[hi];
  const span = b.len - a.len;
  const t = span > 0 ? (target - a.len) / span : 0;

  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    angle: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI,
  };
}

/**
 * Vijugava vertikalna linija za mobilnu verziju (viewBox 0 0 100 1000).
 * Rasteže se preko cele visine liste, a krivine padaju otprilike na visinu
 * stanica — svaka stanica zauzima jednak deo liste.
 */
export function buildTrail(count: number): { d: string; xs: number[] } {
  // opseg 23–77 od 100: širok potez mora da stane u traku bez sečenja ivica
  const xs = Array.from({ length: count }, (_, i) => at(SWAY, i) * 54 + 23);
  const step = 1000 / count;
  const points: Pt[] = [
    { x: 50, y: 0 },
    ...xs.map((x, i) => ({ x, y: step * (i + 0.5) })),
    { x: 55, y: 1000 },
  ];

  const d = [`M ${points[0].x} ${points[0].y}`];
  for (let i = 0; i < points.length - 1; i++) {
    const { c1, c2, p2 } = controls(points, i);
    d.push(
      `C ${c1.x.toFixed(2)} ${c1.y.toFixed(2)} ${c2.x.toFixed(2)} ${c2.y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
    );
  }
  return { d: d.join(" "), xs };
}
