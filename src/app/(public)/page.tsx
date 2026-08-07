import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  Compass,
  Container,
  Eye,
  MapPin,
  MapPinned,
  Package,
  PackageCheck,
  PackageSearch,
  Phone,
  Plane,
  Route,
  ShieldCheck,
  Ship,
  Target,
  Truck,
  Users,
  Zap,
} from "lucide-react";
import { CountUp } from "@/components/marketing/count-up";
import { HeroTrackingForm } from "@/components/marketing/hero-tracking-form";
import { LogoMarquee } from "@/components/marketing/logo-marquee";
import { Reveal } from "@/components/marketing/reveal";
import { SectionHeader } from "@/components/marketing/section-header";
import { TestimonialsCarousel } from "@/components/marketing/testimonials-carousel";
import { TrackingGallery } from "@/components/marketing/tracking-gallery";
import { TrackingPreview } from "@/components/marketing/tracking-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getServiceImage } from "@/lib/site-media";
import { getTrackingPhotos } from "@/lib/tracking-media";
import { getPublicHomeContent } from "@/services/public-site.service";

const iconMap = {
  Truck,
  Ship,
  Plane,
  Zap,
  Package,
  Container,
} as const;

const statIconMap = {
  users: Users,
  calendar: CalendarDays,
  truck: Truck,
  map: MapPinned,
} as const;

const stepIconMap = {
  ClipboardList,
  PackageCheck,
  Route,
  ShieldCheck,
} as const;

const TRACKING_HIGHLIGHTS = [
  "Riwayat perjalanan lengkap dengan waktu dan lokasi setiap tahap.",
  "Cukup masukkan nomor resi — tanpa perlu membuat akun atau login.",
  "Dapat diakses kapan saja dari ponsel maupun desktop.",
];

