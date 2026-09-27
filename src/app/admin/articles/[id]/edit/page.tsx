import { redirect } from "next/navigation";

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params;
  redirect(`/admin/blog/${id}/edit`);
}
