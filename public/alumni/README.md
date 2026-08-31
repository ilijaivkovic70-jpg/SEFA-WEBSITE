# Fotografije za Alumni stranicu

Sve fotografije sa stranice `/alumni` idu u ova dva foldera. Kada se fajl ubaci,
u `data/alumni.ts` treba upisati njegovu putanju umesto `null`.

## 1. Portreti — `public/alumni/portreti/`

Koriste se na dva mesta:

**Hero (mali isečci oko broja „50+”)** — pet fotografija.
U `data/alumni.ts`, u nizu `ALUMNI_SNAPSHOTS`:

```ts
{ src: "/alumni/portreti/1.jpg", alt: "Alumni članovi SEFA-e na okupljanju" },
```

**Priče alumnista** — po jedna fotografija za svaku priču.
U nizu `ALUMNI_STORIES`:

```ts
image: "/alumni/portreti/ime-prezime.jpg",
```

Preporuka: uspravne (portretne) fotografije, najmanje 800 × 1000 px.

## 2. Uspomene — `public/alumni/uspomene/`

Fotografije za galeriju „Trenuci koji ostaju”. U nizu `MEMORIES`:

```ts
{
  src: "/alumni/uspomene/repsus-2019.jpg",
  alt: "Sa konferencije REPSUS",
  title: "REPSUS",
  year: "2019",
  description: "Kratak opis trenutka sa fotografije.",
  shape: "pejzaz",
},
```

`shape` određuje oblik okvira u traci — `"portret"` (3:4), `"pejzaz"` (3:2)
ili `"kvadrat"` (1:1). Izaberi onaj koji odgovara samoj fotografiji, i mešaj
oblike da traka ne izgleda kao pravilna mreža.

## Pre ubacivanja

1. Smanji fajlove preko 2–3 MB — `Image` komponenta ih dalje optimizuje,
   ali joj ne treba davati ogromne originale.
2. `alt` opiši tako da opisuje šta se na fotografiji dešava, ne „fotografija 1”.
3. Za priče alumnista objavi ime, poziciju i izjavu tek uz saglasnost osobe.

Dok je `src` postavljen na `null`, na stranici stoji neutralan prazan okvir —
raspored se ne pomera kad se prava fotografija kasnije ubaci.
