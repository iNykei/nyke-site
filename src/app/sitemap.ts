import type { MetadataRoute } from "next";
import { getPublicProfileIndex } from "@/lib/profiles";
import { getSiteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: new URL("/", siteUrl).toString(), changeFrequency: "weekly", priority: 1 },
    { url: new URL("/explore", siteUrl).toString(), changeFrequency: "daily", priority: 0.8 },
    { url: new URL("/gear", siteUrl).toString(), changeFrequency: "weekly", priority: 0.7 },
  ];

  try {
    const profiles = await getPublicProfileIndex();
    return [
      ...staticRoutes,
      ...profiles.flatMap(({ username, updatedAt }) => {
        const lastModified = new Date(updatedAt);
        return [
          { url: new URL(`/${username}`, siteUrl).toString(), lastModified, changeFrequency: "weekly" as const, priority: 0.7 },
          { url: new URL(`/${username}/gear`, siteUrl).toString(), lastModified, changeFrequency: "weekly" as const, priority: 0.5 },
          { url: new URL(`/${username}/card`, siteUrl).toString(), lastModified, changeFrequency: "weekly" as const, priority: 0.6 },
        ];
      }),
    ];
  } catch {
    return staticRoutes;
  }
}
