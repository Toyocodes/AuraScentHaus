import type { Metadata } from "next";
import { DeliverySection } from "@/components/admin/delivery";

export const metadata: Metadata = { title: "Delivery" };

export default function AdminDeliveryPage() {
  return <DeliverySection />;
}
