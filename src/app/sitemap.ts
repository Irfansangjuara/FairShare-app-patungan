import { MetadataRoute } from "next";
import { db } from "../db";
import { sitePages, articles } from "../db/schema";
import { eq, and } from "drizzle-orm";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://fairshare.copilotmarketing.id";

  const entries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  try {
    // Dynamic published CMS pages
    const pages = await db.query.sitePages.findMany({
      where: and(eq(sitePages.isPublished, true), eq(sitePages.isNoindex, false)),
    });

    for (const page of pages) {
      if (page.key !== "home") {
        entries.push({
          url: `${baseUrl}/${page.slug}`,
          lastModified: page.updatedAt ? new Date(page.updatedAt) : new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    }

    // Dynamic published articles
    const pubArticles = await db.query.articles.findMany({
      where: and(eq(articles.status, "published"), eq(articles.isNoindex, false)),
    });

    for (const art of pubArticles) {
      entries.push({
        url: `${baseUrl}/blog/${art.slug}`,
        lastModified: art.updatedAt ? new Date(art.updatedAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch (err) {
    console.error("Error generating dynamic sitemap:", err);
  }

  return entries;
}
