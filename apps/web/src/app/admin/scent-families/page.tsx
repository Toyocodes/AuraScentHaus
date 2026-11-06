import type { Metadata } from "next";
import { ScentFamiliesSection } from "@/components/admin/scent-families";

export const metadata: Metadata = { title: "Scent families" };

export default function AdminScentFamiliesPage() {
  return <ScentFamiliesSection />;
}
