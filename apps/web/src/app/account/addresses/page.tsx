import type { Metadata } from "next";
import { AddressBook } from "@/components/account";
import { PageHeader } from "@/components/common";
import { mockAddresses } from "@/mocks";

export const metadata: Metadata = { title: "Addresses" };

/** Sample data for now. Later: `useAddresses()` + create / update / delete address hooks. */
export default function AddressesPage() {
  return (
    <div className="space-y-6">
      <PageHeader as="h2" title="Addresses" />
      <AddressBook addresses={mockAddresses} />
    </div>
  );
}
