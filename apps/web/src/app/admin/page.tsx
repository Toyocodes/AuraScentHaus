import { Suspense } from "react";
import { DashboardSection, DashboardSkeleton } from "@/components/admin/dashboard";

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* The range lives in the URL (?range=last_6_months), which is only known at request time. */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardSection />
      </Suspense>
    </div>
  );
}
