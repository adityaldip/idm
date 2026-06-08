"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type TestimonialItem = {
  id: string;
  name: string;
  company: string | null;
  role: string | null;
  content: string;
  rating: number;
};

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
      <Card className="overflow-hidden border-border/60 shadow-md">
        <CardContent className="p-8 md:p-10">
          <Quote className="size-8 text-gold/60" />
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground md:text-xl">
            &ldquo;{current.content}&rdquo;
          </p>
          <div className="mt-6 flex items-center justify-between gap-4">
            <div>
              <p className="font-heading font-semibold">{current.name}</p>
              <p className="text-sm text-muted-foreground">
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
                <Button variant="outline" size="icon" onClick={prev}>
                  <ChevronLeft className="size-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={next}>
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {items.length > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Testimonial ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`size-2 rounded-full transition-colors ${
                i === index ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
