import Image from "next/image";
import type { TrackingPhoto } from "@/lib/tracking-media";
import { Reveal } from "@/components/marketing/reveal";

/**
 * Photo strip of the shipping & tracking process. Uses centred flex-wrap so any
 * number of photos fills its rows without a stranded left-aligned orphan.
 */
export function TrackingGallery({ photos }: { photos: TrackingPhoto[] }) {
  if (photos.length === 0) return null;

  // Four photos fill one row of four; everything else reads better in threes.
  const wideBasis =
    photos.length === 4
      ? "lg:basis-[calc(25%-0.9375rem)]"
      : "lg:basis-[calc(33.333%-0.834rem)]";

  return (
    <div className="flex flex-wrap justify-center gap-5">
      {photos.map((photo, index) => (
        <Reveal
          key={photo.src}
          delay={index * 0.06}
          className={`basis-full sm:basis-[calc(50%-0.625rem)] ${wideBasis}`}
        >
          <figure className="group relative h-full overflow-hidden rounded-2xl shadow-sm ring-1 ring-border/60 transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/10">
            <Image
              src={photo.src}
              alt={photo.title}
              width={800}
              height={600}
              className="aspect-4/3 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              unoptimized
            />
            {/* Scrim keeps the caption legible over whatever photo is dropped in */}
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/55 to-transparent p-4 pt-12 text-white">
              <p className="font-heading text-sm font-semibold">{photo.title}</p>
              {photo.caption && (
                <p className="mt-0.5 text-xs leading-relaxed text-white/80">
                  {photo.caption}
                </p>
              )}
            </figcaption>
          </figure>
        </Reveal>
      ))}
    </div>
  );
}
