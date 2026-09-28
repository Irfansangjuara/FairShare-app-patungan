import { getSessionUser } from "@/lib/auth";
import { AdminShell } from "@/components/AdminShell";
import { AdminLoginForm } from "@/components/AdminLoginForm";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  const isAdmin = user?.role === "admin";

  // Fail closed: the `/admin` subtree must never render for a non-admin. This
  // is the only shared gate for the whole subtree, so it denies rather than
  // forwarding `children` to an unauthenticated visitor.
  if (!isAdmin || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#b7e913]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 w-full">
          <AdminLoginForm />
        </div>
      </div>
    );
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
