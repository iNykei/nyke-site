import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api", "/api/", "/auth", "/auth/", "/forgot-password", "/login", "/register", "/reset-password", "/settings", "/settings/"],
    },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  };
}
