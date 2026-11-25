"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { CARD, TEX_H, TEX_W, drawStrap, loadFonts, readFonts, type Fonts } from "@/lib/alumni-badges/draw";

/**
 * „STALAK” SA AKREDITACIJAMA — 3D scena Alumni stranice.
 *
 * Svaka akreditacija je prava 3D kartica (laminat sa sjajem, ivica,
 * prorez i metalni karabinjer) koja visi na mint traci. Traka je lanac
 * tačaka sa fizikom (verlet), pa se kartica ljulja, okreće oko trake i
 * može da se uhvati mišem ili prstom i baci.
 *
 *   - prevuci karticu: drži je za kopču; kad pustiš, nastavlja da leti
 *   - pređi mišem preko kartice: lupneš je, kao zvonca na vetru
 *   - na ulasku kartice uleću sa strane i smire se
 *
 * Platno ne prima klikove (pointer-events: none) — događaje sluša roditelj,
 * pa tekst i dugmad ispod ostaju normalno klikabilni, a hvata se samo
 * kad je pokazivač stvarno na kartici.
 *
 * Performanse: crta se samo dok je scena u vidnom polju; gustina piksela
 * je ograničena na 2. Uz „smanjeno kretanje” kartice mirno vise, bez
 * fizike. Bez WebGL-a komponenta javlja `onGl(false)` i ne crta ništa —
 * sav tekst stoji i u HTML-u.
 */

export type Painter = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  fonts: Fonts
) => void | Promise<void>;

export type RackBadge = {
  id: string;
  front: Painter;
  back: Painter;
  /** boja tela kartice i boja ivice laminata */
  stock: string;
  edge: string;
};

/** Gde visi jedna kartica: sidro u px od gornjeg levog ugla scene i dužina trake. */
export type RackSlot = { x: number; y: number; length: number };
export type RackLayout = (w: number, h: number) => { width: number; slots: RackSlot[] };

type Props = {
  badges: RackBadge[];
  layout: RackLayout;
  className?: string;
  /** natpis koji se ponavlja na traci */
  strapText: string;
  /** širina trake, deo širine kartice */
  strapWidth?: number;
  /** metalna pločica na sidru (kad je sidro vidljivo) */
  showHooks?: boolean;
  onGl?: (ok: boolean) => void;
};

/* ---------- fizika ---------- */
const ROPE = 12; // tačaka u traci
const STEP = 1 / 120;
const GRAVITY = 2600; // px/s²
const DAMP = 0.992;
const ITER = 14;
const TWIST_K = 7; // koliko jako traka vraća okretanje
const TWIST_C = 1.1; // prigušenje okretanja
const SAMPLES = 40; // tačaka na iscrtanoj traci

type Body = {
  p: Float32Array; // položaji: ROPE tačaka trake + 1 (dno kartice)
  q: Float32Array; // prethodni položaji
  w: Float32Array; // „lakoća” tačke (0 = zakucana)
  seg: number;
  lb: number; // kopča → dno kartice
  ax: number;
  ay: number;
  az: number;
  theta: number;
  omega: number;
  phase: number;
  delay: number;
  knockAt: number;
  group: THREE.Group;
  ribbon: THREE.Mesh;
  rPos: Float32Array;
  rUv: Float32Array;
  curvePts: THREE.Vector3[];
  curve: THREE.CatmullRomCurve3;
  hook?: THREE.Mesh;
};

const UP = new THREE.Vector3(0, 1, 0);

function roundedRect(path: THREE.Path | THREE.Shape, x: number, y: number, w: number, h: number, r: number) {
  path.moveTo(x + r, y);
  path.lineTo(x + w - r, y);
  path.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  path.lineTo(x + w, y + h - r);
  path.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  path.lineTo(x + r, y + h);
  path.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  path.lineTo(x, y + r);
  path.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
}

