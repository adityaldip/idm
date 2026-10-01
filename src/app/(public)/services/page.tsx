import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Container,
  MapPinned,
  MessageSquareText,
  Package,
  PackageSearch,
  Plane,
  Route,
  Ship,
  Truck,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHero } from "@/components/marketing/page-hero";
import { PAGE_HERO_IMAGES, getServiceImage } from "@/lib/site-media";
import { Card, CardContent } from "@/components/ui/card";
import {
  getPublicOfferings,
  getPublicCoverage,
  getContentBlock,
} from "@/services/public-site.service";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Layanan PT Intan Daya Mandiri — Ocean Freight, Domestic Distribution, Project Cargo, dan Air Freight.",
};

const iconMap = {
  Truck,
  Ship,
  Plane,
  Zap,
  Package,
  Container,
} as const;

export default async function ServicesPage() {
  const [offerings, coverage, intro] = await Promise.all([
    getPublicOfferings(),
    getPublicCoverage(),
    getContentBlock("SERVICES_INTRO"),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Layanan"
        title={intro?.title ?? "Layanan Kami"}
        description={
          intro?.subtitle ??
          "Solusi logistik cepat dan andal — pengiriman cepat, aman, dan terpercaya dengan tarif ekspedisi yang kompetitif."
        }
        image={PAGE_HERO_IMAGES.services}
        breadcrumb="Layanan"
        actions={[
          { href: "/contact", label: "Minta Penawaran", icon: MessageSquareText },
          { href: "/tracking", label: "Lacak Kiriman", icon: PackageSearch },
        ]}
        facts={[
          { icon: Package, label: "Pilihan layanan", value: `${offerings.length} layanan` },
          { icon: Route, label: "Moda pengiriman", value: "Darat · Laut · Udara" },
          { icon: MapPinned, label: "Jangkauan", value: "Seluruh Indonesia" },
        ]}
      />

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-16 md:px-6 md:py-20 lg:px-8">
        {/* Horizontal cards, photo side alternating, so text fills its column
            instead of sitting under a tall image. */}
        {offerings.map((service, index) => {
          const Icon = iconMap[service.icon as keyof typeof iconMap] ?? Truck;
          const photo = getServiceImage(service.slug, service.icon);
          const flipped = index % 2 === 1;
          return (
            <Card
              key={service.slug}
              className={cn(
                "group grid overflow-hidden border-border/60 py-0 shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-black/5",
                // The wider column always holds the text, whichever side it's on.
                flipped ? "md:grid-cols-[3fr_2fr]" : "md:grid-cols-[2fr_3fr]",
              )}
            >
              <div
                className={cn(
                  "relative min-h-56 overflow-hidden md:min-h-full",
                  flipped && "md:order-last",
                )}
              >
                {photo ? (
                  <Image
                    src={photo}
                    alt={service.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                ) : (
                  <div className="section-navy absolute inset-0" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                <span className="absolute bottom-4 left-4 font-heading text-5xl font-bold text-white/90 drop-shadow">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <CardContent className="flex flex-col justify-center p-6 md:p-10">
                <div className="flex items-center gap-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gold/12 text-gold-dark ring-1 ring-gold/25 dark:text-gold">
                    <Icon className="size-6" />
                  </span>
                  <h2 className="font-heading text-2xl font-semibold">
                    {service.name}
                  </h2>
                </div>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  {service.description}
                </p>
                {service.features.length > 0 && (
                  <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                    {service.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm"
                      >
                        <CheckCircle2 className="size-4 shrink-0 text-gold" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
                <Link
                  href="/contact"
                  className="mt-6 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-gold"
                >
                  Minta Penawaran
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Coverage as a navy card (not a full band) so it stays separate from
          the navy footer below. */}
      <div className="mx-auto max-w-6xl px-4 pb-16 md:px-6 md:pb-20 lg:px-8">
        <section className="section-navy relative overflow-hidden rounded-3xl px-6 py-12 text-white shadow-2xl shadow-black/15 md:px-12 md:py-14">
          <div className="hero-contours absolute inset-0 opacity-60" />
          <div className="hero-grain pointer-events-none absolute inset-0" />
          <div
            className="pointer-events-none absolute -right-[10%] bottom-0 aspect-[1200/460] w-[80%] bg-[url(/indonesia-dots.svg)] bg-contain bg-no-repeat opacity-[0.12]"
            aria-hidden
          />
          <div className="relative">
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-gold">
              <MapPinned className="size-4" />
              Jangkauan
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight md:text-4xl">
              Jangkauan Pengiriman
            </h2>
            <p className="mt-3 max-w-xl text-white/75">
              Kami menyediakan pengiriman ke seluruh Indonesia, meliputi wilayah:
            </p>
            <div className="mt-8 flex max-w-3xl flex-wrap gap-2.5">
              {coverage.map((region) => (
                <span
                  key={region}
                  className="rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm"
                >
                  {region}
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
