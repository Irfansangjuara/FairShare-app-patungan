"use server";

import { db } from "../../db";
import { sitePages, siteSettings } from "../../db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "../../lib/auth";
import { pageEditSchema, siteSettingsSchema } from "../../lib/validation";
import { revalidatePath } from "next/cache";

export interface PageActionState {
  error?: string;
  success?: boolean;
}

export async function updateSitePageAction(
  pageKey: string,
  _prevState: PageActionState | null,
  formData: FormData
): Promise<PageActionState> {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return { error: "Akses ditolak. Hanya administrator yang dapat mengelola halaman." };
  }

  const rawName = formData.get("name");
  const rawTitle = formData.get("title");
  const rawContent = formData.get("content");
  const rawFeaturedImage = formData.get("featuredImage");
  const rawIsPublished = formData.get("isPublished") === "true";
  const rawNavOrder = formData.get("navOrder");
  const rawSeoTitle = formData.get("seoTitle");
  const rawSeoDescription = formData.get("seoDescription");
  const rawCanonicalUrl = formData.get("canonicalUrl");
  const rawIsNoindex = formData.get("isNoindex") === "true";
  const rawOgImage = formData.get("ogImage");
  const rawOgDescription = formData.get("ogDescription");

  const parsed = pageEditSchema.safeParse({
    key: pageKey,
    name: rawName,
    title: rawTitle,
    content: rawContent,
    featuredImage: rawFeaturedImage,
    isPublished: rawIsPublished,
    navOrder: rawNavOrder,
    seoTitle: rawSeoTitle,
    seoDescription: rawSeoDescription,
    canonicalUrl: rawCanonicalUrl,
    isNoindex: rawIsNoindex,
    ogImage: rawOgImage,
    ogDescription: rawOgDescription,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  await db
    .update(sitePages)
    .set({
      name: data.name,
      title: data.title,
      content: data.content,
      featuredImage: data.featuredImage || null,
      isPublished: data.isPublished,
      navOrder: data.navOrder,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      canonicalUrl: data.canonicalUrl || null,
      isNoindex: data.isNoindex,
      ogImage: data.ogImage || null,
      ogDescription: data.ogDescription || null,
      updatedAt: new Date(),
    })
    .where(eq(sitePages.key, pageKey));

  revalidatePath("/");
  revalidatePath(`/${pageKey}`);
  revalidatePath("/admin/pages");
  revalidatePath("/sitemap.xml");
  revalidatePath("/robots.txt");

  return { success: true };
}

export async function updateSiteSettingsAction(
  _prevState: PageActionState | null,
  formData: FormData
): Promise<PageActionState> {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return { error: "Akses ditolak. Hanya administrator yang dapat mengelola pengaturan SEO." };
  }

  const rawSiteName = formData.get("siteName");
  const rawDefaultDescription = formData.get("defaultDescription");
  const rawDefaultOgImage = formData.get("defaultOgImage");
  const rawTitleTemplate = formData.get("titleTemplate");

  const parsed = siteSettingsSchema.safeParse({
    siteName: rawSiteName,
    defaultDescription: rawDefaultDescription,
    defaultOgImage: rawDefaultOgImage,
    titleTemplate: rawTitleTemplate,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  await db
    .update(siteSettings)
    .set({
      siteName: data.siteName,
      defaultDescription: data.defaultDescription || null,
      defaultOgImage: data.defaultOgImage || null,
      titleTemplate: data.titleTemplate,
      updatedAt: new Date(),
    })
    .where(eq(siteSettings.key, "global"));

  revalidatePath("/");
  revalidatePath("/admin/seo");
  revalidatePath("/sitemap.xml");

  return { success: true };
}
