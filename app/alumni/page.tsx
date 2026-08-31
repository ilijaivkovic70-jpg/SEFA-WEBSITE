import type { Metadata } from "next";
import { AlumniHero } from "@/components/alumni-hero";
import { AlumniPaths } from "@/components/alumni-paths";
import { AlumniStories } from "@/components/alumni-stories";
import { AlumniMemories } from "@/components/alumni-memories";
import { AlumniOutro } from "@/components/alumni-outro";

export const metadata: Metadata = {
  title: "Alumni — SEFA",
  description:
    "Alumni klub Studentske ekonomske fakultetske asocijacije — bivši članovi, njihovi karijerni putevi i uspomene iz SEFE.",
};

/**
 * Alumni stranica. Sav tekst, fotografije i podaci su u `data/alumni.ts`;
 * ovde se sekcije samo ređaju. Svaka sekcija sama vodi svoje otkrivanje
 * (IntersectionObserver), pa nijedna ne ide u <Reveal>.
 */
export default function AlumniPage() {
  return (
    <div className="al-page">
      <AlumniHero />
      <AlumniPaths />
      <AlumniStories />
      <AlumniMemories />
      <AlumniOutro />
    </div>
  );
}
