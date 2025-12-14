import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ProductPerformanceChart } from "@/components/dashboard/charts/ProductPerformanceChart";
import { ProductSelector } from "@/components/dashboard/performance/ProductSelector";
import { useDashboardData } from "@/contexts/DashboardDataContext";
import { useDashboardConfig } from "@/contexts/DashboardConfigContext";

export default function PerformancePage() {
  const { t } = useTranslation();
  const { filteredSalesData, isLoadingData } = useDashboardData();
  const { isLoading: isDateRangeLoading } = useDashboardConfig();

  const isLoading = isLoadingData || isDateRangeLoading;

  // Calcular os 5 produtos mais vendidos do período
  const topProducts = useMemo(() => {
    const productRevenueMap = filteredSalesData.reduce((acc, record) => {
      if (record.type !== "SALE" || record.status !== "COMPLETED") return acc;

      const productId = record.product?.id || "unknown";
      const productName = record.product?.name || "Unknown Product";

      if (!acc[productId]) {
        acc[productId] = {
          id: productId,
          name: productName,
          totalRevenue: 0,
        };
      }
      acc[productId].totalRevenue += Number(record.grossAmount);
      return acc;
    }, {} as Record<string, { id: string; name: string; totalRevenue: number }>);

    return Object.values(productRevenueMap)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);
  }, [filteredSalesData]);

  // Estado para produtos selecionados (inicialmente os top 5)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(
    topProducts.map((p) => p.id)
  );

  // Atualizar produtos selecionados quando os top products mudarem
  useMemo(() => {
    if (topProducts.length > 0 && selectedProductIds.length === 0) {
      setSelectedProductIds(topProducts.map((p) => p.id));
    }
  }, [topProducts, selectedProductIds.length]);

  const handleToggleProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <div className="container p-4 mx-auto space-y-6 md:p-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold md:text-3xl text-foreground">
          {t("performance.title")}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          {t("performance.description")}
        </p>
      </div>

      {/* Gráfico de Performance */}
      <ProductPerformanceChart
        selectedProductIds={selectedProductIds}
        isLoading={isLoading}
      />

      {/* Seletor de Produtos */}
      <ProductSelector
        topProducts={topProducts}
        selectedProductIds={selectedProductIds}
        onToggleProduct={handleToggleProduct}
        isLoading={isLoading}
      />
    </div>
  );
}
