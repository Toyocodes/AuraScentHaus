import type { Metadata } from "next";
import { ProfileSection } from "@/components/account";
import { PageHeader } from "@/components/common";

export const metadata: Metadata = { title: "My account" };

export default function AccountPage() {
  return (
    <div className="space-y-10">
      <PageHeader as="h2" title="Profile" description="Your name and phone number are used for delivery." />
      <ProfileSection />
    </div>
  );
}
