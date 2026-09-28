import { requireAdmin } from "@/lib/auth";
import { OFFICIAL_AI_AGENT_TOKEN } from "@/lib/api/auth";
import { AdminAgentView } from "@/components/AdminAgentView";
import Link from "next/link";
import { ArrowLeft, Bot } from "lucide-react";

export const metadata = {
  title: "AI Agent & Integrasi API",
  description: "Kelola token akses AI Agent untuk otomasi konten blog dan manajemen dashboard.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminAgentPage() {
  await requireAdmin();

  return (
    <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors font-semibold"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali ke Overview</span>
            </Link>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight flex items-center gap-2.5">
            <Bot className="h-7 w-7 text-lime-600" />
            <span>AI Agent & API Dashboard</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-500">
            Konfigurasi token API untuk agen kecerdasan buatan (AI Agent) agar dapat memperbarui artikel blog publik dan mengaudit dashboard admin secara otomatis.
          </p>
        </div>
      </div>

      <AdminAgentView token={OFFICIAL_AI_AGENT_TOKEN} />
    </main>
  );
}
