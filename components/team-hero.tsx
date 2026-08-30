import { ParallaxImage } from "@/components/parallax-image";

export function TeamHero() {
  return (
    <section
      id="team-hero-section"
      className="relative isolate h-screen overflow-hidden [height:100svh]"
      aria-label="Studenti Ekonomskog fakulteta"
    >
      <ParallaxImage
        src="/tim-2.jpg"
        alt="Članovi SEFA-e u amfiteatru Ekonomskog fakulteta"
        priority
        sizes="100vw"
      />
      <div className="team__scrim absolute inset-0" aria-hidden="true" />

      <div className="relative flex h-full flex-col items-center justify-center px-[5vw] text-center">
        <p className="flex items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-primary before:h-px before:w-6 before:bg-primary before:opacity-70 before:content-['']">
          Ko smo mi
        </p>
        <h2 className="team-hero__title font-heading mt-6 text-[clamp(2.2rem,6.6vw,5.4rem)] font-extrabold leading-[0.98] tracking-[-0.025em] text-white">
          <span id="logo-s-target" className="text-primary">S</span>TUDENTI{" "}
          <span id="logo-e-target" className="text-primary">E</span>KONOMSKOG
          <br />
          <span id="logo-f-target" className="text-primary">F</span>
          <span id="logo-a-target" className="text-primary">A</span>KULTETA
        </h2>
        <p className="mt-[1.1rem] max-w-[44ch] text-white/[0.78]">
          Ljudi koji organizuju panele, vode projekte i dovode kompanije u
          amfiteatar, ne čekajući da to neko drugi uradi.
        </p>
      </div>
    </section>
  );
}
