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
    video: {
      src: "/projekti/prava-stvar-promo.mp4",
      poster: "/projekti/prava-stvar-promo-poster.jpg",
    },
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
    video: {
      src: "/projekti/bez-straha-promo.mp4",
      poster: "/projekti/bez-straha-promo-poster.jpg",
    },
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
    slug: "greenfield",
    naziv: "Greenfield",
    slika: "/projekti/greenfield.png",
    video: {
      src: "/projekti/greenfield-promo.mp4",
      poster: "/projekti/greenfield-promo-poster.jpg",
    },
    kratakOpis:
      "Ekološki projekat pokrenut 2022. godine, kojim mladi uče o zaštiti životne sredine kroz akcije čišćenja, reciklažu i humanitarni rad.",
    opis: [
      "Greenfield je ekološki projekat studentske organizacije SEFA, pokrenut 2022. godine sa ciljem podizanja svesti mladih o značaju zaštite životne sredine, održivog razvoja i odgovornog odnosa prema prirodi. Kroz edukativne sadržaje, volonterske aktivnosti i konkretne ekološke inicijative, projekat podstiče studente da aktivno doprinesu očuvanju prirodnih resursa i stvaranju zdravijeg životnog okruženja.",
      "Projekat je započet panel-diskusijom pod nazivom „Što bi neko bio eko”, nakon čega je organizovana akcija čišćenja na Divčibarama. Tokom narednih godina aktivnosti su proširene na različite lokacije širom Srbije, uključujući Ovčar Banju, Suboticu i Avalu. Posebno se izdvaja akcija čišćenja Ovčar Banje, tokom koje je prikupljeno više od 100 džakova otpada, čime je ostvaren značajan doprinos očuvanju lokalnog prirodnog okruženja.",
      "Pored terenskih aktivnosti, Greenfield organizuje i akcije prikupljanja reciklažnog materijala na Ekonomskom fakultetu u Beogradu, povezujući ekološku odgovornost sa humanitarnim radom. U okviru izdanja iz 2024. godine realizovana je reciklažna akcija u saradnji sa organizacijom „Čepom do osmeha”, uz podršku kompanije Procter & Gamble (P&G), koja je učestvovala i u organizaciji ekoloških aktivnosti u Subotici. Prikupljena sredstva usmeravana su u humanitarne svrhe, čime je projekat dobio dodatnu društvenu vrednost.",
      "Tokom 2026. godine projekat je nastavio da razvija humanitarno-ekološke inicijative kroz prikupljanje ambalažnog otpada namenjenog udruženju „Naša kuća”, koje pruža podršku osobama sa smetnjama u razvoju. Na taj način Greenfield nastoji da poveže principe reciklaže, društvene solidarnosti i aktivnog učešća mladih u rešavanju problema zajednice.",
      "Kroz saradnju sa kompanijama, organizacijama i volonterima, Greenfield kontinuirano promoviše značaj ekološke svesti i pokazuje kako zajedničkim angažovanjem mogu nastati konkretne i dugoročne pozitivne promene. Projekat pruža studentima priliku da razvijaju organizacione i timske veštine, istovremeno ih podstičući da odgovornost prema životnoj sredini postane sastavni deo njihove svakodnevice.",
    ],
  },
  {
    slug: "sport-business-day",
    naziv: "Sport Business Day",
    slika: "/projekti/sport-business-day.svg",
    video: {
      src: "/projekti/sport-business-day-promo.mp4",
      poster: "/projekti/sport-business-day-promo-poster.jpg",
    },
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
    video: {
      src: "/projekti/link-to-the-future-promo.mp4",
      poster: "/projekti/link-to-the-future-promo-poster.jpg",
    },
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
