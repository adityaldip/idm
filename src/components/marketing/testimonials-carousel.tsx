"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";

type TestimonialItem = {
  id: string;
  name: string;
  company: string | null;
  role: string | null;
  content: string;
  rating: number;
};

const navButton =
  "flex size-9 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-gold hover:bg-gold";

export function TestimonialsCarousel({
  items,
}: {
  items: TestimonialItem[];
}) {
  const [index, setIndex] = useState(0);
  if (items.length === 0) return null;

  const current = items[index];

  function prev() {
    setIndex((i) => (i === 0 ? items.length - 1 : i - 1));
  }

  function next() {
    setIndex((i) => (i === items.length - 1 ? 0 : i + 1));
  }

  return (
    <div className="relative">
      {/* Glass card, designed for the dark navy testimonials band */}
      <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/[0.07] text-white shadow-2xl shadow-black/20 backdrop-blur-md">
        <div className="p-8 md:p-10">
          <Quote className="size-8 text-gold" />
          <p className="mt-4 text-lg leading-relaxed text-white/90 md:text-xl">
            &ldquo;{current.content}&rdquo;
          </p>
          <div className="mt-6 flex items-center justify-between gap-4">
            <div>
              <p className="font-heading font-semibold">{current.name}</p>
              <p className="text-sm text-white/60">
                {[current.role, current.company].filter(Boolean).join(" · ")}
              </p>
              <div className="mt-2 flex gap-0.5">
                {Array.from({ length: current.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="size-4 fill-gold text-gold"
                  />
                ))}
              </div>
            </div>
            {items.length > 1 && (
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-label="Testimoni sebelumnya"
                  onClick={prev}
                  className={navButton}
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Testimoni berikutnya"
                  onClick={next}
                  className={navButton}
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {items.length > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Testimonial ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-gold" : "w-2 bg-white/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
