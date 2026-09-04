export const usernamePattern = /^[a-z0-9_-]{3,20}$/;

export const reservedUsernames = new Set([
  "_next",
  "api",
  "auth",
  "explore",
  "favicon.ico",
  "forgot-password",
  "gear",
  "login",
  "opengraph-image",
  "register",
  "reset-password",
  "robots.txt",
  "settings",
  "sitemap.xml",
]);

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidUsername(username: string) {
  return usernamePattern.test(username) && !reservedUsernames.has(username);
}

export function isReservedUsername(username: string) {
  return reservedUsernames.has(normalizeUsername(username));
}

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}
