export type ProjekatSekcija = {
  naslov: string;
  stavke: string[];
};

export type Projekat = {
  slug: string;
  naziv: string;
  kratakOpis: string;
  slika?: string;
  opis: string[];
  lokacije?: string[];
  sekcije?: ProjekatSekcija[];
  galerija?: string[];
  /** Promo video koji se na stranici projekta uvećava i sam pušta. */
  video?: { src: string; poster: string };
};

/**
 * Redosled u ovom nizu je i redosled prikaza na stranici /projekti.
 * Da bi se projekat pomerio gore ili dole, dovoljno je pomeriti njegov
 * objekat u nizu, nigde drugde se redosled ne zadaje.
 */
export const PROJEKTI: Projekat[] = [
  {
    slug: "repsus",
    naziv: "REPSUS",
    slika: "/repsus-logo.svg",
    kratakOpis:
      "Regionalni privredni susreti studenata: konferencija na kojoj studenti uče od istaknutih ljudi iz sveta ekonomije i biznisa.",
    opis: [
      "REPSUS, Regionalni privredni susreti studenata, simbol je SEFA-e od samog osnivanja. Na konferenciji učestvuju eminentne ličnosti iz sveta ekonomije, a cilj je da studenti steknu nova znanja i prate aktuelne trendove u privredi.",
    ],
    video: {
      src: "/projekti/repsus-promo.mp4",
      poster: "/projekti/repsus-promo-poster.jpg",
    },
  },
  {
    slug: "sefa-talks",
    naziv: "SEFA Talks",
    slika: "/projekti/sefa-talks.png",
    video: {
      src: "/projekti/sefa-talks-promo-v2.mp4",
      poster: "/projekti/sefa-talks-promo-v2-poster.jpg",
    },
    kratakOpis:

      "Podkast u kom gosti iz sveta biznisa i preduzetništva dele svoja iskustva i savete sa studentima.",
    opis: [
      "Podkast studentske organizacije SEFA, pokrenut sa idejom da kroz razgovore sa preduzetnicima i ljudima iz sveta biznisa mladima približi preduzetništvo i omogući im da čuju iskustva i ispovesti ljudi koji su u tome uspeli.",
      "U podkastu gostuju ljudi koji imaju mnogo toga da nauče: preduzetnici, direktori i stručnjaci iz kompanija, ali i profesori Ekonomskog fakulteta, koji sa studentima dele svoja iskustva i savete za početak karijere. Autori sami biraju sagovornike i teme, na osnovu interesovanja i pregleda slušalaca.",
      "Podkast je dostupan na YouTube-u, Spotify-ju, Deezer-u i Amazon Music-u, kao i na povezanom Instagram nalogu (@sefatalks).",
    ],
  },
  {
    slug: "prava-stvar",
    naziv: "Prava stvar",
    slika: "/projekti/prava-stvar.png",
    kratakOpis:

      "Humanitarni projekat kroz koji članovi SEFA-e pomažu lokalnoj zajednici i razvijaju osećaj društvene odgovornosti.",
    opis: [
      "Humanitarni projekat zabavno-edukativnog karaktera, sa ciljem podizanja svesti o humanosti i prikupljanja sredstava za one kojima je najpotrebnije.",
    ],
    sekcije: [
      {
        naslov: "Gosti i saradnici projekta",
        stavke: [
          "Sergej Trifunović: „Zašto je teško biti human”",
          "Nenad Danilović (Neša Brđis): stand up veče",
          "Vlado Georgiev: nastup u Amfiteatru 1 Ekonomskog fakulteta",
          "Dejan Savić: „Psihologija pobednika”",
        ],
      },
    ],
  },
  {
    slug: "bez-straha",
    naziv: "Bez straha",
    slika: "/projekti/bez-straha.png",
    kratakOpis:

      "Projekat posvećen podizanju svesti o mentalnom zdravlju i podršci studentima u prevazilaženju izazova.",
    opis: [
      "Panel diskusija posvećena temi anksioznosti i mentalnog zdravlja, sa ciljem normalizovanja stresa, izgradnje samopouzdanja, izlaska iz zone komfora i postavljanja prioriteta.",
      "Prva diskusija održana je maja 2019. u Profesorskoj sali Ekonomskog fakulteta.",
    ],
    sekcije: [
      {
        naslov: "Teme za diskusiju",
        stavke: [
          "Šta je to što osećamo i kakav je to strah?",
          "Kako se izboriti sa anksioznošću i različitim trenucima?",
          "Da li je razgovor o anksioznosti nešto o čemu otvoreno pričamo?",
        ],
      },
      {
        naslov: "Učesnici",
        stavke: [
          "Aleksandra „Saša” Simonić: diplomirani novinar / PR menadžer",
          "Teodora Milović: PR menadžer / influencer",
          "Sandra Bijelac: psihoterapeut",
          "Stella Karl Coci: executive & leadership coach",
        ],
      },
    ],
  },
  {
    // TODO(SEFA): dopuniti pravim sadržajem, tekst ispod je privremen,
    // napisan samo da bi projekat imao svoje mesto u indeksu i svoju stranicu.
    slug: "greenfield",
    naziv: "Greenfield",
    slika: "/projekti/greenfield.png",
    kratakOpis:

      "Projekat posvećen ulaganjima i održivom razvoju, kroz koji studenti prate put od ideje do poslovnog poduhvata.",
    opis: [
      "Projekat posvećen investicijama i održivom razvoju, od prve ideje do poslovnog poduhvata koji stoji na svojim nogama. Kroz predavanja i rad na konkretnim primerima studenti se upoznaju sa načinom na koji se ulaganja planiraju, procenjuju i sprovode.",
    ],
  },
  {
    slug: "sport-business-day",
    naziv: "Sport Business Day",
    slika: "/projekti/sport-business-day.svg",
    kratakOpis:

      "Konferencija koja povezuje svet sporta i biznisa, sa stručnjacima iz sportske industrije kao govornicima.",
    opis: [
      "Konferencija pokrenuta 2018. godine, namenjena studentima čija su interesovanja vezana za sport. Prosečno okuplja 200 do 300 delegata.",
      "Cilj je edukacija o funkcionisanju klubova, sportskih udruženja i preduzeća koja organizuju sportske događaje, kroz teme menadžmenta, marketinga, inovacija, tehnologije i novinarstva u sportu. Projekat posebno promoviše mogućnost izgradnje karijere žena u sportskim organizacijama.",
      "Namenjen je studentima Ekonomskog fakulteta, kao i Pravnog fakulteta, FON-a, FPN-a, DIF-a i ETF-a.",
    ],
  },
  {
    // TODO(SEFA): dopuniti pravim sadržajem, tekst ispod je privremen,
    // napisan samo da bi projekat imao svoje mesto u indeksu i svoju stranicu.
    slug: "link-to-the-future",
    naziv: "Link to the Future",
    slika: "/projekti/link-to-the-future.png",
    kratakOpis:

      "Projekat koji povezuje studente sa kompanijama i ljudima iz struke, od prvog kontakta do prve prilike.",
    opis: [
      "Projekat okrenut karijernom razvoju studenata Ekonomskog fakulteta. Kroz susrete sa kompanijama, ljudima iz struke i alumnistima SEFA-e, studenti dobijaju uvid u to kako izgleda posao koji ih čeka i kako do njega doći.",
    ],
  },
];

export function getProjekatBySlug(slug: string) {
  return PROJEKTI.find((projekat) => projekat.slug === slug);
}
