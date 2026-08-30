/**
 * Istorija SEFA-e — sadržaj sekcije „Naš put” (components/history-road.tsx).
 *
 * OVDE se menja ceo tekst i fotografije. Komponenta se ne dira: dodavanje,
 * brisanje i menjanje redosleda stanica radi automatski — put, dužina sekcije,
 * markeri i indikator napretka se preračunavaju iz ovog niza.
 *
 * Ne mora svaka godina od 2015. da bude ovde. Prikazujemo samo godine koje
 * imaju zanimljivu priču; preporučeno je 5–7 stanica.
 *
 * Kako se dodaje fotografija:
 *   1. stavi sliku u `public/istorija/` (npr. `public/istorija/2015.jpg`),
 *   2. upiši `image: "/istorija/2015.jpg"`,
 *   3. popuni `imageAlt` (opis za čitače ekrana — obavezno),
 *   4. `isPlaceholder: false`.
 * Dok je `image: null`, sekcija sama prikazuje neutralan okvir sa natpisom
 * „Fotografija iz <godina>.” — nema slomljene slike.
 *
 * Pravilo za tekst: najviše dve kratke rečenice po stanici.
 */

export type HistoryMilestone = {
  /** Veliki tipografski element, npr. „2015”. Može i „DANAS”. */
  year: string;
  /** Mala oznaka iznad godine, npr. „PRVA STANICA”. */
  eyebrow: string;
  /** Kratak naslov stanice. */
  title: string;
  /** Najviše dve kratke rečenice. */
  description: string;
  /** Putanja do fotografije u `public/`, ili `null` dok slike nema. */
  image: string | null;
  /** Opis fotografije za čitače ekrana. Obavezno kad postoji `image`. */
  imageAlt: string;
  /** Diskretan potpis ispod fotografije, npr. „Arhiva / 2015”. */
  imageCaption: string;
  /** Na kojoj strani puta stoji tekst. Fotografija ide na suprotnu. */
  alignment: "left" | "right";
  /** `true` dok sadržaj nije zamenjen pravim istorijskim podacima. */
  isPlaceholder: boolean;
};

export const historyMilestones: HistoryMilestone[] = [
  {
    // Jedina stanica sa (delimično) pravim podacima. Tekst je privremen i
    // treba ga zameniti pravom pričom o osnivanju.
    year: "2015",
    eyebrow: "Prva stanica",
    title: "Ovde je sve počelo.",
    description:
      "Godine 2015. počela je priča o studentskoj organizaciji koja će tokom narednih godina povezivati ljude, ideje i projekte.",
    image: null,
    imageAlt: "Fotografija iz 2015. godine, iz arhive SEFA-e.",
    imageCaption: "Arhiva / 2015",
    alignment: "left",
    isPlaceholder: true,
  },

  /* ----------------------------------------------------------------
     PRIVREMENE STANICE — sve ispod su placeholderi.
     Zameni `year`, `title`, `description` i `image` pravim podacima,
     pa `isPlaceholder` prebaci na `false`.
     ---------------------------------------------------------------- */

  {
    year: "20XX",
    eyebrow: "Druga stanica",
    title: "Sledeća prekretnica.",
    description:
      "Ovde ide kratak opis događaja koji je promenio način na koji organizacija radi.",
    image: null,
    imageAlt: "Fotografija sa druge stanice na putu SEFA-e.",
    imageCaption: "Arhiva / 20XX",
    alignment: "right",
    isPlaceholder: true,
  },
  {
    year: "20XX",
    eyebrow: "Treća stanica",
    title: "Novo poglavlje.",
    description:
      "Ovde ide kratak opis trenutka kada je organizacija zakoračila u nešto novo.",
    image: null,
    imageAlt: "Fotografija sa treće stanice na putu SEFA-e.",
    imageCaption: "Arhiva / 20XX",
    alignment: "left",
    isPlaceholder: true,
  },
  {
    year: "20XX",
    eyebrow: "Četvrta stanica",
    title: "Trenutak koji pamtimo.",
    description:
      "Ovde ide kratak opis dana koji je generacijama ostao u sećanju.",
    image: null,
    imageAlt: "Fotografija sa četvrte stanice na putu SEFA-e.",
    imageCaption: "Arhiva / 20XX",
    alignment: "right",
    isPlaceholder: true,
  },
  {
    year: "20XX",
    eyebrow: "Peta stanica",
    title: "Još jedna važna stanica.",
    description:
      "Ovde ide kratak opis projekta ili odluke koja je obeležila taj period.",
    image: null,
    imageAlt: "Fotografija sa pete stanice na putu SEFA-e.",
    imageCaption: "Arhiva / 20XX",
    alignment: "left",
    isPlaceholder: true,
  },
];
