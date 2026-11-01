import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Login and register use page-level noindex; crawlers must be able to read it.
      disallow: ["/api", "/api/", "/auth", "/auth/", "/forgot-password", "/reset-password", "/settings", "/settings/"],
    },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  };
}
