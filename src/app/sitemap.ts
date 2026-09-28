import { MetadataRoute } from "next";
import { db } from "../db";
import { sitePages, articles } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { getBaseUrl, absoluteUrl } from "../lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  const entries: MetadataRoute.Sitemap = [];
  const seen = new Set<string>();

  // Normalizes the URL (ignoring a trailing slash) so the same page is never
  // emitted twice — e.g. the root `/` static entry and a dynamic `home` page.
  const pushEntry = (entry: MetadataRoute.Sitemap[number]) => {
    const key = entry.url.replace(/\/+$/, "");
    if (seen.has(key)) return;
    seen.add(key);
    entries.push(entry);
  };

  pushEntry({
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1.0,
  });

  pushEntry({
    url: absoluteUrl("/blog"),
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  });

  pushEntry({
    url: absoluteUrl("/login"),
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  });

  pushEntry({
    url: absoluteUrl("/register"),
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  });

  try {
    // Dynamic published CMS pages
    const pages = await db.query.sitePages.findMany({
      where: and(eq(sitePages.isPublished, true), eq(sitePages.isNoindex, false)),
    });

    for (const page of pages) {
      if (page.key === "home" || !page.slug.trim()) continue;
      pushEntry({
        url: absoluteUrl(page.slug),
        lastModified: page.updatedAt ? new Date(page.updatedAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }

    // Dynamic published articles
    const pubArticles = await db.query.articles.findMany({
      where: and(eq(articles.status, "published"), eq(articles.isNoindex, false)),
    });

    for (const art of pubArticles) {
      if (!art.slug.trim()) continue;
      pushEntry({
        url: absoluteUrl(`/blog/${art.slug}`),
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
