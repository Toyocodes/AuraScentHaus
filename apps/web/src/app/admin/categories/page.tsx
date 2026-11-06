import type { Metadata } from "next";
import { CategoriesSection } from "@/components/admin/categories";

export const metadata: Metadata = { title: "Categories" };

export default function AdminCategoriesPage() {
  return <CategoriesSection />;
}
