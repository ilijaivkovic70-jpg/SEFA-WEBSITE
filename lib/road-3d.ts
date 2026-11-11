/**
 * Sekcija „Naš put” u WebGL-u (Three.js): tlo, put sa linijama, tirkizni
 * trag, oznake stanica, drveće i žbunje, i 3D auto — sve u jednom platnu.
 *
 * Zašto WebGL: u CSS 3D verziji svaki deo sveta je bio poseban sloj
 * pregledača (oko 150), koje je trebalo stalno ponovo iscrtavati; kad bi
 * grafičkoj kartici ponestalo memorije, delovi puta (pa i stranice) bi
 * trepnuli. Ovde se teksture pošalju grafičkoj kartici jednom, a svaki kadar
 * je samo jedno crtanje.
 *
 * Kamera je izračunata tako da se tačno poklapa sa ranijom CSS perspektivom
 * (iste vrednosti: nagib, okret, razmera, tačka auta), pa tekst stanica,
 * horizont i magla (DOM slojevi) ostaju na istim mestima.
 *
 * Koordinate: svet se slaže u „CSS prostoru” (x desno, y naniže, z ka
 * gledaocu / nagore od tla), pa se na kraju preslika u Three.js prostor.
 */

import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  Box3,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CircleGeometry,
  ClampToEdgeWrapping,
  Color,
  DirectionalLight,
  DoubleSide,
  Fog,
  Group,
  HemisphereLight,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  RepeatWrapping,
  RingGeometry,
  Scene,
  SRGBColorSpace,
  Sprite,
  SpriteMaterial,
  Texture,
  TextureLoader,
  Vector3,
  WebGLRenderer,
  type Material,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import type { Sample, Sprite as Plant } from "@/lib/road-scene";

export type PinPhase = "before" | "in" | "after";

export type Road3DData = {
  /** Sredina puta (gusto uzorkovana). */
  road: Sample[];
  /** Linija traga (desna traka). */
  trail: Sample[];
  /** Tačke stanica (oznake na putu). */
  stops: { x: number; y: number }[];
  plants: Plant[];
  roadWidth: number;
  /** Period teksture asfalta i zemlje (jedinice sveta). */
  asphaltTile: number;
  groundTile: number;
  /** Pomeraj senke drveća (udeo veličine). */
  shadow: { x: number; y: number };
};

export type Road3DAssets = {
  ground: string;
  asphalt: string;
  treeTop: string;
  treeSide: string;
  bushTop: string;
  bushSide: string;
  car: string;
};

export type Road3DOptions = {
  carLength: number;
  /** Okret modela auta (stepeni) da mu nos gleda napred. */
  carYawOffset: number;
  pixelRatio: number;
};

export type Road3DView = {
  /** Kadar (px) i CSS perspektiva. */
  W: number;
  H: number;
  persp: number;
  perspY: number;
  /** Tačka auta na ekranu (px). */
  ax: number;
  ay: number;
  /** Nagib tla, okret kamere (stepeni), razmera (px po jedinici). */
  tilt: number;
  rz: number;
  s: number;
  /** Tačka auta u svetu. */
  cx: number;
  cy: number;
  /** Auto: pravac, nagibi, poskakivanje. */
  heading: number;
  roll: number;
  pitch: number;
  lift: number;
  /** 0–1: koliko se vidi pogled odozgo / pogled iza auta. */
  kTop: number;
  kChase: number;
  /** Dokle je iscrtan tirkizni trag (dužina puta). */
  trailLen: number;
  /** Faze oznaka stanica. */
  pins: PinPhase[];
  /** Tačka ispred auta i radijus na kome se drveće utapa u maglu. */
  lookX: number;
  lookY: number;
  cull: number;
};

const deg = (d: number) => (d * Math.PI) / 180;
const clamp = (v: number, lo: number, hi: number) =>
  v < lo ? lo : v > hi ? hi : v;

/** Boja magle na horizontu — ista kao CSS magla iznad platna. */
const FOG = new Color(0x0d201e);
/** Tirkizna boja sajta (--primary). */
const MINT = new Color(0x66c6b3);

