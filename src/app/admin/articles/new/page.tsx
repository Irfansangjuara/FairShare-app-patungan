import { redirect } from "next/navigation";

export default function RedirectNewArticleToBlog() {
  redirect("/admin/blog/new");
}
