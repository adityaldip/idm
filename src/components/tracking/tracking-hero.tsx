import type { ReactNode } from "react";

/**
 * Navy band at the top of every tracking page, styled like the homepage hero.
 * Page content below it pulls up with a negative margin to overlap the band.
 */
export function TrackingHero({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="section-navy relative overflow-hidden text-white">
      <div className="hero-contours absolute inset-0 opacity-80" />
      <div className="hero-grain pointer-events-none absolute inset-0" />

      <div className="relative mx-auto max-w-4xl px-4 pt-14 pb-28 text-center md:px-6 md:pt-16 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-gold">
          Pelacakan
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight md:text-4xl">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-white/75">{description}</p>
        <div className="mx-auto mt-8 max-w-2xl">{children}</div>
      </div>
    </section>
  );
}
