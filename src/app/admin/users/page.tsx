import { requireAdmin } from "@/lib/auth";
import { getAllUsersAction } from "@/server/actions/userManagement";
import { UserManagementView } from "@/components/UserManagementView";
import Link from "next/link";
import { Users, ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Manajemen Pengguna",
  description: "Kelola akun pengguna, hak akses administrator, dan atur kredensial.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminUsersPage() {
  const admin = await requireAdmin();
  const users = await getAllUsersAction();

  return (
    <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      {/* Page Header */}
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
            <span>Manajemen Pengguna</span>
            <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-mono font-bold text-slate-700">
              {users.length}
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-500">
            Kelola seluruh akun terdaftar, atur hak akses administrator, buat akun baru, dan audit partisipasi event patungan.
          </p>
        </div>
      </div>

      {/* User Management View */}
      <UserManagementView initialUsers={users} currentAdminId={admin.id} />
    </main>
  );
}
