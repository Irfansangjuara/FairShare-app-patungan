"use client";

import { useState, useTransition } from "react";
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Key,
  Trash2,
  Search,
  Filter,
  Check,
  X,
  AlertCircle,
  Calendar,
  Lock,
  Mail,
  User,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import {
  createUserAction,
  updateUserRoleAction,
  resetUserPasswordAction,
  deleteUserAction,
  type UserListItem,
} from "@/server/actions/userManagement";

interface UserManagementViewProps {
  initialUsers: UserListItem[];
  currentAdminId: string;
}

export function UserManagementView({
  initialUsers,
  currentAdminId,
}: UserManagementViewProps) {
  const [usersList, setUsersList] = useState<UserListItem[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [isPending, startTransition] = useTransition();

  // Alert Feedback
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [roleModalUser, setRoleModalUser] = useState<UserListItem | null>(null);
  const [passwordModalUser, setPasswordModalUser] = useState<UserListItem | null>(null);
  const [deleteModalUser, setDeleteModalUser] = useState<UserListItem | null>(null);

  // Password reset state
  const [newPassword, setNewPassword] = useState("");

  // Role change state
  const [selectedNewRole, setSelectedNewRole] = useState<"user" | "admin">("user");

  // Filtering
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole =
      roleFilter === "all" ? true : u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalUsers = usersList.length;
  const adminCount = usersList.filter((u) => u.role === "admin").length;
  const regularCount = usersList.filter((u) => u.role !== "admin").length;
  const activeEventUsers = usersList.filter((u) => u.eventCount > 0).length;

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  // 1. Handle Create User
  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createUserAction(null, formData);
      if (res?.error) {
        showFeedback("error", res.error);
      } else {
        showFeedback("success", "Pengguna baru berhasil ditambahkan!");
        setIsCreateOpen(false);
        // Optimistic refresh
        const name = formData.get("name") as string;
        const email = (formData.get("email") as string).toLowerCase().trim();
        const role = (formData.get("role") || "user") as string;
        setUsersList((prev) => [
          {
            id: `temp-${Date.now()}`,
            name,
            email,
            role,
            createdAt: new Date(),
            eventCount: 0,
          },
          ...prev,
        ]);
      }
    });
  };

  // 2. Handle Update Role
  const handleRoleUpdate = async () => {
    if (!roleModalUser) return;
    startTransition(async () => {
      const res = await updateUserRoleAction(roleModalUser.id, selectedNewRole);
      if (res?.error) {
        showFeedback("error", res.error);
      } else {
        showFeedback(
          "success",
          `Role ${roleModalUser.name} berhasil diubah menjadi ${
            selectedNewRole === "admin" ? "Administrator" : "Pengguna Biasa"
          }`
        );
        setUsersList((prev) =>
          prev.map((u) =>
            u.id === roleModalUser.id ? { ...u, role: selectedNewRole } : u
          )
        );
        setRoleModalUser(null);
      }
    });
  };

  // 3. Handle Reset Password
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser) return;
    startTransition(async () => {
      const res = await resetUserPasswordAction(passwordModalUser.id, newPassword);
      if (res?.error) {
        showFeedback("error", res.error);
      } else {
        showFeedback("success", `Kata sandi untuk ${passwordModalUser.name} berhasil diperbarui.`);
        setPasswordModalUser(null);
        setNewPassword("");
      }
    });
  };

  // 4. Handle Delete User
  const handleDeleteUser = async () => {
    if (!deleteModalUser) return;
    startTransition(async () => {
      const res = await deleteUserAction(deleteModalUser.id);
      if (res?.error) {
        showFeedback("error", res.error);
      } else {
        showFeedback("success", `Akun ${deleteModalUser.name} telah berhasil dihapus.`);
        setUsersList((prev) => prev.filter((u) => u.id !== deleteModalUser.id));
        setDeleteModalUser(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs sm:text-sm font-semibold shadow-md animate-in fade-in slide-in-from-top-2 duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 hover:bg-black/20 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="card-diskon p-4 bg-white border border-slate-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Akun
          </span>
          <p className="text-2xl font-extrabold font-mono text-slate-950 mt-1">
            {totalUsers}
          </p>
          <span className="text-[11px] text-slate-500">Terdaftar di sistem</span>
        </div>

        <div className="card-diskon p-4 bg-white border border-slate-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
            Administrator
          </span>
          <p className="text-2xl font-extrabold font-mono text-purple-900 mt-1">
            {adminCount}
          </p>
          <span className="text-[11px] text-purple-600">Hak akses penuh</span>
        </div>

        <div className="card-diskon p-4 bg-white border border-slate-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
            User Biasa
          </span>
          <p className="text-2xl font-extrabold font-mono text-blue-900 mt-1">
            {regularCount}
          </p>
          <span className="text-[11px] text-blue-600">Akses aplikasi standar</span>
        </div>

        <div className="card-diskon p-4 bg-white border border-slate-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            User Aktif Event
          </span>
          <p className="text-2xl font-extrabold font-mono text-emerald-900 mt-1">
            {activeEventUsers}
          </p>
          <span className="text-[11px] text-emerald-600">Memiliki event patungan</span>
        </div>
      </div>

      {/* Action Bar: Search, Role Filter, Add Button */}
      <div className="card-diskon p-4 bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau email pengguna..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none transition-colors"
            />
          </div>

          {/* Role Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-full text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => setRoleFilter("all")}
              className={`px-3 py-1 rounded-full transition-colors ${
                roleFilter === "all"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Semua ({totalUsers})
            </button>
            <button
              onClick={() => setRoleFilter("admin")}
              className={`px-3 py-1 rounded-full transition-colors ${
                roleFilter === "admin"
                  ? "bg-purple-900 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Admin ({adminCount})
            </button>
            <button
              onClick={() => setRoleFilter("user")}
              className={`px-3 py-1 rounded-full transition-colors ${
                roleFilter === "user"
                  ? "bg-blue-900 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              User ({regularCount})
            </button>
          </div>
        </div>

        {/* Add User Button */}
        <button
          onClick={() => setIsCreateOpen(true)}
          className="btn-pill-lime text-xs sm:text-sm py-2 px-4 font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <UserPlus className="h-4 w-4" />
          <span>Tambah Pengguna</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="card-diskon bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Pengguna</th>
                <th className="py-3.5 px-4">Role Akses</th>
                <th className="py-3.5 px-4 text-center">Event Patungan</th>
                <th className="py-3.5 px-4">Terdaftar</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Tindakan Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-slate-600">Tidak ada pengguna ditemukan</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Coba ganti filter role atau kata kunci pencarian.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSelf = u.id === currentAdminId;
                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Name & Email */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-900 text-[#b7e913] flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 truncate">
                                {u.name}
                              </span>
                              {isSelf && (
                                <span className="bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold px-1.5 py-0.2 rounded-md">
                                  Anda
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-500 font-mono block truncate">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        {u.role === "admin" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 border border-purple-200 px-2.5 py-0.5 text-xs font-bold text-purple-900">
                            <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
                            <span>Administrator</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                            <User className="h-3.5 w-3.5 text-blue-600" />
                            <span>Pengguna Biasa</span>
                          </span>
                        )}
                      </td>

                      {/* Event Count */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-full text-xs">
                          {u.eventCount}
                        </span>
                      </td>

                      {/* Created At */}
                      <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>
                            {new Date(u.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Role Change button */}
                          <button
                            onClick={() => {
                              setSelectedNewRole(u.role === "admin" ? "user" : "admin");
                              setRoleModalUser(u);
                            }}
                            disabled={isSelf}
                            title={isSelf ? "Tidak bisa mengubah role akun sendiri" : "Ubah Hak Akses Role"}
                            className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            <Shield className="h-4 w-4" />
                          </button>

                          {/* Reset Password button */}
                          <button
                            onClick={() => {
                              setPasswordModalUser(u);
                              setNewPassword("");
                            }}
                            title="Reset Kata Sandi Pengguna"
                            className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                          >
                            <Key className="h-4 w-4" />
                          </button>

                          {/* Delete User button */}
                          <button
                            onClick={() => setDeleteModalUser(u)}
                            disabled={isSelf}
                            title={isSelf ? "Tidak bisa menghapus akun sendiri saat masuk" : "Hapus Pengguna"}
                            className="p-1.5 rounded-lg border border-red-200 hover:border-red-300 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------- MODAL 1: Tambah Pengguna Baru ---------------- */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="card-diskon bg-white border border-slate-200 max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-lime-100 text-lime-950 flex items-center justify-center">
                  <UserPlus className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-slate-950">
                  Tambah Pengguna Baru
                </h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Contoh: Budi Santoso"
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Alamat Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="nama@email.com"
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Kata Sandi Awal</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    placeholder="Minimal 6 karakter"
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Role / Hak Akses</label>
                <select
                  name="role"
                  defaultValue="user"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-slate-900 focus:outline-none bg-white"
                >
                  <option value="user">User Biasa (Aplikasi Patungan)</option>
                  <option value="admin">Administrator (Panel Kontrol Penuh)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="btn-pill-secondary text-xs py-2 px-4"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-pill-lime text-xs py-2 px-5 font-bold disabled:opacity-50"
                >
                  {isPending ? "Menyimpan..." : "Simpan Pengguna"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL 2: Ubah Role Pengguna ---------------- */}
      {roleModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="card-diskon bg-white border border-slate-200 max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center">
                  <Shield className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-slate-950">
                  Ubah Hak Akses Role
                </h3>
              </div>
              <button
                onClick={() => setRoleModalUser(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-500">Pengguna Terpilih:</p>
                <p className="text-sm font-bold text-slate-900">{roleModalUser.name}</p>
                <p className="text-xs text-slate-500 font-mono">{roleModalUser.email}</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Pilih Role Baru:</label>
                <div className="space-y-2">
                  <label
                    onClick={() => setSelectedNewRole("user")}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedNewRole === "user"
                        ? "border-blue-500 bg-blue-50/50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="roleOption"
                      checked={selectedNewRole === "user"}
                      onChange={() => setSelectedNewRole("user")}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">User Biasa</p>
                      <p className="text-[11px] text-slate-500">
                        Hanya dapat membuat event patungan, mencatat pengeluaran, dan melihat split tagihan.
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() => setSelectedNewRole("admin")}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedNewRole === "admin"
                        ? "border-purple-500 bg-purple-50/50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="roleOption"
                      checked={selectedNewRole === "admin"}
                      onChange={() => setSelectedNewRole("admin")}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Administrator</p>
                      <p className="text-[11px] text-slate-500">
                        Akses penuh ke dashboard /admin, manajemen pengguna, publikasi artikel blog, CMS, dan SEO.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRoleModalUser(null)}
                  className="btn-pill-secondary text-xs py-2 px-4"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleRoleUpdate}
                  disabled={isPending}
                  className="btn-pill-lime text-xs py-2 px-5 font-bold disabled:opacity-50"
                >
                  {isPending ? "Memproses..." : "Perbarui Role"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODAL 3: Reset Kata Sandi ---------------- */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="card-diskon bg-white border border-slate-200 max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                  <Key className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-slate-950">
                  Reset Kata Sandi
                </h3>
              </div>
              <button
                onClick={() => setPasswordModalUser(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-500">Reset kata sandi untuk:</p>
                <p className="text-sm font-bold text-slate-900">{passwordModalUser.name}</p>
                <p className="text-xs text-slate-500 font-mono">{passwordModalUser.email}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Masukkan kata sandi baru (min 6 char)"
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="btn-pill-secondary text-xs py-2 px-4"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending || newPassword.length < 6}
                  className="btn-pill-lime text-xs py-2 px-5 font-bold disabled:opacity-50"
                >
                  {isPending ? "Menyimpan..." : "Reset Kata Sandi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL 4: Hapus Akun Pengguna ---------------- */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="card-diskon bg-white border border-slate-200 max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-100 text-red-900 flex items-center justify-center">
                  <Trash2 className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-slate-950">
                  Konfirmasi Hapus Pengguna
                </h3>
              </div>
              <button
                onClick={() => setDeleteModalUser(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-800 text-xs leading-relaxed space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-red-900">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Peringatan Penghapusan Akun</span>
                </p>
                <p>
                  Apakah Anda yakin ingin menghapus akun <strong>{deleteModalUser.name}</strong> ({deleteModalUser.email})?
                </p>
                <p className="text-[11px] text-red-700">
                  Semua event patungan, pengaturan AI, dan sesi milik pengguna ini akan ikut dihapus permanen. Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeleteModalUser(null)}
                  className="btn-pill-secondary text-xs py-2 px-4"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDeleteUser}
                  disabled={isPending}
                  className="rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 px-5 transition-colors disabled:opacity-50"
                >
                  {isPending ? "Menghapus..." : "Ya, Hapus Akun"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
