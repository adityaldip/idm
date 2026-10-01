import Image from "next/image";
import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type HeroAction = {
  href: string;
  label: string;
  icon?: LucideIcon;
  /** The first action is the gold primary button; others are glass. */
  variant?: "primary" | "glass";
};

type HeroFact = {
  icon: LucideIcon;
  label: string;
  value: string;
};

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Background photo, shown in its own colours behind a left-side scrim. */
  image?: string;
  /** Current page name for the "Beranda / …" breadcrumb. */
  breadcrumb?: string;
  actions?: HeroAction[];
  /** Short glass info cards on the right (desktop only). */
  facts?: HeroFact[];
  className?: string;
}

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  breadcrumb,
  actions,
  facts,
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn("section-navy relative overflow-hidden text-white", className)}
    >
      {image && (
        <Image
          src={image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="hero-kenburns object-cover"
          unoptimized
        />
      )}
      {/* Scrim: solid navy behind the text on the left, fading out so the
          photo keeps its real colours on the right. */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,oklch(0.22_0.06_255/92%)_0%,oklch(0.26_0.07_252/78%)_40%,oklch(0.3_0.07_250/25%)_75%,transparent_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[oklch(0.2_0.06_255/60%)] to-transparent" />
      <div className="hero-grain pointer-events-none absolute inset-0" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pt-14 pb-24 md:px-6 md:pt-20 md:pb-32 lg:grid-cols-[1fr_auto] lg:px-8">
        <div className="max-w-2xl">
          {breadcrumb && (
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex items-center gap-1.5 text-sm text-white/70">
                <li>
                  <Link href="/" className="transition-colors hover:text-white">
                    Beranda
                  </Link>
                </li>
                <ChevronRight className="size-3.5" aria-hidden />
                <li aria-current="page" className="font-medium text-white">
                  {breadcrumb}
                </li>
              </ol>
            </nav>
          )}
          {eyebrow && (
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-gold">
              <span className="h-px w-6 bg-gold" />
              {eyebrow}
            </p>
          )}
          <h1 className="font-heading mt-3 text-4xl font-bold tracking-tight text-balance md:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
            {title}
          </h1>
          {description && (
            <p className="mt-4 text-lg leading-relaxed text-white/80">
              {description}
            </p>
          )}
          {actions && actions.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-3">
              {actions.map(({ href, label, icon: Icon, variant }, i) => {
                const primary = (variant ?? (i === 0 ? "primary" : "glass")) === "primary";
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "inline-flex h-11 items-center gap-2 rounded-lg px-5 text-sm font-semibold transition-all hover:-translate-y-0.5",
                      primary
                        ? "bg-secondary text-secondary-foreground shadow-lg shadow-gold/25 hover:bg-secondary/90"
                        : "border border-white/25 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20",
                    )}
                  >
                    {Icon && <Icon className="size-4" />}
                    {label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {facts && facts.length > 0 && (
          <ul className="hidden w-[22rem] space-y-3 lg:block">
            {facts.map(({ icon: Icon, label, value }) => (
              <li
                key={label}
                // Navy glass: these sit over the bright, unscrimmed side of the photo.
                className="flex items-center gap-3 rounded-xl border border-white/15 bg-[oklch(0.24_0.06_255/65%)] p-4 shadow-lg shadow-black/20 backdrop-blur-md"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gold/20 text-gold">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-white/65">{label}</p>
                  <p className="font-semibold break-words">{value}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Curved hand-off into the page, matching the homepage hero */}
      <div
        className="pointer-events-none absolute inset-x-0 -bottom-px text-background"
        aria-hidden
      >
        <svg
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
          className="block h-[50px] w-full md:h-[80px]"
        >
          <path
            fill="currentColor"
            d="M0,54 C240,96 480,96 720,70 C960,44 1200,10 1440,28 L1440,90 L0,90 Z"
          />
        </svg>
      </div>
    </section>
  );
}
