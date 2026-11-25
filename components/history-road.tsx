"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildTrail,
  buildWorld,
  pointAtLength,
  type World,
} from "@/lib/road-path";
import {
  buildSprites,
  chunkSamples,
  offsetSamples,
  type Sprite,
} from "@/lib/road-scene";
import { historyMilestones } from "@/lib/history-milestones";
import type { PinPhase, Road3D } from "@/lib/road-3d";

/**
 * Sekcija „Naš put” — istorija SEFA-e kao vožnja kroz šumu.
 *
 * SADRŽAJ SE MENJA U `lib/history-milestones.ts`. Ovde je samo kretanje.
 * Stara verzija (pre auta i 3D kamere): `history-road.backup.tsx`.
 *
 * Dva režima, bira se posle montiranja:
 *
 *  „cinema” (sve širine, i telefon, bez „smanjenog kretanja”)
 *      Sekcija je visoka (uvod + stanica × N + kraj), a unutar nje stoji jedan
 *      `sticky` kadar od 100vh. Napredak skrola vozi auto putem. Ceo svet
 *      (podloga, put, trag rute, zelenilo) je jedan 3D sloj („ground”) koji se
 *      pomera samo preko `transform`. Prvo gledamo odozgo; posle prve stanice
 *      kamera se spusti iza auta (chase kamera) i put vodi ka horizontu.
 *      Nema scroll-jackinga — skrol ostaje potpuno normalan.
 *
 *  „flow” (`prefers-reduced-motion` i SSR)
 *      Obična vertikalna lista sa vijugavom linijom; bez 3D scene.
 *
 * Vrednosti za tekst idu u CSS promenljive na korenu sekcije (`--travel`,
 * `--intro`, `--outro`); izgled radi `app/globals.css`. Jedan
 * `requestAnimationFrame` ciklus, jedan slušalac skrola.
 */

/* ---------- tempo putovanja (udeo napretka kroz sekciju, 0 → 1) ---------- */

/** Do ovog napretka traje uvod i polako se povlači. */
const INTRO_END = 0.13;
/** Od ovog napretka put izlazi iz kadra i pojavljuje se završetak. */
const OUTRO_START = 0.87;
/** Koliki deo svog „slota” stanica ostaje vidljiva (ostatak je putovanje). */
const WINDOW_FACTOR = 0.38;
/** Koliko se kadar (odozgo) naginje u smeru krivine, i najviše koliko. */
const STEER = 0.12;
const STEER_MAX = 3.4;

/** Dužina jednog ciklusa poskakivanja (u jedinicama sveta). */
const BOB_CYCLE = 48;
/** Najveće poskakivanje auta, u pikselima. */
const BOB_MAX = 2.4;

/* ---------- slike ---------- */

const IMG = {
  carTop: "/images/nas-put/auto-odozgo.png",
  carBack: "/images/nas-put/auto-odostrag.png",
  asphalt: "/images/nas-put/asfalt.webp",
  ground: "/images/nas-put/zemlja-mahovina.webp",
  treeTop: "/images/nas-put/drvo-odozgo.webp",
  treeSide: "/images/nas-put/drvo-sa-strane.webp",
  bushTop: "/images/nas-put/zbun-odozgo.webp",
  bushSide: "/images/nas-put/zbun-sa-strane.webp",
  horizon: "/images/nas-put/horizont.jpg",
} as const;

/* ---------- veličine (u jedinicama sveta; svet je širok 1000) ---------- */

/** Širina kolovoza. */
const ROAD_W = 84;
/** Auto vozi desnom trakom: pomeraj od sredine puta. */
const LANE_OFFSET = 20;
/** Dužina auta odozgo (~90 px na desktopu, ~50 px na telefonu). */
const CAR_LEN = 64;
/**
 * Slika auta odozgo ima prednji deo okrenut naniže; ovaj dodatak okreće nos
 * u pravcu vožnje (stari SVG marker imao je nos nagore).
 */
const CAR_ROTATION_OFFSET = 180;
/** Širina slike auta odostrag (chase kamera), u jedinicama sveta. */
const CAR_BACK_W = 46;
/**
 * Pravi 3D model auta (Three.js, učitava se tek u „cinema” režimu). Dok se
 * ne učita, vide se slike odozgo/odostrag iznad.
 */
const CAR_MODEL = "/images/nas-put/auto-3d.glb";
/** Dužina 3D auta u jedinicama sveta. */
const CAR_3D_LEN = 72;
/** Okret modela (stepeni) da mu nos gleda napred — zavisi od izvoza modela. */
const CAR_MODEL_YAW = 90;
/** Koliko se karoserija naginje u krivini i pri gasu/kočenju (stepeni). */
const CAR_ROLL_MAX = 3;
/** Koliko iza auta (jedinice sveta) „visi” chase kamera. */
const CHASE_TETHER = 190;
const CAR_PITCH_MAX = 1.8;
/** Prečnik krošnje drveta / žbuna odozgo, pre nasumične razmere 0.8–1.3. */
const TREE_SIZE = 112;
const BUSH_SIZE = 54;
/** Broj sprajtova (drveće + žbunje). */
const SPRITES_DESKTOP = 72;
const SPRITES_MOBILE = 36;
const SPRITE_SEED = 2015;
/** Pravac senki (udeo veličine predmeta): svetlo dolazi odozgo sleva. */
const SHADOW_X = 0.14;
const SHADOW_Y = 0.2;
/** Period teksture asfalta i zemlje. */
const ASPHALT_TILE = 150;
const GROUND_TILE = 240;
/**
 * Pločice podloge: veličina i koliko ih ima oko kamere (2R+1)². Pločica mora
 * biti mala: sloj koji preseče ravan oka (iza kamere) pregledač ne iscrta, pa
 * se takve sakrivaju, a ostatak mora da pokrije tlo do donje ivice ekrana.
 */
const TILE = 240;
const TILE_RING_DESKTOP = 3;
const TILE_RING_MOBILE = 3;
/**
 * U pogledu iza auta pločice se utapaju u jednobojno daleko tlo (manje
 * slojeva za grafičku karticu): od ove udaljenosti, preko ove dužine.
 */
const TILE_FADE_START = 380;
const TILE_FADE_LEN = 340;
/** Dalje od ovoga (od tačke ispred auta) delovi sveta se ne crtaju. */
const CULL_DESKTOP = 1350;
const CULL_MOBILE = 1150;

