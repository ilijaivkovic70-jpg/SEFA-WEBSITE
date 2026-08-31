import Image from "next/image";

/**
 * Okvir za jednu fotografiju na Alumni stranici.
 *
 * Dok fotografija nije ubačena (`src` je `null` u `data/alumni.ts`), na njeno
 * mesto dolazi neutralan prazan okvir istih proporcija — raspored se zato ne
 * pomera kad se prava slika kasnije doda, i nigde ne stoji tuđa stock slika.
 */
export function AlumniFrame({
  src,
  alt,
  sizes,
  priority,
  className,
}: {
  src: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={className ? `al-frame ${className}` : "al-frame"}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          className="al-frame__img"
        />
      ) : (
        /* prazno mesto za buduću fotografiju — vidi public/alumni/README.md */
        <span className="al-frame__empty" aria-hidden="true">
          <span className="al-frame__corner" />
          <span className="al-frame__corner" />
          <span className="al-frame__corner" />
          <span className="al-frame__corner" />
        </span>
      )}
    </div>
  );
}
