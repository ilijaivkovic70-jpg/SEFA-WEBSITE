/**
 * CRTANJE AKREDITACIJA (Alumni stranica)
 *
 * Svaka akreditacija na stranici je 3D kartica (components/alumni-rack.tsx),
 * a njeno lice i poleđina se crtaju ovde, na običnom <canvas>-u, pa se kao
 * slika „zalepe” na karticu. Tekst koji se ovde crta dolazi iz
 * `data/alumni.ts` — ovde se ne menja sadržaj, samo raspored na kartici.
 *
 * Sve mere su u delovima širine kartice (W), da kartica izgleda isto
 * u svakoj veličini.
 */

/** Oblik kartice — isti brojevi prave i 3D telo (rupa za kopču mora da se poklopi). */
export const CARD = {
  /** visina / širina */
  ratio: 1.42,
  /** zaobljenje uglova, deo širine */
  radius: 0.055,
  /** prorez za kopču: širina, visina i razmak od gornje ivice (delovi širine) */
  slotW: 0.26,
  slotH: 0.045,
  slotTop: 0.05,
} as const;

/** rezolucija slike jedne strane kartice */
export const TEX_W = 640;
export const TEX_H = Math.round(TEX_W * CARD.ratio);

export const COLORS = {
  mint: "#66C6B3",
  mintDeep: "#2F6F63",
  canvas: "#07100F",
  canvas2: "#0B1615",
  ink: "#EAF2F0",
} as const;

export type Fonts = { display: string; mono: string; body: string };

/** Fontovi sajta (next/font ih zadaje kao CSS promenljive na <html>). */
export function readFonts(): Fonts {
  const cs = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  return {
    display: v("--font-bricolage", "sans-serif"),
    mono: v("--font-jetbrains-mono", "monospace"),
    body: v("--font-archivo", "sans-serif"),
  };
}

/** Sačeka da se fontovi učitaju, inače bi canvas crtao rezervnim fontom. */
export async function loadFonts(f: Fonts) {
  if (!("fonts" in document)) return;
  await Promise.all([
    document.fonts.load(`800 64px ${f.display}`, "ALUMNIČŽŠĆĐ"),
    document.fonts.load(`500 20px ${f.mono}`, "SEFAČ"),
    document.fonts.load(`400 20px ${f.body}`, "aČ"),
    document.fonts.load(`600 20px ${f.body}`, "aČ"),
  ]).catch(() => undefined);
}

/* ---------------- pomoćne funkcije ---------------- */

type Ctx = CanvasRenderingContext2D;

function rgba(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

function spacing(ctx: Ctx, px: number) {
  if ("letterSpacing" in ctx) (ctx as Ctx & { letterSpacing: string }).letterSpacing = `${px}px`;
}

function font(ctx: Ctx, weight: number, size: number, family: string) {
  ctx.font = `${weight} ${size}px ${family}`;
}

/** sitna mono labela, velikim slovima i razmaknuta */
function label(
  ctx: Ctx,
  f: Fonts,
  text: string,
  x: number,
  y: number,
  size: number,
  color: string,
  align: CanvasTextAlign = "left"
) {
  font(ctx, 500, size, f.mono);
  spacing(ctx, size * 0.14);
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(text.toUpperCase(), x, y);
  spacing(ctx, 0);
}

/** reči u redove zadate širine; duga reč sme da se prelomi na mestu
 *  „mekog crtića” (\u00AD) iz podataka, uz vidljiv crtić na kraju reda */
function wrap(ctx: Ctx, text: string, maxW: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const parts = word.split("\u00AD");
    parts.forEach((part, i) => {
      const glue = i === 0 ? (line ? " " : "") : "";
      const next = line + glue + part;
      const hyphen = i < parts.length - 1 ? "-" : "";
      if (line && ctx.measureText(next + hyphen).width > maxW) {
        lines.push(i === 0 ? line : `${line}-`);
        line = part;
      } else line = next;
    });
  }
  if (line) lines.push(line);
  return lines;
}

