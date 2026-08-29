# Plan implementacije: SEFA sajt

**Stack:** Next.js (React) + Tailwind CSS + shadcn/ui, bez baze podataka, hosting na Vercel.

---

## Faza 0: Postavka

### 0.1 Kreiranje projekta

**Opis:** Pravimo prazan Next.js projekat koji će biti temelj za sve ostalo.

**Zadaci:**
- Instalirati Node.js na računar (ako već nije instaliran).
- Pokrenuti `npx create-next-app@latest sefa-sajt` sa opcijama: TypeScript da, Tailwind CSS da, App Router da.
- Otvoriti projekat u editoru (preporuka: VS Code) i pokrenuti ga lokalno komandom `npm run dev`.
- Napraviti GitHub repozitorijum i povezati ga sa projektom (`git init`, `git remote add origin ...`, prvi `git push`).

**Rezultat:** Prazan Next.js sajt se otvara na `localhost:3000` i kod je sačuvan na GitHub-u.

**Napomena:** Početnici često zaborave da naprave `.gitignore` fajl pa slučajno okače na GitHub fajlove koji im ne trebaju (npr. `node_modules`). Next.js ga automatski pravi pri kreiranju projekta, samo proveri da li postoji pre prvog push-a.

---

### 0.2 Podešavanje shadcn/ui komponenti

**Opis:** Ubacujemo biblioteku gotovih komponenti koje ćemo koristiti kroz ceo sajt (dugmad, kartice, meni).

**Zadaci:**
- Pokrenuti `npx shadcn@latest init` i proći kroz podešavanja (boje, stil).
- Dodati prve komponente koje sigurno trebaju: `button`, `card`, `navigation-menu`.
- Proveriti da li se komponenta ispravno prikazuje na test stranici.

**Rezultat:** Projekat ima podešen shadcn/ui i barem jednu komponentu koja radi na strani.

**Napomena:** shadcn/ui ne instalira sve komponente odjednom, već svaku posebno kad ti zatreba. Ne brini ako u početku vidiš samo par fajlova u `components/ui` folderu, to je normalno.

---

### 0.3 Osnovna struktura sajta (layout, meni, footer)

**Opis:** Pravimo "okvir" sajta koji se ponavlja na svakoj stranici: gornji meni za navigaciju i footer sa kontakt podacima.

**Zadaci:**
- U `app/layout.tsx` dodati zajednički header i footer koji se prikazuju na svim stranicama.
- Napraviti fajl `components/header.tsx` sa logom i linkovima ka glavnim sekcijama (Početna, O nama, Projekti, Alumni, Postani član, Kontakt).
- Napraviti fajl `components/footer.tsx` sa osnovnim podacima i linkovima ka društvenim mrežama.
- Podesiti da se meni na mobilnom telefonu pretvara u "hamburger" meni (shadcn `sheet` komponenta).

**Rezultat:** Svaka stranica ima isti meni na vrhu i footer na dnu, uključujući mobilni prikaz.

**Napomena:** Lako je zaboraviti da testiraš mobilni prikaz dok radiš na velikom monitoru. Redovno smanjuj prozor pregledača ili koristi alat za proveru mobilnog prikaza (u pregledaču, taster F12, pa ikonica telefona/tableta).

---

### 0.4 Ubacivanje loga i dizajn sistema

**Opis:** Postavljamo vizuelni identitet: boje, font i logo koji će se koristiti kroz ceo sajt.

**Zadaci:**
- Sačuvati logo (PNG ili SVG verziju) u folder `public/logo.png`.
- U `tailwind.config.ts` definisati SEFA boje (zelena iz loga kao primarna boja).
- Izabrati font (preporuka: neki čitljiv, moderan font sa Google Fonts, npr. Inter) i podesiti ga u `app/layout.tsx`.
- Ubaciti logo u header komponentu.

**Rezultat:** Sajt ima prepoznatljivu boju, font i logo vidljiv u meniju, umesto podrazumevanog Next.js izgleda.

**Napomena:** Logo koji je poslat ima belu kapu koja se ne vidi dobro na beloj pozadini. Vredi zatražiti verziju loga sa providnom ili tamnijom pozadinom za slučajeve kad se stavlja preko svetle sekcije.

---

### 0.5 Prvi deploy (praznog sajta)

**Opis:** Postavljamo sajt na internet što je pre moguće, čak i prazan, da bismo od početka radili u realnim uslovima.

