import { Filters } from "@/components/dashboard/filters/Filters";
import { StatsCards } from "@/components/dashboard/stats/Stats";
import { useDashboardConfig } from "@/contexts/DashboardConfigContext";
import { useDashboardData } from "@/contexts/DashboardDataContext";
import { SalesTrendChart } from "@/components/dashboard/charts/SalesTrendChart";
import { TopAffiliatesTable } from "@/components/dashboard/tables/TopAffiliatesTable";
import { TopProductsTable } from "@/components/dashboard/tables/TopProductsTable";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { Calendar } from "lucide-react";

export default function DashboardPage() {
  const { t, i18n } = useTranslation();

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
    isProductsGrouped,
    setIsProductsGrouped,
    isLoadingData,
  } = useDashboardData();

  const { currentDateRange, isLoading: isDateRangeLoading } =
    useDashboardConfig();

  const isCombinedLoading = isLoadingData || isDateRangeLoading;

  // Formatar período para mobile
  const formatDateRange = () => {
    if (!currentDateRange?.from) return "";

    const locale = i18n.language === "pt-BR" ? ptBR : enUS;
    const dateFormat = "dd MMM yyyy";

    const fromDate = format(currentDateRange.from, dateFormat, { locale });
    const toDate = currentDateRange.to
      ? format(currentDateRange.to, dateFormat, { locale })
      : fromDate;

    return `${fromDate} - ${toDate}`;
  };

  return (
    <div className="container p-4 mx-auto space-y-6 md:p-8">
      {/* Período atual - Visível apenas no mobile */}
      {currentDateRange?.from && (
        <div className="block md:hidden px-4 py-3 rounded-xl bg-[rgba(6,182,212,0.1)] border border-[rgba(6,182,212,0.2)]">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="font-medium text-foreground">
              {t("filters.period")}:
            </span>
            <span className="text-muted-foreground">{formatDateRange()}</span>
          </div>
        </div>
      )}

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
        isProductsGrouped={isProductsGrouped}
        onProductsGroupChange={setIsProductsGrouped}
        isLoading={isCombinedLoading}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="h-full lg:col-span-1">
          <StatsCards />
        </div>

        <div className="lg:col-span-2">
          <SalesTrendChart />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="lg:col-span-1 lg:col-start-1">
          <TopAffiliatesTable />
        </div>

        <div className="lg:col-span-1">
          <TopProductsTable />
        </div>
      </div>
    </div>
  );
}
