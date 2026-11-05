import { Skeleton } from "@/components/ui/skeleton";

export function OrderDetailSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-48 rounded-sm" />
      </div>
      <Skeleton className="h-64 rounded-sm" />
    </div>
  );
}