export default async function HomePage() {
  const content = await getPublicHomeContent();
  const trackingPhotos = getTrackingPhotos();

  // Highlight the last word of the headline in brand gold.
  const titleWords = content.hero.title.trim().split(/\s+/);
  const accentWord = titleWords.length > 1 ? titleWords.pop() : null;
  const leadWords = titleWords.join(" ");

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="hero-gradient absolute inset-0" />
        <div className="hero-aurora absolute inset-0" />
        <div className="grid-fade absolute inset-0" />

        <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-32 md:px-6 md:pt-28 md:pb-40 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <span className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold backdrop-blur-sm">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-gold" />
                </span>
                {content.hero.subtitle}
              </span>

              <h1 className="mt-5 font-heading text-4xl font-bold tracking-tight text-balance text-white md:text-5xl lg:text-[3.4rem] lg:leading-[1.08]">
                {leadWords}
                {accentWord && (
                  <>
                    {" "}
                    <span className="text-gradient-gold">{accentWord}</span>
                  </>
                )}
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">
                {content.hero.body}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  nativeButton={false}
                  render={<Link href="/tracking" />}
                  size="lg"
                  className="h-11 bg-secondary px-5 text-secondary-foreground shadow-lg shadow-gold/25 transition-transform hover:bg-secondary/90 hover:-translate-y-0.5"
                >
                  {content.hero.ctaPrimary}
                  <ArrowRight />
                </Button>
                <Button
                  nativeButton={false}
                  render={<Link href="/services" />}
                  size="lg"
                  variant="outline"
                  className="h-11 border-white/30 bg-white/10 px-5 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
                >
                  {content.hero.ctaSecondary}
                </Button>
              </div>

              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                {content.whyChooseUs.slice(0, 3).map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-white/75"
                  >
                    <CheckCircle2 className="size-4 shrink-0 text-gold" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <HeroTrackingForm />

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {content.stats.map((stat) => {
                  const StatIcon =
                    statIconMap[stat.icon as keyof typeof statIconMap] ?? Truck;
                  return (
                    <div
                      key={stat.label}
                      className="group rounded-xl border border-white/15 bg-white/10 p-5 text-white shadow-lg shadow-black/10 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-white/15"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-lg bg-gold/15 text-gold ring-1 ring-gold/25 transition-transform duration-300 group-hover:scale-110">
                          <StatIcon className="size-4" />
                        </span>
                        <CountUp
                          value={stat.value}
                          className="font-heading text-3xl font-bold text-gold"
                        />
                      </div>
                      <p className="mt-2 text-sm text-white/75">{stat.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Soft transition into the next section */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 text-background"
          aria-hidden
        >
          <svg
            viewBox="0 0 1440 90"
            preserveAspectRatio="none"
            className="block h-[60px] w-full md:h-[90px]"
          >
            <path
              fill="currentColor"
              d="M0,54 C240,96 480,96 720,70 C960,44 1200,10 1440,28 L1440,90 L0,90 Z"
            />
          </svg>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────── */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Layanan"
              title="Solusi Logistik Terintegrasi"
              description="Pengiriman cepat, aman, dan terpercaya dengan tarif kompetitif untuk kebutuhan bisnis Anda."
            />
          </Reveal>

          <div className="mt-14 flex flex-wrap justify-center gap-6">
            {content.offerings.map((service, index) => {
              const Icon =
                iconMap[service.icon as keyof typeof iconMap] ?? Truck;
              const photo = getServiceImage(service.slug, service.icon);
              return (
                <Reveal
                  key={service.slug}
                  delay={index * 0.06}
                  className="basis-full sm:basis-[calc(50%-0.75rem)] lg:basis-[calc(33.333%-1rem)]"
                >
                  <Card className="card-glow group h-full border-border/60 py-0 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10">
                    {photo && (
                      <div className="relative aspect-16/9 overflow-hidden">
                        <Image
                          src={photo}
                          alt={service.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      </div>
                    )}
                    <CardContent className="flex h-full flex-col p-6">
                      <div className="flex items-start justify-between">
                        <span className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-gold/25 text-primary shadow-sm ring-1 ring-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:from-primary group-hover:to-primary/80 group-hover:text-primary-foreground group-hover:ring-primary/30">
                          <Icon className="size-6" />
                        </span>
                        <span className="font-mono text-xs text-muted-foreground/50">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>

                      <h3 className="mt-5 font-heading text-lg font-semibold">
                        {service.name}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {service.description}
                      </p>

                      {service.features.length > 0 && (
                        <ul className="mt-4 space-y-2">
                          {service.features.slice(0, 3).map((feature) => (
                            <li
                              key={feature}
                              className="flex items-start gap-2 text-xs text-muted-foreground"
                            >
                              <CheckCircle2 className="mt-px size-3.5 shrink-0 text-secondary" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      )}

                      <Link
                        href="/services"
                        className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-primary transition-colors hover:text-secondary"
                      >
                        Selengkapnya
                        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
                    </CardContent>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Trust band ───────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gold via-gold via-65% to-gold-dark py-14 text-white md:py-16">
        <div className="hero-pattern absolute inset-0 opacity-30" />
        <div className="absolute -top-28 -left-24 size-72 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute -right-24 -bottom-32 size-80 rounded-full bg-white/10 blur-3xl" />

        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 md:px-6 lg:flex-row lg:justify-between lg:px-8">
          <Reveal className="max-w-lg text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest backdrop-blur-sm">
              <ShieldCheck className="size-3.5" />
              Terpercaya
            </span>
            <h2 className="mt-4 font-heading text-2xl font-bold md:text-3xl">
              {content.cta.title}
            </h2>
            <p className="mt-3 text-white/90">{content.cta.subtitle}</p>
          </Reveal>

          <Reveal delay={0.1} className="w-full max-w-xl">
            <ul className="flex flex-wrap justify-center gap-2.5 lg:justify-end">
              {content.whyChooseUs.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm ring-1 ring-white/20 backdrop-blur-sm transition-colors hover:bg-white/25"
                >
                  <CheckCircle2 className="size-4 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="section-muted border-t border-border/50 py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Alur Kerja"
              title="Bagaimana Kami Bekerja"
              description="Empat langkah sederhana, dari permintaan penawaran hingga barang diterima di tujuan."
            />
          </Reveal>

          <div className="relative mt-14">
            <div
              className="pointer-events-none absolute inset-x-0 top-7 hidden lg:block"
              aria-hidden
            >
              <svg
                viewBox="0 0 100 2"
                preserveAspectRatio="none"
                className="h-0.5 w-full text-border"
              >
                <line
                  x1="10"
                  y1="1"
                  x2="90"
                  y2="1"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="dash-flow"
                />
              </svg>
            </div>

            <ol className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {content.processSteps.map((step, index) => {
                const StepIcon =
                  stepIconMap[step.icon as keyof typeof stepIconMap] ??
                  ClipboardList;
                return (
                  <li key={step.title}>
                    <Reveal delay={index * 0.08}>
                      <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                        <span className="relative flex size-14 items-center justify-center rounded-2xl bg-card text-primary shadow-md ring-1 ring-border">
                          <StepIcon className="size-6" />
                          <span className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-secondary font-mono text-[11px] font-bold text-secondary-foreground shadow-sm">
                            {index + 1}
                          </span>
                        </span>
                        <h3 className="mt-5 font-heading text-base font-semibold">
                          {step.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </Reveal>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      {/* ── Tracking showcase ────────────────────────────────── */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <SectionHeader
                align="left"
                eyebrow="Pelacakan"
                title="Pantau Setiap Langkah Pengiriman"
                description="Masukkan nomor resi dan lihat posisi terakhir barang Anda — lengkap dengan waktu dan lokasi setiap tahapnya."
              />

              <ul className="mt-8 space-y-3">
                {TRACKING_HIGHLIGHTS.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-4 text-sm shadow-sm"
                  >
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-secondary" />
                    {item}
                  </li>
                ))}
              </ul>

              <Button
                nativeButton={false}
                render={<Link href="/tracking" />}
                size="lg"
                className="mt-8 h-11 bg-secondary px-5 text-secondary-foreground shadow-lg shadow-gold/25 transition-transform hover:-translate-y-0.5 hover:bg-secondary/90"
              >
                <PackageSearch />
                Lacak Pengiriman
              </Button>
            </Reveal>

            <Reveal delay={0.12}>
              <TrackingPreview />
            </Reveal>
          </div>

          {trackingPhotos.length > 0 && (
            <div className="mt-16 md:mt-20">
              <Reveal className="mb-8">
                <SectionHeader
                  eyebrow="Layanan"
                  title="Dari Penjemputan Sampai Serah Terima"
                  description="Setiap tahap pengiriman ditangani tim kami dengan prosedur yang jelas."
                />
              </Reveal>
              <TrackingGallery photos={trackingPhotos} />
            </div>
          )}
        </div>
      </section>

      {/* ── Advantages + vision & mission ────────────────────── */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="grid items-start gap-12 lg:grid-cols-2">
            <div>
              <Reveal>
                <SectionHeader
                  align="left"
                  eyebrow="Keunggulan"
                  title={content.offeringsIntro.title}
                  description={content.offeringsIntro.description}
                />
              </Reveal>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {content.offeringsIntro.items.map((item, index) => (
                  <Reveal key={item} delay={index * 0.05}>
                    <div className="card-glow group flex h-full items-start gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary/15 text-secondary ring-1 ring-secondary/20 transition-colors duration-300 group-hover:bg-secondary group-hover:text-secondary-foreground">
                        <Check className="size-4" />
                      </span>
                      <span className="text-sm leading-relaxed">{item}</span>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            <Reveal delay={0.1}>
              <Card className="overflow-hidden border-border/60 shadow-lg shadow-primary/5">
                <div className="h-1.5 bg-gradient-to-r from-primary via-gold to-gold-dark" />
                <CardContent className="space-y-6 p-8">
                  <div className="flex gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                      <Eye className="size-5" />
                    </span>
                    <div>
                      <h3 className="font-heading text-lg font-semibold text-primary">
                        Visi
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {content.vision}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 border-t border-border/60 pt-6">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-secondary ring-1 ring-secondary/20">
                      <Target className="size-5" />
                    </span>
                    <div>
                      <h3 className="font-heading text-lg font-semibold text-secondary">
                        Misi
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {content.mission}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      {content.testimonials.length > 0 && (
        <section className="section-muted relative overflow-hidden border-t border-border/50 py-20 md:py-24">
          <div className="absolute top-10 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-gold/8 blur-3xl" />
          <div className="relative mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
            <Reveal>
              <SectionHeader
                eyebrow="Testimoni"
                title="Apa Kata Klien Kami"
                description="Dipercaya oleh perusahaan di seluruh Indonesia."
              />
            </Reveal>
            <Reveal delay={0.1} className="mx-auto mt-10 max-w-3xl">
              <TestimonialsCarousel items={content.testimonials} />
            </Reveal>
          </div>
        </section>
      )}

      {/* ── Partners ─────────────────────────────────────────── */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Kepercayaan"
              title="Klien Kami"
              description="Dipercaya oleh perusahaan terkemuka di Indonesia."
            />
          </Reveal>
        </div>
        <div className="mt-12">
          <LogoMarquee items={content.partners} />
        </div>
      </section>

      {/* ── Coverage & closing CTA ───────────────────────────── */}
      <section className="pb-20 md:pb-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl shadow-xl shadow-primary/10">
            <div className="hero-gradient absolute inset-0" />
            <div className="hero-aurora absolute inset-0" />
            <div className="hero-pattern absolute inset-0 opacity-40" />

            <div className="relative grid gap-10 px-8 py-14 text-white md:px-14 md:py-20 lg:grid-cols-2 lg:items-center">
              <Reveal>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold backdrop-blur-sm">
                  <Compass className="size-3.5" />
                  Jangkauan
                </span>
                <h2 className="mt-5 font-heading text-3xl font-bold text-balance md:text-4xl">
                  {content.coverage.title}
                </h2>
                <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/85">
                  {content.coverage.body}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button
                    nativeButton={false}
                    render={<Link href="/contact" />}
                    size="lg"
                    className="h-11 bg-secondary px-5 text-secondary-foreground shadow-lg shadow-gold/25 transition-transform hover:bg-secondary/90 hover:-translate-y-0.5"
                  >
                    Hubungi Kami
                    <ArrowRight />
                  </Button>
                  <Button
                    nativeButton={false}
                    render={<a href={`tel:${content.branding.phoneHref}`} />}
                    size="lg"
                    variant="outline"
                    className="h-11 border-white/30 bg-white/10 px-5 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
                  >
                    <Phone />
                    {content.branding.phone}
                  </Button>
                </div>
              </Reveal>

              <Reveal delay={0.12} className="relative">
                <div className="float-slow absolute -top-12 -right-4 hidden size-24 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm lg:block" />
                <div className="relative rounded-2xl border border-white/15 bg-white/10 p-6 shadow-lg shadow-black/10 backdrop-blur-md">
                  <p className="flex items-center gap-2 text-sm font-semibold text-white/80">
                    <MapPin className="size-4 text-gold" />
                    Wilayah operasional
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {content.coverage.regions.slice(0, 18).map((region) => (
                      <li
                        key={region}
                        className="rounded-full bg-white/15 px-3 py-1.5 text-sm text-white/90 ring-1 ring-white/15 transition-colors hover:bg-white/25"
                      >
                        {region}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
