import Image from "next/image";

type MarqueeLogo = {
  id: string;
  name: string;
  logoUrl: string;
};

/**
 * Continuously scrolling logo strip. The list is rendered twice so the
 * -50% keyframe loops seamlessly; the clone is hidden from screen readers.
 */
export function LogoMarquee({ items }: { items: MarqueeLogo[] }) {
  if (items.length === 0) return null;

  return (
    <div className="marquee-mask group relative overflow-hidden py-2">
      <div className="marquee-track flex w-max gap-5 group-hover:[animation-play-state:paused]">
        {[0, 1].map((pass) => (
          <div key={pass} className="flex shrink-0 gap-5" aria-hidden={pass === 1}>
            {items.map((item) => (
              <div
                key={`${pass}-${item.id}`}
                className="flex h-28 w-52 shrink-0 items-center justify-center rounded-2xl border border-border/50 bg-card px-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-md sm:h-32 sm:w-60"
              >
                <div className="relative h-full w-full opacity-70 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0">
                  <Image
                    src={item.logoUrl}
                    alt={item.name}
                    fill
                    className="object-contain"
                    sizes="240px"
                    unoptimized
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
