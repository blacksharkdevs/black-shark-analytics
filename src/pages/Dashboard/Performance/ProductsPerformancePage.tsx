import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ProductPerformanceChart } from "@/components/dashboard/charts/ProductPerformanceChart";
import { ProductSelector } from "@/components/dashboard/performance/ProductSelector";
import { SharkInsights } from "@/components/dashboard/performance/SharkInsights";
import { ProfitWaterfall } from "@/components/dashboard/performance/ProfitWaterfall";
import { BundleIntelligence } from "@/components/dashboard/performance/BundleIntelligence";
import { HealthMonitor } from "@/components/dashboard/performance/HealthMonitor";
import { useDashboardData } from "@/contexts/DashboardDataContext";
import { useDashboardConfig } from "@/contexts/DashboardConfigContext";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  totalRevenue: number;
  isGrouped?: boolean;
  groupedProducts?: Array<{ id: string; name: string }>;
}

export default function ProductsPerformancePage() {
  const { t } = useTranslation();
  const { filteredSalesData, isLoadingData } = useDashboardData();
  const { isLoading: isDateRangeLoading, currentDateRange } =
    useDashboardConfig();

  const isLoading = isLoadingData || isDateRangeLoading;

  // Estado para agrupamento de produtos
  const [isProductsGrouped, setIsProductsGrouped] = useState(true);

  // Estado para layout do gráfico (full width ou lado a lado)
  const [isFullWidth, setIsFullWidth] = useState(false);

  // Calcular produtos disponíveis (com ou sem agrupamento)
  const availableProducts = useMemo(() => {
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
    }, {} as Record<string, Product>);

    let productsList = Object.values(productRevenueMap).sort(
      (a, b) => b.totalRevenue - a.totalRevenue
    );

    // Aplicar agrupamento se habilitado
    if (isProductsGrouped) {
      const groupMap = new Map<string, Product[]>();

      productsList.forEach((product) => {
        const baseName =
          product.name
            .replace(/\+.*/gi, "")
            .replace(/\d+\s*(bottle|bottles|unit|units|pack|packs)s?/gi, "")
            .replace(/\s+(pro|plus|premium)\s*$/gi, "")
            .replace(/\s+s\s+/gi, " ")
            .replace(/\s+s$/gi, "")
            .replace(/\s+/g, " ")
            .trim() || product.name;

        const existing = groupMap.get(baseName) || [];
        groupMap.set(baseName, [...existing, product]);
      });

      const grouped: Product[] = [];
      const ungrouped: Product[] = [];

      groupMap.forEach((products, baseName) => {
        if (products.length === 1) {
          ungrouped.push(products[0]);
        } else {
          const totalRevenue = products.reduce(
            (sum, p) => sum + p.totalRevenue,
            0
          );
          grouped.push({
            id: `group:${baseName}`,
            name: baseName,
            totalRevenue,
            isGrouped: true,
            groupedProducts: products.map((p) => ({ id: p.id, name: p.name })),
          });
        }
      });

      productsList = [
        ...grouped.sort((a, b) => b.totalRevenue - a.totalRevenue),
        ...ungrouped.sort((a, b) => b.totalRevenue - a.totalRevenue),
      ];
    }

    return productsList;
  }, [filteredSalesData, isProductsGrouped]);

  // Top 5 produtos para seleção inicial
  const topProducts = useMemo(() => {
    return availableProducts.slice(0, 5);
  }, [availableProducts]);

  // Estado para produtos selecionados (inicialmente os top 5)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Atualizar produtos selecionados quando os top products mudarem
  useEffect(() => {
    if (topProducts.length > 0 && selectedProductIds.length === 0) {
      setSelectedProductIds(topProducts.map((p) => p.id));
    }
  }, [topProducts, selectedProductIds.length]);

  // Limpar o gráfico quando o agrupamento mudar
  const handleProductsGroupChange = (value: boolean) => {
    setIsProductsGrouped(value);
    setSelectedProductIds([]); // Limpa todos os produtos selecionados
  };

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

      {/* Gráfico e Produtos - Layout Dinâmico */}
      <div
        className={cn(
          "flex gap-6",
          isFullWidth ? "flex-col" : "flex-col lg:flex-row"
        )}
      >
        {/* Gráfico de Performance */}
        <div className={cn(isFullWidth ? "w-full" : "w-full lg:w-2/3")}>
          <ProductPerformanceChart
            selectedProductIds={selectedProductIds}
            isLoading={isLoading}
            availableProducts={availableProducts}
            isFullWidth={isFullWidth}
            onToggleFullWidth={() => setIsFullWidth(!isFullWidth)}
          />
        </div>

        {/* Seletor de Produtos */}
        <div className={cn(isFullWidth ? "w-full" : "w-full lg:w-1/3")}>
          <ProductSelector
            availableProducts={availableProducts}
            selectedProductIds={selectedProductIds}
            onToggleProduct={handleToggleProduct}
            isLoading={isLoading}
            isProductsGrouped={isProductsGrouped}
            onProductsGroupChange={handleProductsGroupChange}
          />
        </div>
      </div>

      {/* Shark AI Analysis */}
      <SharkInsights
        selectedProductIds={selectedProductIds}
        availableProducts={availableProducts}
        filteredSalesData={filteredSalesData}
        dateRange={currentDateRange}
      />

      {/* Grid de Análise Técnica */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Coluna 1: Profit Waterfall */}
        <div className="lg:col-span-1">
          <ProfitWaterfall
            filteredSalesData={filteredSalesData}
            isLoading={isLoading}
          />
        </div>

        {/* Coluna 2: Bundle Intelligence */}
        <div className="lg:col-span-1">
          <BundleIntelligence
            filteredSalesData={filteredSalesData}
            isLoading={isLoading}
          />
        </div>

        {/* Coluna 3: Health Monitor */}
        <div className="lg:col-span-1">
          <HealthMonitor
            filteredSalesData={filteredSalesData}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