/** najveća veličina fonta pri kojoj tekst staje u `maxLines` redova */
function fitWrap(
  ctx: Ctx,
  text: string,
  weight: number,
  family: string,
  maxW: number,
  maxLines: number,
  maxSize: number,
  minSize: number
) {
  spacing(ctx, 0);
  for (let size = maxSize; size >= minSize; size -= 2) {
    font(ctx, weight, size, family);
    const lines = wrap(ctx, text, maxW);
    if (lines.length <= maxLines && lines.every((l) => ctx.measureText(l).width <= maxW)) {
      return { size, lines };
    }
  }
  font(ctx, weight, minSize, family);
  return { size: minSize, lines: wrap(ctx, text, maxW) };
}

function base(ctx: Ctx, W: number, H: number, fill: string) {
  ctx.clearRect(0, 0, W, H);
  ctx.beginPath();
  ctx.roundRect(0, 0, W, H, W * CARD.radius);
  ctx.fillStyle = fill;
  ctx.fill();
}

/** prorez za kopču — stvarno je providan, kroz njega se vidi pozadina */
function cutSlot(ctx: Ctx, W: number) {
  const w = W * CARD.slotW;
  const h = W * CARD.slotH;
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.roundRect((W - w) / 2, W * CARD.slotTop, w, h, h / 2);
  ctx.fill();
  ctx.restore();
}

function rule(ctx: Ctx, x: number, y: number, w: number, color: string, lw = 2) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, lw);
}

/** četiri ugla praznog okvira za buduću fotografiju */
function corners(ctx: Ctx, x: number, y: number, w: number, h: number, len: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = "square";
  ctx.beginPath();
  ctx.moveTo(x, y + len); ctx.lineTo(x, y); ctx.lineTo(x + len, y);
  ctx.moveTo(x + w - len, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + len);
  ctx.moveTo(x + w, y + h - len); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w - len, y + h);
  ctx.moveTo(x + len, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x, y + h - len);
  ctx.stroke();
}

/** ukrasni bar-kod — uvek isti za isti tekst (ne nosi nikakav podatak) */
function barcode(ctx: Ctx, x: number, y: number, w: number, h: number, seed: string, color: string) {
  let s = 0;
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
  const rand = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const unit = w / 140;
  ctx.fillStyle = color;
  let cx = x;
  while (cx < x + w) {
    const bw = unit * (1 + Math.floor(rand() * 3));
    if (cx + bw > x + w) break;
    ctx.fillRect(cx, y, bw, h);
    cx += bw + unit * (1 + Math.floor(rand() * 2));
  }
}

/* ---------------- traka (lanyard) ---------------- */

/** Mint traka sa natpisom koji se ponavlja; slika se ponavlja duž trake. */
export function drawStrap(ctx: Ctx, W: number, H: number, f: Fonts, text: string) {
  ctx.fillStyle = COLORS.mint;
  ctx.fillRect(0, 0, W, H);
  // tkanje: tanke uzdužne niti
  ctx.fillStyle = rgba(COLORS.canvas, 0.06);
  for (let x = 0; x < W; x += 6) ctx.fillRect(x, 0, 2, H);
  // šav uz ivice
  ctx.fillStyle = rgba(COLORS.canvas, 0.28);
  for (let y = 0; y < H; y += 16) {
    ctx.fillRect(10, y, 3, 9);
    ctx.fillRect(W - 13, y, 3, 9);
  }
  // natpis, okrenut duž trake; razmak je podešen tako da se slika
  // bez šava nastavlja kad se ponovi
  ctx.save();
  ctx.translate(W / 2, H);
  ctx.rotate(-Math.PI / 2);
  font(ctx, 600, W * 0.36, f.mono);
  spacing(ctx, W * 0.05);
  ctx.fillStyle = COLORS.canvas;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  const unit = `${text.toUpperCase()}  ·  `;
  const tw = ctx.measureText(unit).width;
  const count = Math.max(1, Math.round(H / tw));
  const step = H / count;
  for (let i = 0; i < count; i++) ctx.fillText(unit, i * step, 2);
  ctx.restore();
  spacing(ctx, 0);
}

/* ---------------- glavna alumni akreditacija (hero) ---------------- */

export type HeroPass = {
  label: string;
  title: string;
  count: number;
  countSuffix: string;
  countLabel: string;
  nameField: string;
  sinceField: string;
  sinceValue: string;
  validField: string;
  validValue: string;
  footer: string;
};

