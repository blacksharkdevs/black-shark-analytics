import { Filters } from "@/components/dashboard/Filters";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useDashboardConfig } from "@/hooks/useDashboardConfig";
import { DashboardDataProvider } from "@/contexts/DashboardDataContext";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { SalesTrendChart } from "@/components/dashboard/SalesTrendChart";
import { TopAffiliatesTable } from "@/components/dashboard/TopAffiliatesTable";
import { TopSellingItemsTable } from "@/components/dashboard/TopSellingItemsTable";
import { TopProductsTable } from "@/components/dashboard/TopProductsTable";

function DashboardPageContent() {
  const {
    availableProducts,
    availableOfferTypes,
    selectedProduct,
    setSelectedProduct,
    selectedOfferType,
    setSelectedOfferType,
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
          actionTypes={availableOfferTypes}
          selectedActionType={selectedOfferType}
          onActionTypeChange={setSelectedOfferType}
          isLoading={isCombinedLoading}
        />
      </div>

      <div className="container p-0 mx-auto space-y-6">
        <StatsCards />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-3">
          <SalesTrendChart />
        </div>

        <div className="lg:col-span-1">
          <TopAffiliatesTable />
        </div>

        <div className="lg:col-span-1">
          <TopSellingItemsTable />
        </div>

        <div className="lg:col-span-1">
          <TopProductsTable />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardDataProvider>
      <DashboardPageContent />
    </DashboardDataProvider>
  );
}
