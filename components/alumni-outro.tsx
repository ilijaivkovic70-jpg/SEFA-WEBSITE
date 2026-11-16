import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ALUMNI_HERO } from "@/data/alumni";
import { AlumniBrand } from "@/components/alumni-brand";

/**
 * Završna poruka Alumni stranice: kraj trake koja se provlači kroz celu
 * stranicu, poruka i dugme ka kontakt stranici (isto kao u heroju).
 */
export function AlumniOutro() {
  return (
    <section className="ak-outro" aria-label="Poveži se">
      <span className="ak-outro__strap" aria-hidden="true" />
      <p className="ak-outro__line">
        <AlumniBrand>Jednom deo SEFA-E. Uvek deo priče.</AlumniBrand>
      </p>
      <Link href={ALUMNI_HERO.cta.href} className="ak-btn">
        {ALUMNI_HERO.cta.label}
        <ArrowRight className="ak-btn__icon" aria-hidden="true" />
      </Link>
    </section>
  );
}
