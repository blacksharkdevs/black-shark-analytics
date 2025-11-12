import { useMemo } from "react";
import { Table, TableBody } from "@/components/common/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/common/ui/card";
import { Users } from "lucide-react";
import { useAffiliates } from "@/hooks/useAffiliates";
import { AffiliatesProvider } from "@/contexts/AffiliatesContext";
import { type AffiliatePerformanceData } from "@/types/affiliates";
import { AFFILIATE_ACTION_TYPES } from "@/lib/config";
import {
  AffiliatesTableHeader,
  AffiliatesTableRow,
  AffiliatesTableFooter,
  AffiliatesPagination,
  AffiliatesLoadingSkeleton,
  AffiliatesNoData,
} from "@/components/dashboard/affiliates";
import { Filters } from "@/components/dashboard/Filters";

function AffiliatesPageContent() {
  const {
    affiliateData,
    isLoadingData,
    isDateRangeLoading,
    isFetchingPlatforms,
    filterState,
    handleFilterChange,
    sortState,
    pagination,
  } = useAffiliates();

  const { availablePlatforms, selectedPlatform, selectedActionType } =
    filterState;

  const { sortColumn, sortDirection, handleSort } = sortState;

  const {
    currentPage,
    totalPages,
    itemsPerPage,
    totalAffiliatesCount,
    handlePageChange,
    handleItemsPerPageChange,
  } = pagination;

  // Cálculos de Apresentação
  const showContentSkeleton =
    (isLoadingData ||
      isDateRangeLoading ||
      (isFetchingPlatforms && availablePlatforms.length === 0)) &&
    affiliateData.length === 0;
  const showNoDataMessage =
    !isLoadingData &&
    !isDateRangeLoading &&
    !isFetchingPlatforms &&
    affiliateData.length === 0;

  const calculateTopAffiliates = (
    data: AffiliatePerformanceData[]
  ): Set<string> => {
    if (data.length === 0) return new Set();

    const sortedByRevenue = [...data].sort(
      (a, b) => b.total_revenue - a.total_revenue
    );

    const topAffiliateNames = new Set(
      sortedByRevenue
        .slice(0, 3)
        .map((item) => `${item.aff_name}-${item.platform}`)
    );
    return topAffiliateNames;
  };

  const topAffiliatesSet = useMemo(
    () => calculateTopAffiliates(affiliateData),
    [affiliateData]
  );

  const isLoading = isLoadingData || isDateRangeLoading;

  return (
    <div className="container p-4 mx-auto space-y-6 md:p-8">
      <Card className="shadow-lg border-[1px] border-gray-300/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            <CardTitle>Affiliate Performance</CardTitle>
          </div>
          <CardDescription>
            Aggregated performance data for affiliates, calculated based on the
            filters selected below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Filters
            products={[{ id: "all", name: "All Products" }]}
            selectedProduct="all"
            onProductChange={() => {}}
            actionTypes={AFFILIATE_ACTION_TYPES}
            selectedActionType={selectedActionType}
            onActionTypeChange={handleFilterChange.actionType}
            platforms={availablePlatforms}
            selectedPlatform={selectedPlatform}
            onPlatformChange={handleFilterChange.platform}
            isPlatformLoading={isFetchingPlatforms}
            searchPlaceholder="Search by Affiliate Name..."
            onSearchChange={handleFilterChange.search}
          />

          {showContentSkeleton ? (
            <AffiliatesLoadingSkeleton itemsPerPage={itemsPerPage} />
          ) : showNoDataMessage ? (
            <AffiliatesNoData />
          ) : (
            <>
              <div className="overflow-x-auto border-b-[1px] rounded-md border-b-gray-300/30">
                <Table>
                  <AffiliatesTableHeader
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <TableBody>
                    {affiliateData.map((item) => {
                      const isTopAffiliate = topAffiliatesSet.has(
                        `${item.aff_name}-${item.platform}`
                      );
                      return (
                        <AffiliatesTableRow
                          key={`${item.aff_name}-${item.platform}`}
                          item={item}
                          isTopAffiliate={isTopAffiliate}
                        />
                      );
                    })}
                  </TableBody>
                  <AffiliatesTableFooter data={affiliateData} />
                </Table>
              </div>

              <AffiliatesPagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalAffiliatesCount={totalAffiliatesCount}
                rowsPerPageOptions={pagination.ROWS_PER_PAGE_OPTIONS}
                isLoading={isLoading}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AffiliatesPage() {
  return (
    <AffiliatesProvider>
      <AffiliatesPageContent />
    </AffiliatesProvider>
  );
}
