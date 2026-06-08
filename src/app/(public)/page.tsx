import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Plane,
  Ship,
  Truck,
} from "lucide-react";
import { SectionHeader } from "@/components/marketing/section-header";
import { TestimonialsCarousel } from "@/components/marketing/testimonials-carousel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPublicHomeContent } from "@/services/public-site.service";

const iconMap = { Truck, Ship, Plane, Container: Truck } as const;

export default async function HomePage() {
  const content = await getPublicHomeContent();

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="hero-gradient absolute inset-0" />
        <div className="hero-pattern absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 md:px-6 md:py-32 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-gold">
                {content.hero.subtitle}
              </p>
              <h1 className="font-heading text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-[3.25rem] lg:leading-tight">
                {content.hero.title}
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-white/85">
                {content.hero.body}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  nativeButton={false}
                  render={<Link href="/tracking" />}
                  size="lg"
                  className="bg-secondary text-secondary-foreground shadow-lg shadow-gold/25 hover:bg-secondary/90"
                >
                  {content.hero.ctaPrimary}
                  <ArrowRight />
                </Button>
                <Button
                  nativeButton={false}
                  render={<Link href="/services" />}
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
                >
                  {content.hero.ctaSecondary}
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {content.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/15 bg-white/10 p-6 text-white shadow-lg shadow-black/10 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/15"
                >
                  <p className="font-heading text-3xl font-bold text-gold">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-white/75">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Layanan"
            title="Solusi Logistik Terintegrasi"
            description="Pengiriman cepat, aman, dan terpercaya dengan tarif kompetitif untuk kebutuhan bisnis Anda."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {content.offerings.map((service) => {
              const Icon =
                iconMap[service.icon as keyof typeof iconMap] ?? Truck;
              return (
                <Card
                  key={service.slug}
                  className="card-hover group border-border/60"
                >
                  <CardContent className="p-6">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-gold/15 text-primary transition-colors group-hover:from-primary/25 group-hover:to-gold/25">
                      <Icon className="size-6" />
                    </div>
                    <h3 className="mt-4 font-heading text-lg font-semibold">
                      {service.name}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-muted/40 py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="grid items-start gap-12 lg:grid-cols-2">
            <div>
              <SectionHeader
                align="left"
                eyebrow="Keunggulan"
                title={content.offeringsIntro.title}
                description={content.offeringsIntro.description}
              />
              <ul className="mt-8 space-y-4">
                {content.offeringsIntro.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 rounded-lg border border-border/50 bg-card p-4 text-sm shadow-sm"
                  >
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-secondary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Card className="overflow-hidden border-border/60 shadow-md">
              <div className="h-1.5 bg-gradient-to-r from-primary via-gold to-gold-dark" />
              <CardContent className="space-y-6 p-8">
                <div>
                  <h3 className="font-heading text-lg font-semibold text-primary">
                    Visi
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {content.vision}
                  </p>
                </div>
                <div className="border-t border-border/60 pt-6">
                  <h3 className="font-heading text-lg font-semibold text-secondary">
                    Misi
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {content.mission}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {content.testimonials.length > 0 && (
        <section className="py-20 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
            <SectionHeader
              eyebrow="Testimoni"
              title="Apa Kata Klien Kami"
              description="Dipercaya oleh perusahaan di seluruh Indonesia."
            />
            <div className="mt-10 max-w-3xl mx-auto">
              <TestimonialsCarousel items={content.testimonials} />
            </div>
          </div>
        </section>
      )}

      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gold via-gold to-gold-dark p-8 text-center text-white shadow-xl shadow-gold/20 md:p-14">
            <div className="hero-pattern absolute inset-0 opacity-30" />
            <div className="relative">
              <h2 className="font-heading text-2xl font-bold md:text-4xl">
                {content.cta.title}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
                {content.cta.subtitle}
              </p>
              <ul className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-3">
                {content.whyChooseUs.slice(0, 4).map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur-sm"
                  >
                    <CheckCircle2 className="size-4" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted/40 py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Kepercayaan"
            title="Klien Kami"
            description="Dipercaya oleh perusahaan terkemuka di Indonesia."
          />
          <div className="mt-12 grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-4 md:gap-8">
            {content.partners.map((partner) => (
              <div
                key={partner.id}
                className="flex h-32 items-center justify-center overflow-hidden rounded-xl border border-border/50 bg-card p-4 shadow-sm transition-all hover:border-gold/30 hover:shadow-md sm:h-36 md:h-40 md:p-5"
              >
                <div className="relative h-full w-full scale-[1.15] opacity-80 grayscale transition-all hover:opacity-100 hover:grayscale-0 sm:scale-[1.2] md:scale-[1.25]">
                  <Image
                    src={partner.logoUrl}
                    alt={partner.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, 20vw"
                    unoptimized
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl">
            <div className="hero-gradient absolute inset-0" />
            <div className="hero-pattern absolute inset-0 opacity-50" />
            <div className="relative flex flex-col items-center gap-6 px-8 py-14 text-center text-white md:px-16 md:py-20">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                <MapPin className="size-8 text-gold" />
              </div>
              <h2 className="font-heading text-3xl font-bold md:text-4xl">
                {content.coverage.title}
              </h2>
              <p className="max-w-xl text-lg text-white/85">
                {content.coverage.body}
              </p>
              <Button
                nativeButton={false}
                render={<Link href="/contact" />}
                size="lg"
                className="mt-2 bg-secondary text-secondary-foreground shadow-lg shadow-gold/25 hover:bg-secondary/90"
              >
                Hubungi Kami
                <ArrowRight />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
