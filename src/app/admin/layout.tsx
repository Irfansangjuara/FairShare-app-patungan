import { getSessionUser } from "../../lib/auth";
import { redirect } from "next/navigation";
import { AdminNavbar } from "../../components/AdminNavbar";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login?redirect=/admin");
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="card-diskon bg-white p-8 max-w-md w-full text-center space-y-4 border border-rose-200 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Akses Terbatas (403)</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Halaman ini khusus untuk Administrator FairShare. Akun Anda (<strong>{user.email}</strong>) tidak memiliki hak akses administrator.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="btn-pill-primary text-xs py-2 px-5 inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali ke Dashboard Saya</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col bg-[#F8FAFC]">
      <AdminNavbar user={user} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
