import { ArticleEditor } from "../../../../components/ArticleEditor";

export default function NewArticlePage() {
  return (
    <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
          Tulis Artikel Baru
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Buat konten edukatif dan panduan finansial baru untuk blog FairShare.
        </p>
      </div>

      <ArticleEditor />
    </main>
  );
}