**Zadaci:**
- Napraviti nalog na Vercel-u i povezati ga sa GitHub nalogom.
- Uvesti (import) GitHub repozitorijum u Vercel.
- Sačekati da se sajt automatski postavi i proveriti dobijeni `.vercel.app` link.

**Rezultat:** Sajt je dostupan na internetu (privremeni link) i svaki novi `git push` automatski ažurira sajt.

**Napomena:** Ne treba još kupovati domen. Prvo se navikni na radni tok (napraviš izmenu, push-uješ, sajt se sam ažurira), pa tek na kraju povežemo pravi domen (korak 2.6).

---

## Faza 1: MVP (srž sajta)

### 1.1 Početna stranica

**Opis:** Pravimo prvu stranicu koju posetilac vidi, sa animiranim uvodom, motom organizacije i kratkim pregledom.

**Zadaci:**
- U `app/page.tsx` napraviti uvodnu sekciju gde se naziv „SEFA” sastavlja slovo po slovo dok korisnik skroluje, a zatim se pojavljuje moto „Prave stvari na pravi način”.
- Dodati sekciju sa fotografijom tima ili prostorija fakulteta i kratkim uvodnim tekstom.
- Dodati istaknute brojke (preko 70 aktivnih članova, alumni klub preko 50 članova, broj projekata) u stilu velikih brojeva sa opisom ispod.
- Dodati tri do četiri kartice koje sažeto predstavljaju glavne sektore ili projekte.
- Dodati dugme koje vodi ka stranici Projekti.

**Rezultat:** Početna stranica ima logo, animirani uvod, moto, pregled sektora, brojke i dugme ka projektima, i lepo izgleda na telefonu i računaru.

**Napomena:** Animacija slovo po slovo se najlakše pravi praćenjem pozicije skrola (`scroll` event ili `IntersectionObserver`) i menjanjem CSS promenljivih (`--y`, `--opacity`) za svako slovo posebno. Ovo je nešto kompleksnije od običnog Tailwind hover efekta, pa je u redu da ovaj korak potraje duže od ostalih. Obavezno testirati sa `prefers-reduced-motion` kako sajt ne bi bio neprijatan korisnicima koji su isključili animacije, i proveriti da animacija ne usporava sajt na slabijim telefonima.

---

### 1.2 Stranica O nama

**Opis:** Detaljnija stranica o misiji, strukturi i brojkama organizacije.

**Zadaci:**
- Napraviti fajl `app/o-nama/page.tsx`.
- Preneti tekst o misiji i motu organizacije.
- Prikazati četiri sektora (komunikacije, sponzorstva i prodaje, upravljanja projektima, ljudskih resursa) kao kartice (shadcn `card` komponenta).
- Dodati sekciju "Briga o članovima" (mentorstvo, edukacije, druženja).
- Dodati sekciju sa brojkama (aktivni članovi, alumni klub).

**Rezultat:** Stranica O nama sadrži kompletan tekst iz dokumenta, lepo raspoređen u sekcije i kartice.

**Napomena:** Nema.

---

### 1.3 Pregled projekata

**Opis:** Stranica sa listom svih projekata organizacije, svaki kao kartica koja vodi ka detaljnoj stranici.

**Zadaci:**
- Napraviti fajl `app/projekti/page.tsx`.
- Napraviti fajl `data/projekti.ts` u kome se čuvaju podaci o svakom projektu (naziv, kratak opis, slika, jedinstveni "slug" za URL).
- Prikazati sve projekte kao kartice u mreži (grid): Prava stvar, REPSUS, EKOF u pokretu, Sport Business Day, Bez straha, SEFA Talks.

**Rezultat:** Stranica Projekti prikazuje sve projekte sa kratkim opisom i slikom, i svaka kartica je klikabilna.

**Napomena:** Držanje podataka u posebnom fajlu (`data/projekti.ts`) umesto direktno u stranici je važno jer ćeš kasnije lako dodati novi projekat na jednom mestu, bez diranja koda stranice.

---

### 1.4 Detaljna stranica projekta

**Opis:** Svaki projekat dobija svoju posebnu stranicu sa punim tekstom, gostima i detaljima.

**Zadaci:**
- Napraviti dinamičku rutu `app/projekti/[slug]/page.tsx`.
- Povući podatke iz `data/projekti.ts` na osnovu `slug` vrednosti iz URL-a.
- Preneti kompletan tekst za svaki projekat (gosti, lokacije, partneri, teme) iz dokumenta.
- Dodati dugme "Nazad na projekte".

