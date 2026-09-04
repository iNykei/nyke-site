import { notFound } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { ProfileHeader } from "@/components/ProfileHeader";
import { ProfileSubnav } from "@/components/profile/ProfileSubnav";
import { getCachedPublicProfileData } from "@/lib/profiles";

type ProfileLayoutProps = { children: ReactNode; params: Promise<{ username: string }> };
export const dynamic = "force-dynamic";

const profileTheme = {
  "--profile-bg": "#fafafa", "--profile-surface": "#ffffff", "--profile-text": "#18181b",
  "--profile-muted": "#71717a", "--profile-border": "#e4e4e7", "--profile-accent": "#fb7185",
  "--profile-technical": "#4d7c0f",
} as CSSProperties;

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
