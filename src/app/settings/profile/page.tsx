import { redirect } from "next/navigation";
import { EditProfileForm } from "@/components/profile/EditProfileForm";
import { getEditableProfileData } from "@/lib/profiles";
import { saveProfile } from "./actions";

export default async function SettingsProfilePage() {
  const data = await getEditableProfileData();

  if (!data) {
    redirect("/login");
  }

  return (
    <main className="page-light min-h-[calc(100vh-57px)] bg-[#fbfaf8] px-4 py-10 text-zinc-950 sm:px-6 lg:px-8">
      <EditProfileForm data={data} action={saveProfile} />
    </main>
  );
}
