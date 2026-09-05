const productionSiteUrl = "https://nyke.life";

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configuredUrl) {
    try {
      return new URL(configuredUrl);
    } catch {
      // Fall through to an environment-safe default.
    }
  }

  return new URL(process.env.NODE_ENV === "production" ? productionSiteUrl : "http://localhost:3000");
}

export function toAbsoluteUrl(value: string | undefined) {
  if (!value) return undefined;

  try {
    return new URL(value, getSiteUrl()).toString();
  } catch {
    return undefined;
  }
}
