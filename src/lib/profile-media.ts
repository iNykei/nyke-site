export const PROFILE_MEDIA_BUCKET = "profile-media";

export type ProfileMediaKind = "avatar" | "banner";

export const PROFILE_MEDIA_LIMITS: Record<ProfileMediaKind, number> = {
  avatar: 5 * 1024 * 1024,
  banner: 8 * 1024 * 1024,
};

const extensionsByMimeType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const mediaFilePattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:jpg|jpeg|png|webp)$/i;

export function getProfileMediaExtension(mimeType: string) {
  return extensionsByMimeType[mimeType] ?? null;
}

export function createProfileMediaPath(userId: string, kind: ProfileMediaKind, mimeType: string) {
  const extension = getProfileMediaExtension(mimeType);

  if (!extension) {
    return null;
  }

  return `${userId}/${kind}/${crypto.randomUUID()}.${extension}`;
}

export function isOwnedProfileMediaPath(path: string, userId: string, kind: ProfileMediaKind) {
  const segments = path.split("/");

  return segments.length === 3 && segments[0] === userId && segments[1] === kind && mediaFilePattern.test(segments[2]);
}

export function getOwnedProfileMediaPathFromUrl(
  value: string | null,
  projectUrl: string,
  userId: string,
  kind: ProfileMediaKind,
) {
  if (!value) {
    return null;
  }

  try {
    const mediaUrl = new URL(value);
    const projectOrigin = new URL(projectUrl).origin;
    const pathPrefix = `/storage/v1/object/public/${PROFILE_MEDIA_BUCKET}/`;

    if (mediaUrl.origin !== projectOrigin || !mediaUrl.pathname.startsWith(pathPrefix)) {
      return null;
    }

    const path = decodeURIComponent(mediaUrl.pathname.slice(pathPrefix.length));
    return isOwnedProfileMediaPath(path, userId, kind) ? path : null;
  } catch {
    return null;
  }
}
