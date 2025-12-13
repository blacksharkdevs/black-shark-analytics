import { Filters } from "@/components/dashboard/filters/Filters";
import { StatsCards } from "@/components/dashboard/stats/Stats";
import { useDashboardConfig } from "@/contexts/DashboardConfigContext";
import { useDashboardData } from "@/contexts/DashboardDataContext";
import { SalesTrendChart } from "@/components/dashboard/charts/SalesTrendChart";
import { TopAffiliatesTable } from "@/components/dashboard/tables/TopAffiliatesTable";
import { TopProductsTable } from "@/components/dashboard/tables/TopProductsTable";

export default function DashboardPage() {
  const {
    availableProducts,
    availableOfferTypes,
    availablePlatforms,
    selectedProduct,
    setSelectedProduct,
    selectedOfferType,
    setSelectedOfferType,
    selectedPlatform,
    setSelectedPlatform,
    isLoadingData,
  } = useDashboardData();

  const { isLoading: isDateRangeLoading } = useDashboardConfig();

  const isCombinedLoading = isLoadingData || isDateRangeLoading;

  return (
    <div className="container p-4 mx-auto space-y-6 md:p-8">
      <div className="p-4 rounded-none shadow bg-card/50 border-[1px] border-white/30">
        <Filters
          products={availableProducts}
          selectedProduct={selectedProduct}
          onProductChange={setSelectedProduct}
          offerTypes={availableOfferTypes}
          selectedOfferType={selectedOfferType}
          onOfferTypeChange={setSelectedOfferType}
          platforms={availablePlatforms}
          selectedPlatform={selectedPlatform}
          onPlatformChange={setSelectedPlatform}
          isLoading={isCombinedLoading}
        />
      </div>

      <div className="container p-0 mx-auto space-y-6">
        <StatsCards />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <SalesTrendChart />
        </div>

        <div className="lg:col-span-1">
          <TopAffiliatesTable />
        </div>

        <div className="lg:col-span-1">
          <TopProductsTable />
        </div>
      </div>
    </div>
  );
}
