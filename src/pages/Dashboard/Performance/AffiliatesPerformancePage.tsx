import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AffiliatePerformanceChart } from "@/components/dashboard/charts/AffiliatePerformanceChart";
import { AffiliateSelector } from "@/components/dashboard/performance/AffiliateSelector";
import { AffiliateSharkInsights } from "@/components/dashboard/performance/AffiliateSharkInsights";
import { AffiliateCommissionAnalyzer } from "@/components/dashboard/performance/AffiliateCommissionAnalyzer";
import { AffiliateQualityMonitor } from "@/components/dashboard/performance/AffiliateQualityMonitor";
import { useDashboardData } from "@/contexts/DashboardDataContext";
import { useDashboardConfig } from "@/contexts/DashboardConfigContext";
import { cn } from "@/lib/utils";

interface Affiliate {
  id: string;
  name: string;
  totalRevenue: number;
  totalCommission: number;
  salesCount: number;
}

export default function AffiliatesPerformancePage() {
  const { t } = useTranslation();
  const { filteredSalesData, isLoadingData } = useDashboardData();
  const { isLoading: isDateRangeLoading, currentDateRange } =
    useDashboardConfig();

  const isLoading = isLoadingData || isDateRangeLoading;
  const [isFullWidth, setIsFullWidth] = useState(false);

  const availableAffiliates = useMemo(() => {
    const affiliateMap = new Map<string, Affiliate>();

    filteredSalesData.forEach((record) => {
      if (
        !record.affiliateId ||
        record.type !== "SALE" ||
        record.status !== "COMPLETED"
      ) {
        return;
      }

      const affiliateId = record.affiliateId;
      const affiliateName =
        record.affiliate?.name || `Affiliate ${affiliateId}`;

      if (!affiliateMap.has(affiliateId)) {
        affiliateMap.set(affiliateId, {
          id: affiliateId,
          name: affiliateName,
          totalRevenue: 0,
          totalCommission: 0,
          salesCount: 0,
        });
      }

      const affiliate = affiliateMap.get(affiliateId)!;
      affiliate.totalRevenue += Number(record.grossAmount);
      affiliate.totalCommission += Number(record.affiliateCommission);
      affiliate.salesCount += 1;
    });

    return Array.from(affiliateMap.values()).sort(
      (a, b) => b.totalRevenue - a.totalRevenue
    );
  }, [filteredSalesData]);

  const topAffiliates = useMemo(() => {
    return availableAffiliates.slice(0, 5);
  }, [availableAffiliates]);

  const [selectedAffiliateIds, setSelectedAffiliateIds] = useState<string[]>(
    []
  );

  useEffect(() => {
    if (topAffiliates.length > 0 && selectedAffiliateIds.length === 0) {
      setSelectedAffiliateIds(topAffiliates.map((a) => a.id));
    }
  }, [topAffiliates, selectedAffiliateIds.length]);

  const handleToggleAffiliate = (affiliateId: string) => {
    setSelectedAffiliateIds((prev) =>
      prev.includes(affiliateId)
        ? prev.filter((id) => id !== affiliateId)
        : [...prev, affiliateId]
    );
  };

  return (
    <div className="container p-4 mx-auto space-y-6 md:p-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold md:text-3xl text-foreground">
          {t("performance.affiliatesTitle")}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          {t("performance.affiliatesDescription")}
        </p>
      </div>

      {/* Gráfico e Afiliados - Layout Dinâmico */}
      <div
        className={cn(
          "flex gap-6",
          isFullWidth ? "flex-col" : "flex-col lg:flex-row"
        )}
      >
        {/* Gráfico de Performance */}
        <div className={cn(isFullWidth ? "w-full" : "w-full lg:w-2/3")}>
          <AffiliatePerformanceChart
            selectedAffiliateIds={selectedAffiliateIds}
            isLoading={isLoading}
            availableAffiliates={availableAffiliates}
            isFullWidth={isFullWidth}
            onToggleFullWidth={() => setIsFullWidth(!isFullWidth)}
          />
        </div>

        {/* Seletor de Afiliados */}
        <div className={cn(isFullWidth ? "w-full" : "w-full lg:w-1/3")}>
          <AffiliateSelector
            availableAffiliates={availableAffiliates}
            selectedAffiliateIds={selectedAffiliateIds}
            onToggleAffiliate={handleToggleAffiliate}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Shark AI Analysis */}
      <AffiliateSharkInsights
        selectedAffiliateIds={selectedAffiliateIds}
        availableAffiliates={availableAffiliates}
        filteredSalesData={filteredSalesData}
        dateRange={currentDateRange}
      />

      {/* Grid de Análise Técnica */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Coluna 1: Commission Analyzer */}
        <div className="lg:col-span-1">
          <AffiliateCommissionAnalyzer
            selectedAffiliateIds={selectedAffiliateIds}
            availableAffiliates={availableAffiliates}
            filteredSalesData={filteredSalesData}
            isLoading={isLoading}
          />
        </div>

        {/* Coluna 2: Quality Monitor */}
        <div className="lg:col-span-1">
          <AffiliateQualityMonitor
            selectedAffiliateIds={selectedAffiliateIds}
            availableAffiliates={availableAffiliates}
            filteredSalesData={filteredSalesData}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
