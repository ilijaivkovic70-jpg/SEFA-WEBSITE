/**
 * SADRŽAJ ALUMNI STRANICE
 *
 * Ceo tekst i sve fotografije sa stranice `/alumni` menjaju se u ovom fajlu.
 * Komponente ispod `components/alumni-*.tsx` samo prikazuju ono što je ovde.
 *
 * VAŽNO — privremeni sadržaj:
 * Sva polja koja su `null` znače „fotografija još nije ubačena”. Umesto slike
 * se tada prikaže neutralan okvir, bez izmišljenih fotografija sa interneta.
 * Priče alumnista (`ALUMNI_STORIES`) trenutno sadrže označene privremene
 * vrednosti — treba ih zameniti pravim podacima pre objave.
 *
 * Gde idu fotografije:
 *   public/alumni/portreti/   — portreti alumnista (hero i priče)
 *   public/alumni/uspomene/   — fotografije za galeriju „Trenuci koji ostaju”
 * Detaljno uputstvo: public/alumni/README.md
 */

/* ============================================================
   HERO — naslov, uvodni tekst i broj članova
   Reč „SEFA” / „SEFA-E” se u naslovu i tekstu sama oboji u mint.
   ============================================================ */

export const ALUMNI_HERO = {
  eyebrow: "Alumni klub",
  /** naslov u dva reda — razmak na kraju prvog reda ostaje (zbog čitača ekrana) */
  titleLines: ["Zajednica koja traje ", "i posle SEFA-E"],
  lead:
    "Alumni klub okuplja bivše članove SEFA-E koji su svoje iskustvo iz organizacije preneli dalje u profesionalni svet, ostajući deo naše zajednice i podrška generacijama koje dolaze.",
  /** broj članova alumni kluba — menja se samo ovde */
  count: 50,
  /** znak posle broja; staviti "" ako je broj tačan, a ne „više od” */
  countSuffix: "+",
  countLabel: "Članova u alumni klubu",
  /** dugme ispod uvodnog teksta (isto kao na kraju stranice) */
  cta: { label: "Poveži se sa alumni zajednicom", href: "/kontakt" },
  /** sitan natpis koji kaže da akreditacija može da se uhvati */
  hint: "Uhvati akreditaciju i zavrti je",
};

/* ============================================================
   ALUMNI AKREDITACIJA — velika mint kartica u heroju
   Štampa na kartici; „SEFA” i broj članova dolaze iz ALUMNI_HERO.
   ============================================================ */

export const ALUMNI_PASS = {
  /** natpis gore levo na kartici */
  label: "Alumni klub",
  /** veliki natpis preko kartice */
  title: "ALUMNI",
  /** prazno polje za ime (namerno ostaje prazno — kartica je „tvoja”) */
  nameField: "Ime i prezime",
  sinceField: "Član od",
  sinceValue: "20__",
  validField: "Važi",
  validValue: "Uvek",
  /** tamna traka na dnu kartice i poleđina */
  footer: "Jednom deo SEFA-E · Uvek deo priče",
  /** natpis koji se ponavlja na traci (lanyard) */
  strap: "SEFA alumni",
};

/* ============================================================
   HERO — isečci fotografija ispod naslova (traka kao sa izložbe)
   Tačno pet komada; oblik i položaj svakog okvira zadaje komponenta.
   ============================================================ */

export type AlumniSnapshot = {
  /** npr. "/alumni/portreti/1.jpg" — dok je `null`, prikazuje se prazan okvir */
  src: string | null;
  alt: string;
};

export const ALUMNI_SNAPSHOTS: AlumniSnapshot[] = [
  { src: null, alt: "Alumni članovi SEFA-E na okupljanju" },
  { src: null, alt: "Tim SEFA-E tokom rada na projektu" },
  { src: null, alt: "Bivši član SEFA-E na konferenciji" },
  { src: null, alt: "Generacija članova SEFA-E" },
  { src: null, alt: "Alumni članovi na dodeli priznanja" },
];

/* ============================================================
   KARIJERNI PUTEVI — „Put nakon SEFA-E”
   Tri akreditacije vise sa jedne šipke — po jedna za svaki karijerni
   put iz `CAREER_PATHS` ispod. `eyebrow` se štampa na karticama.
   ============================================================ */

export const CAREER_PATHS_INTRO = {
  eyebrow: "Gde su danas",
  title: "Put nakon SEFA-E",
  lead:
    "Iskustvo stečeno kroz rad u sektorima SEFA-E otvara vrata ka različitim karijernim putevima.",
  /** natpis u kosoj traci preko svake akreditacije pravca */
  band: "Jedno iskustvo · tri pravca",
  /** reč posle broja kod karijernog puta, npr. „12 alumnista” */
  countUnit: "alumnista",
};

/* `count` ostaviti `null` dok ne postoji tačan broj; ne prikazuje se
   dok je prazan, da se ne bi objavljivala izmišljena statistika. */

export type CareerPath = {
  id: string;
  title: string;
  description: string;
  count: number | null;
};

