import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { getPublishedNewsBySlug } from "@/services/public-site.service";

interface NewsArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: NewsArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedNewsBySlug(slug);
  if (!article) return { title: "Berita tidak ditemukan" };
  return {
    title: article.title,
    description: article.excerpt ?? undefined,
  };
}

export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  const { slug } = await params;
  const article = await getPublishedNewsBySlug(slug);
  if (!article) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 md:px-6 lg:px-8">
      <Link
        href="/berita"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Kembali ke Berita
      </Link>
      <header className="mt-6">
        <p className="text-sm text-muted-foreground">
          {article.publishedAt
            ? format(article.publishedAt, "dd MMMM yyyy")
            : ""}
          {article.author?.name ? ` · ${article.author.name}` : ""}
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold md:text-4xl">
          {article.title}
        </h1>
        {article.excerpt && (
          <p className="mt-4 text-lg text-muted-foreground">{article.excerpt}</p>
        )}
      </header>
      <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert">
        {article.content.split("\n").map((para, i) =>
          para.trim() ? (
            <p key={i} className="mb-4 leading-relaxed text-muted-foreground">
              {para}
            </p>
          ) : null,
        )}
      </div>
    </article>
  );
}