export function drawHeroFront(ctx: Ctx, W: number, H: number, f: Fonts, d: HeroPass) {
  const ink = COLORS.canvas;
  const pad = W * 0.08;
  base(ctx, W, H, COLORS.mint);

  label(ctx, f, d.label, pad, W * 0.2, W * 0.032, ink);
  label(ctx, f, "SEFA", W - pad, W * 0.2, W * 0.032, ink, "right");
  rule(ctx, pad, W * 0.232, W - pad * 2, rgba(ink, 0.4));

  // veliki natpis
  const t = fitWrap(ctx, d.title, 800, f.display, W - pad * 2, 1, W * 0.3, W * 0.12);
  font(ctx, 800, t.size, f.display);
  ctx.fillStyle = ink;
  ctx.textAlign = "left";
  const titleBase = W * 0.24 + t.size * 0.86;
  ctx.fillText(t.lines[0], pad - t.size * 0.03, titleBase);

  // mesto za fotografiju + broj članova
  const fy = titleBase + W * 0.06;
  const fw = W * 0.4;
  const fh = fw * 1.12;
  ctx.fillStyle = rgba(ink, 0.1);
  ctx.beginPath();
  ctx.roundRect(pad, fy, fw, fh, W * 0.02);
  ctx.fill();
  corners(ctx, pad + W * 0.03, fy + W * 0.03, fw - W * 0.06, fh - W * 0.06, W * 0.05, rgba(ink, 0.55));

  const cx = pad + fw + W * 0.06;
  font(ctx, 800, W * 0.18, f.display);
  ctx.fillStyle = ink;
  ctx.fillText(`${d.count}${d.countSuffix}`, cx, fy + W * 0.15);
  font(ctx, 500, W * 0.03, f.mono);
  spacing(ctx, W * 0.004);
  wrap(ctx, d.countLabel.toUpperCase(), W - pad - cx).forEach((l, i) =>
    ctx.fillText(l, cx, fy + W * 0.22 + i * W * 0.045)
  );
  spacing(ctx, 0);

  // polja za upis
  let y = fy + fh + W * 0.09;
  label(ctx, f, d.nameField, pad, y, W * 0.028, rgba(ink, 0.7));
  rule(ctx, pad, y + W * 0.07, W - pad * 2, ink);
  y += W * 0.14;
  const col2 = W * 0.52;
  label(ctx, f, d.sinceField, pad, y, W * 0.028, rgba(ink, 0.7));
  label(ctx, f, d.validField, col2, y, W * 0.028, rgba(ink, 0.7));
  font(ctx, 800, W * 0.062, f.display);
  ctx.fillStyle = ink;
  ctx.fillText(d.sinceValue, pad, y + W * 0.07);
  ctx.fillText(d.validValue, col2, y + W * 0.07);

  // donja tamna traka
  const bh = H * 0.075;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(0, 0, W, H, W * CARD.radius);
  ctx.clip();
  ctx.fillStyle = ink;
  ctx.fillRect(0, H - bh, W, bh);
  ctx.restore();
  label(ctx, f, d.footer, W / 2, H - bh / 2 + W * 0.011, W * 0.028, COLORS.mint, "center");

  cutSlot(ctx, W);
}

export function drawHeroBack(ctx: Ctx, W: number, H: number, f: Fonts, d: { label: string; line: string }) {
  base(ctx, W, H, COLORS.canvas2);
  const pad = W * 0.08;
  // „SEFA” uspravno, preko cele visine
  ctx.save();
  ctx.translate(W * 0.62, H - pad);
  ctx.rotate(-Math.PI / 2);
  const t = fitWrap(ctx, "SEFA", 800, f.display, H - pad * 2 - W * 0.16, 1, W * 0.62, W * 0.2);
  font(ctx, 800, t.size, f.display);
  ctx.fillStyle = COLORS.mint;
  ctx.textAlign = "left";
  ctx.fillText("SEFA", 0, 0);
  ctx.restore();

  label(ctx, f, d.label, pad, W * 0.2, W * 0.032, COLORS.mint);
  rule(ctx, pad, W * 0.232, W * 0.3, rgba(COLORS.mint, 0.5));
  font(ctx, 600, W * 0.045, f.body);
  ctx.fillStyle = COLORS.ink;
  ctx.textAlign = "left";
  wrap(ctx, d.line, W * 0.36).forEach((l, i) => ctx.fillText(l, pad, H * 0.36 + i * W * 0.062));
  barcode(ctx, pad, H - pad - W * 0.06, W * 0.34, W * 0.06, d.line, rgba(COLORS.ink, 0.5));
  cutSlot(ctx, W);
}

