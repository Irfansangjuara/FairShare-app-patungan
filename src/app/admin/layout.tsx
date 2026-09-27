import { getSessionUser } from "@/lib/auth";
import { AdminShell } from "@/components/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  const isAdmin = user?.role === "admin";

  if (!isAdmin || !user) {
    return <div className="min-h-screen bg-slate-950">{children}</div>;
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
