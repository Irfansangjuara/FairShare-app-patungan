import { getPublishedArticles, getSiteSettings } from "../../server/queries";
import { getSessionUser } from "../../lib/auth";
import { FairShareNavbar } from "../../components/FairShareNavbar";
import { PublicFooter } from "../../components/PublicFooter";
import Link from "next/link";
import { Calendar, ArrowRight, BookOpen, Clock, Tag } from "lucide-react";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `Blog & Panduan Finansial Trip | ${settings.siteName}`,
    description: "Tips, panduan, dan artikel seputar cara mudah mengelola patungan, liburan hemat, dan keuangan bersama.",
    alternates: {
      canonical: "/blog",
    },
  };
}

export default async function BlogIndexPage() {
  const user = await getSessionUser();
  const articles = await getPublishedArticles();

  return (
    <div className="min-h-full flex flex-col bg-[#F8FAFC]">
      <FairShareNavbar user={user} />

      <main className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 py-8 sm:py-14">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-lime-100 px-3 py-1 text-xs font-bold text-lime-950 uppercase tracking-wider">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Blog & Wawasan</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-950 tracking-tight">
            Panduan & Tips Patungan Cerdas
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Artikel praktis seputar transparansi keuangan trip, tips liburan hemat bersama teman, dan cara menyelesaikan tagihan grup tanpa ribet.
          </p>
        </div>

        {/* Article Grid */}
        {articles.length === 0 ? (
          <div className="card-diskon bg-white p-12 text-center max-w-md mx-auto border border-slate-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 mx-auto mb-3">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Belum Ada Artikel Dipublikasikan</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Artikel informatif sedang dipersiapkan oleh tim redaksi kami. Kunjungi kembali dalam waktu dekat!
            </p>
            {user?.role === "admin" && (
              <Link
                href="/admin/blog/new"
                className="btn-pill-lime text-xs py-2 px-4 inline-flex items-center gap-1.5 font-bold"
              >
                <span>Tulis Artikel Pertama</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((art) => (
              <article
                key={art.id}
                className="card-diskon bg-white border border-slate-200 overflow-hidden flex flex-col group hover:-translate-y-1 transition-all"
              >
                {art.featuredImage ? (
                  <div className="aspect-video w-full overflow-hidden bg-slate-100 relative">
                    <img
                      src={art.featuredImage}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex items-center justify-center p-6 text-center">
                    <span className="text-[#b7e913] font-bold text-sm tracking-wide line-clamp-2">
                      {art.title}
                    </span>
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {art.publishedAt
                          ? new Date(art.publishedAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Draft"}
                      </span>
                      {art.author?.name && (
                        <>
                          <span>•</span>
                          <span>{art.author.name}</span>
                        </>
                      )}
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-slate-950 group-hover:text-lime-600 transition-colors line-clamp-2">
                      <Link href={`/blog/${art.slug}`}>{art.title}</Link>
                    </h2>

                    {art.summary && (
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {art.summary}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-900 group-hover:text-lime-600">
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
