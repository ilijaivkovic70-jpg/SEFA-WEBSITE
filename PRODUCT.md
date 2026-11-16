# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Sajt kao celina služi budućim kandidatima za članstvo: studentima Ekonomskog fakulteta Univerziteta u Beogradu koji žele da saznaju šta je SEFA, šta radi i kako da se prijave.

Alumni stranica (`/alumni`) ima drugu primarnu publiku (potvrđeno 2026-11-16): **bivše članove SEFA-E**. Oni dolaze da se prepoznaju, da se povežu i da ostanu deo zajednice. Budući članovi i partneri je čitaju usput, ali nisu oni kojima se stranica obraća.

## Product Purpose

Informativni sajt Studentske ekonomske fakultetske asocijacije (SEFA): predstavlja organizaciju, njene projekte i alumni mrežu. Uspeh za sajt znači da kandidat lako razume organizaciju i nađe put do prijave. Uspeh za alumni stranicu znači da se bivši član oseti kao deo zajednice koja i dalje postoji i da se javi (link ka `/kontakt`).

## Positioning

Alumni klub nije spisak bivših članova, nego zajednica koja traje i posle članstva: isto iskustvo iz SEFA-E vodi u tri različita profesionalna pravca (državne institucije, velike korporacije, preduzetništvo), a članovi ostaju podrška generacijama koje dolaze.

## Operating Context

- Statičan sajt bez baze, bez logovanja i bez slanja mejlova. Prijava za članstvo ide preko eksternog Google Forms linka.
- Vlasnik sam održava sajt i nije programer: sav tekst i sve putanje do fotografija menja u `data/` fajlovima (`data/alumni.ts` za alumni stranicu), ne u komponentama.
- Hosting je Vercel, deploy preko GitHub-a.
- Radni folder je na iCloud Desktopu sa gotovo punim diskom, pa se dev server pokreće iz lokalne kopije (`dev-local-copy`, port 3001).

## Capabilities and Constraints

- Next.js (App Router, verzija sa izmenjenim API-jem, vidi `AGENTS.md`), TypeScript, Tailwind CSS 4, shadcn/ui, Lenis za mekan skrol. `three` je već u zavisnostima.
- Sve slike idu kroz Next.js `Image`.
- Svaka stranica mora da radi na telefonu pre nego što se smatra gotovom; animacije se proveravaju i na slabijim telefonima.
- `prefers-reduced-motion` je obavezan: uz smanjeno kretanje sav sadržaj stoji odmah, bez animacije.
- Kod treba da ostane čitljiv i lako proširiv, sa komentarima na srpskom.
- Na alumni stranici sme slobodno da se menja struktura i redosled sekcija; postojeći tekst i činjenice ostaju (potvrđeno 2026-11-16).

## Brand Commitments

- Ime: SEFA (u padežu „SEFA-E”, „SEFA-i”). Na alumni stranici se ime u naslovima i pasusima boji u mint.
- Boje: mint `#66C6B3`, mint-deep `#2F6F63`, canvas `#07100F`, canvas-2 `#0B1615`, ink `#EAF2F0`. Sajt je taman.
- Fontovi: Bricolage Grotesque (naslovi), Archivo (tekst), JetBrains Mono (sitne labele).
- Dugmad su potpuno zaobljena; kartice se oslanjaju na kontrast i tanke linije, ne na senke.
- Jezik sajta je srpski, latinica.

## Evidence on Hand

Stvarno i sme da se prikaže:
- Alumni klub ima više od 50 članova (`ALUMNI_HERO.count`).
- Tri karijerna pravca sa opisima (`CAREER_PATHS`): državne institucije, velike korporacije, preduzetništvo.
- Nazivi projekata: REPSUS, SEFA Talks, Prava stvar, Bez straha, Greenfield, Sport Business Day, Link to the Future, EKOF u pokretu.
- Logo: `public/logo.png`.

Ne postoji i ne sme da se izmišlja (potvrđeno 2026-11-16, „još ništa od toga”):
- Fotografije sa događaja i portreti alumnista. Folderi `public/alumni/portreti/` i `public/alumni/uspomene/` su prazni; galerija trenutno pozajmljuje pozadinske slike sajta kao privremene.
- Priče alumnista: imena, pozicije, izjave. Tri unosa u `ALUMNI_STORIES` su prazni obrasci („Ime i prezime”).
- Broj alumnista po karijernom pravcu (`count: null`), nazivi kompanija, godine i generacije.

## Product Principles

1. Zajednica pre pojedinca: dok nema ličnih priča, stranica govori o celini, a ne glumi svedočenja.
2. Ništa izmišljeno: prazno mesto je poštenije od lažne fotografije, imena ili brojke.
3. Sadržaj menja vlasnik, ne programer: sve što se čita dolazi iz `data/alumni.ts`.
4. Kretanje je ukras, ne uslov: stranica je potpuna i bez animacije, i na telefonu.

## Accessibility & Inclusion

`prefers-reduced-motion` se poštuje na svim stranicama. Interaktivni delovi moraju da rade tastaturom i da imaju vidljiv fokus.
