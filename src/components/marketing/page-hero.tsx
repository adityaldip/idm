import Image from "next/image";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Background photo. Sits under a scrim so the text keeps its contrast. */
  image?: string;
  className?: string;
}

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  className,
}: PageHeroProps) {
  return (
    <section className={cn("relative overflow-hidden", className)}>
      {image && (
        <Image
          src={image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
          unoptimized
        />
      )}
      <div
        className={cn(
          "hero-gradient absolute inset-0",
          // Let the photo through while keeping white text readable on top.
          image && "opacity-80 mix-blend-multiply",
        )}
      />
      {image && <div className="absolute inset-0 bg-primary/25" />}
      <div className="hero-pattern absolute inset-0 opacity-40" />

      <div
        className={cn(
          "relative mx-auto max-w-7xl px-4 md:px-6 lg:px-8",
          image ? "py-20 md:py-28" : "py-16 md:py-20",
        )}
      >
        <div className="max-w-3xl">
          {eyebrow && (
            <p className="text-sm font-semibold uppercase tracking-widest text-gold">
              {eyebrow}
            </p>
          )}
          <h1 className="font-heading mt-2 text-4xl font-bold tracking-tight text-white text-balance md:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-4 text-lg leading-relaxed text-white/85">
              {description}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
