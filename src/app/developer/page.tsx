import { getSessionUser } from "../../lib/auth";
import { getUserApiTokensAction } from "../../server/actions/apiToken";
import { Navbar } from "../../components/Navbar";
import { PublicFooter } from "../../components/PublicFooter";
import { DeveloperApiManager } from "../../components/DeveloperApiManager";
import Link from "next/link";
import { Code, Key, ArrowRight, ShieldCheck, Terminal } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dokumentasi API & Token AI Agent | FairShare",
  description: "Dokumentasi REST API lengkap dan manajemen token untuk AI agent eksternal yang terhubung dengan FairShare.",
  alternates: {
    canonical: "/developer",
  },
};

export default async function DeveloperPage() {
  const user = await getSessionUser();
  const tokens = user ? await getUserApiTokensAction() : [];

  return (
    <div className="min-h-full flex flex-col bg-[#F8FAFC]">
      <Navbar user={user} />

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-lime-100 px-3 py-1 text-xs font-bold text-lime-950 uppercase tracking-wider">
            <Terminal className="h-3.5 w-3.5" />
            <span>Developer & AI Agent Gateway</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Dokumentasi API & Token AI Agent
          </h1>

          <p className="text-slate-600 text-xs sm:text-base max-w-3xl leading-relaxed">
            Hubungkan agent otomasi eksternal (seperti LangChain, CrewAI, AutoGen, atau custom bot Anda) ke data campaign FairShare secara aman dengan token Bearer dan kontrol hak akses (*scopes*) granular.
          </p>
        </div>

        {!user ? (
          <div className="card-diskon bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-slate-800">
            <div className="space-y-1">
              <h3 className="text-base font-bold">Ingin Menggunakan API Token?</h3>
              <p className="text-xs text-slate-400">
                Silakan masuk atau buat akun FairShare terlebih dahulu untuk meng-generate token otentikasi AI agent Anda.
              </p>
            </div>
            <Link
              href="/login?redirect=/developer"
              className="btn-pill-lime text-xs sm:text-sm py-2 px-5 font-bold shrink-0"
            >
              <span>Masuk untuk Buat Token</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : null}

        <DeveloperApiManager tokens={tokens} />
      </main>

      <PublicFooter />
    </div>
  );
}
