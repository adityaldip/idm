import type { Metadata } from "next";
import { Building2, Eye, Target } from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";
import { Card, CardContent } from "@/components/ui/card";
import { getPublicAboutContent } from "@/services/public-site.service";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description:
    "Tentang PT Intan Daya Mandiri — mitra bisnis terpercaya di bidang logistik sejak 2013.",
};

export default async function AboutPage() {
  const content = await getPublicAboutContent();

  return (
    <>
      <PageHero
        eyebrow={content.branding.tagline}
        title={content.title}
        description={content.history}
      />

      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="card-hover overflow-hidden border-primary/20">
            <div className="h-1 bg-primary" />
            <CardContent className="p-6">
              <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Target className="size-5" />
              </div>
              <h2 className="mt-4 font-heading text-xl font-semibold text-primary">
                Misi Kami
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {content.mission}
              </p>
            </CardContent>
          </Card>
          <Card className="card-hover overflow-hidden border-secondary/30">
            <div className="h-1 bg-gradient-to-r from-gold to-gold-dark" />
            <CardContent className="p-6">
              <div className="flex size-11 items-center justify-center rounded-lg bg-gold/15 text-secondary">
                <Eye className="size-5" />
              </div>
              <h2 className="mt-4 font-heading text-xl font-semibold text-secondary">
                Visi Kami
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {content.vision}
              </p>
            </CardContent>
          </Card>
          <Card className="card-hover overflow-hidden">
            <div className="h-1 bg-muted-foreground/30" />
            <CardContent className="p-6">
              <div className="flex size-11 items-center justify-center rounded-lg bg-muted text-foreground">
                <Building2 className="size-5" />
              </div>
              <h2 className="mt-4 font-heading text-xl font-semibold">
                Mengapa Memilih Kami
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {content.whyUs}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 overflow-hidden border-border/60 shadow-sm">
          <div className="h-1.5 bg-gradient-to-r from-primary via-gold to-gold-dark" />
          <CardContent className="space-y-4 p-8">
            <h2 className="font-heading text-2xl font-semibold">Siapa Kami</h2>
            <p className="leading-relaxed text-muted-foreground">
              {content.short}
            </p>
            <p className="leading-relaxed text-muted-foreground">
              {content.about}
            </p>
            <div className="inline-flex flex-wrap gap-3 pt-2">
              <span className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                Berdiri {content.foundedDate}
              </span>
              <span className="rounded-full bg-gold/15 px-4 py-1.5 text-sm font-medium text-secondary">
                Rebranding {content.rebrandYear}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
