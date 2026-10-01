import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Newspaper } from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";
import { PAGE_HERO_IMAGES } from "@/lib/site-media";
import { Card, CardContent } from "@/components/ui/card";
import { getPublishedNews } from "@/services/public-site.service";

export const metadata: Metadata = {
  title: "Berita",
  description: "Berita dan update terbaru dari PT Intan Daya Mandiri.",
};

export default async function NewsPage() {
  const articles = await getPublishedNews();

  return (
    <>
      <PageHero
        eyebrow="Berita"
        title="Berita & Update"
        description="Informasi terbaru seputar layanan logistik dan kegiatan perusahaan."
        image={PAGE_HERO_IMAGES.berita}
        breadcrumb="Berita"
      />

      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20 lg:px-8">
        {articles.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Belum ada berita yang dipublikasikan.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Card
                key={article.id}
                className="card-hover group overflow-hidden border-border/60 py-0"
              >
                <Link
                  href={`/berita/${article.slug}`}
                  className="relative block aspect-16/9 overflow-hidden"
                >
                  {article.coverImage ? (
                    <Image
                      src={article.coverImage}
                      alt={article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    // No cover set in the CMS — branded placeholder beats a gap.
                    <span className="hero-gradient flex size-full items-center justify-center">
                      <Newspaper className="size-10 text-white/40" />
                    </span>
                  )}
                </Link>
                <CardContent className="p-6">
                  <p className="text-xs text-muted-foreground">
                    {article.publishedAt
                      ? format(article.publishedAt, "dd MMM yyyy")
                      : "—"}
                  </p>
                  <h2 className="mt-2 font-heading text-lg font-semibold">
                    <Link
                      href={`/berita/${article.slug}`}
                      className="hover:text-primary"
                    >
                      {article.title}
                    </Link>
                  </h2>
                  {article.excerpt && (
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                      {article.excerpt}
                    </p>
                  )}
                  <Link
                    href={`/berita/${article.slug}`}
                    className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
                  >
                    Baca selengkapnya →
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
