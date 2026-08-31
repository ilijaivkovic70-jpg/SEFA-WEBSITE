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
   HERO — mali isečci fotografija oko broja „50+”
   Tačno pet komada; raspored po putanji zadaje sama komponenta.
   ============================================================ */

export type AlumniSnapshot = {
  /** npr. "/alumni/portreti/1.jpg" — dok je `null`, prikazuje se prazan okvir */
  src: string | null;
  alt: string;
};

export const ALUMNI_SNAPSHOTS: AlumniSnapshot[] = [
  { src: null, alt: "Alumni članovi SEFE na okupljanju" },
  { src: null, alt: "Tim SEFE tokom rada na projektu" },
  { src: null, alt: "Bivši član SEFE na konferenciji" },
  { src: null, alt: "Generacija članova SEFE" },
  { src: null, alt: "Alumni članovi na dodeli priznanja" },
];

/* ============================================================
   MAPA KARIJERNIH PUTEVA — „Put nakon SEFE”
   `count` ostaviti `null` dok ne postoji tačan broj; ne prikazuje se
   dok je prazan, da se ne bi objavljivala izmišljena statistika.
   ============================================================ */

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
    title: "Preduzetništvo",
    description:
      "Deo alumni zajednice je pokrenuo sopstvene poslovne poduhvate i danas su mladi preduzetnici.",
    count: null,
  },
];

/* ============================================================
   PRIČE ALUMNISTA — „Od SEFE do novih uspeha”

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
    imageAlt: "Portret bivšeg člana SEFE",
    quote: "Kratka lična uspomena ili poruka budućim članovima.",
  },
  {
    name: "Ime i prezime",
    currentRole: "Trenutna pozicija / kompanija",
    sefaRole: "Uloga u SEFA-i",
    sefaYear: "20XX",
    image: null,
    imageAlt: "Portret bivše članice SEFE",
    quote: "Kratka lična uspomena ili poruka budućim članovima.",
  },
  {
    name: "Ime i prezime",
    currentRole: "Trenutna pozicija / kompanija",
    sefaRole: "Uloga u SEFA-i",
    sefaYear: "20XX",
    image: null,
    imageAlt: "Portret bivšeg člana SEFE",
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
  { src: null, alt: "Sa konferencije REPSUS", title: "REPSUS", year: null, description: null, shape: "pejzaz" },
  { src: null, alt: "Snimanje podkasta SEFA Talks", title: "SEFA Talks", year: null, description: null, shape: "portret" },
  { src: null, alt: "Sa projekta Sport Business Day", title: "Sport Business Day", year: null, description: null, shape: "kvadrat" },
  { src: null, alt: "Sa ekskurzije EKOF u pokretu", title: "EKOF u pokretu", year: null, description: null, shape: "pejzaz" },
  { src: null, alt: "Sa humanitarne akcije Prava stvar", title: "Prava stvar", year: null, description: null, shape: "portret" },
  { src: null, alt: "Sa projekta Link to the Future", title: "Link to the Future", year: null, description: null, shape: "kvadrat" },
  { src: null, alt: "Sa projekta Greenfield", title: "Greenfield", year: null, description: null, shape: "pejzaz" },
  { src: null, alt: "Sa tribine Bez straha", title: "Bez straha", year: null, description: null, shape: "portret" },
];
