import type { Metadata } from "next";
import Image from "next/image";
import { AlumniHero } from "@/components/alumni-hero";
import { AlumniPaths } from "@/components/alumni-paths";
import { AlumniStories } from "@/components/alumni-stories";
import { AlumniMemories } from "@/components/alumni-memories";
import { AlumniOutro } from "@/components/alumni-outro";

export const metadata: Metadata = {
  title: "Alumni",
  description:
    "Alumni klub Studentske ekonomske fakultetske asocijacije: bivši članovi, njihovi karijerni putevi i uspomene iz SEFE.",
};

/**
 * Alumni stranica. Sav tekst, fotografije i podaci su u `data/alumni.ts`;
 * ovde se sekcije samo ređaju. Svaka sekcija sama vodi svoje otkrivanje
 * (IntersectionObserver), pa nijedna ne ide u <Reveal>.
 */
export default function AlumniPage() {
  return (
    <div className="al-page relative">
      {/* pozadina cele stranice: mreža puteva/veza, već tamna i u
          paleti sajta — treba joj samo lagano zatamnjenje, ne obrada */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/alumni-pozadina.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover al-bg__img"
        />
        <div className="absolute inset-0 bg-background/45" />
      </div>

      <AlumniHero />
      <AlumniPaths />
      <AlumniStories />
      <AlumniMemories />
      <AlumniOutro />
    </div>
  );
}
