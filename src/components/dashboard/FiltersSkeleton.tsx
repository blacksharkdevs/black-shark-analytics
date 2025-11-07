import { Skeleton } from "@/components/common/ui/skeleton";
import { Package, ListFilter, Network } from "lucide-react";
import { cn } from "@/lib/utils";

interface FiltersSkeletonProps {
  hasPlatformFilter: boolean;
}

export function FiltersSkeleton({ hasPlatformFilter }: FiltersSkeletonProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4",
        hasPlatformFilter ? "md:grid-cols-3" : "md:grid-cols-2"
      )}
    >
      <div className="flex items-center gap-2">
        <Package className="hidden w-6 h-6 text-blue-600 dark:text-white sm:block" />
        <Skeleton className="w-full h-10 rounded-none bg-accent/20" />
      </div>
      <div className="flex items-center gap-2">
        <ListFilter className="hidden w-6 h-6 text-blue-600 dark:text-white sm:block" />
        <Skeleton className="w-full h-10 rounded-none bg-accent/20" />
      </div>
      {hasPlatformFilter && (
        <div className="flex items-center gap-2">
          <Network className="hidden w-6 h-6 text-blue-600 dark:text-white sm:block" />
          <Skeleton className="w-full h-10 rounded-none bg-accent/20" />
        </div>
      )}
    </div>
  );
}
