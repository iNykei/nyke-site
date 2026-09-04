export function toFriendlyAuthError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "Email or password is incorrect.";
  }
  
  if (normalized.includes("rate limit") ||
  normalized.includes("too many requests") ||
  normalized.includes("email rate limit exceeded")
) {
  return "Too many emails sent. Please wait a while and try again.";
}
  
  if (normalized.includes("already registered") || normalized.includes("user already registered")) {
    return "An account with this email already exists.";
  }

  if (normalized.includes("duplicate") || normalized.includes("unique")) {
    return "That username is already taken.";
  }

  if (normalized.includes("invalid_username") || normalized.includes("database error saving new user")) {
    return "That username is unavailable. Choose another username and try again.";
  }

  if (normalized.includes("email")) {
    return "Please check your email address and try again.";
  }

  if (normalized.includes("password")) {
    return "Please check your password and try again.";
  }

  return "Something went wrong. Please try again.";
}