/**
 * Oštrina 3D slojeva. Svaki sloj (pločica, deo puta, drvo) pregledač
 * rasterizuje jednom (`will-change: transform`), pa se ne crta iznova pri
 * svakom pomeranju kamere. Kad mu se udaljenost znatno promeni, sloj se
 * ponovo rasterizuje — ali najviše do ove razmere (px po jedinici sveta), da
 * bliski slojevi ne pojedu memoriju grafičke kartice.
 */
const RASTER_CAP_DESKTOP = 2.2;
const RASTER_CAP_MOBILE = 1.4;
/** Koliko slojeva najviše sme da se osveži u jednom kadru (bez trzanja). */
const RASTER_REFRESH_PER_FRAME = 2;

/* ---------- kamera ---------- */

/** Napredak skrola na kome kamera kreće da se spušta iza auta (posle 2015). */
const CAMERA_SWITCH_PROGRESS = 0.245;
/** Koliko traje prelaz (udeo skrola). */
const CAMERA_SWITCH_SPAN = 0.075;
/** Nagib tla u chase pogledu (stepeni). */
const TILT_DESKTOP = 66;
const TILT_MOBILE = 52;
/** CSS perspective (px) — veće = kamera dalje, kao duži objektiv. */
const PERSPECTIVE_DESKTOP = 2400;
const PERSPECTIVE_MOBILE = 1500;
/** Koliko se kamera primakne u chase pogledu (u odnosu na pogled odozgo). */
const CHASE_ZOOM_DESKTOP = 3;
const CHASE_ZOOM_MOBILE = 2.8;
/** Visina horizonta i auta u chase pogledu (udeo visine ekrana). */
const HORIZON_DESKTOP = 0.3;
const HORIZON_MOBILE = 0.24;
const CHASE_CAR_DESKTOP = 0.8;
const CHASE_CAR_MOBILE = 0.6;
/** Visina auta u pogledu odozgo (isto mesto kao stari marker). */
const TOP_CAR_Y = 0.524;
/** Koliko ispred auta je središte iscrtanog sveta u chase pogledu. */
const LOOK_AHEAD = 700;

const clamp = (v: number, lo: number, hi: number) =>
  v < lo ? lo : v > hi ? hi : v;

/** Smootherstep — usporava na krajevima. */
const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const rad = (deg: number) => (deg * Math.PI) / 180;

type Phase = "before" | "in" | "after";

