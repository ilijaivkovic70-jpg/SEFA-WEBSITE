import type { Metadata } from "next";
import { ContactScene } from "@/components/contact-scene";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Kontakt podaci i društvene mreže Studentske ekonomske fakultetske asocijacije.",
};

export default function KontaktPage() {
  return <ContactScene />;
}
