import Image from "next/image";

/**
 * Kolaž fotografija članova iza naslova „STUDENTI EKONOMSKOG FAKULTETA”.
 * Stoji u mestu (position: fixed) dok sajt klizi preko, a roditeljska
 * sekcija ga iseca (clip-path), pa izgleda kao „prozor” u zid fotografija.
 * Lagano se približava (Ken Burns) da pozadina ne bude mrtva.
 */
export function TeamCollage() {
  return (
    <div className="window-image__wrap team-collage" aria-hidden="true">
      <Image
        src="/kolaz-tim.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="team-collage__img"
      />
      <div className="team-collage__tint" />
    </div>
  );
}
