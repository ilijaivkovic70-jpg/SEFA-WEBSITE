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
      "„REPSUS – Regionalni privredni susreti studenata” jedan je od najznačajnijih projekata Studentske organizacije SEFA, koji ima za cilj povezivanje studenata iz regiona sa poslovnim svetom i pružanje prilike za praktičnu primenu znanja stečenih tokom studija. Projekat se održava jednom godišnje i okuplja studente iz Beograda, Zagreba, Banje Luke i Podgorice, podstičući regionalnu saradnju, razmenu iskustava i profesionalni razvoj mladih. Kroz kombinaciju edukativnih sadržaja i takmičarskih aktivnosti, REPSUS predstavlja značajnu sponu između akademskog obrazovanja i savremenog poslovnog okruženja.",
      "Centralni deo projekta predstavlja regionalno takmičenje u rešavanju studije slučaja (Case Study), tokom kojeg studenti imaju priliku da se suoče sa realnim poslovnim izazovima i razviju inovativna rešenja za probleme iz prakse. Poseban značaj ima saradnja sa vodećim kompanijama koje učesnicima pružaju uvid u način funkcionisanja savremenog poslovanja. Na REPSUS-u 2026. godine, studiju slučaja zadala je kompanija L'Oréal, jedan od globalnih lidera u industriji lepote. Takmičenje je okupilo više od 50 prijavljenih timova, dok je pet najboljih dobilo priliku da svoja rešenja predstavi pred stručnim žirijem kompanije. Ovakav koncept podstiče razvoj analitičkog razmišljanja, kreativnosti, timskog rada i prezentacionih veština.",
      "Pored takmičarskog dela, značajan segment projekta predstavlja konferencija koja okuplja stručnjake iz oblasti marketinga, preduzetništva, finansija, menadžmenta i revizije. Kroz predavanja i panel-diskusije, studenti imaju priliku da se upoznaju sa aktuelnim poslovnim trendovima i steknu dragocene uvide u profesionalna iskustva uspešnih pojedinaca. Konferencija održana 2026. godine pod nazivom „Inicijativa gradi tvoju karijeru” obuhvatila je šest predavanja posvećenih razvoju poslovnih ideja, liderstvu, inovacijama i savremenim izazovima poslovanja.",
      "Među predavačima na konferenciji 2026. godine bili su Sava Pavlović, jedan od osnivača startapa FARMIT, koji je govorio o razvoju preduzetničke ideje i njenom pretvaranju u održiv poslovni model. Srđan Janićijević, osnivač Mokrogorske škole menadžmenta, koji je kroz predavanje „Sezam se otvorio: Pet potreba biznisa” približio ključne principe uspešnog poslovanja. Svoje iskustvo sa učesnicima podelio je i Dušan Vranić, alumnista organizacije SEFA i Senior Brand Manager kompanije HEINEKEN Srbija, naglašavajući značaj inicijative, odgovornosti i proaktivnog pristupa profesionalnom razvoju.",
      "Program konferencije dodatno su upotpunili Biljana Bogovac, rukovodeća partnerka kompanije PwC, kroz razgovor o reviziji, konsaltingu i ulozi žena u poslovnom svetu. Miroslav Maslovarić osnivač Community Media koji je govorio o primeni veštačke inteligencije u marketingu i značaju očuvanja ljudske autentičnosti u procesu digitalne transformacije. Na kraju je usledilo predavanje Ines Oštrić pod nazivom „Business Beyond Business”, koje je kroz primer kompanije L'Oréal istaklo značaj društveno odgovornog poslovanja i povezivanja ekonomskih ciljeva sa širim društvenim vrednostima.",
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
      "„Sefa Talks” – prvi studentski podkast na Univerzitetu koji daje priliku svima da čuju iskustva uspešnih preduzetnika, investitora i naših alumnista. Kroz razgovor sa našim voditeljima, gledaoci imaju priliku da sa bilo koje lokacije i u bilo kom trenutku slušaju teme koje ih zanimaju iz sveta ekonomije.",
      "Epizode koje su obeležile prošlu godinu bile su sa profesorom matematike na našem fakultetu – Branislavom Boričićem, zatim epizoda sa Goranom Tintorom koji je stručnjak za marketing, strategiju i ponašanje potrošača. Takođe, sa Nemanjom Antićem – preduzetnik, investitor i broker. Pored njih našle su se i epizode sa našim alumnistima Emilijom Vasović, Ivanom Rajkovićem, Veljkom Vukovićem, Dušanom Vranićem i Aleksom Vukićevićem.",
      "„Sefa Talks” omogućava studentima da prošire svoja znanja, upoznaju se sa različitim profesionalnim iskustvima i čuju korisne savete od ljudi koji su uspešni u svojim oblastima. Cilj podkasta je da ekonomske teme približi studentima na zanimljiv i pristupačan način.",
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
      "„Prava stvar” je humanitarni projekat Studentske organizacije SEFA koji ima za cilj podsticanje društvene odgovornosti, solidarnosti i humanosti među mladima. Kroz organizaciju različitih humanitarnih događaja i dobrotvornih aktivnosti, projekat okuplja studente oko zajedničkog cilja – pružanja podrške pojedincima i zajednicama kojima je pomoć najpotrebnija. Njegova osnovna ideja jeste da pokaže kako zajedništvo, empatija i lična inicijativa mogu doprineti stvaranju pozitivnih promena u društvu.",
      "Program projekta obuhvata humanitarne sportske turnire, pub kvizove, koncerte i različite akcije prikupljanja sredstava. Kroz spoj zabave, druženja i humanitarnog angažovanja, učesnicima se pruža prilika da aktivno doprinesu ostvarivanju plemenitih ciljeva. Na ovaj način, projekat podstiče mlade da prepoznaju značaj društvene odgovornosti i uključe se u inicijative koje imaju pozitivan uticaj na širu zajednicu.",
      "Poseban značaj u okviru projekta imaju humanitarni pub kvizovi, koji predstavljaju spoj znanja, timskog duha i humanosti. Kroz takmičenje u različitim oblastima, učesnici imaju priliku da provere svoje znanje, druže se i istovremeno doprinesu prikupljanju sredstava u humanitarne svrhe. Ovakvi događaji okupljaju studente različitih interesovanja i pokazuju kako se zajedničkim angažovanjem i pozitivnom energijom može pružiti konkretna podrška onima kojima je ona najpotrebnija.",
      "Pored pub kvizova, značajno mesto u okviru projekta zauzimaju humanitarni sportski turniri, koncerti i druge društvene aktivnosti. Kroz sportska nadmetanja promovišu se fer-plej, timski rad i solidarnost, dok koncerti i kreativni događaji pružaju dodatne mogućnosti za okupljanje mladih oko zajedničkog humanitarnog cilja. Raznovrsnost aktivnosti omogućava uključivanje što većeg broja učesnika i doprinosi širenju svesti o značaju humanitarnog delovanja.",
      "Važan segment projekta predstavlja i podizanje svesti o izazovima sa kojima se suočavaju pojedinci i društveno ugrožene grupe. Kroz humanitarne inicijative, saradnju sa organizacijama i uključivanje društveno odgovornih partnera, „Prava stvar” nastoji da doprinese pružanju konkretne pomoći i istovremeno ukaže na važnost dugoročne solidarnosti. Posebna pažnja posvećuje se razvijanju empatije, međusobnog razumevanja i spremnosti mladih da svojim delovanjem doprinesu dobrobiti zajednice.",
      "„Prava stvar” predstavlja više od humanitarnog projekta – ona je prilika da studenti svojim angažovanjem, kreativnošću i posvećenošću pokažu da i male inicijative mogu dovesti do značajnih promena. Negovanjem kulture solidarnosti, zajedništva i dobročinstva, projekat inspiriše mlade da prepoznaju potrebe drugih i aktivno doprinesu stvaranju humanijeg i odgovornijeg društva. Kroz svaku realizovanu aktivnost, SEFA nastoji da pokaže da je upravo spremnost da pomognemo drugima ono što čini pravu stvar.",
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
      "„Bez straha” je projekat posvećen podizanju svesti o značaju mentalnog zdravlja, sa posebnim fokusom na izazove sa kojima se studenti svakodnevno suočavaju jer studentski život ne podrazumeva samo pohađanje predavanja i polaganje ispita.",
      "U cilju nam je da stvorimo okruženje u kojem studenti mogu slobodno da govore o svim poteškoćama sa kojima se suočavaju i razbijemo predrasude koje i dalje postoje kada je reč o mentalnom zdravlju. Kroz gostujuća predavanja, panel diskusije i radionice sa psiholozima, želimo da približimo načine za lakše suočavanje sa svakodnevnim izazovima i pokažemo studentima da nisu sami, jer mentalno zdravlje ne treba da bude tabu tema, već tema o kojoj se otvoreno razgovara.",
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
      "„Sport Business Day” je namenjen studentima koji su zainteresovani da se upoznaju sa biznisom u sportu kao i kako mogu započeti karijeru u ovoj oblasti.",
      "Tokom konferencije obrađuju se teme iz sveta sportskog biznisa, poput menadžmenta u sportu, marketinga, sponzorstava, finansiranja sportskih klubova i izgradnje uspešnih sportskih brendova.",
      "Posebnu vrednost događaju daje učešće istaknutih ličnosti iz sveta sporta, među kojima su treneri, sportski menadžeri i rukovodioci uspešnih sportskih organizacija. Svojim znanjem i profesionalnim iskustvom, oni studentima približavaju realne izazove, mogućnosti i perspektive razvoja u ovoj oblasti.",
      "Na poslednjoj konferenciji, prošle godine u decembru, gosti su bili Marko Pešić, jedan od poznatih evropskih menadžera, zatim bivši selektor reprezentacije Srbije Svetislav Pešić i Marko Vukomanović, direktor marketinga košarkaškog kluba Partizan.",
      "„Sport Business Day” predstavlja značajnu priliku za studente da prošire svoja znanja, steknu praktične uvide i povežu se sa ljudima koji imaju uspešnu karijeru u ovoj industriji. Takođe, doprinosi razvoju interesovanja za sportski biznis i podstiče studente da prepoznaju nove mogućnosti za svoj profesionalni razvoj.",
    ],
  },
  {
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
      "„Link to the Future” je projekat Studentske organizacije SEFA koji ima za cilj povezivanje ekonomije, savremenih tehnologija i inovacija. Kroz različite edukativne aktivnosti, projekat pruža studentima priliku da se upoznaju sa aktuelnim trendovima u digitalnoj ekonomiji, steknu nova znanja i razviju veštine neophodne za razumevanje savremenog poslovnog okruženja.",
      "Program projekta obuhvata predavanja, panel-diskusije, interaktivne radionice i susrete sa stručnjacima iz oblasti finansija, tehnologije i preduzetništva. Posebna pažnja posvećena je temama kao što su primena veštačke inteligencije u poslovanju, digitalna transformacija, investiranje, kriptovalute i blokčejn tehnologija. Na ovaj način, studentima se omogućava da sagledaju uticaj tehnološkog razvoja na ekonomske procese i budućnost poslovanja.",
      "Jedan od značajnih segmenata projekta predstavlja oblast investiranja i finansijskih tržišta. U okviru edukativne radionice, studenti su imali priliku da kroz predavanja dr Miloša Božovića i Vladimira Đukanovića steknu uvid u savremene investicione strategije, upravljanje portfoliom i uticaj veštačke inteligencije na finansijski sektor. Poseban akcenat stavljen je na praktičnu primenu stečenih znanja kroz simulaciju berzanskog trgovanja na platformi Investopedia, koja je učesnicima omogućila da se upoznaju sa procesom donošenja investicionih odluka u uslovima tržišne dinamike.",
      "Važan deo projekta čini konferencija „Jedna tema – tri perspektive”, posvećena razmeni znanja i iskustava između studenata i stručnjaka iz različitih oblasti poslovanja i tehnologije. Među gostujućim predavačima bili su Davor Sakač iz TS Ventures Fund, Luka Trikić iz kompanije Connect The Dots i Danilo Prodanović iz kompanije Microsoft. Kroz različite profesionalne perspektive, učesnicima su približili značaj inovacija, savremenih tehnoloških rešenja i preduzetničkog načina razmišljanja u dinamičnom poslovnom okruženju.",
      "U okviru projekta organizovana je i poseta Beogradskoj berzi, tokom koje su učesnici imali priliku da se neposredno upoznaju sa funkcionisanjem domaćeg tržišta kapitala. Kroz razgovor sa direktorom Lazom Ostojićem i predavanje profesora dr Dejana Erića, studenti su stekli dodatna saznanja o berzanskom poslovanju, finansijskom sistemu i značaju tržišta kapitala za privredni razvoj. Ova poseta predstavljala je priliku za povezivanje akademskog znanja sa praktičnim aspektima funkcionisanja finansijskih institucija.",
      "„Link to the Future” teži da stvori prostor za razmenu znanja, ideja i iskustava između studenata i uspešnih profesionalaca. Podsticanjem inovativnog razmišljanja, usvajanjem savremenih znanja i povezivanjem akademskog obrazovanja sa poslovnom praksom, projekat doprinosi pripremi mladih za izazove digitalne ekonomije i aktivno učešće u oblikovanju budućnosti poslovanja.",
    ],
  },
];

export function getProjekatBySlug(slug: string) {
  return PROJEKTI.find((projekat) => projekat.slug === slug);
}
