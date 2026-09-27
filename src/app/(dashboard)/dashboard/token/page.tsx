import { getSessionUser } from "@/lib/auth";
import { getUserApiTokensAction } from "@/server/actions/apiToken";
import { DeveloperApiManager } from "@/components/DeveloperApiManager";
import { Key, ArrowLeft, Bot } from "lucide-react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Token Akses Telegram | FairShare",
  description:
    "Token akses dan kredensial aman untuk integrasi bot Telegram dan agent otomasi yang terhubung dengan FairShare.",
  alternates: {
    canonical: "/dashboard/token",
  },
};

export default async function DashboardTokenPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?redirect=/dashboard/token");
  }

  const tokens = await getUserApiTokensAction();

  return (
    <div className="mx-auto max-w-5xl w-full space-y-6">
      {/* Navigation & Header */}
      <div className="space-y-1">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Dashboard</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-lime-100 px-3 py-1 text-xs font-bold text-lime-950 uppercase tracking-wider font-sans mb-2">
              <Key className="h-3.5 w-3.5 text-lime-800" />
              <span>Akses &amp; Kredensial Bot Telegram</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight font-sans">
              Token Akses Telegram
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Kelola token otentikasi Bearer dan izin akses (<em>scopes</em>) untuk bot Telegram dan integrasi agent FairShare Anda secara aman.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/settings"
              className="btn-pill-primary text-xs py-2 px-3.5 inline-flex items-center gap-1.5 font-semibold"
            >
              <Bot className="h-3.5 w-3.5" />
              <span>Pengaturan AI &amp; Bot</span>
            </Link>
          </div>
        </div>
      </div>

      <DeveloperApiManager tokens={tokens} />
    </div>
  );
}