export function AlumniRack({
  badges,
  layout,
  className,
  strapText,
  strapWidth = 0.13,
  showHooks = false,
  onGl,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  // slikari i raspored se čitaju jednom, pri pokretanju scene
  const cfg = useRef({ badges, layout, strapText, strapWidth, showHooks, onGl });

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const host = wrap.parentElement ?? wrap;
    const { badges, layout, strapText, strapWidth, showHooks, onGl } = cfg.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      onGl?.(false);
      return;
    }
    onGl?.(true);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.className = "ak-rack__canvas";
    canvas.setAttribute("aria-hidden", "true");
    wrap.appendChild(canvas);

    /* ---------- scena, svetlo, kamera ---------- */
    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.55;
    const key = new THREE.DirectionalLight(0xffffff, 1.5);
    key.position.set(-0.6, 1, 1.2);
    const rim = new THREE.DirectionalLight(0x66c6b3, 0.9);
    rim.position.set(1, -0.4, -1);
    scene.add(key, rim, new THREE.AmbientLight(0xffffff, 0.3));
    const camera = new THREE.PerspectiveCamera(28, 1, 10, 20000);

    /* ---------- slike lica, poleđine i trake ---------- */
    const anisotropy = renderer.capabilities.getMaxAnisotropy();
    const makeTex = (w: number, h: number) => {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = anisotropy;
      return { c, t };
    };
    const faces = badges.map(() => ({ front: makeTex(TEX_W, TEX_H), back: makeTex(TEX_W, TEX_H) }));
    const strap = makeTex(128, 1024);
    strap.t.wrapT = THREE.RepeatWrapping;

    /* ---------- materijali (jednom) ---------- */
    const metal = new THREE.MeshStandardMaterial({ color: 0xc9d4d1, metalness: 1, roughness: 0.28 });
    const strapMat = new THREE.MeshStandardMaterial({ map: strap.t, roughness: 0.78, side: THREE.DoubleSide });
    const mats = badges.map((b, i) => {
      const face = (t: THREE.Texture) =>
        new THREE.MeshPhysicalMaterial({
          map: t,
          alphaTest: 0.5,
          roughness: 0.46,
          clearcoat: 1,
          clearcoatRoughness: 0.13,
        });
      return {
        body: [
          new THREE.MeshStandardMaterial({ color: b.stock, roughness: 0.5 }),
          new THREE.MeshStandardMaterial({ color: b.edge, roughness: 0.3 }),
        ],
        front: face(faces[i].front.t),
        back: face(faces[i].back.t),
      };
    });

    /* ---------- stanje ---------- */
    let W = 0;
    let H = 0;
    let bw = 0;
    let bh = 0;
    let bodies: Body[] = [];
    let geos: THREE.BufferGeometry[] = [];
    let painted = false;
    let disposed = false;
    let visible = false;
    let raf = 0;
    let last = 0;
    let acc = 0;
    let clock = 0;
    let firstBuild = true;
    const hitMeshes: THREE.Object3D[] = [];

    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const tmp = new THREE.Vector3();
    const tan = new THREE.Vector3();
    const nb = new THREE.Vector3();
    const bn = new THREE.Vector3();
    const qa = new THREE.Quaternion();
    const qs = new THREE.Quaternion();

    const drag: { body: Body | null; tx: number; ty: number; ox: number; oy: number; id: number } = {
      body: null,
      tx: 0,
      ty: 0,
      ox: 0,
      oy: 0,
      id: -1,
    };

    /* ---------- gradnja scene za datu veličinu ---------- */
    const clear = () => {
      bodies.forEach((b) => {
        scene.remove(b.group, b.ribbon);
        if (b.hook) scene.remove(b.hook);
      });
      geos.forEach((g) => g.dispose());
      geos = [];
      bodies = [];
      hitMeshes.length = 0;
    };

    const build = () => {
      clear();
      const L = layout(W, H);
      bw = L.width;
      bh = bw * CARD.ratio;

      const ringR = bw * 0.05;
      const slotC = bw * (CARD.slotTop + CARD.slotH / 2);
      const cardTop = -1.7 * ringR + slotC;
      const cardCY = cardTop - bh / 2;
      const lb = bh - cardTop;
      const T = Math.max(3, bw * 0.016);

      // telo kartice: zaobljen pravougaonik sa prorezom
      const shape = new THREE.Shape();
      roundedRect(shape, -bw / 2, -bh / 2, bw, bh, bw * CARD.radius);
      const sw = bw * CARD.slotW;
      const sh = bw * CARD.slotH;
      const hole = new THREE.Path();
      roundedRect(hole, -sw / 2, bh / 2 - bw * CARD.slotTop - sh, sw, sh, sh / 2 - 0.01);
      shape.holes.push(hole);
      const bodyGeo = new THREE.ExtrudeGeometry(shape, {
        depth: T,
        bevelEnabled: true,
        bevelThickness: T * 0.3,
        bevelSize: T * 0.3,
        bevelSegments: 2,
        curveSegments: 12,
      });
      bodyGeo.translate(0, 0, -T / 2);
      const planeGeo = new THREE.PlaneGeometry(bw, bh);
      const ringGeo = new THREE.TorusGeometry(ringR, Math.max(1.2, bw * 0.008), 10, 28);
      const sWidth = bw * strapWidth;
      const hookGeo = new THREE.BoxGeometry(sWidth * 1.4, Math.max(4, bw * 0.03), Math.max(4, bw * 0.03));
      geos.push(bodyGeo, planeGeo, ringGeo, hookGeo);
      const zFace = T / 2 + T * 0.3 + 0.3;

      L.slots.forEach((slot, i) => {
        const m = mats[i % mats.length];
        const group = new THREE.Group();
        const body = new THREE.Mesh(bodyGeo, m.body);
        body.position.y = cardCY;
        const front = new THREE.Mesh(planeGeo, m.front);
        front.position.set(0, cardCY, zFace);
        const back = new THREE.Mesh(planeGeo, m.back);
        back.position.set(0, cardCY, -zFace);
        back.rotation.y = Math.PI;
        const ring = new THREE.Mesh(ringGeo, metal);
        ring.position.y = -ringR;
        ring.rotation.y = Math.PI / 2;
        group.add(body, front, back, ring);
        group.visible = painted;
        scene.add(group);

        // traka: geometrija koja se menja svakog kadra
        const rPos = new Float32Array(SAMPLES * 2 * 3);
        const rUv = new Float32Array(SAMPLES * 2 * 2);
        const idx: number[] = [];
        for (let k = 0; k < SAMPLES - 1; k++) {
          const a = k * 2;
          idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
        }
        const rg = new THREE.BufferGeometry();
        rg.setAttribute("position", new THREE.BufferAttribute(rPos, 3).setUsage(THREE.DynamicDrawUsage));
        rg.setAttribute("uv", new THREE.BufferAttribute(rUv, 2).setUsage(THREE.DynamicDrawUsage));
        rg.setIndex(idx);
        geos.push(rg);
        const ribbon = new THREE.Mesh(rg, strapMat);
        ribbon.frustumCulled = false;
        ribbon.visible = painted;
        scene.add(ribbon);

        const ax = slot.x - W / 2;
        const ay = H / 2 - slot.y;
        const az = -i * 4;
        const n = ROPE;
        const p = new Float32Array((n + 1) * 3);
        const q = new Float32Array((n + 1) * 3);
        const w = new Float32Array(n + 1);
        const seg = slot.length / (n - 1);

        // početni položaj: mirno visi, ili (na prvom crtanju) zabačena u stranu
        const swing = firstBuild && !reduced ? (i % 2 ? -1 : 1) * (1.05 + 0.15 * i) : 0;
        const sx = Math.sin(swing);
        const sy = -Math.cos(swing);
        for (let k = 0; k <= n; k++) {
          const d = k < n ? k * seg : slot.length + lb;
          p[k * 3] = q[k * 3] = ax + sx * d;
          p[k * 3 + 1] = q[k * 3 + 1] = ay + sy * d;
          p[k * 3 + 2] = q[k * 3 + 2] = az;
          w[k] = k === 0 ? 0 : k === n ? 0.22 : k === n - 1 ? 0.7 : 1;
        }

        let hook: THREE.Mesh | undefined;
        if (showHooks) {
          hook = new THREE.Mesh(hookGeo, metal);
          hook.position.set(ax, ay, az);
          scene.add(hook);
        }

        const curvePts = Array.from({ length: n }, () => new THREE.Vector3());
        const b: Body = {
          p,
          q,
          w,
          seg,
          lb,
          ax,
          ay,
          az,
          theta: swing ? swing * 1.6 : 0,
          omega: 0,
          phase: i * 1.7,
          delay: firstBuild && !reduced ? 0.15 + i * 0.16 : 0,
          knockAt: 0,
          group,
          ribbon,
          rPos,
          rUv,
          curvePts,
          curve: new THREE.CatmullRomCurve3(curvePts, false, "centripetal"),
          hook,
        };
        body.userData.body = b;
        front.userData.body = b;
        back.userData.body = b;
        hitMeshes.push(body, front, back);
        bodies.push(b);
      });
      firstBuild = false;
      bodies.forEach(sync);
    };

    /* ---------- jedan korak fizike ---------- */
    const solve = (b: Body, a: number, c: number, len: number) => {
      const ia = a * 3;
      const ic = c * 3;
      const dx = b.p[ic] - b.p[ia];
      const dy = b.p[ic + 1] - b.p[ia + 1];
      const dz = b.p[ic + 2] - b.p[ia + 2];
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6;
      const wa = b.w[a];
      const wc = b.w[c];
      const sum = wa + wc;
      if (!sum) return;
      const diff = (d - len) / d / sum;
      b.p[ia] += dx * diff * wa;
      b.p[ia + 1] += dy * diff * wa;
      b.p[ia + 2] += dz * diff * wa;
      b.p[ic] -= dx * diff * wc;
      b.p[ic + 1] -= dy * diff * wc;
      b.p[ic + 2] -= dz * diff * wc;
    };

    const step = (b: Body, dt: number) => {
      const n = ROPE;
      const held = drag.body === b;
      if (clock < b.delay) return;
      const g = GRAVITY * dt * dt;
      for (let k = 1; k <= n; k++) {
        if (held && k === n - 1) continue;
        const i = k * 3;
        for (let a = 0; a < 3; a++) {
          const v = (b.p[i + a] - b.q[i + a]) * DAMP;
          b.q[i + a] = b.p[i + a];
          b.p[i + a] += v;
        }
        b.p[i + 1] -= g;
        // dubina se lagano vraća u ravan
        b.p[i + 2] += (b.az - b.p[i + 2]) * 0.02;
      }
      // tih povetarac — kartica nikad ne stoji potpuno mrtvo
      b.p[n * 3] += Math.sin(clock * 0.8 + b.phase) * 120 * dt * dt;

      const top = (n - 1) * 3;
      if (held) {
        b.w[n - 1] = 0;
        b.q[top] = b.p[top];
        b.q[top + 1] = b.p[top + 1];
        b.p[top] = drag.tx;
        b.p[top + 1] = drag.ty;
      }
      for (let it = 0; it < ITER; it++) {
        b.p[0] = b.ax;
        b.p[1] = b.ay;
        b.p[2] = b.az;
        for (let k = 1; k < n; k++) solve(b, k - 1, k, b.seg);
        solve(b, n - 1, n, b.lb);
      }
      if (held) b.w[n - 1] = 0.7;

      b.omega += (-TWIST_K * b.theta - TWIST_C * b.omega) * dt;
      b.theta += b.omega * dt;
    };

    /* ---------- prenos fizike na 3D objekte ---------- */
    const sync = (b: Body) => {
      const n = ROPE;
      const t = (n - 1) * 3;
      const e = n * 3;
      // kartica: od kopče ka dnu
      tmp.set(b.p[t] - b.p[e], b.p[t + 1] - b.p[e + 1], b.p[t + 2] - b.p[e + 2]).normalize();
      qa.setFromUnitVectors(UP, tmp);
      qs.setFromAxisAngle(UP, b.theta);
      b.group.quaternion.copy(qa).multiply(qs);
      b.group.position.set(b.p[t], b.p[t + 1], b.p[t + 2]);

      // traka: glatka kriva kroz tačke, uvija se ka kartici
      for (let k = 0; k < n; k++) b.curvePts[k].set(b.p[k * 3], b.p[k * 3 + 1], b.p[k * 3 + 2]);
      b.curve.updateArcLengths();
      const half = (bw * strapWidth) / 2;
      const repeat = bw * strapWidth * 8;
      let len = 0;
      let px = 0;
      let py = 0;
      let pz = 0;
      for (let k = 0; k < SAMPLES; k++) {
        const u = k / (SAMPLES - 1);
        b.curve.getPointAt(u, tmp);
        b.curve.getTangentAt(u, tan);
        if (k) len += Math.hypot(tmp.x - px, tmp.y - py, tmp.z - pz);
        px = tmp.x;
        py = tmp.y;
        pz = tmp.z;
        nb.set(-tan.y, tan.x, 0);
        if (nb.lengthSq() < 1e-8) nb.set(1, 0, 0);
        nb.normalize();
        bn.crossVectors(tan, nb).normalize();
        const phi = b.theta * u * u;
        const c = Math.cos(phi) * half;
        const s = Math.sin(phi) * half;
        const wx = nb.x * c + bn.x * s;
        const wy = nb.y * c + bn.y * s;
        const wz = nb.z * c + bn.z * s;
        const o = k * 6;
        b.rPos[o] = tmp.x - wx;
        b.rPos[o + 1] = tmp.y - wy;
        b.rPos[o + 2] = tmp.z - wz;
        b.rPos[o + 3] = tmp.x + wx;
        b.rPos[o + 4] = tmp.y + wy;
        b.rPos[o + 5] = tmp.z + wz;
        const v = -len / repeat;
        const ou = k * 4;
        b.rUv[ou] = 0;
        b.rUv[ou + 1] = v;
        b.rUv[ou + 2] = 1;
        b.rUv[ou + 3] = v;
      }
      const g = b.ribbon.geometry;
      g.attributes.position.needsUpdate = true;
      g.attributes.uv.needsUpdate = true;
      g.computeVertexNormals();
    };

    /* ---------- petlja ---------- */
    const render = () => renderer.render(scene, camera);

    const frame = (now: number) => {
      raf = 0;
      if (disposed || !visible || !painted) return;
      const dt = Math.min(0.05, last ? (now - last) / 1000 : STEP);
      last = now;
      acc += dt;
      while (acc >= STEP) {
        clock += STEP;
        bodies.forEach((b) => step(b, STEP));
        acc -= STEP;
      }
      bodies.forEach(sync);
      render();
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (reduced) {
        if (painted) render();
        return;
      }
      if (!raf && visible && painted) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };

    /* ---------- veličina ---------- */
    const resize = () => {
      const r = wrap.getBoundingClientRect();
      const nw = Math.round(r.width);
      const nh = Math.round(r.height);
      if (!nw || !nh || (nw === W && nh === H)) return;
      W = nw;
      H = nh;
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      camera.position.set(0, 0, H / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
      camera.far = camera.position.z * 4;
      camera.updateProjectionMatrix();
      build();
      if (reduced && painted) render();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });
    io.observe(wrap);

    /* ---------- crtanje slika, pa tek onda pojavljivanje ---------- */
    (async () => {
      const fonts = readFonts();
      await loadFonts(fonts);
      if (disposed) return;
      drawStrap(strap.c.getContext("2d")!, 128, 1024, fonts, strapText);
      strap.t.needsUpdate = true;
      await Promise.all(
        badges.map(async (b, i) => {
          await b.front(faces[i].front.c.getContext("2d")!, TEX_W, TEX_H, fonts);
          await b.back(faces[i].back.c.getContext("2d")!, TEX_W, TEX_H, fonts);
          faces[i].front.t.needsUpdate = true;
          faces[i].back.t.needsUpdate = true;
        })
      );
      if (disposed) return;
      painted = true;
      clock = 0;
      bodies.forEach((b) => {
        b.group.visible = true;
        b.ribbon.visible = true;
      });
      wrap.setAttribute("data-ready", "");
      start();
    })();

    /* ---------- ruka: hvatanje, bacanje, lupkanje ---------- */
    const toNdc = (x: number, y: number) => {
      const r = canvas.getBoundingClientRect();
      ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
    };
    const hit = (x: number, y: number): Body | null => {
      if (!painted || reduced) return null;
      toNdc(x, y);
      const h = ray.intersectObjects(hitMeshes, false)[0];
      return (h?.object.userData.body as Body) ?? null;
    };
    const worldAt = (x: number, y: number, z: number) => {
      toNdc(x, y);
      plane.constant = -z;
      return ray.ray.intersectPlane(plane, tmp) ? { x: tmp.x, y: tmp.y } : null;
    };
    const clampToRope = (b: Body, x: number, y: number) => {
      const max = b.seg * (ROPE - 1);
      const dx = x - b.ax;
      const dy = y - b.ay;
      const d = Math.hypot(dx, dy);
      return d > max ? { x: b.ax + (dx / d) * max, y: b.ay + (dy / d) * max } : { x, y };
    };

    let lastMove = { x: 0, y: 0, t: 0 };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      const b = hit(e.clientX, e.clientY);
      if (!b) return;
      const w = worldAt(e.clientX, e.clientY, b.az);
      if (!w) return;
      e.preventDefault();
      const t = (ROPE - 1) * 3;
      drag.body = b;
      drag.id = e.pointerId;
      drag.ox = b.p[t] - w.x;
      drag.oy = b.p[t + 1] - w.y;
      const c = clampToRope(b, w.x + drag.ox, w.y + drag.oy);
      drag.tx = c.x;
      drag.ty = c.y;
      host.setPointerCapture?.(e.pointerId);
      host.style.cursor = "grabbing";
      start();
    };

    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      if (drag.body && e.pointerId === drag.id) {
        const b = drag.body;
        const w = worldAt(e.clientX, e.clientY, b.az);
        if (w) {
          const c = clampToRope(b, w.x + drag.ox, w.y + drag.oy);
          const dt = Math.max(8, now - lastMove.t) / 1000;
          const vx = (c.x - drag.tx) / dt;
          b.omega = THREE.MathUtils.clamp(b.omega + vx * 0.0016, -16, 16);
          drag.tx = c.x;
          drag.ty = c.y;
        }
        lastMove = { x: e.clientX, y: e.clientY, t: now };
        return;
      }
      if (e.pointerType !== "mouse") return;

      const b = hit(e.clientX, e.clientY);
      host.style.cursor = b ? "grab" : "";
      // lupkanje: brz prelaz preko kartice je gura u pravcu kretanja
      const dt = Math.max(8, now - lastMove.t) / 1000;
      if (b && lastMove.t && now - b.knockAt > 140 && dt < 0.1) {
        const vx = THREE.MathUtils.clamp((e.clientX - lastMove.x) / dt, -2400, 2400);
        const n = ROPE;
        const push = (vx * 0.28 * STEP);
        b.q[n * 3] -= push;
        b.q[(n - 1) * 3] -= push * 0.5;
        b.omega = THREE.MathUtils.clamp(b.omega + vx * 0.0022, -14, 14);
        b.knockAt = now;
        start();
      }
      lastMove = { x: e.clientX, y: e.clientY, t: now };
    };

    const onUp = (e: PointerEvent) => {
      if (!drag.body || e.pointerId !== drag.id) return;
      drag.body = null;
      drag.id = -1;
      host.releasePointerCapture?.(e.pointerId);
      host.style.cursor = "";
    };

    // na dodir: ako prst krene sa kartice, stranica se ne skroluje
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t && hit(t.clientX, t.clientY)) e.preventDefault();
    };
    const onTouchMove = (e: TouchEvent) => {
      if (drag.body) e.preventDefault();
    };

    host.addEventListener("pointerdown", onDown);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerup", onUp);
    host.addEventListener("pointercancel", onUp);
    host.addEventListener("touchstart", onTouchStart, { passive: false });
    host.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerup", onUp);
      host.removeEventListener("pointercancel", onUp);
      host.removeEventListener("touchstart", onTouchStart);
      host.removeEventListener("touchmove", onTouchMove);
      host.style.cursor = "";
      clear();
      mats.forEach((m) => {
        m.body.forEach((x) => x.dispose());
        m.front.dispose();
        m.back.dispose();
      });
      faces.forEach((f) => {
        f.front.t.dispose();
        f.back.t.dispose();
      });
      strap.t.dispose();
      strapMat.dispose();
      metal.dispose();
      env.dispose();
      pmrem.dispose();
      room.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, []);

  return <div ref={wrapRef} className={className ? `ak-rack ${className}` : "ak-rack"} />;
}
