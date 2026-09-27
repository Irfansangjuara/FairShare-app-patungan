import { redirect } from "next/navigation";

export default function LegacyDeveloperPage() {
  redirect("/dashboard/token");
}
