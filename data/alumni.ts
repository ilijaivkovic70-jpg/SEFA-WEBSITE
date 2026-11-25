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
     "siroki"   — široka (16:9)
     "visoki"   — uspravna (9:16), za snimke sa telefona
   Fotografije su u public/alumni/uspomene/ (01–17.jpg), snimci kao v1–v6.mp4
   sa sličicom v1–v6.jpg. Naslov ispod slike je „rukom” dopisana beleška.
   Mešanje oblika je namerno, da traka izgleda kao kontakt-list, a ne kao mreža.
   ============================================================ */

export type MemoryShape = "portret" | "pejzaz" | "kvadrat" | "siroki" | "visoki";

export type Memory = {
  /** npr. "/alumni/uspomene/01.jpg" — dok je `null`, prikazuje se prazan okvir.
      Kod snimka je ovo sličica (poster) koja se vidi dok se snimak ne pokrene. */
  src: string | null;
  /** putanja do snimka (mp4) — ako postoji, uspomena je video */
  video?: string;
  alt: string;
  /** naziv projekta ili događaja */
  title: string;
  /** godina snimka, npr. "2019" — ostaviti `null` dok se ne zna */
  year: string | null;
  /** kratak opis koji se vidi u uvećanom prikazu */
  description: string | null;
  shape: MemoryShape;
};

const U = "/alumni/uspomene";

/** fotografija */
const foto = (
  file: string,
  shape: MemoryShape,
  title: string,
  alt: string
): Memory => ({ src: `${U}/${file}.jpg`, alt, title, year: null, description: null, shape });

/** snimak: `v1.mp4` + sličica `v1.jpg`, uvek uspravan (9:16) */
const snimak = (file: string, title: string, alt: string): Memory => ({
  src: `${U}/${file}.jpg`,
  video: `${U}/${file}.mp4`,
  alt,
  title,
  year: null,
  description: null,
  shape: "visoki",
});

/**
 * Redosled je namerno izmešan (fotografije, snimci, različiti oblici), da
 * traka ostane živa. Naslovi su beleške „rukom” ispod slike — menjaju se ovde.
 */
export const MEMORIES: Memory[] = [
  foto("09", "siroki", "Cela ekipa", "Zajednička fotografija celog tima ispred kuće, sa podignutim rukama"),
  foto("02", "siroki", "Roštilj u dvorištu", "Ekipa oko roštilja u dvorištu kuće, a pored je bazen"),
  snimak("v1", "Na terasi", "Snimak druženja na natkrivenoj terasi"),
  foto("04", "pejzaz", "Zagrljaj kraj bazena", "Dve drugarice se grle ispod nadstrešnice, a u pozadini su ostali kraj bazena"),
  foto("03", "portret", "Tri lica, jedan kadar", "Selfi troje članova ispod zelene nadstrešnice"),
  snimak("v3", "Bazen", "Snimak bazena na suncu"),
  foto("08", "pejzaz", "Teren sa pogledom", "Članovi na terenu sa pogledom na brda"),
  snimak("v4", "Dim sa roštilja", "Snimak dvorišta, roštilja i ekipe u hladu"),
  foto("10", "visoki", "Pogled sa terase", "Član pozira za stolom sa pogledom na zelene brežuljke"),
  foto("05", "portret", "Krug razgovora", "Ekipa sedi u krugu oko stočića i razgovara"),
  foto("01", "pejzaz", "Dugo u noć", "Veliko društvo opušteno na kaučima uveče"),
  snimak("v2", "Pergola", "Snimak ekipe ispod pergole sa pogledom"),
  foto("06", "pejzaz", "Noćni zagrljaj", "Dve drugarice se grle u mraku"),
  foto("07", "pejzaz", "Poslednji krug", "Četvoro prijatelja sedi na zidiću u dvorištu, kasno uveče"),
  foto("11", "pejzaz", "Muzika do kasno", "Članovi u naočarima za sunce uz laptop i slušalice noću"),
  foto("12", "pejzaz", "Tri prijateljice", "Tri drugarice zagrljene u kući"),
  snimak("v5", "Između igara", "Snimak ekipe ispod pergole i trave"),
  foto("14", "pejzaz", "U SEFA majicama", "Šestoro članova u crnim SEFA majicama i značkama, u parku"),
  foto("13", "visoki", "Čistimo zajedno", "Četiri člana sa ljubičastim vrećama za smeće tokom akcije čišćenja"),
  foto("15", "pejzaz", "Zalazak na klupi", "Ekipa na klupi u parku, u svetlosti zalaska sunca"),
  snimak("v6", "Oko vatre", "Snimak okupljanja oko vatre u šumi uveče"),
  foto("16", "portret", "Vatra i prijatelji", "Četiri prijatelja kraj ložišta u parku"),
  foto("17", "pejzaz", "Pauza za piknik", "Ekipa za piknik stolom u parku"),
];
