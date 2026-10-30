"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { ImageReveal } from "@/components/image-reveal";

// različita brzina po koloni, kao "lanac" slika na savor.it
const PARALLAX = [0, 24, 12];

export function ProjectGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  if (images.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="font-heading text-xl font-bold tracking-tight">
        Galerija
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((src, i) => (
          <ImageReveal key={src} parallax={PARALLAX[i % 3]}>
          <button
            type="button"
            onClick={() => setSelected(i)}
            className="group relative block aspect-square w-full overflow-hidden rounded-lg ring-1 ring-border"
          >
            <Image
              src={src}
              alt={`${alt}, fotografija ${i + 1}`}
              fill
              sizes="(min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
          </ImageReveal>
        ))}
      </div>

      {selected !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelected(null)}
        >
          <button
            type="button"
            aria-label="Zatvori"
            onClick={() => setSelected(null)}
            className="absolute right-4 top-4 rounded-full p-2 text-white/80 hover:text-white"
          >
            <X className="size-6" />
          </button>
          <div className="relative aspect-video w-full max-w-3xl">
            <Image
              src={images[selected]}
              alt={`${alt}, fotografija ${selected + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
