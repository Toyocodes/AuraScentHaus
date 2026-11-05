import type { Metadata } from "next";
import { UserPlus } from "lucide-react";
import { CustomerDialog, CustomersTable } from "@/components/admin/customers";
import { PageHeader, SearchForm } from "@/components/common";
import { Button } from "@/components/ui/button";
import { mockCustomers } from "@/mocks";

export const metadata: Metadata = { title: "Customers" };

/** Sample data for now. Later: `useCustomers({ search })`, `useCreateCustomer()`, `useUpdateCustomer()`. */
export default function AdminCustomersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="People"
        title="Customers"
        actions={
          <CustomerDialog
            trigger={
              <Button>
                <UserPlus /> Add customer
              </Button>
            }
          />
        }
      />
      <SearchForm placeholder="Search by email or name…" className="max-w-sm" />
      <CustomersTable customers={mockCustomers} />
    </div>
  );
}