/** Meki krug (senka, odsjaj) kao tekstura. */
function glowTexture(stops: [number, string][]) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  stops.forEach(([o, col]) => grad.addColorStop(o, col));
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/** Snop farova na putu: svetlo počinje kod auta i širi se napred. */
function beamTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const g = c.getContext("2d")!;
  for (let x = 0; x < 256; x++) {
    const t = x / 255;
    const spread = 0.22 + t * 0.78;
    const alpha = Math.pow(1 - t, 1.6) * Math.min(1, t * 6);
    const grad = g.createLinearGradient(0, 64 - 64 * spread, 0, 64 + 64 * spread);
    grad.addColorStop(0, "rgba(255,240,210,0)");
    grad.addColorStop(0.5, `rgba(255,240,210,${alpha.toFixed(3)})`);
    grad.addColorStop(1, "rgba(255,240,210,0)");
    g.fillStyle = grad;
    g.fillRect(x, 64 - 64 * spread, 1, 128 * spread);
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/** Poprečni gradijent (u = 0…1): senka uz ivice puta. */
function shoulderTexture() {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 1;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 64, 0);
  grad.addColorStop(0, "rgba(2,6,5,0)");
  grad.addColorStop(0.3, "rgba(2,6,5,0.42)");
  grad.addColorStop(0.5, "rgba(2,6,5,0.42)");
  grad.addColorStop(0.7, "rgba(2,6,5,0.42)");
  grad.addColorStop(1, "rgba(2,6,5,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 1);
  const t = new CanvasTexture(c);
  t.wrapS = ClampToEdgeWrapping;
  return t;
}

/** Uzdužni šablon (v = 0…1 je jedan period): crta i razmak. */
function dashTexture(pattern: [number, number][]) {
  const c = document.createElement("canvas");
  c.width = 4;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#fff";
  for (const [from, to] of pattern) g.fillRect(0, from * 256, 4, (to - from) * 256);
  const t = new CanvasTexture(c);
  t.wrapS = ClampToEdgeWrapping;
  t.wrapT = RepeatWrapping;
  return t;
}

/**
 * Traka duž linije: širina `width`, pomerena bočno za `offset`. `u` ide
 * poprečno od 0 do `uSpan`, `v` uzdužno = dužina / `vScale`.
 */
function stripGeometry(
  samples: Sample[],
  offset: number,
  width: number,
  vScale: number,
  uSpan = 1
) {
  const n = samples.length;
  const pos = new Float32Array(n * 6);
  const uv = new Float32Array(n * 4);
  const idx = new Uint32Array((n - 1) * 6);
  for (let i = 0; i < n; i++) {
    const a = samples[Math.max(i - 1, 0)];
    const b = samples[Math.min(i + 1, n - 1)];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const l = Math.hypot(dx, dy) || 1;
    const nx = -dy / l;
    const ny = dx / l;
    const s = samples[i];
    const cx = s.x + nx * offset;
    const cy = s.y + ny * offset;
    pos.set([cx - nx * width * 0.5, cy - ny * width * 0.5, 0], i * 6);
    pos.set([cx + nx * width * 0.5, cy + ny * width * 0.5, 0], i * 6 + 3);
    const v = s.len / vScale;
    uv.set([0, v, uSpan, v], i * 4);
  }
  for (let i = 0; i < n - 1; i++) {
    const a = i * 2;
    idx.set([a, a + 2, a + 1, a + 1, a + 2, a + 3], i * 6);
  }
  const geo = new BufferGeometry();
  geo.setAttribute("position", new BufferAttribute(pos, 3));
  geo.setAttribute("uv", new BufferAttribute(uv, 2));
  geo.setIndex(new BufferAttribute(idx, 1));
  geo.computeBoundingSphere();
  return geo;
}

/** Materijal za ravne slojeve na tlu (crtaju se ovim redom, bez z-borbe). */
function flat(
  params: ConstructorParameters<typeof MeshBasicMaterial>[0],
  layer: number
) {
  const m = new MeshBasicMaterial({
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
    toneMapped: false,
    polygonOffset: true,
    polygonOffsetFactor: -layer,
    polygonOffsetUnits: -layer * 4,
    ...params,
  });
  return m;
}

type PlantMeshes = {
  plant: Plant;
  top: Mesh;
  side: Mesh;
  sideW: number;
  sideH: number;
  base: number;
};

export class Road3D {
  readonly ready: Promise<void>;
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera();
  /** Ceo svet; matrica = kamera (isti transform kao nekadašnji CSS sloj). */
  private world = new Group();
  private body = new Group();
  private carGround = new Group();
  private carDecals = new Group();
  private sun = new DirectionalLight(0xd8efe8, 2.2);
  private sky = new HemisphereLight(0x5f8f86, 0x0b1a14, 0.9);
  /** Tirkizno kontra-svetlo sa horizonta: ocrtava krov i ivice karoserije. */
  private rim = new DirectionalLight(0x66e0c4, 1.1);
  private heads: Sprite[] = [];
  private tails: Sprite[] = [];
  private beam!: Mesh;
  private tailGlow!: Mesh;
  private carShadow!: Mesh;
  private trail: Mesh[] = [];
  private trailIdx: number[] = [];
  private pins: { ring: Mesh; dot: Mesh; ringOp: number; dotOp: number; scale: number }[] = [];
  private plants: PlantMeshes[] = [];
  private W = 0;
  private H = 0;
  private disposed = false;

  // pomoćne matrice (bez alokacije u svakom kadru)
  private m = new Matrix4();
  private t = new Matrix4();
  private r = new Matrix4();
  private camMat = new Matrix4();
  private flip = new Matrix4().makeScale(1, -1, 1);
  private v3 = new Vector3();
  private v3b = new Vector3();
  /** Model: X napred, Y gore, Z desno  →  CSS: x napred, z gore, y desno. */
  private base = new Matrix4().set(
    1, 0, 0, 0,
    0, 0, 1, 0,
    0, 1, 0, 0,
    0, 0, 0, 1
  );

  constructor(
    private canvas: HTMLCanvasElement,
    private data: Road3DData,
    assets: Road3DAssets,
    private opts: Road3DOptions
  ) {
    this.renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(opts.pixelRatio);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.95;
    this.renderer.outputColorSpace = SRGBColorSpace;

    // odsjaji na laku auta: neutralna „studijska” okolina, prigušena za noć
    const pmrem = new PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.55;
    pmrem.dispose();

    this.scene.fog = new Fog(FOG, 1e7, 1e7 + 1);
    this.scene.add(this.sky, this.sun, this.sun.target, this.rim, this.rim.target);
    for (const o of [this.world, this.body, this.carGround])
      o.matrixAutoUpdate = false;
    this.scene.add(this.world, this.carGround, this.body);

    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
    const loader = new TextureLoader();
    const tex = (url: string, repeat: boolean) =>
      loader.loadAsync(url).then((t) => {
        t.colorSpace = SRGBColorSpace;
        t.anisotropy = maxAniso;
        if (repeat) t.wrapS = t.wrapT = RepeatWrapping;
        return t;
      });

    this.ready = Promise.all([
      tex(assets.ground, true),
      tex(assets.asphalt, true),
      tex(assets.treeTop, false),
      tex(assets.treeSide, false),
      tex(assets.bushTop, false),
      tex(assets.bushSide, false),
      new GLTFLoader().loadAsync(assets.car),
    ]).then(([ground, asphalt, treeTop, treeSide, bushTop, bushSide, gltf]) => {
      if (this.disposed) return;
      this.buildWorld({ ground, asphalt, treeTop, treeSide, bushTop, bushSide });
      this.buildCar(gltf.scene);
      // prvo crtanje unapred prevede sve šejdere — bez zastoja pri skrolu
      this.renderer.compile(this.scene, this.camera);
    });
  }

  /* ---------------------------------------------------------------- */
  /*  svet                                                            */
  /* ---------------------------------------------------------------- */

  private buildWorld(t: {
    ground: Texture;
    asphalt: Texture;
    treeTop: Texture;
    treeSide: Texture;
    bushTop: Texture;
    bushSide: Texture;
  }) {
    const d = this.data;
    const w = d.roadWidth;

    // tlo: jedna velika ravan, tekstura se ponavlja
    const size = 40000;
    t.ground.repeat.set(size / d.groundTile, size / d.groundTile);
    const ground = new Mesh(
      new PlaneGeometry(size, size),
      new MeshBasicMaterial({ map: t.ground, toneMapped: false, side: DoubleSide })
    );
    ground.position.set(500, 3200, 0);
    ground.renderOrder = 0;
    this.world.add(ground);

    // senka uz ivice puta
    const shoulder = new Mesh(
      stripGeometry(d.road, 0, w + 44, 1000),
      flat({ map: shoulderTexture() }, 1)
    );
    shoulder.renderOrder = 1;

    // asfalt (malo zatamnjen, iste nijanse kao ostatak stranice)
    const asphalt = new Mesh(
      stripGeometry(d.road, 0, w, d.asphaltTile, w / d.asphaltTile),
      flat({ map: t.asphalt, color: new Color(0.86, 0.86, 0.86), transparent: false }, 2)
    );
    asphalt.renderOrder = 2;

    // ivične linije (blago istrošene) i isprekidana sredina
    const edgeMat = flat(
      {
        color: new Color("rgb(206,202,186)"),
        opacity: 0.42,
        alphaMap: dashTexture([
          [0, 0.31],
          [0.32, 0.53],
          [0.535, 0.985],
        ]),
      },
      3
    );
    const edgeL = new Mesh(stripGeometry(d.road, -(w / 2 - 4.5), 2, 143.6), edgeMat);
    const edgeR = new Mesh(stripGeometry(d.road, w / 2 - 4.5, 2, 143.6), edgeMat);
    const center = new Mesh(
      stripGeometry(d.road, 0, 1.8, 30),
      flat(
        {
          color: new Color("rgb(214,208,190)"),
          opacity: 0.46,
          alphaMap: dashTexture([[0, 16 / 30]]),
        },
        3
      )
    );
    for (const m of [edgeL, edgeR, center]) m.renderOrder = 3;

    // tirkizni trag rute: tanak + blagi sjaj; iscrtava se do auta
    const glow = new Mesh(
      stripGeometry(d.trail, 0, 6, 1000),
      flat({ color: MINT, opacity: 0.1, blending: AdditiveBlending }, 4)
    );
    const line = new Mesh(
      stripGeometry(d.trail, 0, 1.6, 1000),
      flat({ color: MINT, opacity: 0.62 }, 5)
    );
    glow.renderOrder = 4;
    line.renderOrder = 5;
    this.trail = [glow, line];
    this.trailIdx = d.trail.map((s) => s.len);
    for (const m of this.trail) m.geometry.setDrawRange(0, 0);

    this.world.add(shoulder, asphalt, edgeL, edgeR, center, glow, line);

    // oznake stanica
    for (const p of d.stops) {
      const ring = new Mesh(
        new RingGeometry(15.4, 17, 64),
        flat({ color: MINT, opacity: 0 }, 6)
      );
      const dot = new Mesh(new CircleGeometry(4.5, 24), flat({ color: MINT, opacity: 0.22 }, 6));
      for (const m of [ring, dot]) {
        m.position.set(p.x, p.y, 0);
        m.renderOrder = 6;
      }
      ring.scale.setScalar(0.35);
      this.world.add(ring, dot);
      this.pins.push({ ring, dot, ringOp: 0, dotOp: 0.22, scale: 0.35 });
    }

    // drveće i žbunje: senka i krošnja odozgo leže na tlu; sa strane stoje
    const shadowTex = glowTexture([
      [0, "rgba(0,0,0,0.55)"],
      [0.58, "rgba(0,0,0,0.3)"],
      [1, "rgba(0,0,0,0)"],
    ]);
    const unit = new PlaneGeometry(1, 1);
    const standing = new PlaneGeometry(1, 1).translate(0, 0.5, 0);
    for (const p of d.plants) {
      const tree = p.kind === "tree";
      const shadow = new Mesh(unit, flat({ map: shadowTex }, 7));
      shadow.position.set(p.x + d.shadow.x * p.size, p.y + d.shadow.y * p.size, 0);
      shadow.scale.set(p.size * 1.05, p.size * 1.05, 1);
      shadow.renderOrder = 7;

      const topSize = p.size / 0.93;
      const top = new Mesh(unit, flat({ map: tree ? t.treeTop : t.bushTop }, 8));
      top.position.set(p.x, p.y, 0);
      top.rotation.z = deg(p.rot);
      top.scale.set(topSize, topSize, 1);
      top.renderOrder = 8;

      const sideW = tree ? p.size * 1.13 : p.size * 1.35;
      const sideH = tree ? sideW / 0.7536 : sideW * 0.7536;
      const side = new Mesh(
        standing,
        new MeshBasicMaterial({
          map: tree ? t.treeSide : t.bushSide,
          transparent: true,
          depthWrite: false,
          side: DoubleSide,
          toneMapped: false,
          opacity: 0,
        })
      );
      side.matrixAutoUpdate = false;
      side.visible = false;
      side.renderOrder = 10;

      this.world.add(shadow, top, side);
      this.plants.push({
        plant: p,
        top,
        side,
        sideW,
        sideH,
        // žbun na slici ne dopire do donje ivice
        base: tree ? -0.01 : -0.15,
      });
    }
  }

  /* ---------------------------------------------------------------- */
  /*  auto                                                            */
  /* ---------------------------------------------------------------- */

  private buildCar(model: Object3D) {
    const L = this.opts.carLength;

    // meka senka ispod auta (leži na tlu, ne naginje se sa karoserijom)
    this.carShadow = new Mesh(
      new PlaneGeometry(L * 1.18, L * 0.62),
      flat(
        {
          map: glowTexture([
            [0, "rgba(0,0,0,0.82)"],
            [0.55, "rgba(0,0,0,0.5)"],
            [1, "rgba(0,0,0,0)"],
          ]),
        },
        9
      )
    );
    this.carShadow.matrixAutoUpdate = false;
    this.carShadow.renderOrder = 9;

    // snop farova na asfaltu, ispred auta; crveni odsjaj stop svetala iza
    this.beam = new Mesh(
      new PlaneGeometry(L * 2.2, L * 1.25),
      flat({ map: beamTexture(), blending: AdditiveBlending, opacity: 0.34 }, 9)
    );
    this.beam.position.set(L * 0.5 + L * 1.1, 0, 0);
    this.tailGlow = new Mesh(
      new PlaneGeometry(L * 0.55, L * 0.62),
      flat(
        {
          map: glowTexture([
            [0, "rgba(255,40,30,0.55)"],
            [1, "rgba(255,40,30,0)"],
          ]),
          blending: AdditiveBlending,
          opacity: 0.5,
        },
        9
      )
    );
    this.tailGlow.position.set(-L * 0.62, 0, 0);
    this.beam.renderOrder = this.tailGlow.renderOrder = 9;
    this.carDecals.matrixAutoUpdate = false;
    this.carDecals.add(this.beam, this.tailGlow);
    this.carGround.add(this.carShadow, this.carDecals);

    model.rotation.y = deg(this.opts.carYawOffset);
    model.updateMatrixWorld(true);
    // poravnaj: sredina auta u (0, 0), točkovi na y = 0, dužina = L
    const box = new Box3().setFromObject(model);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const k = L / size.x;
    const holder = new Object3D();
    model.position.sub(new Vector3(center.x, box.min.y, center.z));
    holder.add(model);
    holder.scale.setScalar(k);
    size.multiplyScalar(k);

    model.traverse((o) => {
      const mesh = o as Mesh;
      if (!mesh.isMesh) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m: Material & { envMapIntensity?: number }) => {
        if ("envMapIntensity" in m) m.envMapIntensity = 1;
      });
    });

    // svetla na karoseriji (pozicije iz dimenzija modela)
    const { x: len, y: h, z: w } = size;
    const head = glowTexture([
      [0, "rgba(255,248,230,1)"],
      [0.25, "rgba(255,236,200,0.55)"],
      [1, "rgba(255,236,200,0)"],
    ]);
    const tail = glowTexture([
      [0, "rgba(255,70,55,1)"],
      [0.3, "rgba(255,30,25,0.5)"],
      [1, "rgba(255,30,25,0)"],
    ]);
    for (const side of [-1, 1]) {
      const hs = new Sprite(
        new SpriteMaterial({ map: head, blending: AdditiveBlending, depthWrite: false, transparent: true, fog: false })
      );
      hs.position.set(len * 0.47, h * 0.42, side * w * 0.36);
      hs.scale.setScalar(len * 0.11);
      hs.material.opacity = 0.9;
      this.heads.push(hs);
      const ts = new Sprite(
        new SpriteMaterial({ map: tail, blending: AdditiveBlending, depthWrite: false, transparent: true, fog: false })
      );
      ts.position.set(-len * 0.48, h * 0.55, side * w * 0.37);
      ts.scale.setScalar(len * 0.075);
      ts.material.opacity = 0.75;
      this.tails.push(ts);
    }

    const rig = new Group();
    rig.add(holder, ...this.heads, ...this.tails);
    rig.matrixAutoUpdate = false;
    rig.matrix.copy(this.base);
    this.body.add(rig);
  }

  /* ---------------------------------------------------------------- */
  /*  kadar                                                           */
  /* ---------------------------------------------------------------- */

  /** Nacrta kadar. Vraća `true` dok se oznake stanica još animiraju. */
  render(v: Road3DView): boolean {
    if (this.disposed) return false;
    if (v.W !== this.W || v.H !== this.H) {
      this.W = v.W;
      this.H = v.H;
      this.renderer.setSize(v.W, v.H, false);
    }

    // kamera = CSS perspektiva: oko u (W/2, perspY, persp), ravan ekrana z = 0
    const near = 60;
    const far = v.persp + 200000;
    const f = near / v.persp;
    this.camera.position.set(v.W / 2, -v.perspY, v.persp);
    this.camera.quaternion.identity();
    this.camera.updateMatrixWorld(true);
    this.camera.projectionMatrix.makePerspective(
      -(v.W / 2) * f,
      (v.W / 2) * f,
      v.perspY * f,
      (v.perspY - v.H) * f,
      near,
      far
    );
    this.camera.projectionMatrixInverse.copy(this.camera.projectionMatrix).invert();

    // svet: isti transform kao nekadašnji CSS sloj
    const cam = this.camMat
      .makeTranslation(v.ax, v.ay, 0)
      .multiply(this.t.makeRotationX(deg(v.tilt)))
      .multiply(this.t.makeRotationZ(deg(v.rz)))
      .multiply(this.t.makeScale(v.s, v.s, v.s));
    this.world.matrix
      .copy(this.flip)
      .multiply(cam)
      .multiply(this.t.makeTranslation(-v.cx, -v.cy, 0));

    // magla: raste sa daljinom, samo kad je kamera nagnuta
    const sinT = Math.sin(deg(v.tilt));
    const fog = this.scene.fog as Fog;
    if (v.kChase > 0.01 && sinT > 0.05) {
      fog.near = v.persp + 520 * v.s * sinT;
      fog.far = v.persp + 2600 * v.s * sinT;
    } else {
      fog.near = 1e7;
      fog.far = 1e7 + 1;
    }

    // trag rute do auta
    let k = 0;
    const idx = this.trailIdx;
    let lo = 0;
    let hi = idx.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (idx[mid] <= v.trailLen) lo = mid;
      else hi = mid - 1;
    }
    k = lo;
    for (const m of this.trail) m.geometry.setDrawRange(0, k * 6);

    // oznake stanica: meki prelazi između faza
    let animating = false;
    v.pins.forEach((phase, i) => {
      const pin = this.pins[i];
      if (!pin) return;
      const ringT = phase === "in" ? 0.9 : phase === "after" ? 0.28 : 0;
      const dotT = phase === "before" ? 0.22 : 1;
      const scaleT = phase === "before" ? 0.35 : 1;
      pin.ringOp += (ringT - pin.ringOp) * 0.14;
      pin.dotOp += (dotT - pin.dotOp) * 0.14;
      pin.scale += (scaleT - pin.scale) * 0.12;
      if (
        Math.abs(ringT - pin.ringOp) > 0.004 ||
        Math.abs(dotT - pin.dotOp) > 0.004 ||
        Math.abs(scaleT - pin.scale) > 0.004
      )
        animating = true;
      (pin.ring.material as MeshBasicMaterial).opacity = pin.ringOp;
      (pin.dot.material as MeshBasicMaterial).opacity = pin.dotOp;
      pin.ring.scale.setScalar(pin.scale);
    });

    // zelenilo: odozgo krošnje, sa strane uspravni „billboard”-i okrenuti ka
    // kameri; iza auta i u daljini se utapaju
    const phi = deg(-90 - v.rz);
    const hx = Math.cos(phi);
    const hy = Math.sin(phi);
    const face = this.r
      .makeRotationZ(phi - Math.PI / 2)
      .multiply(this.t.makeRotationX(Math.PI / 2));
    for (const pm of this.plants) {
      const p = pm.plant;
      (pm.top.material as MeshBasicMaterial).opacity = v.kTop;
      pm.top.visible = v.kTop > 0.002;

      let op = 0;
      if (v.kChase > 0.002) {
        const fwd = (p.x - v.cx) * hx + (p.y - v.cy) * hy;
        const dist = Math.hypot(p.x - v.lookX, p.y - v.lookY);
        const behind = clamp((fwd + 30) / 60, 0, 1);
        const farFade = clamp((v.cull - dist) / 260, 0, 1);
        op = v.kChase * behind * farFade;
      }
      pm.side.visible = op > 0.002;
      if (!pm.side.visible) continue;
      (pm.side.material as MeshBasicMaterial).opacity = op;
      const flipX = p.flip ? -1 : 1;
      pm.side.matrix
        .makeTranslation(p.x, p.y, 0)
        .multiply(face)
        .multiply(this.m.makeTranslation(0, pm.base * pm.sideH, 0))
        .multiply(this.m.makeScale(pm.sideW * flipX, pm.sideH, 1));
    }

    // auto: stoji na tački puta; karoserija se naginje i poskakuje
    const L = this.opts.carLength;
    const carBase = this.m
      .copy(this.flip)
      .multiply(cam);
    this.carGround.matrix.copy(carBase);
    this.carShadow.matrix
      .makeTranslation(L * 0.07, L * 0.1, 0)
      .multiply(this.t.makeRotationZ(deg(v.heading)));
    this.carDecals.matrix.makeRotationZ(deg(v.heading));
    this.body.matrix
      .copy(carBase)
      .multiply(this.t.makeRotationZ(deg(v.heading)))
      .multiply(this.t.makeTranslation(0, 0, v.lift))
      .multiply(this.t.makeRotationY(deg(-v.pitch)))
      .multiply(this.t.makeRotationX(deg(v.roll)));

    // svetla su fiksna u svetu (odozgo sleva) — okreću se zajedno sa tlom
    const orient = this.r
      .copy(this.flip)
      .multiply(this.t.makeRotationX(deg(v.tilt)))
      .multiply(this.t.makeRotationZ(deg(v.rz)));
    const carPos = this.v3.set(v.ax, -v.ay, 0);
    const sunDir = this.v3b.set(-0.45, -0.6, 0.9).normalize().applyMatrix4(orient);
    this.sun.position.copy(carPos).addScaledVector(sunDir, 1000);
    this.sun.target.position.copy(carPos);
    this.sky.position.set(0, 0, 1).applyMatrix4(orient);
    // kontra-svetlo dolazi iz pravca horizonta (ispred auta, nisko)
    const rimDir = this.v3b
      .set(0, -0.4, 0.12)
      .applyMatrix4(this.t.copy(this.flip).multiply(this.m.makeRotationX(deg(v.tilt))))
      .normalize();
    this.rim.position.copy(carPos).addScaledVector(rimDir, 1000);
    this.rim.target.position.copy(carPos);
    this.rim.intensity = 1.1 * Math.min(1, v.tilt / 40);

    this.renderer.render(this.scene, this.camera);
    return animating;
  }

  dispose() {
    this.disposed = true;
    const textures = new Set<Texture>();
    this.scene.traverse((o) => {
      const mesh = o as Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mats = mesh.material
        ? Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material]
        : [];
      mats.forEach((mat) => {
        Object.values(mat).forEach((val) => {
          if (val && typeof val === "object" && (val as Texture).isTexture)
            textures.add(val as Texture);
        });
        mat.dispose();
      });
    });
    textures.forEach((t) => t.dispose());
    this.scene.environment?.dispose();
    this.renderer.dispose();
  }
}
