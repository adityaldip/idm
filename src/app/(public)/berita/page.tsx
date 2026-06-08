import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { PageHero } from "@/components/marketing/page-hero";
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
                className="card-hover overflow-hidden border-border/60"
              >
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
