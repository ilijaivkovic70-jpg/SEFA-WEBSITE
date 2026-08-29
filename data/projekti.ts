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
};

export const PROJEKTI: Projekat[] = [
  {
    slug: "prava-stvar",
    naziv: "Prava stvar",
    kratakOpis:
      "Humanitarni projekat kroz koji članovi SEFA-e pomažu lokalnoj zajednici i razvijaju osećaj društvene odgovornosti.",
    opis: [
      "Humanitarni projekat zabavno-edukativnog karaktera, sa ciljem podizanja svesti o humanosti i prikupljanja sredstava za one kojima je najpotrebnije.",
    ],
    sekcije: [
      {
        naslov: "Gosti i saradnici projekta",
        stavke: [
          "Sergej Trifunović — „Zašto je teško biti human”",
          "Nenad Danilović (Neša Brđis) — stand up veče",
          "Vlado Georgiev — nastup u Amfiteatru 1 Ekonomskog fakulteta",
          "Dejan Savić — „Psihologija pobednika”",
        ],
      },
    ],
  },
  {
    slug: "repsus",
    naziv: "REPSUS",
    kratakOpis:
      "Najveća konferencija posvećena temi socijalnog preduzetništva u regionu, sa gostima, panelima i radionicama.",
    opis: [
      "REPSUS — Regionalni privredni susreti studenata. Simbol organizacije od samog osnivanja. Konferencija na koju učestvuju eminentne ličnosti iz sveta ekonomije, sa ciljem da studenti steknu znanje i prate aktuelne trendove u ekonomiji.",
    ],
    lokacije: [
      "Zlatibor (2016)",
      "Crowne Plaza (2017)",
      "Ekonomski fakultet (2018, 2019)",
    ],
    sekcije: [
      {
        naslov: "Izbor tema i govornika kroz godine",
        stavke: [
          "Rade Jokimović — dostupnosti i kako doći do fondova stranog kapitala",
          "Vladimir Nikolić (Limundo/Kupindo) — razvoj online trgovine u Srbiji",
          "Milenko Škorić (Sky Music Corporation) — Moj put do uspeha",
          "Zoran Petrović (Raiffeisen) — investiciono bankarstvo, upravljanje rizikom i kapitalom",
          "Telenor i Sberbanka — budućnost bankarskog sektora",
          "Hasan Hanić — inovacije u obrazovanju, preduzetništvo i privreda",
          "StartUp Srbija — Seeder, Evoke, Miracle Dojo",
          "Tomislav Momirović (Mona) — male tajne našeg uspeha",
          "Srđan Janićijević (Mokrogorska škola menadžmenta) — obrazovanjem do uspešne karijere",
          "Aleksandar Marušić (KEA) — karijera iz mitologije",
          "Kosara Dangić Melentijević (Kabinet Brewery) — put do najuspešnijeg startup-a",
          "Ovation BBDO — advertajzing, čemu učiti i kako radi",
        ],
      },
      {
        naslov: "Partneri konferencije kroz godine",
        stavke: [
          "2016: Eversa, Jaffa, Chips Way, Na Bis, Chr, Dunav osiguranje, Sky Music, EXIT",
          "2017: Tuborg, Neft, Jaffa, Logo, Koronijum, Suprema Lab, Rosa, Banca Intesa, Crowne Plaza",
          "2018: Ekonomski fakultet, Neftz, Jaffa, Espinbono",
          "2019: Ekonomski fakultet, Bel, Sibo, Frikom, Nectar, Booster, Heba, Muschmalow, GDi",
        ],
      },
    ],
  },
  {
    slug: "ekof-u-pokretu",
    naziv: "EKOF u pokretu",
    kratakOpis:
      "Sportsko-zabavni projekat koji okuplja studente Ekonomskog fakulteta kroz aktivnosti van učionice.",
    opis: [
      "Stručna ekskurzija pokrenuta 2016. godine — projekat upoznaje studente sa iskustvima u inostranstvu i master programima, uz upoznavanje novih kultura, gradova i kolega. Do sada realizovano 4 ekskurzije, sa preko 450 studenata.",
    ],
    sekcije: [
      {
        naslov: "Ekskurzije kroz godine",
        stavke: [
          "Milano vol. 1 (oktobar 2016) — poseta univerzitetu Bocconi i Trst; obišli i videli Veneciju, Monzu, Trst, jezero Komo",
          "Rim vol. 2 (oktobar 2017) — poseta univerzitetu Sapienza; obišli i Bolonju, Napulj, Firencu",
          "Istanbul vol. 3 (oktobar 2018) — poseta 160 studenata, najveća ekskurzija do sada",
          "Prag vol. 4 (oktobar 2019) — obišli i Beč (WU — Ekonomski fakultet) i Drezden",
        ],
      },
    ],
  },
  {
    slug: "sport-business-day",
    naziv: "Sport Business Day",
    kratakOpis:
      "Konferencija koja povezuje svet sporta i biznisa, sa stručnjacima iz sportske industrije kao govornicima.",
    opis: [
      "Konferencija pokrenuta 2018. godine, namenjena studentima čija su interesovanja vezana za sport. Prosečno okuplja 200 do 300 delegata.",
      "Cilj je edukacija o funkcionisanju klubova, sportskih udruženja i preduzeća koja organizuju sportske događaje, kroz teme menadžmenta, marketinga, inovacija, tehnologije i novinarstva u sportu. Projekat posebno promoviše mogućnost izgradnje karijere žena u sportskim organizacijama.",
      "Namenjen je studentima Ekonomskog fakulteta, kao i Pravnog fakulteta, FON-a, FPN-a, DIF-a i ETF-a.",
    ],
  },
  {
    slug: "bez-straha",
    naziv: "Bez straha",
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
          "Aleksandra „Saša” Simonić — diplomirani novinar / PR menadžer",
          "Teodora Milović — PR menadžer / influencer",
          "Sandra Bijelac — psihoterapeut",
          "Stella Karl Coci — executive & leadership coach",
        ],
      },
    ],
  },
  {
    slug: "sefa-talks",
    naziv: "SEFA Talks",
    kratakOpis:
      "Podkast u kom gosti iz sveta biznisa i preduzetništva dele svoja iskustva i savete sa studentima.",
    opis: [
      "Podkast studentske organizacije SEFA, pokrenut sa idejom da kroz razgovore sa preduzetnicima i ljudima iz sveta biznisa mladima približi preduzetništvo i omogući im da čuju iskustva i ispovesti ljudi koji su u tome uspeli.",
      "U podkastu gostuju ljudi koji imaju mnogo toga da nauče — preduzetnici, direktori i stručnjaci iz kompanija, ali i profesori Ekonomskog fakulteta, koji sa studentima dele svoja iskustva i savete za početak karijere. Autori sami biraju sagovornike i teme, na osnovu interesovanja i pregleda slušalaca.",
      "Podkast je dostupan na YouTube-u, Spotify-ju, Deezer-u i Amazon Music-u, kao i na povezanom Instagram nalogu (@sefatalks).",
    ],
    sekcije: [
      {
        naslov: "Dosadašnji gosti i teme (izbor)",
        stavke: [
          "Nikola Marković — CFO kompanije Gomex, alumnista Ekonomskog fakulteta, osnivač EKOF Case Study Cluba i programa EKOF Mentorship — o radu u „Big four” kompanijama i iskustvu mentorstva",
          "Anđelka Balrinović — šef odeljenja za planiranje i analizu prodaje, Delta Sport",
          "Aleksandar Gradić — bivši asistent na predmetima Osnovi ekonomije i Osnovi statističke analize",
          "Branislav Borić — bivši dekan i profesor Ekonomskog fakulteta — o ekonomskim, društvenim i političkim temama",
          "Nenad Atanacković — suvlasnik Thyme street food restorana",
          "Nikola Stamenić — direktor sektora za reviziju u kompaniji PwC",
        ],
      },
    ],
  },
];

export function getProjekatBySlug(slug: string) {
  return PROJEKTI.find((projekat) => projekat.slug === slug);
}
