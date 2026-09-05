import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { ProfileHeader } from "@/components/ProfileHeader";
import { ProfileSubnav } from "@/components/profile/ProfileSubnav";
import { getCachedPublicProfileData } from "@/lib/profiles";
import { toAbsoluteUrl } from "@/lib/site";

type ProfileLayoutProps = { children: ReactNode; params: Promise<{ username: string }> };
export const dynamic = "force-dynamic";

const profileTheme = {
  "--profile-bg": "#fafafa", "--profile-surface": "#ffffff", "--profile-text": "#18181b",
  "--profile-muted": "#71717a", "--profile-border": "#e4e4e7", "--profile-accent": "#fb7185",
  "--profile-technical": "#4d7c0f",
} as CSSProperties;

export async function generateMetadata({ params }: Pick<ProfileLayoutProps, "params">): Promise<Metadata> {
  const { username } = await params;
  const data = await getCachedPublicProfileData(username);

  if (!data) return { title: "Profile not found — NYKE", robots: { index: false, follow: false } };

  const { player } = data;
  const title = `${player.displayName} (@${player.username}) — NYKE`;
  const description = player.bio || "FPS profile, aim settings and active gear on NYKE.";
  const image = toAbsoluteUrl(player.bannerUrl || player.avatarUrl);

  return {
    title,
    description,
    alternates: { canonical: `/${player.username}` },
    openGraph: {
      type: "profile",
      title,
      description,
      url: `/${player.username}`,
      images: image ? [{ url: image }] : [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : ["/opengraph-image"],
    },
  };
}

export default async function ProfileLayout({ children, params }: ProfileLayoutProps) {
  const { username } = await params;
  const publicProfile = await getCachedPublicProfileData(username);
  if (!publicProfile) notFound();

  return (
    <main className="profile-page page-light min-h-[calc(100vh-57px)] bg-[var(--profile-bg)] px-4 pb-20 pt-6 text-[var(--profile-text)] sm:px-6 sm:pt-8 lg:px-8" style={profileTheme}>
      <div className="mx-auto w-full max-w-7xl">
        <ProfileHeader player={publicProfile.player} isOwner={publicProfile.isOwner} />
        <ProfileSubnav username={publicProfile.player.username} />
        {children}
      </div>
    </main>
  );
}
