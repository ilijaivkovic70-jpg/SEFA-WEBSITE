import { Fragment } from "react";

/**
 * Oboji "SEFA" / "SEFE" unutar teksta u mint boju loga — isti tretman
 * svuda na Alumni stranici gde se ime organizacije pominje u naslovu
 * ili pasusu. Ne dira sitne mono labele (npr. "U SEFA-i" pored polja) —
 * tamo bi obojen fragment razbio ujednačen izgled malog natpisa.
 */
export function AlumniBrand({ children }: { children: string }) {
  const parts = children.split(/(SEFA|SEFE)/g);
  return (
    <>
      {parts.map((part, i) =>
        part === "SEFA" || part === "SEFE" ? (
          <span key={i} className="al-brand">
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  );
}
