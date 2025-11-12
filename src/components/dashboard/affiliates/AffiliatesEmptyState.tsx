import { Skeleton } from "@/components/common/ui/skeleton";

interface AffiliatesLoadingSkeletonProps {
  itemsPerPage: number;
}

export function AffiliatesLoadingSkeleton({
  itemsPerPage,
}: AffiliatesLoadingSkeletonProps) {
  return (
    <div className="space-y-2">
      {[...Array(itemsPerPage)].map((_, i) => (
        <Skeleton key={i} className="w-full h-12" />
      ))}
    </div>
  );
}

export function AffiliatesNoData() {
  return (
    <div className="py-10 text-center text-muted-foreground">
      No affiliate data found for the selected filters.
    </div>
  );
}
