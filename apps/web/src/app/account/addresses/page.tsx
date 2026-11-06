import type { Metadata } from "next";
import { AddressBookSection } from "@/components/account";
import { PageHeader } from "@/components/common";

export const metadata: Metadata = { title: "Addresses" };

export default function AddressesPage() {
  return (
    <div className="space-y-6">
      <PageHeader as="h2" title="Addresses" />
      <AddressBookSection />
    </div>
  );
}
