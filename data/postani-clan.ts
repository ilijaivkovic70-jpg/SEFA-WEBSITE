/**
 * Sav sadržaj stranice /postani-clan.
 * Ovde se menja tekst, linkovi i pitanja — komponente ne treba dirati.
 */

/* ---------- prijave i lista čekanja ---------- */

export const PRIJAVE = {
  /** Kad krenu prijave (oktobar), prebaci na true. */
  otvorene: false,
  /** Link ka Google formularu za prijavu (koristi se kad su prijave otvorene). */
  prijavaLink: "",
  /**
   * Link ka Google formularu za listu čekanja (samo polje za mejl).
   * Dok je prazno, dugme vodi na stranicu /kontakt.
   */
  listaCekanjaLink: "",
  /** Kada se prijave otvaraju, ispisuje se u rečenici „Prijave se otvaraju …”. */
  termin: "u oktobru",
};

/* ---------- sektori ---------- */

export type SektorId = "pr" | "dizajn" | "sponzorstva" | "ljudski-resursi";

export type Sektor = {
  id: SektorId;
  naziv: string;
  opis: string;
};

export const SEKTORI: Sektor[] = [
  {
    id: "pr",
    naziv: "PR",
    opis: "Promovišemo SEFA-u i njene projekte, vodimo društvene mreže i gradimo prepoznatljiv glas organizacije među studentima.",
  },
  {
    id: "dizajn",
    naziv: "Dizajn",
    opis: "Vizuelno oblikujemo sve projekte: objave, plakate, prezentacije i video materijale.",
  },
  {
    id: "sponzorstva",
    naziv: "Sponzorstva",
    opis: "Gradimo partnerstva sa kompanijama, i pretvaramo dobre ideje u podršku projektima SEFA-e.",
  },
  {
    id: "ljudski-resursi",
    naziv: "Ljudski resursi",
    opis: "Okupljamo, razvijamo i povezujemo članove kroz mentorstvo, edukacije i snažnu timsku atmosferu.",
  },
];

/* ---------- kviz ---------- */

/**
 * Svaki odgovor dodaje jedan poen sektoru (`sektor`) ili bira projekat
 * (`projekat`, slug iz data/projekti.ts). Pitanja i odgovori mogu
 * slobodno da se menjaju, dodaju ili brišu.
 */
export type Odgovor = {
  tekst: string;
  sektor?: SektorId;
  projekat?: string;
};

export type Pitanje = {
  pitanje: string;
  odgovori: Odgovor[];
};

export const KVIZ: Pitanje[] = [
  {
    pitanje: "Organizujemo događaj. Gde te najverovatnije nalazimo?",
    odgovori: [
      { tekst: "Sa telefonom u ruci: snimam, objavljujem, pišem opis.", sektor: "pr" },
      { tekst: "Pored plakata i postera, proveravam da li sve izgleda kako treba.", sektor: "dizajn" },
      { tekst: "Na pozivu sa partnerom, dogovaram ko donosi šta.", sektor: "sponzorstva" },
      { tekst: "Na ulazu, pazim da se svako oseća dobrodošlo.", sektor: "ljudski-resursi" },
    ],
  },
  {
    pitanje: "Društvo te najčešće zove kad treba…",
    odgovori: [
      { tekst: "smisliti opis ili ideju za objavu.", sektor: "pr" },
      { tekst: "napraviti plakat, prezentaciju ili montirati video.", sektor: "dizajn" },
      { tekst: "nešto „izdejstvovati” ili naći pravu osobu.", sektor: "sponzorstva" },
      { tekst: "saslušati, posavetovati i smiriti situaciju.", sektor: "ljudski-resursi" },
    ],
  },
  {
    pitanje: "Šta bi ove godine najradije savladao/la?",
    odgovori: [
      { tekst: "Kako se vode društvene mreže i pravi kampanja koju ljudi zaista prate.", sektor: "pr" },
      { tekst: "Kako se u Canvi, Illustratoru ili Premiere Pro-u pravi nešto što izgleda vrhunski.", sektor: "dizajn" },
      { tekst: "Kako se pregovara i zatvara dogovor sa kompanijom.", sektor: "sponzorstva" },
      { tekst: "Kako se vodi tim i kako se ljudi motivišu.", sektor: "ljudski-resursi" },
    ],
  },
  {
    pitanje: "Koja rečenica najviše zvuči kao ti?",
    odgovori: [
      { tekst: "„Hajde da ispričamo ovu priču svima.”", sektor: "pr" },
      { tekst: "„Može ovo da izgleda mnogo bolje.”", sektor: "dizajn" },
      { tekst: "„Sigurno postoji neko ko bi ovo podržao.”", sektor: "sponzorstva" },
      { tekst: "„Najbolji projekti nastaju od dobre ekipe.”", sektor: "ljudski-resursi" },
    ],
  },
  {
    pitanje: "Koja tema te najviše vuče?",
    odgovori: [
      { tekst: "Biznis, ekonomija i ljudi koji su uspeli.", projekat: "repsus" },
      { tekst: "Razgovori, mikrofon i dobre priče.", projekat: "sefa-talks" },
      { tekst: "Priroda i akcije na terenu.", projekat: "greenfield" },
      { tekst: "Mentalno zdravlje i podrška drugima.", projekat: "bez-straha" },
      { tekst: "Sport i sve što se dešava iza scene.", projekat: "sport-business-day" },
      { tekst: "Prvi kontakt sa kompanijama i karijera.", projekat: "link-to-the-future" },
      { tekst: "Pomaganje lokalnoj zajednici.", projekat: "prava-stvar" },
    ],
  },
];

/* ---------- koraci selekcije ---------- */

/**
 * Proces prijave, redom. Dok je niz prazan, sekcija se ne prikazuje.
 * Primer jednog koraka:
 *   { naslov: "Prijavni formular", opis: "Popuniš kratak formular…" },
 */
export const KORACI: { naslov: string; opis: string }[] = [];

/* ---------- česta pitanja ---------- */

/**
 * Dok je niz prazan, sekcija se ne prikazuje.
 * Primer:
 *   { pitanje: "Ko može da se prijavi?", odgovor: "…" },
 */
export const PITANJA: { pitanje: string; odgovor: string }[] = [];
