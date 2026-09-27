import { getSessionUser } from "@/lib/auth";
import { getUserApiTokensAction } from "@/server/actions/apiToken";
import { DeveloperApiManager } from "@/components/DeveloperApiManager";
import { Terminal } from "lucide-react";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dokumentasi API & Token AI Agent | FairShare",
  description:
    "Dokumentasi REST API lengkap dan manajemen token untuk AI agent eksternal yang terhubung dengan FairShare.",
  alternates: {
    canonical: "/developer",
  },
};

export default async function DeveloperPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?redirect=/developer");
  }

  const tokens = await getUserApiTokensAction();

  return (
    <div className="mx-auto max-w-5xl w-full space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-lime-100 px-3 py-1 text-xs font-bold text-lime-950 uppercase tracking-wider font-sans">
          <Terminal className="h-3.5 w-3.5 text-lime-800" />
          <span>Developer &amp; AI Agent Gateway</span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-950 tracking-tight font-sans">
          Dokumentasi API &amp; Token AI Agent
        </h1>

        <p className="text-slate-600 text-xs sm:text-sm lg:text-base max-w-3xl leading-relaxed">
          Hubungkan agent otomasi eksternal (seperti LangChain, CrewAI, AutoGen, atau custom bot Anda) ke data event FairShare secara aman dengan token Bearer dan kontrol hak akses (<em>scopes</em>) granular.
        </p>
      </div>

      <DeveloperApiManager tokens={tokens} />
    </div>
  );
}