export const CAREER_PATHS: CareerPath[] = [
  {
    id: "institucije",
    title: "Državne institucije",
    description:
      "Deo alumni mreže danas gradi karijeru u državnim institucijama, primenjujući iskustvo stečeno kroz rad u SEFA-i.",
    count: null,
  },
  {
    id: "korporacije",
    title: "Velike korporacije",
    description:
      "Mnogi bivši članovi su zaposleni u vodećim domaćim i međunarodnim kompanijama.",
    count: null,
  },
  {
    id: "preduzetnistvo",
    /** \u00AD = mesto gde sme da se prelomi na kartici */
    title: "Preduzet\u00ADništvo",
    description:
      "Deo alumni zajednice je pokrenuo sopstvene poslovne poduhvate i danas su mladi preduzetnici.",
    count: null,
  },
];

/* ============================================================
   PRIČE ALUMNISTA — „Od SEFA-E do novih uspeha”

   PRIVREMENI PODACI. Sva tri unosa su prazni obrasci koje treba
   popuniti pravim imenima, pozicijama i izjavama — tek uz saglasnost
   osobe čija priča se objavljuje. Na stranici se prikazuju najviše tri.
   ============================================================ */

export type AlumniStory = {
  name: string;
  /** trenutna pozicija i kompanija */
  currentRole: string;
  /** uloga koju je osoba imala u SEFA-i */
  sefaRole: string;
  /** godina ili raspon godina članstva */
  sefaYear: string;
  /** npr. "/alumni/portreti/marko.jpg" — dok je `null`, prikazuje se prazan okvir */
  image: string | null;
  imageAlt: string;
  /** kratka lična uspomena ili poruka budućim članovima */
  quote: string;
};

export const ALUMNI_STORIES: AlumniStory[] = [
  {
    name: "Ime i prezime",
    currentRole: "Trenutna pozicija / kompanija",
    sefaRole: "Uloga u SEFA-i",
    sefaYear: "20XX",
    image: null,
    imageAlt: "Portret bivšeg člana SEFA-E",
    quote: "Kratka lična uspomena ili poruka budućim članovima.",
  },
  {
    name: "Ime i prezime",
    currentRole: "Trenutna pozicija / kompanija",
    sefaRole: "Uloga u SEFA-i",
    sefaYear: "20XX",
    image: null,
    imageAlt: "Portret bivše članice SEFA-E",
    quote: "Kratka lična uspomena ili poruka budućim članovima.",
  },
  {
    name: "Ime i prezime",
    currentRole: "Trenutna pozicija / kompanija",
    sefaRole: "Uloga u SEFA-i",
    sefaYear: "20XX",
    image: null,
    imageAlt: "Portret bivšeg člana SEFA-E",
    quote: "Kratka lična uspomena ili poruka budućim članovima.",
  },
];

/* ============================================================
   GALERIJA „Trenuci koji ostaju”

   Nazivi projekata su stvarni (isti kao na stranici /projekti).
   `year` i `description` su prazni dok se ne zna tačna godina i opis
   konkretne fotografije — prazna polja se jednostavno ne prikazuju.

   `shape` određuje oblik okvira u traci:
     "portret"  — uspravna (3:4)
     "pejzaz"   — položena (3:2)
     "kvadrat"  — kvadratna (1:1)
   Mešanje oblika je namerno, da traka izgleda kao kontakt-list, a ne kao mreža.
   ============================================================ */

export type MemoryShape = "portret" | "pejzaz" | "kvadrat";

export type Memory = {
  /** npr. "/alumni/uspomene/repsus-1.jpg" — dok je `null`, prikazuje se prazan okvir */
  src: string | null;
  alt: string;
  /** naziv projekta ili događaja */
  title: string;
  /** godina snimka, npr. "2019" — ostaviti `null` dok se ne zna */
  year: string | null;
  /** kratak opis koji se vidi u uvećanom prikazu */
  description: string | null;
  shape: MemoryShape;
};

export const MEMORIES: Memory[] = [
  // PRIVREMENO: postojeće slike sajta, samo da se vidi animacija trake. Zameniti pravim fotografijama sa događaja.
  { src: "/tim-2.jpg", alt: "Sa konferencije REPSUS", title: "REPSUS", year: null, description: null, shape: "pejzaz" },
  { src: "/o-nama-pozadina.jpg", alt: "Snimanje podkasta SEFA Talks", title: "SEFA Talks", year: null, description: null, shape: "portret" },
  { src: "/komunikacije-glas.png", alt: "Sa projekta Sport Business Day", title: "Sport Business Day", year: null, description: null, shape: "kvadrat" },
  { src: "/put-pozadina.jpg", alt: "Sa ekskurzije EKOF u pokretu", title: "EKOF u pokretu", year: null, description: null, shape: "pejzaz" },
  { src: "/ljudski-resursi-glas.png", alt: "Sa humanitarne akcije Prava stvar", title: "Prava stvar", year: null, description: null, shape: "portret" },
  { src: "/komunikacije-glas.png", alt: "Sa projekta Link to the Future", title: "Link to the Future", year: null, description: null, shape: "kvadrat" },
  { src: "/projekti-pozadina.jpg", alt: "Sa projekta Greenfield", title: "Greenfield", year: null, description: null, shape: "pejzaz" },
  { src: "/tim-2.jpg", alt: "Sa tribine Bez straha", title: "Bez straha", year: null, description: null, shape: "portret" },
];
