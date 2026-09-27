import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://fairshare.copilotmarketing.id";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/events/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