**Rezultat:** Svaki projekat ima svoj URL (npr. `/projekti/repsus`) sa punim tekstom, i sve informacije iz dokumenta su prenete.

**Napomena:** Ovo je najviše teksta za kucanje u celom projektu (posebno REPSUS ima puno govornika i partnera po godinama). Ne mora sve odjednom, može projekat po projekat.

---

### 1.5 Kontakt stranica

**Opis:** Stranica sa svim informacijama za kontakt i linkovima ka društvenim mrežama.

**Zadaci:**
- Napraviti fajl `app/kontakt/page.tsx`.
- Dodati adresu, linkove ka Facebook, Instagram, X, LinkedIn, YouTube nalozima (obični linkovi, otvaraju se u novom tabu).
- Dodati posebno istaknut link ka Instagram nalogu SEFA Talks podkasta.
- Ostaviti prazno mesto (placeholder) za email i broj telefona, dok ne dobiješ te podatke od organizacije.

**Rezultat:** Kontakt stranica prikazuje sve trenutno dostupne podatke i lako se dopunjuje kad stignu email i telefon.

**Napomena:** Pre lansiranja sajta obavezno proveri da li je adresa (Kamenička 6) i dalje tačna, u dokumentu piše da to treba proveriti.

---

### 1.6 Provera prikaza na mobilnom telefonu

**Opis:** Prolazimo kroz sve dosad napravljene stranice i proveravamo da li lepo izgledaju na malom ekranu.

**Zadaci:**
- Otvoriti svaku stranicu na simulatoru mobilnog telefona u pregledaču (F12, pa ikonica telefona).
- Ispraviti sekcije koje se "lome" ili preklapaju (obično se rešava dodavanjem `flex-col` ili `grid-cols-1` klasa za mali ekran u Tailwind-u).
- Proveriti da li je tekst čitljiv i dugmad dovoljno velika za prst.

**Rezultat:** Sve stranice izgledaju uredno i na telefonu, ne samo na računaru.

**Napomena:** Nema.

---

### 1.7 Osnovni SEO i favicon

**Opis:** Podešavamo da sajt lepo izgleda kad se nađe na Google-u ili podeli link na društvenim mrežama.

**Zadaci:**
- U `app/layout.tsx` podesiti `metadata` objekat sa nazivom sajta i kratkim opisom organizacije.
- Dodati `favicon.ico` (mala ikonica u tabu pregledača) na osnovu loga.
- Dodati sliku koja se prikazuje kad se link podeli na Facebook/Instagram (Open Graph slika), može biti logo na jednobojnoj pozadini.

**Rezultat:** Naslov taba u pregledaču, ikonica i opis sajta su podešeni umesto podrazumevanih Next.js vrednosti.

**Napomena:** Nema.

---

### 1.8 Deploy MVP verzije

**Opis:** Postavljamo kompletnu prvu verziju sajta na internet.

**Zadaci:**
- Proveriti da li sve stranice rade lokalno bez grešaka (`npm run build`).
- Uraditi `git push`, sačekati automatski deploy na Vercel-u.
- Proći kroz ceo sajt na `.vercel.app` linku i proveriti sve linkove.

**Rezultat:** Kompletan informativni sajt (Početna, O nama, Projekti, Kontakt) je dostupan na internetu.

**Napomena:** Nema.

---

## Faza 2: Proširenja i poliranje

### 2.1 Alumni stranica

**Opis:** Posebna stranica koja ističe bivše članove i njihova dostignuća.

**Zadaci:**
- Napraviti fajl `app/alumni/page.tsx`.
- Napisati tekst o alumni klubu (preko 50 članova, gde danas rade).
- Ako dobiješ konkretna imena i pozicije od organizacije, prikazati ih kao kartice.

**Rezultat:** Stranica Alumni postoji i prikazuje dostupne informacije o bivšim članovima.

**Napomena:** Dokument trenutno nema konkretna imena alumni članova, samo opšti opis. Ova stranica će verovatno zahtevati dodatni sadržaj od organizacije.

---

### 2.2 Stranica "Postani član"

**Opis:** Stranica koja objašnjava sektore i kasnije vodi ka Google Forms prijavi kad prijave budu otvorene.

**Zadaci:**
- Napraviti fajl `app/postani-clan/page.tsx`.
- Opisati četiri sektora i šta rade.
- Dodati veliko dugme "Prijavi se" koje za sada vodi na Kontakt stranicu ili je onemogućeno sa natpisom "Prijave uskoro", a kasnije se lako menja da vodi na Google Forms link.

