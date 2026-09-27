import { redirect } from "next/navigation";

export default function LegacyTokenPage() {
  redirect("/dashboard/token");
}
