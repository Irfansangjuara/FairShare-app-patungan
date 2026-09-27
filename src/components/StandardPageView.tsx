import { FairShareNavbar } from "./FairShareNavbar";
import { PublicFooter } from "./PublicFooter";
import { getSessionUser } from "../lib/auth";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";

interface StandardPageViewProps {
  page: {
    key: string;
    name: string;
    title: string;
    content: string;
    featuredImage?: string | null;
    updatedAt?: Date | string;
  };
}

export async function StandardPageView({ page }: StandardPageViewProps) {
  const user = await getSessionUser();

  // Simple paragraph / markdown formatter
  const renderContent = (text: string) => {
    return text.split("\n\n").map((block, idx) => {
      if (block.startsWith("### ")) {
        return (
          <h3 key={idx} className="text-lg sm:text-xl font-bold text-slate-900 mt-6 mb-2">
            {block.replace("### ", "")}
          </h3>
        );
      }
      if (block.startsWith("- ")) {
        const items = block.split("\n").filter((l) => l.startsWith("- "));
        return (
          <ul key={idx} className="list-disc list-inside space-y-1 text-slate-600 text-sm sm:text-base my-3">
            {items.map((item, itemIdx) => (
              <li key={itemIdx}>{item.replace("- ", "")}</li>
            ))}
          </ul>
        );
      }
      return (
        <p key={idx} className="text-slate-600 text-sm sm:text-base leading-relaxed mb-4">
          {block}
        </p>
      );
    });
  };

  return (
    <div className="min-h-full flex flex-col bg-[#F8FAFC]">
      <FairShareNavbar user={user} />

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 sm:px-6 py-8 sm:py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>

        <article className="card-diskon bg-white p-6 sm:p-10 border border-slate-200">
          <header className="border-b border-slate-100 pb-6 mb-6">
            <span className="inline-flex items-center rounded-full bg-lime-100 text-lime-950 px-3 py-1 text-xs font-bold uppercase tracking-wider mb-3">
              {page.name}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
              {page.title}
            </h1>
            {page.updatedAt && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-3">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  Terakhir diperbarui:{" "}
                  {new Date(page.updatedAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
          </header>

          {page.featuredImage && (
            <div className="mb-6 rounded-2xl overflow-hidden border border-slate-100 max-h-80">
              <img
                src={page.featuredImage}
                alt={page.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="prose prose-slate max-w-none">
            {renderContent(page.content)}
          </div>
        </article>
      </main>

      <PublicFooter />
    </div>
  );
}