**Rezultat:** Stranica postoji i jasno komunicira da prijave trenutno nisu otvorene, spremna da se za par minuta doda pravi link kad prijave krenu.

**Napomena:** Kad dobiješ Google Forms link, samo zameniš `href` vrednost na dugmetu, izmena traje par sekundi.

---

### 2.3 Galerija slika za projekte

**Opis:** Dodajemo slike sa prošlih događaja na stranice projekata da sajt deluje življe.

**Zadaci:**
- Sakupiti slike sa Instagram/Facebook naloga organizacije (uz dozvolu/proveru prava korišćenja).
- Sačuvati ih u `public/galerija/` folderu, organizovane po projektu.
- Prikazati ih kao jednostavnu mrežu slika na dnu svake stranice projekta, koristeći Next.js `Image` komponentu.

**Rezultat:** Svaka stranica projekta ima galeriju od nekoliko slika sa prošlih događaja.

**Napomena:** Slike direktno sa Instagrama često su velike i usporavaju sajt. Next.js `Image` komponenta automatski ih optimizuje, ali je bolje unapred smanjiti prevelike fajlove (preko 2-3 MB) pre ubacivanja.

---

### 2.4 Sitne animacije i detalji

**Opis:** Dodajemo blage animacije da sajt deluje modernije (pojavljivanje sekcija pri skrolovanju, hover efekti na karticama).

**Zadaci:**
- Dodati jednostavne Tailwind animacije (`transition`, `hover:scale-105`) na kartice i dugmad.
- Po želji, dodati biblioteku Framer Motion za pojavljivanje sekcija pri skrolovanju.

**Rezultat:** Sajt ima blage, profesionalne animacije koje ne ometaju čitanje sadržaja.

**Napomena:** Lako je preterati sa animacijama. Drži se pravila: animacija treba da traje kratko (ispod pola sekunde) i da se koristi samo tamo gde skreće pažnju na nešto važno.

---

### 2.5 Osnovna analitika

**Opis:** Pratimo koliko ljudi posećuje sajt i koje stranice su najpopularnije.

**Zadaci:**
- Uključiti Vercel Analytics (ugrađena opcija, jedan klik u Vercel podešavanjima).
- Po želji, dodati i Google Analytics za detaljniju analizu.

**Rezultat:** Imaš uvid u broj poseta i najposećenije stranice.

**Napomena:** Nema.

---

### 2.6 Povezivanje sopstvenog domena

**Opis:** Umesto `.vercel.app` linka, sajt dobija pravu adresu (npr. sefa.rs).

**Zadaci:**
- Kupiti domen kod registra po izboru (npr. preko `rnids.rs` za `.rs` domene).
- U Vercel podešavanjima dodati domen i uneti tražene DNS zapise kod registra domena.
- Sačekati da se domen aktivira (obično par sati do 24h).

**Rezultat:** Sajt je dostupan na pravoj, kupljenoj adresi.

**Napomena:** DNS izmene ponekad traju duže nego što se očekuje. Ne brini ako sajt ne proradi odmah na novom domenu, sačekaj bar nekoliko sati pre nego što pomisliš da nešto nije dobro podešeno.

---

## Definicija gotovog po fazama

| Faza | Definicija gotovog |
|---|---|
| Faza 0 | Prazan, stilizovan Next.js sajt sa logom, menijem i footerom je uspešno postavljen na Vercel. |
| Faza 1 | Sav sadržaj iz dokumenta je prenet na sajt (Početna, O nama, Projekti sa detaljima, Kontakt), sajt je responzivan i ima osnovni SEO. |
| Faza 2 | Sajt ima Alumni i "Postani član" stranice, galerije slika, animacije, analitiku i radi na sopstvenom domenu. |

---

## Mapa stranica i ruta

| Ruta | Stranica | Faza |
|---|---|---|
| `/` | Početna | 1.1 |
| `/o-nama` | O nama | 1.2 |
| `/projekti` | Pregled projekata | 1.3 |
| `/projekti/[slug]` | Detalji projekta (npr. `/projekti/repsus`) | 1.4 |
| `/kontakt` | Kontakt | 1.5 |
| `/alumni` | Alumni | 2.1 |
| `/postani-clan` | Postani član | 2.2 |

*Napomena: Sajt nema API rute jer nema bazu podataka niti slanje email-a u ovoj fazi. Ako se to promeni u budućnosti (npr. forma za prijavu direktno na sajtu), tada bi se dodala ruta poput `app/api/prijava/route.ts`.*

---

## Dizajn sistem

