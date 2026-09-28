import { MetadataRoute } from "next";
import { getBaseUrl } from "../lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/dashboard/", "/events/", "/share/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
