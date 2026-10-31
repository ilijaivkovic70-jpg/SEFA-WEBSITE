import { AlumniFrame } from "@/components/alumni-frame";
import { KOLAZ } from "@/data/kolaz";

/**
 * Kolaž fotografija iza naslova tima. Kao i ranija pojedinačna slika,
 * stoji u mestu (position: fixed) dok sajt klizi preko, a roditeljska
 * sekcija ga iseca (clip-path), pa izgleda kao „prozor” u zid fotografija.
 *
 * Računar: 6 kolona × 4 reda, prva fotografija zauzima 2 × 2.
 * Telefon: 3 kolone × 7 redova, sve iste veličine.
 */
export function TeamCollage() {
  const empty = KOLAZ.every((p) => !p.src);

  return (
    <div className="window-image__wrap team-collage" aria-hidden={empty || undefined}>
      <ul className="team-collage__grid">
        {KOLAZ.map((photo, i) => (
          <li
            key={i}
            className="team-collage__tile"
            data-i={i + 1}
            // blago različite nijanse praznih okvira, da se vidi mreža
            style={{ "--tone": `${(i * 37) % 9}` } as React.CSSProperties}
          >
            <AlumniFrame
              src={photo.src}
              alt={photo.alt}
              sizes={i === 0 ? "(min-width: 768px) 34vw, 67vw" : "(min-width: 768px) 17vw, 34vw"}
              priority={i < 6}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
