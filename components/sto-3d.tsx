"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { SEKTORI, type SektorId } from "@/data/postani-clan";
import { StoSefa, type StoFaza } from "@/components/sto-sefa";

/**
 * 3D okrugli sto SEFA-e: drvena ploča sa logom, stolice članova
 * raspoređene u četiri sektora i po jedno prazno mesto u svakom.
 * Jedna svetla stolica („ti”) stoji izvučena ispred stola; dok
 * posetilac odgovara na kviz, ona obilazi sto ka sektoru koji mu
 * najviše leži, a na kraju se primakne i sedne na prazno mesto.
 *
 * Bez WebGL-a se prikazuje ravna (2D) verzija istog stola.
 */

type Props = {
  sektor: SektorId | null;
  faza: StoFaza;
  className?: string;
};

/* ---------- mere (metri, otprilike) ---------- */

const STO_R = 1.55; // poluprečnik ploče
const STO_Y = 0.76; // visina ploče
const STO_D = 0.07; // debljina ploče
const R_SEDI = 1.78; // gde stoje stolice za stolom
const R_BIRA = 2.45; // stolica „ti” dok bira, izvučena
const R_CEKA = 2.7; // stolica „ti” na početku, ispred stola
const R_NATPIS = 2.6;

/** Ugao centra sektora oko stola; 0 je strana prema posmatraču. */
const UGAO: Record<SektorId, number> = {
  pr: -45,
  dizajn: 45,
  sponzorstva: 135,
  "ljudski-resursi": -135,
};
const RAZMAK = 16; // stepeni između stolica
const UGAO_CEKA = 0;

const rad = (u: number) => (u * Math.PI) / 180;
const naKrugu = (u: number, r: number, y = 0) =>
  new THREE.Vector3(r * Math.sin(rad(u)), y, r * Math.cos(rad(u)));
const izi = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

const BOJA_CLAN = new THREE.Color("#33403c");
const BOJA_VODECI = new THREE.Color("#45635c");
const BOJA_TI = new THREE.Color("#66c6b3");

/* ---------- materijali ---------- */

/** Tekstura drveta nacrtana u kodu: daske sa godovima, bez spoljnih slika. */
function drvo() {
  const S = 1024;
  const c = document.createElement("canvas");
  c.width = S;
  c.height = S;
  const g = c.getContext("2d")!;
  const osnova = g.createLinearGradient(0, 0, S, S);
  osnova.addColorStop(0, "#6b4529");
  osnova.addColorStop(0.5, "#5a3920");
  osnova.addColorStop(1, "#4b2f1a");
  g.fillStyle = osnova;
  g.fillRect(0, 0, S, S);

  // daske
  const daske = 6;
  for (let d = 0; d < daske; d++) {
    const y0 = (d * S) / daske;
    g.fillStyle = `rgba(${d % 2 ? "40,24,12" : "120,80,48"},${0.06 + Math.random() * 0.06})`;
    g.fillRect(0, y0, S, S / daske);
    // godovi
    for (let i = 0; i < 46; i++) {
      const y = y0 + Math.random() * (S / daske);
      const faza = Math.random() * Math.PI * 2;
      const amp = 2 + Math.random() * 7;
      const frek = 0.004 + Math.random() * 0.01;
      g.beginPath();
      for (let x = 0; x <= S; x += 8) {
        const yy = y + Math.sin(x * frek + faza) * amp + Math.sin(x * frek * 3.1 + faza) * amp * 0.25;
        if (x === 0) g.moveTo(x, yy);
        else g.lineTo(x, yy);
      }
      const tamno = Math.random() > 0.35;
      g.strokeStyle = tamno
        ? `rgba(30,16,6,${0.08 + Math.random() * 0.22})`
        : `rgba(160,112,70,${0.06 + Math.random() * 0.12})`;
      g.lineWidth = 0.6 + Math.random() * 2.4;
      g.stroke();
    }
    // spoj dasaka
    g.fillStyle = "rgba(20,10,4,0.55)";
    g.fillRect(0, y0, S, 2);
  }
  // sitna zrnca
  for (let i = 0; i < 14000; i++) {
    g.fillStyle = `rgba(${Math.random() > 0.5 ? "0,0,0" : "255,220,180"},${Math.random() * 0.05})`;
    g.fillRect(Math.random() * S, Math.random() * S, 1 + Math.random() * 2, 1);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/* ---------- stolica ---------- */

function napraviStolicu(boja: THREE.Color, metal: THREE.Material) {
  const g = new THREE.Group();
  const skoljka = new THREE.MeshStandardMaterial({ color: boja.clone(), roughness: 0.62, metalness: 0.04 });

  const sediste = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.05, 0.42), skoljka);
  sediste.position.set(0, 0.46, 0);
  const nasl = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.4, 0.045), skoljka);
  nasl.position.set(0, 0.7, 0.2);
  nasl.rotation.x = -0.12;
  g.add(sediste, nasl);

  const nogaGeo = new THREE.CylinderGeometry(0.016, 0.014, 0.46, 10);
  for (const [x, z] of [
    [-0.18, -0.17],
    [0.18, -0.17],
    [-0.18, 0.17],
    [0.18, 0.17],
  ]) {
    const n = new THREE.Mesh(nogaGeo, metal);
    n.position.set(x, 0.23, z);
    g.add(n);
  }
  g.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return { grupa: g, materijal: skoljka };
}

