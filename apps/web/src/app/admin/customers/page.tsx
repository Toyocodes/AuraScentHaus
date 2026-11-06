import type { Metadata } from "next";
import { CustomersSection } from "@/components/admin/customers";

export const metadata: Metadata = { title: "Customers" };

export default function AdminCustomersPage() {
  return <CustomersSection />;
}
