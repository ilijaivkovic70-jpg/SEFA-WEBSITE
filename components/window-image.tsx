import Image, { type ImageProps } from "next/image";

/**
 * Slika stoji u mestu dok sadržaj klizi preko nje, pa sekcija izgleda kao
 * "prozor" kroz koji se vidi fotografija iza sajta. Slika je fiksirana za
 * ekran (position: fixed), a roditeljska sekcija je iseca preko clip-path
 * (overflow: hidden ne seče fiksirane elemente, clip-path da). Za razliku
 * od background-attachment: fixed, radi i na telefonima (iOS Safari).
 */
export function WindowImage({ alt, ...props }: Omit<ImageProps, "fill" | "style">) {
  return (
    <div className="window-image__wrap">
      <Image {...props} alt={alt} fill className="window-image__img" />
    </div>
  );
}
