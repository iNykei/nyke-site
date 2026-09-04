import { NavbarClient } from "@/components/nav/NavbarClient";
import { getCurrentUserAndProfile } from "@/lib/profiles";

export async function Navbar() {
  const { profile } = await getCurrentUserAndProfile();

  return (
    <NavbarClient
      viewer={profile
        ? {
            username: profile.username,
            avatarUrl: profile.avatar_url,
          }
        : null}
    />
  );
}
