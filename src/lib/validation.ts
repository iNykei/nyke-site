export const usernamePattern = /^[a-z0-9_-]{3,20}$/;

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidUsername(username: string) {
  return usernamePattern.test(username);
}

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}