/** Postavlja stolicu na ugao i rastojanje od centra, okrenutu ka stolu. */
function postavi(g: THREE.Object3D, u: number, r: number) {
  g.position.copy(naKrugu(u, r));
  g.rotation.y = rad(u);
}

/* ---------- komponenta ---------- */

export function Sto3D({ sektor, faza, className }: Props) {
  const okvirRef = useRef<HTMLDivElement>(null);
  const natpisiRef = useRef<(HTMLSpanElement | null)[]>([]);
  const ciljRef = useRef({ sektor, faza });
  const [bezWebGL, setBezWebGL] = useState(false);

  useEffect(() => {
    ciljRef.current = { sektor, faza };
  }, [sektor, faza]);

  useEffect(() => {
    const okvir = okvirRef.current;
    if (!okvir) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      // nema WebGL-a: posle ovog kadra prikaži ravnu verziju
      const id = requestAnimationFrame(() => setBezWebGL(true));
      return () => cancelAnimationFrame(id);
    }

    const smanjeno = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const telefon = window.matchMedia("(max-width: 767px)").matches;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, telefon ? 1.4 : 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.className = "pc-sto3d__platno";
    okvir.prepend(renderer.domElement);

    const scena = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const okolina = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scena.environment = okolina;
    scena.environmentIntensity = 0.55;

    const kamera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    const cilj = new THREE.Vector3(0, 0.42, 0);

    /* svetla */
    scena.add(new THREE.HemisphereLight("#dfeee9", "#0b1615", 0.5));
    const sunce = new THREE.DirectionalLight("#fff4e6", 2.4);
    sunce.position.set(-3.2, 7, 3.4);
    sunce.castShadow = true;
    sunce.shadow.mapSize.set(telefon ? 1024 : 2048, telefon ? 1024 : 2048);
    sunce.shadow.camera.left = -4;
    sunce.shadow.camera.right = 4;
    sunce.shadow.camera.top = 4;
    sunce.shadow.camera.bottom = -4;
    sunce.shadow.radius = 6;
    sunce.shadow.bias = -0.0004;
    scena.add(sunce);
    const mintSvetlo = new THREE.PointLight("#66c6b3", 6, 8, 2);
    mintSvetlo.position.set(2.6, 1.6, -2.4);
    scena.add(mintSvetlo);

    /* pod koji samo hvata senku */
    const pod = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: 0.5 }));
    pod.rotation.x = -Math.PI / 2;
    pod.receiveShadow = true;
    scena.add(pod);

    /* sto */
    const drvoTex = drvo();
    drvoTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const drvoMat = new THREE.MeshStandardMaterial({ map: drvoTex, roughness: 0.48, metalness: 0 });
    const ivicaMat = new THREE.MeshStandardMaterial({ color: "#3e2614", roughness: 0.55 });
    const metal = new THREE.MeshStandardMaterial({ color: "#1d2321", roughness: 0.35, metalness: 0.85 });

    const sto = new THREE.Group();
    const ploca = new THREE.Mesh(new THREE.CylinderGeometry(STO_R, STO_R, STO_D, 128), [ivicaMat, drvoMat, drvoMat]);
    ploca.position.y = STO_Y;
    const ivica = new THREE.Mesh(new THREE.TorusGeometry(STO_R, STO_D / 2, 16, 160), ivicaMat);
    ivica.rotation.x = Math.PI / 2;
    ivica.position.y = STO_Y;
    const stub = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, STO_Y - STO_D / 2, 32), metal);
    stub.position.y = (STO_Y - STO_D / 2) / 2;
    const stopa = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.04, 64), metal);
    stopa.position.y = 0.02;
    sto.add(ploca, ivica, stub, stopa);
    sto.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    scena.add(sto);

    /* logo na ploči, kao štampa na drvetu */
    const logoTex = new THREE.TextureLoader().load("/logo.png", () => crtaj());
    logoTex.colorSpace = THREE.SRGBColorSpace;
    logoTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const logoMat = new THREE.MeshStandardMaterial({
      map: logoTex,
      transparent: true,
      roughness: 0.35,
      metalness: 0.05,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    });
    const logoSirina = 1.5;
    const logo = new THREE.Mesh(new THREE.PlaneGeometry(logoSirina, logoSirina / (2453 / 900)), logoMat);
    logo.rotation.x = -Math.PI / 2;
    logo.position.set(0, STO_Y + STO_D / 2 + 0.002, 0.05);
    logo.receiveShadow = true;
    scena.add(logo);

    /* stolice članova: po četiri u sektoru, prazno mesto u sredini */
    const clanovi: { mat: THREE.MeshStandardMaterial; sektor: SektorId }[] = [];
    for (const s of SEKTORI) {
      for (const pomak of [-2, -1, 1, 2]) {
        const { grupa, materijal } = napraviStolicu(BOJA_CLAN, metal);
        postavi(grupa, UGAO[s.id] + pomak * RAZMAK, R_SEDI);
        scena.add(grupa);
        clanovi.push({ mat: materijal, sektor: s.id });
      }
    }

    /* tvoja stolica */
    const ti = napraviStolicu(BOJA_TI, metal);
    ti.materijal.roughness = 0.5;
    ti.materijal.emissive = new THREE.Color("#66c6b3");
    ti.materijal.emissiveIntensity = 0.35;
    scena.add(ti.grupa);
    const poz = { u: UGAO_CEKA, r: R_CEKA };
    postavi(ti.grupa, poz.u, poz.r);
    let put: { od: { u: number; r: number }; razlika: number; doR: number; start: number; trajanje: number } | null = null;
    let prethodni = "";

    /* veličina */
    const velicina = () => {
      const w = okvir.clientWidth;
      const h = Math.round(w * 0.92);
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = `${w}px`;
      renderer.domElement.style.height = `${h}px`;
      kamera.aspect = w / h;
      kamera.updateProjectionMatrix();
    };
    velicina();
    const ro = new ResizeObserver(velicina);
    ro.observe(okvir);

    /* pokazivač: kamera se blago pomera za mišem */
    const mis = { x: 0, y: 0 };
    const glatko = { x: 0, y: 0 };
    const naMis = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = okvir.getBoundingClientRect();
      mis.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      mis.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    const vanMis = () => {
      mis.x = 0;
      mis.y = 0;
    };
    okvir.addEventListener("pointermove", naMis);
    okvir.addEventListener("pointerleave", vanMis);

    /* natpisi sektora: HTML iznad platna, prate 3D položaj */
    const tackeNatpisa = SEKTORI.map((s) => naKrugu(UGAO[s.id], R_NATPIS, 1.35));
    const v = new THREE.Vector3();

    const boje = clanovi.map(() => BOJA_CLAN.clone());
    const pocetak = performance.now();

    function crtaj() {
      const sad = performance.now();
      const { sektor: s, faza: f } = ciljRef.current;

      // novi cilj za tvoju stolicu
      const kljuc = `${s}-${f}`;
      if (kljuc !== prethodni) {
        prethodni = kljuc;
        const doU = f === "ceka" || !s ? UGAO_CEKA : UGAO[s];
        const doR = f === "ceka" || !s ? R_CEKA : f === "sedi" ? R_SEDI : R_BIRA;
        let razlika = ((doU - poz.u + 540) % 360) - 180;
        if (Math.abs(razlika) < 0.01) razlika = 0;
        put = { od: { ...poz }, razlika, doR, start: sad, trajanje: smanjeno ? 0 : 900 + Math.abs(razlika) * 6 };
      }
      if (put) {
        const t = put.trajanje === 0 ? 1 : Math.min(1, (sad - put.start) / put.trajanje);
        const e = izi(t);
        poz.u = put.od.u + put.razlika * e;
        // kad obilazi sto, malo se odmakne da ne udari u druge stolice
        poz.r =
          put.od.r +
          (put.doR - put.od.r) * e +
          Math.sin(Math.PI * t) * Math.min(0.55, Math.abs(put.razlika) / 220);
        postavi(ti.grupa, poz.u, poz.r);
        if (t >= 1) {
          poz.u = (((put.od.u + put.razlika) % 360) + 360) % 360;
          put = null;
        }
      }

      // boje stolica vodećeg sektora
      clanovi.forEach((c, i) => {
        const cilj = c.sektor === s ? BOJA_VODECI : BOJA_CLAN;
        boje[i].lerp(cilj, smanjeno ? 1 : 0.08);
        c.mat.color.copy(boje[i]);
      });

      // kamera
      glatko.x += (mis.x - glatko.x) * 0.05;
      glatko.y += (mis.y - glatko.y) * 0.05;
      const vreme = (sad - pocetak) / 1000;
      const ljuljanje = smanjeno ? 0 : Math.sin(vreme * 0.25) * 0.18;
      const ugaoKamere = ljuljanje + glatko.x * 0.22;
      const rast = 7.2;
      kamera.position.set(
        Math.sin(ugaoKamere) * rast,
        5.1 - glatko.y * 0.45,
        Math.cos(ugaoKamere) * rast
      );
      kamera.lookAt(cilj);

      renderer.render(scena, kamera);

      // natpisi
      const w = renderer.domElement.clientWidth;
      const h = renderer.domElement.clientHeight;
      tackeNatpisa.forEach((p, i) => {
        const el = natpisiRef.current[i];
        if (!el) return;
        v.copy(p).project(kamera);
        // natpis ostaje unutar ivica platna (bitno na uskom telefonu)
        const pola = el.offsetWidth / 2 + 4;
        const x = Math.min(w - pola, Math.max(pola, ((v.x + 1) / 2) * w));
        el.style.transform = `translate(-50%, -50%) translate(${x}px, ${((1 - v.y) / 2) * h}px)`;
      });
    }

    /* petlja samo dok je sto na ekranu */
    let frame = 0;
    let vidljiv = false;
    const petlja = () => {
      crtaj();
      frame = requestAnimationFrame(petlja);
    };
    const io = new IntersectionObserver(([e]) => {
      vidljiv = e.isIntersecting;
      cancelAnimationFrame(frame);
      if (vidljiv) frame = requestAnimationFrame(petlja);
    });
    io.observe(okvir);
    crtaj();

    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      ro.disconnect();
      okvir.removeEventListener("pointermove", naMis);
      okvir.removeEventListener("pointerleave", vanMis);
      scena.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) {
          m.geometry.dispose();
          (Array.isArray(m.material) ? m.material : [m.material]).forEach((mat) => mat.dispose());
        }
      });
      drvoTex.dispose();
      logoTex.dispose();
      okolina.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  if (bezWebGL) return <StoSefa sektor={sektor} faza={faza} className={className} />;

  return (
    <div ref={okvirRef} className={`pc-sto3d ${className ?? ""}`} data-faza={faza} aria-hidden="true">
      {SEKTORI.map((s, i) => (
        <span
          key={s.id}
          ref={(el) => {
            natpisiRef.current[i] = el;
          }}
          className="pc-sto3d__natpis"
          data-vodeci={sektor === s.id ? "da" : "ne"}
        >
          {s.naziv}
        </span>
      ))}
    </div>
  );
}
