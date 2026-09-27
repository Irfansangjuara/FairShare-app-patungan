import { getSessionUser } from "@/lib/auth";
import { AdminNavbar } from "@/components/AdminNavbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-full flex flex-col bg-[#F8FAFC]">
      {isAdmin && <AdminNavbar user={user} />}
      <div className="flex-1">{children}</div>
    </div>
  );
}
