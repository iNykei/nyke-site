"use server";

import { revalidatePath } from "next/cache";
import {
  getOwnedProfileMediaPathFromUrl,
  isOwnedProfileMediaPath,
  PROFILE_MEDIA_BUCKET,
  type ProfileMediaKind,
} from "@/lib/profile-media";
import { getSupabaseEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type ProfileMediaActionResult = {
  status: "success" | "warning" | "error";
  message: string;
  url?: string | null;
};

function isProfileMediaKind(value: string): value is ProfileMediaKind {
  return value === "avatar" || value === "banner";
}

function mediaColumn(kind: ProfileMediaKind) {
  return kind === "avatar" ? "avatar_url" : "banner_url";
}

async function revalidateProfile(username: string) {
  revalidatePath(`/${username}`);
  revalidatePath("/settings/profile");
}

export async function commitProfileMedia(kindValue: string, path: string): Promise<ProfileMediaActionResult> {
  if (!isProfileMediaKind(kindValue)) {
    return { status: "error", message: "That profile image type is not supported." };
  }

  const supabase = await createClient();
  const { url: projectUrl } = getSupabaseEnv();

  if (!supabase || !projectUrl) {
    return { status: "error", message: "Profile images are not configured." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "You must be signed in to update profile images." };
  }

  if (!isOwnedProfileMediaPath(path, user.id, kindValue)) {
    return { status: "error", message: "That uploaded image could not be verified." };
  }

  const [folder, fileName] = [path.slice(0, path.lastIndexOf("/")), path.slice(path.lastIndexOf("/") + 1)];
  const { data: uploadedFiles, error: listError } = await supabase.storage
    .from(PROFILE_MEDIA_BUCKET)
    .list(folder, { limit: 2, search: fileName });

  if (listError || !uploadedFiles?.some((file) => file.name === fileName)) {
    return { status: "error", message: "That uploaded image could not be found." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("username, avatar_url, banner_url")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    await supabase.storage.from(PROFILE_MEDIA_BUCKET).remove([path]);
    return { status: "error", message: "Your profile could not be loaded." };
  }

  const column = mediaColumn(kindValue);
  const previousUrl = profile[column];
  const { data: publicUrlData } = supabase.storage.from(PROFILE_MEDIA_BUCKET).getPublicUrl(path);
  const publicUrl = publicUrlData.publicUrl;
  const update = kindValue === "avatar" ? { avatar_url: publicUrl } : { banner_url: publicUrl };
  const { error: updateError } = await supabase.from("profiles").update(update).eq("id", user.id).select("id").single();

  if (updateError) {
    await supabase.storage.from(PROFILE_MEDIA_BUCKET).remove([path]);
    return { status: "error", message: "The image uploaded, but your profile could not be updated." };
  }

  await revalidateProfile(profile.username);

  const previousPath = getOwnedProfileMediaPathFromUrl(previousUrl, projectUrl, user.id, kindValue);

  if (previousPath && previousPath !== path) {
    const { error: cleanupError } = await supabase.storage.from(PROFILE_MEDIA_BUCKET).remove([previousPath]);

    if (cleanupError) {
      return {
        status: "warning",
        message: "Image saved. The previous file could not be cleaned up.",
        url: publicUrl,
      };
    }
  }

  return { status: "success", message: `${kindValue === "avatar" ? "Avatar" : "Banner"} saved.`, url: publicUrl };
}

export async function removeProfileMedia(kindValue: string): Promise<ProfileMediaActionResult> {
  if (!isProfileMediaKind(kindValue)) {
    return { status: "error", message: "That profile image type is not supported." };
  }

  const supabase = await createClient();
  const { url: projectUrl } = getSupabaseEnv();

  if (!supabase || !projectUrl) {
    return { status: "error", message: "Profile images are not configured." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "You must be signed in to update profile images." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("username, avatar_url, banner_url")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return { status: "error", message: "Your profile could not be loaded." };
  }

  const column = mediaColumn(kindValue);
  const previousUrl = profile[column];
  const update = kindValue === "avatar" ? { avatar_url: null } : { banner_url: null };
  const { error: updateError } = await supabase.from("profiles").update(update).eq("id", user.id).select("id").single();

  if (updateError) {
    return { status: "error", message: `The ${kindValue} could not be removed.` };
  }

  await revalidateProfile(profile.username);

  const previousPath = getOwnedProfileMediaPathFromUrl(previousUrl, projectUrl, user.id, kindValue);

  if (previousPath) {
    const { error: cleanupError } = await supabase.storage.from(PROFILE_MEDIA_BUCKET).remove([previousPath]);

    if (cleanupError) {
      return {
        status: "warning",
        message: `${kindValue === "avatar" ? "Avatar" : "Banner"} removed from your profile. The old file could not be cleaned up.`,
        url: null,
      };
    }
  }

  return { status: "success", message: `${kindValue === "avatar" ? "Avatar" : "Banner"} removed.`, url: null };
}