*Ažurirano prema referentnom dizajnu koji je poslat (tamna, mint zelena tema sa animiranim uvodom) i strukturnoj inspiraciji sa ekonomska-klinika.hr.*

**Boje:**
- Mint zelena (primarna, akcenat): `#66C6B3`
- Tamnija mint zelena (hover stanja, dublji akcenat): `#2F6F63`
- Pozadina (glavna, najtamnija): `#07100F`
- Pozadina (sekcije, blago svetlija): `#0B1615`
- Tekst (glavni): `#EAF2F0`
- Tekst (prigušen, opisi): `rgba(234,242,240,.64)`
- Linije/razdelnici: `rgba(234,242,240,.13)`

**Tipografija:**
- Naslovi (display): Bricolage Grotesque, veoma podebljano (700-800), veliki razmak slova skoro nula ili negativan
- Tekst (body): Archivo, regularna težina
- Sitni detalji (kicker labele, hint tekst, brojevi): JetBrains Mono, sve veliko slovo, razmaknuto (letter-spacing)

**Senke, zaobljenja i teksture:**
- Dugmad: potpuno zaobljena (`rounded-full`), puna mint pozadina za primarnu akciju, providna sa mint ivicom za sekundarnu
- Kartice: minimalne senke, oslanjaju se više na kontrast pozadine i tanke linije nego na senku
- Opciono: blaga tekstura "grain" preko pozadine za premium osećaj (SVG filter, laka za implementaciju u Tailwind/CSS)

**Animacije:**
- Uvodna animacija na početnoj: naziv organizacije se sastavlja slovo po slovo dok korisnik skroluje kroz prvih 100vh do 400vh visine, praćeno kratkom rečenicom (moto) koja se pojavljuje reč po reč
- Glavni meni je nevidljiv preko uvoda i pojavljuje se (fade + slide) tek kad korisnik prođe uvodnu sekciju
- Sekcije ispod uvoda imaju blagi "reveal" efekat (fade + pomeranje na gore) kad uđu u vidno polje
- Poštovati `prefers-reduced-motion`: za korisnike koji su isključili animacije, sav sadržaj se odmah prikazuje bez pokreta

**Struktura sadržaja (inspirisano sa ekonomska-klinika.hr):**
- Posle uvodne animacije: velika fotografija ili sekcija sa "Ko smo mi" porukom
- Tri do četiri kartice koje sažeto predstavljaju glavne oblasti (kod SEFA to su sektori ili glavni projekti, ne savetovanja kao kod ekonomska-klinika.hr)
- Sekcija sa brojkama istaknuta velikim ciframa (70+ članova, broj projekata, broj godina postojanja), svaka sa kratkim opisom ispod

---

## Česte greške i rešenja

| Problem | Rešenje |
|---|---|
| Sajt lepo izgleda na računaru, ali se "lomi" na telefonu | Testirati svaku stranicu na mobilnom prikazu odmah nakon pravljenja, ne na kraju svega |
| Slike usporavaju sajt | Koristiti Next.js `Image` komponentu i unapred smanjiti velike fajlove pre ubacivanja |
| Zaboravljen `.gitignore`, pa `node_modules` završi na GitHub-u | Proveriti da `.gitignore` postoji pre prvog `git push`-a |
| Izmena na sajtu se ne vidi uživo | Proveriti da li je `git push` zaista izvršen i da li je Vercel deploy završen (zeleno polje u Vercel panelu) |
| Domen ne radi odmah posle povezivanja | Sačekati par sati do 24h zbog DNS propagacije, ne menjati ponovo podešavanja u međuvremenu |
| Tekst projekta predugačak i nepregledan na strani | Podeliti tekst u manje sekcije sa podnaslovima, umesto jednog dugog pasusa |

---

## Napomene o zavisnostima

- Faza 1 ne može da počne pre nego što se završi Faza 0 (potreban je postavljen projekat, dizajn sistem i deploy tok).
- Korak 1.4 (detaljna stranica projekta) zavisi od koraka 1.3 (potrebna je struktura podataka iz `data/projekti.ts`).
- Korak 1.6 (provera mobilnog prikaza) najbolje se radi posle koraka 1.1-1.5, kad postoji sadržaj za proveru.
- Korak 2.2 (Postani član) ne zavisi tehnički ni od čega u Fazi 2, ali suštinski čeka da organizacija otvori prijave i pošalje Google Forms link.
- Korak 2.6 (domen) treba da bude poslednji, jer se radi kad je sadržaj sajta već stabilan i spreman za javnost.
