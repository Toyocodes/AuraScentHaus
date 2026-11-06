"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { QueryError } from "@/components/common";
import { Skeleton } from "@/components/ui/skeleton";
import { useLogoutAll } from "@/hooks/auth";
import { getErrorMessage } from "@/hooks/helper/errors";
import { useProfile, useUpdateProfile } from "@/hooks/profile";
import { SignOutEverywhere } from "../sign-out-everywhere/sign-out-everywhere";
import { ProfileForm } from "./profile-form";

/** /account, connected: edit name and phone, and sign out on every device. */
export function ProfileSection() {
  const router = useRouter();
  const profile = useProfile();
  const updateProfile = useUpdateProfile();
  const logoutAll = useLogoutAll();

  if (profile.isPending) {
    return (
      <div className="max-w-md space-y-4">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </div>
    );
  }
  if (profile.isError) return <QueryError error={profile.error} onRetry={() => void profile.refetch()} />;

  return (
    <>
      <ProfileForm
        user={profile.data}
        isPending={updateProfile.isPending}
        onSubmit={async (input) => {
          try {
            await updateProfile.mutateAsync(input);
            toast.success("Your profile is saved.");
          } catch (error) {
            toast.error(getErrorMessage(error, "We couldn't save your profile."));
          }
        }}
      />
      <SignOutEverywhere
        isPending={logoutAll.isPending}
        onConfirm={async () => {
          try {
            await logoutAll.mutateAsync();
            toast.success("You're signed out on every device.");
            router.replace("/");
          } catch (error) {
            toast.error(getErrorMessage(error));
          }
        }}
      />
    </>
  );
}
