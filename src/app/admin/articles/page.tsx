import { redirect } from "next/navigation";

export default function RedirectArticlesToBlog() {
  redirect("/admin/blog");
}
