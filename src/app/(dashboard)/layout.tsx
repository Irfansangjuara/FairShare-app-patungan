import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/DashboardShell";
import { ensureDatabaseSchema } from "@/db/migrate";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  // Ensure DB tables (including user_ai_settings and api_tokens) exist safely
  await ensureDatabaseSchema();

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
