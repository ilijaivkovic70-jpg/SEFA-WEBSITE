export type Projekat = {
  slug: string;
  naziv: string;
  kratakOpis: string;
  slika?: string;
};

export const PROJEKTI: Projekat[] = [
  {
    slug: "prava-stvar",
    naziv: "Prava stvar",
    kratakOpis:
      "Humanitarni projekat kroz koji članovi SEFA-e pomažu lokalnoj zajednici i razvijaju osećaj društvene odgovornosti.",
  },
  {
    slug: "repsus",
    naziv: "REPSUS",
    kratakOpis:
      "Najveća konferencija posvećena temi socijalnog preduzetništva u regionu, sa gostima, panelima i radionicama.",
  },
  {
    slug: "ekof-u-pokretu",
    naziv: "EKOF u pokretu",
    kratakOpis:
      "Sportsko-zabavni projekat koji okuplja studente Ekonomskog fakulteta kroz aktivnosti van učionice.",
  },
  {
    slug: "sport-business-day",
    naziv: "Sport Business Day",
    kratakOpis:
      "Konferencija koja povezuje svet sporta i biznisa, sa stručnjacima iz sportske industrije kao govornicima.",
  },
  {
    slug: "bez-straha",
    naziv: "Bez straha",
    kratakOpis:
      "Projekat posvećen podizanju svesti o mentalnom zdravlju i podršci studentima u prevazilaženju izazova.",
  },
  {
    slug: "sefa-talks",
    naziv: "SEFA Talks",
    kratakOpis:
      "Podkast u kom gosti iz sveta biznisa i preduzetništva dele svoja iskustva i savete sa studentima.",
  },
];
