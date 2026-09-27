import { getArticleBySlug, getSiteSettings } from "../../../server/queries";
import { getSessionUser } from "../../../lib/auth";
import { Navbar } from "../../../components/Navbar";
import { PublicFooter } from "../../../components/PublicFooter";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Share2, Tag, BookOpen } from "lucide-react";
import { Metadata } from "next";

interface ArticleDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ArticleDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug, true);
  const settings = await getSiteSettings();

  if (!article) {
    return {
      title: `Artikel Tidak Ditemukan | ${settings.siteName}`,
    };
  }

  return {
    title: article.seoTitle || `${article.title} | ${settings.siteName}`,
    description: article.seoDescription || article.summary || article.title,
    alternates: {
      canonical: article.canonicalUrl || `/blog/${article.slug}`,
    },
    robots: {
      index: !article.isNoindex && article.status === "published",
      follow: !article.isNoindex && article.status === "published",
    },
    openGraph: {
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.summary || article.title,
      images: article.featuredImage ? [article.featuredImage] : undefined,
      type: "article",
      publishedTime: article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined,
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const user = await getSessionUser();
  const { slug } = await params;
  const settings = await getSiteSettings();

  // Allow admin to preview draft
  const isAdmin = user?.role === "admin";
  const article = await getArticleBySlug(slug, isAdmin);

  if (!article) {
    notFound();
  }

  // Requirement: Draft articles cannot be accessed by public visitors
  if (article.status !== "published" && !isAdmin) {
    notFound();
  }

  // Content formatter for paragraphs, headings, and lists
  const renderContent = (text: string) => {
    return text.split("\n\n").map((block, idx) => {
      if (block.startsWith("### ")) {
        return (
          <h3 key={idx} className="text-xl sm:text-2xl font-bold text-slate-950 mt-8 mb-3">
            {block.replace("### ", "")}
          </h3>
        );
      }
      if (block.startsWith("## ")) {
        return (
          <h2 key={idx} className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-10 mb-4 pb-2 border-b border-slate-100">
            {block.replace("## ", "")}
          </h2>
        );
      }
      if (block.startsWith("- ")) {
        const items = block.split("\n").filter((l) => l.startsWith("- "));
        return (
          <ul key={idx} className="list-disc list-inside space-y-2 text-slate-700 text-sm sm:text-base my-4">
            {items.map((item, itemIdx) => (
              <li key={itemIdx}>{item.replace("- ", "")}</li>
            ))}
          </ul>
        );
      }
      return (
        <p key={idx} className="text-slate-700 text-sm sm:text-base leading-relaxed mb-5">
          {block}
        </p>
      );
    });
  };

  return (
    <div className="min-h-full flex flex-col bg-[#F8FAFC]">
      <Navbar user={user} />

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 sm:px-6 py-8 sm:py-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Semua Artikel</span>
          </Link>

          {isAdmin && (
            <Link
              href={`/admin/blog/${article.id}/edit`}
              className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors"
            >
              Edit di Admin
            </Link>
          )}
        </div>

        {/* Google SEO JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: article.seoTitle || article.title,
              description: article.seoDescription || article.summary || article.title,
              image: article.featuredImage ? [article.featuredImage] : undefined,
              datePublished: article.publishedAt
                ? new Date(article.publishedAt).toISOString()
                : undefined,
              dateModified: article.updatedAt
                ? new Date(article.updatedAt).toISOString()
                : undefined,
              author: {
                "@type": "Person",
                name: article.author?.name || "Admin FairShare",
              },
              publisher: {
                "@type": "Organization",
                name: settings.siteName || "FairShare",
              },
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": article.canonicalUrl || `https://fairshare.copilotmarketing.id/blog/${article.slug}`,
              },
            }),
          }}
        />

        {article.status === "draft" && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-semibold flex items-center justify-between">
            <span>⚠️ Status: DRAFT — Artikel ini hanya terlihat oleh Administrator.</span>
          </div>
        )}

        <article className="card-diskon bg-white p-6 sm:p-12 border border-slate-200 space-y-8">
          <header className="space-y-4">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
              {article.title}
            </h1>

            {article.summary && (
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
                {article.summary}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>
                  {article.publishedAt
                    ? new Date(article.publishedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Draft Belum Terbit"}
                </span>
              </div>

              {article.author?.name && (
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4 text-slate-400" />
                  <span>{article.author.name}</span>
                </div>
              )}
            </div>
          </header>

          {article.featuredImage && (
            <div className="rounded-2xl overflow-hidden border border-slate-100 max-h-96 w-full">
              <img
                src={article.featuredImage}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="prose prose-slate max-w-none pt-2">
            {renderContent(article.content)}
          </div>
        </article>
      </main>

      <PublicFooter />
    </div>
  );
}
