import { Skeleton } from "@/components/ui/skeleton";
import { PRODUCT_GRID_CLASS } from "./product-grid";

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className={PRODUCT_GRID_CLASS}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-[4/5] rounded-sm" />
          <Skeleton className="mx-auto h-3 w-1/3" />
          <Skeleton className="mx-auto h-5 w-2/3" />
          <Skeleton className="mx-auto h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}
