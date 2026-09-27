import { getSessionUser } from "@/lib/auth";
import { getUserApiTokensAction } from "@/server/actions/apiToken";
import { DeveloperApiManager } from "@/components/DeveloperApiManager";
import { Key } from "lucide-react";
import { Metadata } from "next";
import { redirect } from "next/navigation";

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
    <div className="mx-auto max-w-5xl w-full space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-lime-100 px-3 py-1 text-xs font-bold text-lime-950 uppercase tracking-wider font-sans">
          <Key className="h-3.5 w-3.5 text-lime-800" />
          <span>Akses &amp; Kredensial Bot Telegram</span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-950 tracking-tight font-sans">
          Token Akses Telegram
        </h1>

        <p className="text-slate-600 text-xs sm:text-sm lg:text-base max-w-3xl leading-relaxed">
          Kelola token otentikasi Bearer dan izin akses (<em>scopes</em>) untuk bot Telegram dan integrasi agent FairShare Anda secara aman.
        </p>
      </div>

      <DeveloperApiManager tokens={tokens} />
    </div>
  );
}
