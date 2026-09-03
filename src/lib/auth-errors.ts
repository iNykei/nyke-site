export function toFriendlyAuthError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "Email or password is incorrect.";
  }

  if (normalized.includes("already registered") || normalized.includes("user already registered")) {
    return "An account with this email already exists.";
  }

  if (normalized.includes("duplicate") || normalized.includes("unique")) {
    return "That username is already taken.";
  }

  if (normalized.includes("email")) {
    return "Please check your email address and try again.";
  }

  if (normalized.includes("password")) {
    return "Please check your password and try again.";
  }

  return "Something went wrong. Please try again.";
}
