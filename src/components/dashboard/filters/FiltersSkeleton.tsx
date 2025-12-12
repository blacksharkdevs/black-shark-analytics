import { Skeleton } from "@/components/common/ui/skeleton";
import { Package, ListFilter, Network, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface FiltersSkeletonProps {
  hasPlatformFilter?: boolean;
  hasSearchFilter?: boolean;
}

export function FiltersSkeleton({
  hasPlatformFilter = false,
  hasSearchFilter = false,
}: FiltersSkeletonProps) {
  const totalFilters =
    2 + (hasPlatformFilter ? 1 : 0) + (hasSearchFilter ? 1 : 0);

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4",
        totalFilters === 2 && "md:grid-cols-2",
        totalFilters === 3 && "md:grid-cols-2 lg:grid-cols-3",
        totalFilters === 4 && "md:grid-cols-2 lg:grid-cols-4"
      )}
    >
      {hasSearchFilter && (
        <div className="flex items-center gap-2">
          <Search className="hidden w-5 h-5 text-blue-600 dark:text-white sm:block" />
          <Skeleton className="w-full h-10 rounded-none bg-accent/20" />
        </div>
      )}
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
