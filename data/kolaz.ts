/**
 * Kolaž iza naslova „STUDENTI EKONOMSKOG FAKULTETA” na početnoj
 * (components/team-collage.tsx).
 *
 * Fotografije idu u `public/kolaz/` (npr. `public/kolaz/01.jpg`), pa se
 * ovde upiše putanja umesto `null`. Dok je `src` `null`, stoji prazan
 * okvir. Redosled = redosled u mreži; prva fotografija je najveća.
 */

export type KolazSlika = {
  src: string | null;
  alt: string;
};

export const KOLAZ: KolazSlika[] = Array.from({ length: 21 }, (_, i) => ({
  src: null,
  alt: `Članovi SEFA-e, fotografija ${i + 1}`,
}));
