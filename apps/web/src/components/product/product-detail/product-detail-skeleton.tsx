import { Skeleton } from "@/components/ui/skeleton";

export function ProductDetailSkeleton() {
  return (
    <div className="grid gap-10 md:grid-cols-2 lg:gap-20">
      <Skeleton className="aspect-[4/5] rounded-sm" />
      <div className="space-y-5">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-14 w-3/4" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}