/* ---------------- akreditacija karijernog pravca ---------------- */

export type Stock = {
  /** boja kartice */
  stock: string;
  /** boja štampe */
  ink: string;
  /** boja kose trake preko kartice */
  band: string;
  /** boja teksta u kosoj traci */
  bandInk: string;
};

export function drawPathFront(
  ctx: Ctx,
  W: number,
  H: number,
  f: Fonts,
  s: Stock,
  d: { kicker: string; title: string; band: string; footer: string }
) {
  const pad = W * 0.08;
  base(ctx, W, H, s.stock);

  label(ctx, f, d.kicker, pad, W * 0.2, W * 0.032, s.ink);
  label(ctx, f, "SEFA", W - pad, W * 0.2, W * 0.032, s.ink, "right");
  rule(ctx, pad, W * 0.232, W - pad * 2, rgba(s.ink, 0.35));

  // kosa traka „zone pristupa”, kao na pravim akreditacijama
  const y0 = H * 0.36;
  const y1 = H * 0.28;
  const th = H * 0.085;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(0, 0, W, H, W * CARD.radius);
  ctx.clip();
  ctx.fillStyle = s.band;
  ctx.beginPath();
  ctx.moveTo(0, y0);
  ctx.lineTo(W, y1);
  ctx.lineTo(W, y1 + th);
  ctx.lineTo(0, y0 + th);
  ctx.closePath();
  ctx.fill();
  ctx.translate(pad, y0 + th / 2 - (y0 - y1) * (pad / W));
  ctx.rotate(Math.atan2(y1 - y0, W));
  label(ctx, f, d.band, 0, W * 0.012, W * 0.032, s.bandInk);
  ctx.restore();

  // naziv pravca, poravnat odozdo
  const t = fitWrap(ctx, d.title, 800, f.display, W - pad * 2, 3, W * 0.16, W * 0.08);
  font(ctx, 800, t.size, f.display);
  ctx.fillStyle = s.ink;
  ctx.textAlign = "left";
  const lastBase = H - H * 0.175;
  t.lines.forEach((l, i) => {
    ctx.fillText(l, pad - t.size * 0.03, lastBase - (t.lines.length - 1 - i) * t.size * 0.96);
  });

  rule(ctx, pad, H - H * 0.135, W - pad * 2, rgba(s.ink, 0.35));
  barcode(ctx, pad, H - H * 0.112, W * 0.42, H * 0.05, d.title, s.ink);
  label(ctx, f, d.footer, W - pad, H - H * 0.07, W * 0.028, s.ink, "right");

  cutSlot(ctx, W);
}

/** poleđina običnih akreditacija: ista boja, tiha štampa */
export function drawPassBack(
  ctx: Ctx,
  W: number,
  H: number,
  f: Fonts,
  s: Stock,
  d: { label: string; line: string }
) {
  const pad = W * 0.08;
  base(ctx, W, H, s.stock);
  label(ctx, f, d.label, pad, W * 0.2, W * 0.032, s.ink);
  rule(ctx, pad, W * 0.232, W - pad * 2, rgba(s.ink, 0.35));

  ctx.save();
  ctx.translate(W - pad, H - pad);
  ctx.rotate(-Math.PI / 2);
  const t = fitWrap(ctx, "ALUMNI", 800, f.display, H * 0.62, 1, W * 0.3, W * 0.1);
  font(ctx, 800, t.size, f.display);
  ctx.fillStyle = rgba(s.ink, 0.14);
  ctx.textAlign = "left";
  ctx.fillText("ALUMNI", 0, 0);
  ctx.restore();

  font(ctx, 600, W * 0.05, f.body);
  ctx.fillStyle = s.ink;
  ctx.textAlign = "left";
  const lines = wrap(ctx, d.line, W * 0.6);
  lines.forEach((l, i) => ctx.fillText(l, pad, H * 0.42 + i * W * 0.066));
  barcode(ctx, pad, H - H * 0.112, W * 0.5, H * 0.05, d.line, s.ink);
  cutSlot(ctx, W);
}
