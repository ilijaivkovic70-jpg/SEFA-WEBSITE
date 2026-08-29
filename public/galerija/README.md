# Galerija slika

Slike za svaki projekat idu u odgovarajući podfolder (npr. `public/galerija/repsus/1.jpg`).

Koraci za dodavanje slika:

1. Smanji velike fajlove (preko 2-3 MB) pre ubacivanja — Next.js `Image` komponenta dalje optimizuje, ali ne treba joj davati ogromne originale.
2. Ubaci slike u folder projekta, npr. `public/galerija/repsus/1.jpg`, `2.jpg`, ...
3. U `data/projekti.ts`, kod odgovarajućeg projekta, dodaj polje `galerija` sa putanjama:

```ts
galerija: ["/galerija/repsus/1.jpg", "/galerija/repsus/2.jpg"],
```

Galerija se automatski prikazuje na dnu stranice projekta čim `galerija` niz nije prazan.
