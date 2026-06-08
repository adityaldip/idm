import type { Metadata } from "next";
import { Plane, Ship, Truck } from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";
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

const iconMap = { Truck, Ship, Plane, Container: Truck } as const;

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
      />

      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {offerings.map((service) => {
            const Icon =
              iconMap[service.icon as keyof typeof iconMap] ?? Truck;
            return (
              <Card
                key={service.slug}
                className="card-hover overflow-hidden border-border/60"
              >
                <div className="h-1 bg-gradient-to-r from-primary/80 to-gold/80" />
                <CardContent className="p-8">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-gold/15 text-primary">
                    <Icon className="size-7" />
                  </div>
                  <h2 className="mt-5 font-heading text-xl font-semibold">
                    {service.name}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                  <ul className="mt-5 space-y-2.5">
                    {service.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2.5 text-sm text-muted-foreground"
                      >
                        <span className="size-2 rounded-full bg-gradient-to-r from-gold to-gold-dark" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-12 overflow-hidden border-border/60 bg-muted/30 shadow-sm">
          <div className="h-1 bg-primary" />
          <CardContent className="p-8">
            <h2 className="font-heading text-2xl font-semibold">
              Jangkauan Pengiriman
            </h2>
            <p className="mt-2 text-muted-foreground">
              Kami menyediakan pengiriman ke seluruh Indonesia, meliputi wilayah:
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {coverage.map((region) => (
                <span
                  key={region}
                  className="rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary"
                >
                  {region}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
