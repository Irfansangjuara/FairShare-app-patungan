import { ArticleEditor } from "@/components/ArticleEditor";
import { requireAdmin } from "@/lib/auth";

export const metadata = {
  title: "Tulis Artikel Baru | Admin FairShare",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminNewBlogArticlePage() {
  await requireAdmin();

  return (
    <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
          Tulis Artikel Blog Baru
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Buat konten edukatif dan panduan finansial baru yang akan otomatis dipublikasikan di halaman /blog.
        </p>
      </div>

      <ArticleEditor />
    </main>
  );
}