export function HistoryRoad() {
  const stops = historyMilestones;
  const count = stops.length;

  /** Putanja za kameru (isti tempo kao ranije). */
  const world = useMemo<World>(() => buildWorld(count), [count]);
  /** Ista putanja, gušće uzorkovana — za crtanje. */
  const fine = useMemo<World>(() => buildWorld(count, 200), [count]);
  const trail = useMemo(() => buildTrail(count), [count]);

  const roadChunks = useMemo(
    () => chunkSamples(fine.samples, 120, ROAD_W / 2 + 22, 3),
    [fine]
  );
  /** Linija tirkiznog traga (desna traka). */
  const trailLine = useMemo(
    () => offsetSamples(fine.samples, LANE_OFFSET),
    [fine]
  );
  const trailChunks = useMemo(
    // iste granice kao delovi puta (isti `len`), pa trag ide u isti SVG
    () => chunkSamples(trailLine, 120, 10),
    [trailLine]
  );


  const [compact, setCompact] = useState(false);
  /** WebGL svet je spreman — CSS svet se tada uklanja iz stranice. */
  const [glOn, setGlOn] = useState(false);
  /** WebGL nije dostupan ili je izgubljen — ostaje CSS svet. */
  const [glFailed, setGlFailed] = useState(false);
  const sprites = useMemo<Sprite[]>(
    () =>
      buildSprites(fine, {
        seed: SPRITE_SEED,
        max: compact ? SPRITES_MOBILE : SPRITES_DESKTOP,
        roadWidth: ROAD_W,
        treeSize: TREE_SIZE,
        bushSize: BUSH_SIZE,
      }),
    [fine, compact]
  );
  const ring = compact ? TILE_RING_MOBILE : TILE_RING_DESKTOP;
  const tileCount = (ring * 2 + 1) ** 2;

  /** Napredak na kome je svaka stanica u punom kadru. */
  const centers = useMemo(() => {
    const span = OUTRO_START - INTRO_END;
    return stops.map((_, i) => INTRO_END + ((i + 0.5) * span) / count);
  }, [stops, count]);
  const half = useMemo(
    () => ((OUTRO_START - INTRO_END) / count) * WINDOW_FACTOR,
    [count]
  );

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<"flow" | "cinema">("flow");
  const [animated, setAnimated] = useState(false);
  const [active, setActive] = useState(-1);
  const [passed, setPassed] = useState(0);
  const [seen, setSeen] = useState<boolean[]>(() => stops.map(() => false));

  /* ---------- izbor režima ---------- */
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const narrow = window.matchMedia("(max-width: 1023px)");

    const sync = () => {
      setAnimated(!reduced.matches);
      setMode(!reduced.matches ? "cinema" : "flow");
      setCompact(narrow.matches);
    };

    sync();
    reduced.addEventListener("change", sync);
    narrow.addEventListener("change", sync);
    return () => {
      reduced.removeEventListener("change", sync);
      narrow.removeEventListener("change", sync);
    };
  }, []);

  /* ---------- „cinema”: auto vozi putem, kamera ga prati ---------- */
  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const scene = sceneRef.current;
    const car = carRef.current;
    if (!section || !stage || !scene || mode !== "cinema") return;

    const tilt = compact ? TILT_MOBILE : TILT_DESKTOP;
    const persp = compact ? PERSPECTIVE_MOBILE : PERSPECTIVE_DESKTOP;
    const chaseZoom = compact ? CHASE_ZOOM_MOBILE : CHASE_ZOOM_DESKTOP;
    const horizonAt = compact ? HORIZON_MOBILE : HORIZON_DESKTOP;
    const chaseCarAt = compact ? CHASE_CAR_MOBILE : CHASE_CAR_DESKTOP;
    const cull = compact ? CULL_MOBILE : CULL_DESKTOP;
    const rasterCap = compact ? RASTER_CAP_MOBILE : RASTER_CAP_DESKTOP;

    // četiri sloja sa istom kamerom (tlo → put → trag → zelenilo), uvek tim
    // redom — pregledač ne mora da ih sortira po dubini
    const grounds = Array.from(
      scene.querySelectorAll<HTMLElement>(".road__ground")
    );
    const tiles = Array.from(
      scene.querySelectorAll<HTMLElement>("[data-tile]")
    );
    const chunkEls = Array.from(
      scene.querySelectorAll<SVGSVGElement>("[data-chunk]")
    );
    const plantEls = Array.from(
      scene.querySelectorAll<HTMLElement>("[data-plant]")
    );
    const standEls = plantEls.map((el) =>
      el.querySelector<HTMLElement>(".road__plant-stand")
    );
    const carTop = car?.querySelector<HTMLElement>(".road__car-top");
    const plantsGround = grounds[grounds.length - 1] ?? null;
    const horizonEls = Array.from(
      scene.querySelectorAll<HTMLElement>(".road__sky, .road__fog")
    );
    const varCache = new WeakMap<HTMLElement, Record<string, string>>();
    /** Upiše CSS promenljivu samo kad joj se vrednost promeni. */
    const setVar = (el: HTMLElement, name: string, value: string) => {
      let c = varCache.get(el);
      if (!c) varCache.set(el, (c = {}));
      if (c[name] === value) return;
      c[name] = value;
      el.style.setProperty(name, value);
    };
    const carShadow = car?.querySelector<HTMLElement>(".road__car-shadow");
    const carBack = car?.querySelector<HTMLElement>(".road__car-back");

    // poslednje upisane vrednosti — DOM se dira samo kad se nešto promeni
    const tileShown = tiles.map(() => true);
    const chunkShown = chunkEls.map(() => true);
    const trailFrac = chunkEls.map(() => -1);
    const tileOp = tiles.map(() => 1);
    const plantShown = plantEls.map(() => true);
    const standOp = plantEls.map(() => -1);
    let cellX = NaN;
    let cellY = NaN;
    let lastView = "";

    /* ----- oštrina 3D slojeva (vidi RASTER_CAP_DESKTOP) ----- */
    const lodEls: (HTMLElement | SVGSVGElement)[] = [
      ...tiles,
      ...chunkEls,
      ...plantEls,
      ...standEls.map((el, i) => el ?? plantEls[i]),
    ];
    const offChunk = tiles.length;
    const offPlant = offChunk + chunkEls.length;
    const offStand = offPlant + plantEls.length;
    /** Razmera u kojoj je sloj poslednji put rasterizovan (0 = nepoznato). */
    const lodScale = new Float32Array(lodEls.length);
    const lodIdeal = new Float32Array(lodEls.length);
    const lodQueue: number[] = [];
    const lodBusy = new Set<number>();
    let lodBacklog = false;
    // trenutne (ublažene) vrednosti kamere — bez ovoga slika podrhtava
    let len = 0;
    let rot = 0;
    let cam = 0; // 0 = odozgo, 1 = iza auta
    let heading = 90; // ublažen pravac puta za chase kameru
    let primed = false;

    // WebGL svet (Three.js): kad se učita, crta tlo, put, drveće i auto u
    // jednom platnu; CSS svet (ispod) ostaje samo kao rezerva
    let gl: Road3D | null = null;
    let glReady = false;
    let glAnimating = false;
    let cancelled = false;
    const glCanvas = scene.querySelector<HTMLCanvasElement>(".road__gl");
    const onLost = (e: Event) => {
      e.preventDefault();
      glReady = false;
      setGlOn(false);
      setGlFailed(true);
    };
    if (glCanvas && !glFailed) {
      glCanvas.addEventListener("webglcontextlost", onLost);
      import("@/lib/road-3d")
        .then(({ Road3D }) => {
          if (cancelled) return;
          gl = new Road3D(
            glCanvas,
            {
              road: fine.samples,
              trail: trailLine,
              stops: world.stops,
              plants: sprites,
              roadWidth: ROAD_W,
              asphaltTile: ASPHALT_TILE,
              groundTile: GROUND_TILE,
              shadow: { x: SHADOW_X, y: SHADOW_Y },
            },
            {
              ground: IMG.ground,
              asphalt: IMG.asphalt,
              treeTop: IMG.treeTop,
              treeSide: IMG.treeSide,
              bushTop: IMG.bushTop,
              bushSide: IMG.bushSide,
              car: CAR_MODEL,
            },
            {
              carLength: CAR_3D_LEN,
              carYawOffset: CAR_MODEL_YAW,
              pixelRatio: Math.min(
                window.devicePixelRatio || 1,
                compact ? 1.25 : 1.5
              ),
            }
          );
          return gl.ready;
        })
        .then(() => {
          if (cancelled || !gl) return;
          glReady = true;
          paint();
          scene.dataset.gl = "on";
          // CSS svet se uklanja tek kad je WebGL kadar već na ekranu
          requestAnimationFrame(() => {
            if (!cancelled) setGlOn(true);
          });
        })
        .catch(() => {
          // bez WebGL-a ostaje CSS svet
        });
    }
    // brzina i ubrzanje (po pređenom putu u kadru) — za nagib karoserije
    let lastLen = NaN;
    let speed = 0;
    let accel = 0;

    let W = stage.clientWidth;
    let H = stage.clientHeight;
    let frame = 0;
    let lastActive = -2;
    let lastPassed = -1;

    /** Dužina puta koja odgovara napretku `p`, sa usporavanjem uz stanice. */
    const lengthAt = (p: number) => {
      const keys: [number, number][] = [
        [0, 0],
        ...centers.map((c, i): [number, number] => [c, world.stopLengths[i]]),
        [1, world.total],
      ];
      for (let i = 0; i < keys.length - 1; i++) {
        const [p0, l0] = keys[i];
        const [p1, l1] = keys[i + 1];
        if (p <= p1 || i === keys.length - 2) {
          const t = p1 > p0 ? clamp((p - p0) / (p1 - p0), 0, 1) : 1;
          return l0 + (l1 - l0) * ease(t);
        }
      }
      return world.total;
    };

    /** Koliko je dugačak fini put u odnosu na put kamere (skoro 1). */
    const fineRatio = fine.total / world.total;

    const paint = () => {
      frame = 0;

      const rect = section.getBoundingClientRect();
      const travel = section.offsetHeight - window.innerHeight;
      const p = travel <= 0 ? 0 : clamp(-rect.top / travel, 0, 1);

      const targetLen = lengthAt(p);
      const targetPt = pointAtLength(world, targetLen);
      const targetRot = clamp(
        -(targetPt.angle - 90) * STEER,
        -STEER_MAX,
        STEER_MAX
      );
      const targetCam = clamp(
        (p - CAMERA_SWITCH_PROGRESS) / CAMERA_SWITCH_SPAN,
        0,
        1
      );

      if (!primed) {
        len = targetLen;
        rot = targetRot;
        cam = targetCam;
        heading = targetPt.angle;
        primed = true;
      } else {
        len += (targetLen - len) * 0.1;
        rot += (targetRot - rot) * 0.07;
        cam += (targetCam - cam) * 0.1;
      }

      const pt = pointAtLength(world, len);
      // chase kamera je „na užetu” iza auta: gleda od tačke na putu iza njega
      // ka autu, pa se u krivini vidi bok auta (kao pravi snimak iz vožnje)
      const behindPt = pointAtLength(world, Math.max(0, len - CHASE_TETHER));
      const camTarget =
        len > CHASE_TETHER
          ? (Math.atan2(pt.y - behindPt.y, pt.x - behindPt.x) * 180) / Math.PI
          : pt.angle;
      heading += (camTarget - heading) * 0.08;

      /* ----- faze prelaza: okret iza auta, pa nagib, pa primicanje ----- */
      const kTurn = ease(clamp(cam / 0.75, 0, 1));
      const kTilt = ease(clamp((cam - 0.15) / 0.85, 0, 1));
      const kZoom = ease(cam);
      // kratak pretapanje slike auta, da na sredini prelaza ne deluje providno
      const kTop = 1 - ease(clamp((cam - 0.42) / 0.2, 0, 1));
      const kBack = ease(clamp((cam - 0.45) / 0.22, 0, 1));

      // koliko je kamera blizu neke stanice (0 → 1) — put se tu blago primakne
      let near = 0;
      for (let i = 0; i < centers.length; i++) {
        near = Math.max(near, 1 - clamp(Math.abs(p - centers[i]) / half, 0, 1));
      }
      const unit = clamp((W * 1.2) / 1250, 0.78, 1.75);
      const zoom = unit * (1 + near * 0.03);
      const s = zoom * (1 + (chaseZoom - 1) * kZoom);

      const rz = rot + (-90 - heading - rot) * kTurn;
      const T = tilt * kTilt;

      // auto vozi desnom trakom: tačka kamere je pomerena od sredine puta
      const a = rad(pt.angle);
      const cx = pt.x - Math.sin(a) * LANE_OFFSET;
      const cy = pt.y + Math.cos(a) * LANE_OFFSET;

      // blago podrhtavanje kamere u vožnji (po pređenom putu, ne po vremenu)
      const shakeX = Math.sin(len * 0.13) * 0.7 * kTilt;
      const shakeY =
        (Math.sin(len * 0.21) * 0.8 + Math.sin(len * 0.053) * 0.7) * kTilt;

      const ax = W / 2 + shakeX;
      const ay = H * (TOP_CAR_Y + (chaseCarAt - TOP_CAR_Y) * kZoom) + shakeY;

      const groundTransform =
        `translate3d(${ax.toFixed(2)}px,${ay.toFixed(2)}px,0) ` +
        `rotateX(${T.toFixed(3)}deg) rotateZ(${rz.toFixed(3)}deg) ` +
        `scale3d(${s.toFixed(4)},${s.toFixed(4)},${s.toFixed(4)}) ` +
        `translate3d(${(-cx).toFixed(2)}px,${(-cy).toFixed(2)}px,0)`;
      if (!glReady)
        for (const g of grounds) g.style.transform = groundTransform;

      // ravan oka: sve što bi zašlo iza nje (iza kamere) se ne crta — takav
      // sloj pregledač ne ume da iscrta i troši memoriju ostalima
      const eyeBehind =
        T > 0.5 ? (0.9 * persp) / (s * Math.sin(rad(T))) : Infinity;
      const sinT = Math.sin(rad(T));
      /** Razmera (px po jedinici) tačke koja je `fwd` ispred auta. */
      const idealAt = (fwd: number) =>
        T > 0.5
          ? (s * persp) /
            (persp + Math.max(fwd, -0.85 * eyeBehind) * s * sinT)
          : s;
      const lod = (k: number, shown: boolean, fwd: number) => {
        if (!shown) {
          lodScale[k] = 0;
          return;
        }
        const ideal = idealAt(fwd);
        if (lodScale[k] === 0) {
          lodScale[k] = ideal;
          return;
        }
        const r = ideal / lodScale[k];
        if ((r > 1.6 && lodScale[k] < rasterCap) || r < 0.33) {
          lodIdeal[k] = ideal;
          lodQueue.push(k);
        }
      };
      const hxv = Math.cos(rad(-90 - rz));
      const hyv0 = Math.sin(rad(-90 - rz));
      /** Najdalje „iza kamere” (po pravcu pogleda) za pravougaonik u svetu. */
      const backmost = (x: number, y: number, w: number, h: number) => {
        const f = (x - cx) * hxv + (y - cy) * hyv0;
        return (
          f + Math.min(0, w * hxv) + Math.min(0, h * hyv0)
        );
      };

      // horizont: tačka u kojoj nagnuto tlo nestaje (perspektiva)
      const py = horizonAt * H + persp / Math.tan(rad(tilt));
      const hy = T > 0.5 ? py - persp / Math.tan(rad(T)) : -2 * H;

      const view = cam <= 0.001 ? "top" : cam >= 0.999 ? "chase" : "turn";

      // CSS promenljive idu samo na elemente koji ih koriste — da pregledač
      // ne preračunava stil celog sveta (stotine SVG putanja) u svakom kadru
      if (plantsGround && !glReady) {
        if (view !== "top") {
          setVar(plantsGround, "--rz", rz.toFixed(2));
          setVar(plantsGround, "--tilt", T.toFixed(2));
        }
        setVar(plantsGround, "--k-top", kTop.toFixed(3));
      }
      const hx = `${clamp((-(rz + 180) * 5 - len * 0.012) * kTilt, -160, 160).toFixed(1)}px`;
      for (const el of horizonEls) {
        setVar(el, "--k-chase", kTilt.toFixed(3));
        if (kTilt > 0) {
          setVar(el, "--hy", `${hy.toFixed(1)}px`);
          setVar(el, "--hx", hx);
        }
      }
      if (view !== lastView) {
        lastView = view;
        scene.dataset.view = view;
      }

      /* ----- auto ----- */
      if (Number.isNaN(lastLen)) lastLen = len;
      const v = len - lastLen;
      lastLen = len;
      const prevSpeed = speed;
      speed += (v - speed) * 0.25;
      accel += (speed - prevSpeed - accel) * 0.15;
      const moving = clamp(Math.abs(speed) / 3, 0, 1);
      // auto prati tačan pravac puta; kamera kasni, pa mu se u krivini vidi bok
      const carHeading = pt.angle + Math.sin(len / 37) * 0.35 * moving;
      // naginje se ka spoljnoj strani krivine
      const carRoll = clamp((pt.angle - heading) * 0.45, -CAR_ROLL_MAX, CAR_ROLL_MAX);
      // gas: nos se diže; kočenje: nos se spušta
      const carPitch = clamp(accel * 6, -CAR_PITCH_MAX, CAR_PITCH_MAX);
      const carLift =
        (Math.sin(len * 0.83) * 0.5 + Math.sin(len * 2.1) * 0.25) * 0.18 * moving;

      // tačka ispred auta: odatle se meri šta je „daleko” (zelenilo, delovi)
      const look = LOOK_AHEAD * kZoom;
      const gx = cx + Math.cos(rad(heading)) * look;
      const gy = cy + Math.sin(rad(heading)) * look;

      /* ----- CSS svet (rezerva dok se WebGL ne učita) ----- */
      if (!glReady) {
      const phase = (len / BOB_CYCLE) * Math.PI * 2;
      const bob = Math.abs(Math.sin(phase)) * BOB_MAX;
      const sway = Math.sin(len / 37) * 0.8;
      const driveRot = pt.angle + rz + 90 + CAR_ROTATION_OFFSET + sway;
      if (car) car.style.transform = `translate3d(${ax.toFixed(2)}px,${ay.toFixed(2)}px,0)`;
      if (carTop) {
        carTop.style.opacity = kTop.toFixed(3);
        carTop.style.transform =
          `translateY(${(-bob).toFixed(2)}px) rotate(${driveRot.toFixed(2)}deg) ` +
          `scale(${(s / unit).toFixed(4)})`;
      }
      if (carShadow) {
        carShadow.style.opacity = kTop.toFixed(3);
        carShadow.style.transform =
          `translate(${(CAR_LEN * 0.07 * s).toFixed(1)}px,${(CAR_LEN * 0.1 * s).toFixed(1)}px) ` +
          `rotate(${driveRot.toFixed(2)}deg) scale(${(s / unit).toFixed(4)})`;
      }
      if (carBack) {
        // pri skretanju telo auta se blago nagne ka spoljnoj strani krivine
        const roll = clamp(-(pt.angle - heading) * 0.3, -1.5, 1.5);
        const backScale = (s / (unit * chaseZoom)) * (0.9 + 0.1 * kBack);
        carBack.style.opacity = kBack.toFixed(3);
        carBack.style.transform =
          `translateY(${(-bob * 0.35).toFixed(2)}px) rotate(${roll.toFixed(2)}deg) ` +
          `scale(${backScale.toFixed(4)})`;
      }

      /* ----- pločice podloge: mreža oko auta ----- */
      const nx = Math.floor(cx / TILE);
      const ny = Math.floor(cy / TILE);
      if (nx !== cellX || ny !== cellY) {
        cellX = nx;
        cellY = ny;
        let t = 0;
        for (let j = -ring; j <= ring; j++) {
          for (let i = -ring; i <= ring; i++) {
            const el = tiles[t++];
            if (el)
              el.style.transform = `translate3d(${(nx + i) * TILE}px,${(ny + j) * TILE}px,0)`;
          }
        }
      }

      for (let t = 0, j = -ring; j <= ring; j++) {
        for (let i = -ring; i <= ring; i++, t++) {
          const el = tiles[t];
          if (!el) continue;
          const tx = (nx + i) * TILE;
          const ty = (ny + j) * TILE;
          const far = clamp(
            (Math.hypot(tx + TILE / 2 - cx, ty + TILE / 2 - cy) -
              TILE_FADE_START) /
              TILE_FADE_LEN,
            0,
            1
          );
          const op = Math.round((1 - kTilt * far) * 20) / 20;
          const show =
            op > 0 && backmost(tx, ty, TILE + 2, TILE + 2) > -eyeBehind;
          if (show !== tileShown[t]) {
            tileShown[t] = show;
            el.style.visibility = show ? "" : "hidden";
          }
          if (op !== tileOp[t]) {
            tileOp[t] = op;
            el.style.opacity = op === 1 ? "" : String(op);
          }
          lod(t, show, backmost(tx, ty, TILE, TILE));
        }
      }

      /* ----- crtaj samo ono što je blizu ----- */
      for (let i = 0; i < chunkEls.length; i++) {
        const c = roadChunks[i];
        const show =
          Math.hypot(c.cx - gx, c.cy - gy) < cull + Math.max(c.w, c.h) / 2 &&
          backmost(c.x, c.y, c.w, c.h) > -eyeBehind;
        if (show !== chunkShown[i]) {
          chunkShown[i] = show;
          chunkEls[i].style.display = show ? "" : "none";
        }
        lod(offChunk + i, show, backmost(c.x, c.y, c.w, c.h));
      }

      // trag rute: iscrtan do auta (ide u isti SVG kao deo puta)
      const fineLen = len * fineRatio;
      for (let i = 0; i < chunkEls.length; i++) {
        const c = trailChunks[i];
        if (!c) continue;
        const f = clamp((fineLen - c.start) / (c.end - c.start), 0, 1);
        const fr = Math.round(f * 500) / 500;
        if (fr !== trailFrac[i]) {
          trailFrac[i] = fr;
          chunkEls[i].style.setProperty("--f", fr.toFixed(3));
        }
      }

      for (let i = 0; i < plantEls.length; i++) {
        const sp = sprites[i];
        if (!sp) continue;
        const dist = Math.hypot(sp.x - gx, sp.y - gy);
        const fwd = (sp.x - cx) * hxv + (sp.y - cy) * hyv0;
        const show = dist < cull && fwd > -eyeBehind + sp.size * 0.6;
        if (show !== plantShown[i]) {
          plantShown[i] = show;
          plantEls[i].style.display = show ? "" : "none";
        }
        const stand = standEls[i];
        lod(offPlant + i, show, fwd - sp.size * 0.6);
        lod(offStand + i, show && !!stand && view !== "top", fwd);
        if (!show || !stand) continue;
        // drvo iza auta (između auta i kamere) nestaje, daleko se utapa u maglu
        const behind = clamp((fwd + 30) / 60, 0, 1);
        const far = clamp((cull - dist) / 260, 0, 1);
        const op = Math.round(kTilt * behind * far * 100) / 100;
        if (op !== standOp[i]) {
          standOp[i] = op;
          stand.style.opacity = String(op);
        }
      }

      // slojevi kojima se udaljenost mnogo promenila: kratko skini
      // `will-change`, pregledač ih iscrta u novoj razmeri, pa ga vrati
      lodBacklog = false;
      if (lodQueue.length) {
        const score = (k: number) =>
          Math.abs(Math.log(lodIdeal[k] / lodScale[k]));
        lodQueue.sort((a, b) => score(b) - score(a));
        const batch: number[] = [];
        for (const k of lodQueue) {
          if (lodBusy.has(k)) continue;
          if (batch.length >= RASTER_REFRESH_PER_FRAME) {
            lodBacklog = true;
            break;
          }
          batch.push(k);
        }
        lodQueue.length = 0;
        for (const k of batch) {
          lodBusy.add(k);
          lodScale[k] = Math.min(lodIdeal[k], rasterCap * 1.6);
          lodEls[k].style.willChange = "auto";
        }
        if (batch.length)
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              for (const k of batch) {
                lodEls[k].style.willChange = "";
                lodBusy.delete(k);
              }
            })
          );
      }

      } else {
        lodBacklog = false;
      }

      /* ----- tekst i indikator (nepromenjeno) ----- */
      // `--travel` crta samo mobilnu liniju iz „flow” režima (ovde je skrivena),
      // pa se u ovom režimu ne upisuje u svakom kadru — promena na korenu
      // sekcije tera pregledač da preračuna stil cele scene
      setVar(section, "--intro", (1 - clamp(p / INTRO_END, 0, 1)).toFixed(3));
      setVar(
        section,
        "--outro",
        clamp((p - OUTRO_START) / (1 - OUTRO_START), 0, 1).toFixed(3)
      );

      let nextActive = -1;
      let nextPassed = 0;
      for (let i = 0; i < centers.length; i++) {
        if (Math.abs(p - centers[i]) <= half) nextActive = i;
        if (p > centers[i]) nextPassed = i + 1;
      }
      if (nextActive !== lastActive) {
        lastActive = nextActive;
        setActive(nextActive);
      }
      if (nextPassed !== lastPassed) {
        lastPassed = nextPassed;
        setPassed(nextPassed);
      }

      /* ----- WebGL svet: jedan kadar ----- */
      if (gl && glReady) {
        const pins: PinPhase[] = centers.map((_, i) =>
          i === nextActive ? "in" : i < nextPassed ? "after" : "before"
        );
        glAnimating = gl.render({
          W,
          H,
          persp,
          perspY: horizonAt * H + persp / Math.tan(rad(tilt)),
          ax,
          ay,
          tilt: T,
          rz,
          s,
          cx,
          cy,
          heading: carHeading,
          roll: carRoll,
          pitch: carPitch,
          lift: carLift,
          kTop,
          kChase: kTilt,
          trailLen: len * fineRatio,
          pins,
          lookX: gx,
          lookY: gy,
          cull,
        });
      }

      // nastavi da crtaš dok se ublažene vrednosti ne slegnu
      const settled =
        Math.abs(targetLen - len) < 0.4 &&
        Math.abs(targetRot - rot) < 0.01 &&
        Math.abs(targetCam - cam) < 0.0015 &&
        Math.abs(camTarget - heading) < 0.05 &&
        !lodBacklog &&
        Math.abs(speed) < 0.02 &&
        Math.abs(accel) < 0.002 &&
        !glAnimating;
      if (!settled) frame = requestAnimationFrame(paint);
    };

    const request = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const measure = () => {
      W = stage.clientWidth;
      H = stage.clientHeight;
      const unit = clamp((W * 1.2) / 1250, 0.78, 1.75);
      // osnovne veličine auta (u px) — menjaju se samo pri promeni širine
      scene.style.setProperty("--u", unit.toFixed(4));
      scene.style.setProperty("--u-chase", (unit * chaseZoom).toFixed(4));
      scene.style.setProperty("--persp", `${persp}px`);
      const py = horizonAt * H + persp / Math.tan(rad(tilt));
      scene.style.setProperty("--persp-y", `${py.toFixed(1)}px`);
    };

    const observer = new ResizeObserver(() => {
      measure();
      request();
    });
    observer.observe(stage);

    // slike koje se prvi put vide tek pri prelazu kamere dekodiraj unapred,
    // da prvi prelaz ne zastane
    const decoded = new Set<string>();
    scene
      .querySelectorAll<HTMLImageElement>(".road__plant-side, .road__car-back img")
      .forEach((img) => {
        const key = img.currentSrc || img.src;
        if (decoded.has(key)) return;
        decoded.add(key);
        img.decode().catch(() => {});
      });

    measure();
    paint();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      lodEls.forEach((el) => (el.style.willChange = ""));
      cancelled = true;
      glCanvas?.removeEventListener("webglcontextlost", onLost);
      gl?.dispose();
      delete scene.dataset.gl;
      section.style.removeProperty("--travel");
      section.style.removeProperty("--intro");
      section.style.removeProperty("--outro");
    };
  }, [
    mode,
    compact,
    world,
    fine,
    centers,
    half,
    roadChunks,
    trailChunks,
    trailLine,
    sprites,
    ring,
    glFailed,
  ]);

  /* ---------- „flow”: linija se iscrtava, stanice se otkrivaju redom ---------- */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || mode !== "flow" || !animated) return;

    let frame = 0;
    const paint = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const p = clamp(
        (window.innerHeight * 0.78 - rect.top) / Math.max(rect.height, 1),
        0,
        1
      );
      section.style.setProperty("--travel", p.toFixed(4));
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const i = Number((entry.target as HTMLElement).dataset.stop);
          setSeen((prev) =>
            prev[i] ? prev : prev.map((v, j) => (j === i ? true : v))
          );
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.25, rootMargin: "0px 0px -12% 0px" }
    );
    section
      .querySelectorAll<HTMLElement>("[data-stop]")
      .forEach((el) => observer.observe(el));

    paint();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      section.style.removeProperty("--travel");
    };
  }, [mode, animated]);

  /* ---------- statični delovi 3D scene (ne crtaju se iznova pri promeni stanice) ---------- */
  const tileEls = useMemo(
    () => (
      <>
      {/* podloga: mreža pločica koja putuje sa kamerom */}
      {Array.from({ length: tileCount }, (_, i) => (
        <div
          key={`t${i}`}
          data-tile=""
          className="road__tile"
          style={
            {
              width: TILE + 2,
              height: TILE + 2,
              backgroundImage: `url(${IMG.ground})`,
              backgroundSize: `${GROUND_TILE}px ${GROUND_TILE}px`,
            } as React.CSSProperties
          }
        />
      ))}
      </>
    ),
    [tileCount]
  );

  const chunkSvgs = useMemo(
    () => (
      <>
      {/* put, iseckan na delove */}
      {roadChunks.map((c, i) => (
        <svg
          key={`r${i}`}
          data-chunk=""
          className="road__chunk"
          viewBox={`${c.x} ${c.y} ${c.w} ${c.h}`}
          width={c.w}
          height={c.h}
          style={
            {
              transform: `translate3d(${c.x}px,${c.y}px,0.8px)`,
              "--f": 0,
            } as React.CSSProperties
          }
        >
          <path className="road__shoulder" d={c.d} strokeWidth={ROAD_W + 40} />
          <path className="road__shoulder" d={c.d} strokeWidth={ROAD_W + 16} />
          <path
            className="road__asphalt"
            d={c.dOver}
            strokeWidth={ROAD_W}
          />
          <path
            className="road__edge"
            d={c.d}
            strokeWidth={ROAD_W - 7}
            strokeDashoffset={(c.start % 143.6).toFixed(1)}
          />
          <path
            className="road__asphalt"
            d={c.dOver}
            strokeWidth={ROAD_W - 11}
          />
          <path className="road__wear" d={c.d} strokeWidth={ROAD_W - 14} />
          <path
            className="road__center"
            d={c.d}
            strokeDashoffset={(c.start % 30).toFixed(1)}
          />
          {trailChunks[i] && (
            <>
              <path
                className="road__route-glow"
                d={trailChunks[i].d}
                pathLength={1}
              />
              <path
                className="road__route-line"
                d={trailChunks[i].d}
                pathLength={1}
              />
            </>
          )}
        </svg>
      ))}
      </>
    ),
    [roadChunks, trailChunks]
  );

  const plantEls = useMemo(
    () => (
      <>
      {/* drveće i žbunje: odozgo leže na tlu, sa strane stoje uspravno */}
      {sprites.map((sp, i) => {
        const tree = sp.kind === "tree";
        const top = sp.size / 0.93;
        const standW = tree ? sp.size * 1.13 : sp.size * 1.35;
        const standH = tree ? standW / 0.7536 : standW * 0.7536;
        return (
          <div
            key={`s${i}`}
            data-plant=""
            className="road__plant"
            data-kind={sp.kind}
            style={{
              transform: `translate3d(${sp.x.toFixed(1)}px,${sp.y.toFixed(1)}px,1.6px)`,
            }}
          >
            <span
              className="road__plant-shadow"
              style={{
                width: sp.size * 1.05,
                height: sp.size * 1.05,
                left: sp.size * (SHADOW_X - 0.525),
                top: sp.size * (SHADOW_Y - 0.525),
              }}
            />
            <Image
              src={tree ? IMG.treeTop : IMG.bushTop}
              alt=""
              width={tree ? 512 : 400}
              height={tree ? 512 : 400}
              loading="eager"
              draggable={false}
              className="road__plant-top"
              style={{
                width: top,
                height: top,
                left: -top / 2,
                top: -top / 2,
                transform: `rotate(${sp.rot}deg)`,
              }}
            />
            <span className="road__plant-stand">
              <Image
                src={tree ? IMG.treeSide : IMG.bushSide}
                alt=""
                width={tree ? 520 : 560}
                height={tree ? 690 : 422}
                loading="eager"
                draggable={false}
                className="road__plant-side"
                style={{
                  width: standW,
                  height: standH,
                  left: -standW / 2,
                  // žbun na slici ne dopire do donje ivice
                  bottom: tree ? -standH * 0.01 : -standH * 0.15,
                  transform: sp.flip ? "scaleX(-1)" : undefined,
                }}
              />
            </span>
          </div>
        );
      })}
      </>
    ),
    [sprites]
  );

  const phaseOf = (i: number): Phase => {
    if (mode === "flow") return !animated || seen[i] ? "in" : "before";
    if (i === active) return "in";
    return i < passed ? "after" : "before";
  };

  const meterYear =
    active >= 0 ? stops[active].year : passed >= count ? "Danas" : "";

  return (
    <section
      ref={sectionRef}
      className="road"
      data-mode={mode}
      data-anim={animated ? "on" : undefined}
      data-compact={compact ? "" : undefined}
      style={{ "--road-stops": count } as React.CSSProperties}
      aria-labelledby="nas-put-naslov"
    >
      <div className="road__stage" ref={stageRef}>
        {/* ---------- 3D scena: samo u „cinema” režimu ---------- */}
        {mode === "cinema" && (
          <div
            className="road__scene"
            ref={sceneRef}
            data-view="top"
            aria-hidden="true"
            style={
              {
                "--car-len": CAR_LEN,
                "--car-back-w": CAR_BACK_W,
              } as React.CSSProperties
            }
          >
            {/* nebo i horizont — vide se tek kad se kamera spusti iza auta */}
            <div className="road__sky">
              <div className="road__horizon">
                <Image
                  src={IMG.horizon}
                  alt=""
                  fill
                  sizes="130vw"
                  loading="eager"
                  className="road__horizon-img"
                />
              </div>
              {/* daleko tlo ispod horizonta (iza pločica podloge) */}
              <div className="road__land" />
            </div>

            {/* šara asfalta, zajednička za sve delove puta */}
            <svg className="road__defs" width="0" height="0" aria-hidden="true">
              <defs>
                <pattern
                  id="road-asphalt"
                  patternUnits="userSpaceOnUse"
                  width={ASPHALT_TILE}
                  height={ASPHALT_TILE}
                >
                  <image
                    href={IMG.asphalt}
                    width={ASPHALT_TILE}
                    height={ASPHALT_TILE}
                    preserveAspectRatio="none"
                  />
                </pattern>
              </defs>
            </svg>

            {/* svet u WebGL-u (Three.js): tlo, put, trag, drveće i 3D auto */}
            <canvas className="road__gl" />

            {/* rezerva: isti svet u CSS 3D, dok se WebGL ne učita (ili ako ga nema) */}
            {!glOn && (
              <>
            {/* svet: tri sloja sa istom kamerom (tlo → put → zelenilo), ovim redom */}
            <div className="road__view">
              <div className="road__ground">
                {tileEls}
              </div>
            </div>

            <div className="road__view">
              <div className="road__ground">
                {chunkSvgs}

                {/* oznake stanica na putu */}
                {world.stops.map((stop, i) => (
                  <div
                    key={`p${i}`}
                    className="road__pin"
                    data-phase={phaseOf(i)}
                    style={{
                      transform: `translate3d(${stop.x}px,${stop.y}px,1.2px)`,
                    }}
                  >
                    <i className="road__pin-ring" />
                    <i className="road__pin-dot" />
                  </div>
                ))}
              </div>
            </div>

            <div className="road__view">
              <div className="road__ground">
                {plantEls}
              </div>
            </div>
              </>
            )}

            {/* magla na prelazu tla u horizont, vinjeta i ton */}
            <div className="road__fog" />
            <div className="road__shade" />

            {/* auto: odozgo se okreće u pravcu vožnje, odostrag uvek gleda u kameru */}
            {/* rezerva: slike auta (odozgo/odostrag) dok se WebGL ne učita */}
            {!glOn && (
            <div className="road__car" ref={carRef}>
              <div className="road__car-shadow" />
              <div className="road__car-top">
                <span className="road__car-beam" />
                <span className="road__car-tail" />
                <Image
                  src={IMG.carTop}
                  alt=""
                  width={360}
                  height={478}
                  preload
                  draggable={false}
                  className="road__car-img"
                />
              </div>
              <div className="road__car-back">
                <span className="road__car-back-shadow" />
                <Image
                  src={IMG.carBack}
                  alt=""
                  width={640}
                  height={482}
                  preload
                  draggable={false}
                  className="road__car-img"
                />
                <span className="road__car-lamp road__car-lamp--l" />
                <span className="road__car-lamp road__car-lamp--r" />
              </div>
            </div>
            )}

            <div className="road__grain" />
          </div>
        )}

        {/* ---------- uvod ---------- */}
        <div className="road__intro">
          <p className="road__eyebrow road__eyebrow--hero">Naš put</p>
          <h2 id="nas-put-naslov" className="road__title">
            Od 2015. do danas.
          </h2>
          <p className="road__lead">
            Neke priče se ne mogu ispričati odjednom. Zato krenimo od početka.
          </p>
          <p className="road__hint">
            <span>Skroluj da kreneš putem</span>
            <span className="road__hint-line" aria-hidden="true" />
          </p>
        </div>

        {/* ---------- stanice ---------- */}
        <div className="road__stops-wrap">
          {/* put: mobilna linija, rasteže se preko cele liste */}
          <div className="road__trail" aria-hidden="true">
            <svg
              viewBox="0 0 100 1000"
              preserveAspectRatio="none"
              fill="none"
              className="road__trail-svg"
            >
              <path className="road__trail-bed" d={trail.d} />
              <path className="road__trail-ink" d={trail.d} pathLength={1} />
            </svg>
          </div>

          <ol className="road__stops">
            {stops.map((stop, i) => (
              <li
                key={`${stop.year}-${i}`}
                className="road__stop"
                data-stop={i}
                data-phase={phaseOf(i)}
                data-align={stop.alignment}
                data-shape={i % 3}
                /* položaj tačke na krivini mobilne linije (0–100 širine trake) */
                style={
                  { "--bead": trail.xs[i].toFixed(2) } as React.CSSProperties
                }
              >
                <span className="road__bead" aria-hidden="true" />

                <div className="road__body">
                  <p className="road__stop-eyebrow">{stop.eyebrow}</p>
                  <p className="road__year" aria-hidden="true">
                    {stop.year}
                  </p>
                  <h3 className="road__stop-title">
                    <span className="road__sr">{stop.year} — </span>
                    <span className="road__line">
                      <span>{stop.title}</span>
                    </span>
                  </h3>
                  <p className="road__desc">{stop.description}</p>
                </div>

                <figure className="road__figure">
                  <div className="road__frame">
                    {stop.image ? (
                      <Image
                        src={stop.image}
                        alt={stop.imageAlt}
                        fill
                        sizes="(min-width: 1024px) 38vw, 90vw"
                        priority={i === 0}
                        className="road__photo"
                      />
                    ) : (
                      <div className="road__placeholder">
                        <span>Fotografija iz {stop.year}.</span>
                      </div>
                    )}
                  </div>
                  <figcaption className="road__caption">
                    {stop.imageCaption}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ol>
        </div>

        {/* ---------- kraj putovanja ---------- */}
        <div className="road__outro">
          <p className="road__eyebrow">Danas</p>
          <p className="road__outro-title">Priča se nastavlja.</p>
          <p className="road__lead">
            Svaka nova generacija ostavlja svoj trag.
          </p>
        </div>

        {/* ---------- indikator napretka ---------- */}
        <div className="road__meter" aria-hidden="true">
          <span className="road__meter-year">{meterYear}</span>
          <span className="road__meter-rail">
            {stops.map((stop, i) => (
              <i key={`${stop.year}-${i}`} data-on={i < passed || undefined} />
            ))}
          </span>
        </div>
      </div>
    </section>
  );
}
