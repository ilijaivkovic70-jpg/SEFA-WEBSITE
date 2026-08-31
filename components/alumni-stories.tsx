"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { ALUMNI_STORIES } from "@/data/alumni";
import { AlumniFrame } from "@/components/alumni-frame";
import { AlumniBrand } from "@/components/alumni-brand";

/**
 * „Od SEFE do novih uspeha” — priče bivših članova, složene kao strane
 * iz magazina, a ne kao tri profilne kartice: naizmenično fotografija levo
 * pa desno, treća uža sa citatom kao dominantnim elementom. Nema okvira ni
 * pozadina — priče razdvajaju tanka linija i prazan prostor.
 *
 * Svaka priča se otkriva zasebno, kad uđe u vidno polje: fotografija se
 * otkriva maskom odozdo naviše, tekst ulazi sa malim kašnjenjem, a citat
 * reč po reč.
 *
 * Novi alumnista se dodaje kao još jedan objekat u `ALUMNI_STORIES`
 * (`data/alumni.ts`) — raspored se dalje sam smenjuje.
 */

const LAYOUTS = ["media-levo", "media-desno", "citat"] as const;

/** Najviše tri priče stoje na stranici. */
const STORIES = ALUMNI_STORIES.slice(0, 3);

export function AlumniStories() {
  const listRef = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState<boolean[]>(() => STORIES.map(() => false));

  useEffect(() => {
    const root = listRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const i = Number((entry.target as HTMLElement).dataset.story);
          setSeen((prev) => (prev[i] ? prev : prev.map((v, j) => (j === i ? true : v))));
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
    );

    root.querySelectorAll<HTMLElement>("[data-story]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (STORIES.length === 0) return null;

  return (
    <section className="al-stories" aria-labelledby="alumni-price">
      <div className="al-stories__intro">
        <p className="al-eyebrow">Alumni priče</p>
        <h2 id="alumni-price" className="al-stories__title">
          <AlumniBrand>Od SEFE do novih uspeha</AlumniBrand>
        </h2>
      </div>

      <div ref={listRef} className="al-stories__list">
        {STORIES.map((story, i) => (
          <article
            key={`${story.name}-${i}`}
            className="al-story"
            data-story={i}
            data-layout={LAYOUTS[i] ?? "media-levo"}
            data-in={seen[i] || undefined}
          >
            <figure className="al-story__media">
              <AlumniFrame
                src={story.image}
                alt={story.imageAlt}
                sizes="(min-width: 1024px) 42vw, 92vw"
              />
            </figure>

            <div className="al-story__body">
              <p className="al-story__index" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </p>

              <h3 className="al-story__name">{story.name}</h3>
              <p className="al-story__role">{story.currentRole}</p>

              <blockquote className="al-story__quote">
                <p>
                  {/* razmak stoji izvan `span`-a: `inline-block` bi ga pojeo,
                      pa bi se reči slepile pri kopiranju i čitanju */}
                  {story.quote.split(" ").map((word, w) => (
                    <Fragment key={`${word}-${w}`}>
                      <span
                        className="al-story__word"
                        style={{ transitionDelay: `${420 + w * 45}ms` }}
                      >
                        {word}
                      </span>{" "}
                    </Fragment>
                  ))}
                </p>
              </blockquote>

              <dl className="al-story__meta">
                <div>
                  <dt>U SEFA-i</dt>
                  <dd>{story.sefaRole}</dd>
                </div>
                <div>
                  <dt>Generacija</dt>
                  <dd>{story.sefaYear}</dd>
                </div>
              </dl>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
