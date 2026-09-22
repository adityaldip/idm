"use client";

import { useState } from "react";
import { X } from "lucide-react";

export type TrackingPhotoView = {
  id: string;
  url: string;
  width?: number;
  height?: number;
};

/** Thumbnails for a tracking event — click opens a simple lightbox. */
export function TrackingPhotoGallery({
  photos,
  altPrefix = "Foto tracking",
}: {
  photos: TrackingPhotoView[];
  altPrefix?: string;
}) {
  const [active, setActive] = useState<TrackingPhotoView | null>(null);

  if (photos.length === 0) return null;

  return (
    <>
      <ul className="mt-3 grid grid-cols-3 gap-2">
        {photos.map((photo, index) => (
          <li key={photo.id}>
            <button
              type="button"
              onClick={() => setActive(photo)}
              className="block w-full overflow-hidden rounded-md border border-border/60 transition hover:opacity-90"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={`${altPrefix} ${index + 1}`}
                className="aspect-square w-full object-cover"
                loading="lazy"
              />
            </button>
          </li>
        ))}
      </ul>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau foto"
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            aria-label="Tutup"
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={() => setActive(null)}
          >
            <X className="size-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={active.url}
            alt={altPrefix}
            className="max-h-[90vh] max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
