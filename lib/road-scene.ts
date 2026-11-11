/**
 * Geometrija scene za sekciju „Naš put” — sve što se iscrtava na tlu:
 * delovi puta, trag rute i raspored drveća i žbunja.
 *
 * Put se seče na kratke delove (svaki je svoj mali 3D sloj u pregledaču).
 * Tako se, kad kamera pređe u pogled iza auta, bliski delovi crtaju oštro, a
 * daleki u nižoj rezoluciji, i ne mora ceo svet da se iscrta odjednom.
 *
 * Raspored zelenila je pseudo-nasumičan sa fiksnim semenom: svako učitavanje
 * daje isti raspored.
 */

import type { World } from "@/lib/road-path";

export type Sample = { x: number; y: number; len: number };

export type Chunk = {
  /** Putanja u koordinatama sveta, tačno od početka do kraja dela. */
  d: string;
  /** Ista putanja sa preklopom na krajevima (za neprozirni asfalt). */
  dOver: string;
  /** Okvir dela (sa marginom), u koordinatama sveta. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Dužina puta na početku i kraju dela. */
  start: number;
  end: number;
  /** Središte okvira — za odbacivanje delova daleko od kamere. */
  cx: number;
  cy: number;
};

export type Sprite = {
  kind: "tree" | "bush";
  x: number;
  y: number;
  /** Prečnik krošnje odozgo, u jedinicama sveta. */
  size: number;
  /** Rotacija sprajta odozgo, u stepenima. */
  rot: number;
  /** Ogledalo za verziju sa strane (više raznolikosti iz iste slike). */
  flip: boolean;
};

/** Deterministički generator (mulberry32). */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f1 = (n: number) => n.toFixed(1);

/** Desna normala pravca vožnje (y raste naniže). */
function rightNormal(samples: Sample[], i: number) {
  const a = samples[Math.max(i - 1, 0)];
  const b = samples[Math.min(i + 1, samples.length - 1)];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const l = Math.hypot(dx, dy) || 1;
  return { x: -dy / l, y: dx / l };
}

/** Ista linija, pomerena bočno za `offset` (pozitivno = desno od vozača). */
export function offsetSamples(samples: Sample[], offset: number): Sample[] {
  return samples.map((s, i) => {
    const n = rightNormal(samples, i);
    return { x: s.x + n.x * offset, y: s.y + n.y * offset, len: s.len };
  });
}

/**
 * Seče liniju na delove dužine ~`chunkLen`. `overlap` dodaje po nekoliko
 * uzoraka na krajevima da se susedni delovi preklope (bez tankog šava).
 */
export function chunkSamples(
  samples: Sample[],
  chunkLen: number,
  pad: number,
  overlap = 0
): Chunk[] {
  const chunks: Chunk[] = [];
  let from = 0;
  while (from < samples.length - 1) {
    let to = from + 1;
    while (
      to < samples.length - 1 &&
      samples[to].len - samples[from].len < chunkLen
    )
      to++;

    const lo = Math.max(from - overlap, 0);
    const hi = Math.min(to + overlap, samples.length - 1);
    const pts = samples.slice(lo, hi + 1);
    const exact = samples.slice(from, to + 1);
    const line = (list: Sample[]) =>
      "M " + list.map((p) => `${f1(p.x)} ${f1(p.y)}`).join(" L ");

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const p of pts) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
    const x = Math.floor(minX - pad);
    const y = Math.floor(minY - pad);
    const w = Math.ceil(maxX + pad) - x;
    const h = Math.ceil(maxY + pad) - y;

    chunks.push({
      d: line(exact),
      dOver: line(pts),
      x,
      y,
      w,
      h,
      start: samples[from].len,
      end: samples[to].len,
      cx: x + w / 2,
      cy: y + h / 2,
    });
    from = to;
  }
  return chunks;
}

/** Najmanje rastojanje tačke do linije puta (grubo, po uzorcima). */
function distToRoad(samples: Sample[], x: number, y: number) {
  let best = Infinity;
  for (let i = 0; i < samples.length; i += 2) {
    const d = Math.hypot(samples[i].x - x, samples[i].y - y);
    if (d < best) best = d;
  }
  return best;
}

/**
 * Drveće i žbunje uz obe strane puta. Uvek isti raspored (seme), bez
 * preklapanja sa putem ni međusobno.
 */
export function buildSprites(
  world: World,
  opts: {
    seed: number;
    max: number;
    roadWidth: number;
    treeSize: number;
    bushSize: number;
  }
): Sprite[] {
  const { samples, total } = world;
  const r = rng(opts.seed);
  const half = opts.roadWidth / 2;
  const out: Sprite[] = [];

  let along = 90;
  let side = r() < 0.5 ? 1 : -1;

  while (along < total - 60) {
    // pronađi uzorak na ovoj dužini
    let i = 0;
    while (i < samples.length - 1 && samples[i].len < along) i++;
    const s = samples[i];
    const n = rightNormal(samples, i);

    const tree = r() < 0.58;
    const scale = 0.8 + r() * 0.5; // 0.8 – 1.3
    const size = (tree ? opts.treeSize : opts.bushSize) * scale;
    const lateral = tree
      ? half + 16 + size * 0.5 + r() * 95
      : half + 8 + size * 0.5 + r() * 40;

    const x = s.x + n.x * lateral * side;
    const y = s.y + n.y * lateral * side;

    const clearOfRoad = distToRoad(samples, x, y) > half + 6 + size * 0.42;
    const clearOfOthers = out.every(
      (o) => Math.hypot(o.x - x, o.y - y) > (o.size + size) * 0.42
    );

    if (clearOfRoad && clearOfOthers) {
      out.push({
        kind: tree ? "tree" : "bush",
        x,
        y,
        size,
        rot: Math.floor(r() * 360),
        flip: r() < 0.5,
      });
    }

    // sledeći: uglavnom druga strana, ponekad ista; razmak nepravilan
    if (r() < 0.72) side = -side;
    along += 42 + r() * 78;
  }

  if (out.length <= opts.max) return out;
  // ravnomerno proređivanje do traženog broja
  const step = out.length / opts.max;
  return Array.from({ length: opts.max }, (_, k) => out[Math.floor(k * step)]);
}
