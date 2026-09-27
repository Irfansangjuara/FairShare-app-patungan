import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ArticleEditor } from "@/components/ArticleEditor";
import { requireAdmin } from "@/lib/auth";

export const metadata = {
  title: "Edit Artikel Blog | Admin FairShare",
  robots: {
    index: false,
    follow: false,
  },
};

interface EditBlogArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditBlogArticlePage({
  params,
}: EditBlogArticlePageProps) {
  await requireAdmin();
  const { id } = await params;

  const article = await db.query.articles.findFirst({
    where: eq(articles.id, id),
  });

  if (!article) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
          Edit Artikel Blog
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Perbarui teks konten, gambar, dan optimasi standar SEO Google untuk artikel ini.
        </p>
      </div>

      <ArticleEditor initialData={article} />
    </main>
  );
}
