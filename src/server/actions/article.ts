"use server";

import { db } from "../../db";
import { articles } from "../../db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "../../lib/auth";
import { articleSchema } from "../../lib/validation";
import { revalidatePath } from "next/cache";

export interface ArticleActionState {
  error?: string;
  success?: boolean;
  slug?: string;
}

export async function createArticleAction(
  _prevState: ArticleActionState | null,
  formData: FormData
): Promise<ArticleActionState> {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return { error: "Akses ditolak. Hanya administrator yang dapat mengelola artikel." };
  }

  const rawTitle = formData.get("title");
  const rawSlug = formData.get("slug");
  const rawSummary = formData.get("summary");
  const rawContent = formData.get("content");
  const rawFeaturedImage = formData.get("featuredImage");
  const rawStatus = formData.get("status") || "draft";
  const rawSeoTitle = formData.get("seoTitle");
  const rawSeoDescription = formData.get("seoDescription");
  const rawCanonicalUrl = formData.get("canonicalUrl");
  const rawIsNoindex = formData.get("isNoindex") === "true";

  const parsed = articleSchema.safeParse({
    title: rawTitle,
    slug: rawSlug,
    summary: rawSummary,
    content: rawContent,
    featuredImage: rawFeaturedImage,
    status: rawStatus,
    seoTitle: rawSeoTitle,
    seoDescription: rawSeoDescription,
    canonicalUrl: rawCanonicalUrl,
    isNoindex: rawIsNoindex,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const {
    title,
    slug,
    summary,
    content,
    featuredImage,
    status,
    seoTitle,
    seoDescription,
    canonicalUrl,
    isNoindex,
  } = parsed.data;

  // Check unique slug
  const existing = await db.query.articles.findFirst({
    where: eq(articles.slug, slug),
  });

  if (existing) {
    return { error: `Slug "${slug}" sudah digunakan oleh artikel lain.` };
  }

  await db.insert(articles).values({
    authorId: user.id,
    title,
    slug,
    summary: summary || null,
    content,
    featuredImage: featuredImage || null,
    status,
    seoTitle: seoTitle || null,
    seoDescription: seoDescription || null,
    canonicalUrl: canonicalUrl || null,
    isNoindex,
    publishedAt: status === "published" ? new Date() : null,
  });

  revalidatePath("/blog");
  revalidatePath("/admin/articles");
  return { success: true, slug };
}

export async function updateArticleAction(
  articleId: string,
  _prevState: ArticleActionState | null,
  formData: FormData
): Promise<ArticleActionState> {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return { error: "Akses ditolak. Hanya administrator yang dapat mengelola artikel." };
  }

  const existing = await db.query.articles.findFirst({
    where: eq(articles.id, articleId),
  });

  if (!existing) {
    return { error: "Artikel tidak ditemukan." };
  }

  const rawTitle = formData.get("title");
  const rawSlug = formData.get("slug");
  const rawSummary = formData.get("summary");
  const rawContent = formData.get("content");
  const rawFeaturedImage = formData.get("featuredImage");
  const rawStatus = formData.get("status") || "draft";
  const rawSeoTitle = formData.get("seoTitle");
  const rawSeoDescription = formData.get("seoDescription");
  const rawCanonicalUrl = formData.get("canonicalUrl");
  const rawIsNoindex = formData.get("isNoindex") === "true";

  const parsed = articleSchema.safeParse({
    title: rawTitle,
    slug: rawSlug,
    summary: rawSummary,
    content: rawContent,
    featuredImage: rawFeaturedImage,
    status: rawStatus,
    seoTitle: rawSeoTitle,
    seoDescription: rawSeoDescription,
    canonicalUrl: rawCanonicalUrl,
    isNoindex: rawIsNoindex,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const {
    title,
    slug,
    summary,
    content,
    featuredImage,
    status,
    seoTitle,
    seoDescription,
    canonicalUrl,
    isNoindex,
  } = parsed.data;

  // Check unique slug if changed
  if (slug !== existing.slug) {
    const slugExists = await db.query.articles.findFirst({
      where: eq(articles.slug, slug),
    });
    if (slugExists) {
      return { error: `Slug "${slug}" sudah digunakan oleh artikel lain.` };
    }
  }

  const wasPublished = existing.status === "published";
  const nowPublished = status === "published";

  await db
    .update(articles)
    .set({
      title,
      slug,
      summary: summary || null,
      content,
      featuredImage: featuredImage || null,
      status,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      canonicalUrl: canonicalUrl || null,
      isNoindex,
      publishedAt: !wasPublished && nowPublished ? new Date() : existing.publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(articles.id, articleId));

  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/articles");
  return { success: true, slug };
}

export async function deleteArticleAction(
  articleId: string
): Promise<ArticleActionState> {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return { error: "Akses ditolak. Hanya administrator yang dapat menghapus artikel." };
  }

  await db.delete(articles).where(eq(articles.id, articleId));

  revalidatePath("/blog");
  revalidatePath("/admin/articles");
  return { success: true };
}
