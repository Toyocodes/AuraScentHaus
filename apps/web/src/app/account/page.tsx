import type { Metadata } from "next";
import { ProfileForm, SignOutEverywhere } from "@/components/account";
import { PageHeader } from "@/components/common";
import { mockUser } from "@/mocks";

export const metadata: Metadata = { title: "My account" };

/** Sample data for now. Later: `useProfile()` + `useUpdateProfile()`, and `useLogoutAll()`. */
export default function AccountPage() {
  return (
    <div className="space-y-10">
      <PageHeader as="h2" title="Profile" description="Your name and phone number are used for delivery." />
      <ProfileForm user={mockUser} />
      <SignOutEverywhere />
    </div>
  );
}
