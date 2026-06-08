import { cn } from "@/lib/utils";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}

export function PageHero({
  eyebrow,
  title,
  description,
  className,
}: PageHeroProps) {
  return (
    <section className={cn("relative overflow-hidden", className)}>
      <div className="hero-gradient absolute inset-0" />
      <div className="hero-pattern absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20 lg:px-8">
        <div className="max-w-3xl">
          {eyebrow && (
            <p className="text-sm font-semibold uppercase tracking-widest text-gold">
              {eyebrow}
            </p>
          )}
          <h1 className="font-heading mt-2 text-4xl font-bold tracking-tight text-white md:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-4 text-lg text-white/80">{description}</p>
          )}
        </div>
      </div>
    </section>
  );
}
