import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AffiliateSummaryCards } from "@/components/dashboard/performance/AffiliateSummaryCards";
import { AffiliateRevenueBarChart } from "@/components/dashboard/performance/AffiliateRevenueBarChart";
import { AffiliateRiskScatterPlot } from "@/components/dashboard/performance/AffiliateRiskScatterPlot";
import { AffiliateDetailTable } from "@/components/dashboard/performance/AffiliateDetailTable";
import { AffiliateSelector } from "@/components/dashboard/performance/AffiliateSelector";
import { useDashboardData } from "@/contexts/DashboardDataContext";
import { useDashboardConfig } from "@/contexts/DashboardConfigContext";
import type { Transaction } from "@/types/index";

interface AffiliateMetrics {
  id: string;
  name: string;
  totalRevenue: number;
  totalNet: number;
  salesCount: number;
  commissionPaid: number;
  refundCount: number;
  refundRate: number;
}

export default function AffiliatesPerformancePage() {
  const { t } = useTranslation();
  const { filteredSalesData, isLoadingData } = useDashboardData();
  const { isLoading: isDateRangeLoading } = useDashboardConfig();

  const isLoading = isLoadingData || isDateRangeLoading;

  // Calcular métricas agregadas por afiliado
  const affiliateMetrics = useMemo(() => {
    const metricsMap = new Map<string, AffiliateMetrics>();

    filteredSalesData.forEach((record: Transaction) => {
      if (!record.affiliateId) return;

      const affiliateId = record.affiliateId;
      const affiliateName =
        record.affiliate?.name || `Affiliate ${affiliateId}`;

      if (!metricsMap.has(affiliateId)) {
        metricsMap.set(affiliateId, {
          id: affiliateId,
          name: affiliateName,
          totalRevenue: 0,
          totalNet: 0,
          salesCount: 0,
          commissionPaid: 0,
          refundCount: 0,
          refundRate: 0,
        });
      }

      const metrics = metricsMap.get(affiliateId)!;

      if (record.type === "SALE" && record.status === "COMPLETED") {
        metrics.salesCount += 1;
        metrics.totalRevenue += Number(record.grossAmount);
        metrics.totalNet += Number(record.netAmount);
        metrics.commissionPaid += Number(record.affiliateCommission);
      }

      if (record.type === "REFUND") {
        metrics.refundCount += 1;
      }
    });

    // Calcular refund rate
    metricsMap.forEach((metrics) => {
      metrics.refundRate =
        metrics.salesCount > 0
          ? (metrics.refundCount / metrics.salesCount) * 100
          : 0;
    });

    return Array.from(metricsMap.values()).sort(
      (a, b) => b.totalRevenue - a.totalRevenue
    );
  }, [filteredSalesData]);

  const topAffiliates = useMemo(() => {
    return affiliateMetrics.slice(0, 10);
  }, [affiliateMetrics]);

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

      {/* Top Row - Summary Cards */}
      <AffiliateSummaryCards
        affiliateMetrics={affiliateMetrics}
        isLoading={isLoading}
      />

      {/* Middle Row - Layout with Selector and Visualizations */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Affiliate Selector - Sidebar */}
        <div className="w-full lg:w-1/4">
          <AffiliateSelector
            availableAffiliates={affiliateMetrics.map((m) => ({
              id: m.id,
              name: m.name,
              totalRevenue: m.totalRevenue,
              totalCommission: m.commissionPaid,
              salesCount: m.salesCount,
            }))}
            selectedAffiliateIds={selectedAffiliateIds}
            onToggleAffiliate={handleToggleAffiliate}
            isLoading={isLoading}
          />
        </div>

        {/* Charts Column */}
        <div className="flex-1 space-y-6">
          {/* Horizontal Bar Chart */}
          <AffiliateRevenueBarChart
            affiliateMetrics={affiliateMetrics}
            isLoading={isLoading}
            selectedAffiliateIds={selectedAffiliateIds}
          />

          {/* Scatter Plot - Risk Analysis */}
          <AffiliateRiskScatterPlot
            affiliateMetrics={affiliateMetrics}
            isLoading={isLoading}
            selectedAffiliateIds={selectedAffiliateIds}
          />
        </div>
      </div>

      {/* Bottom Row - Detailed Table */}
      <AffiliateDetailTable
        affiliateMetrics={affiliateMetrics}
        isLoading={isLoading}
        selectedAffiliateIds={selectedAffiliateIds}
      />
    </div>
  );
}
