import React, { useMemo } from "react";
import { StatsCard } from "./StatsCard";
import {
  DollarSign,
  BarChart3,
  Users,
  Package,
  BadgePercent,
} from "lucide-react";

import { useDashboardData } from "@/hooks/useDashboardData"; // Dados e Stats
import { useDashboardConfig } from "@/hooks/useDashboardConfig"; // Loading de Config

// Mapeamento de Título, Descrição e Fórmula (o mesmo do StatsCard original)
const STATS_MAP = {
  gross_sales: {
    title: "Gross Sales",
    description: "Revenue after platform fees & taxes",
    formula: "Total Revenue - Platform Fees - Taxes",
  },
  total_sales: {
    title: "Total Sales",
    description: "Total number of transactions",
  },
  front_sales: {
    title: "Front Sales",
    description: "Number of initial sales (non-upsell new orders)",
  },
  back_sales: {
    title: "Back Sales",
    description: "Number of upsells/follow-ups (upsell new orders)",
  },
  average_order_value: {
    title: "Average Order Value",
    description: "Avg. gross sales per front sale",
    formula: "Gross Sales / Front Sales",
  },
};

export function StatsCards() {
  // 🔑 CONSUMO: Dados, Estatísticas e Utilitários
  const { stats, isLoadingData, formatCurrency } = useDashboardData();
  const { isLoading: isDateRangeLoading } = useDashboardConfig();
  const isLoading = isLoadingData || isDateRangeLoading;

  // --- CÁLCULO DAS PROPS (Toda a lógica de switch/case é resolvida aqui) ---
  const cardProps = useMemo(() => {
    // Lógica complexa do tooltip de Gross Sales (Resolvendo o bug de valor zero)
    const grossSalesExplanation = `Total Revenue: ${formatCurrency(
      stats.totalRevenue
    )}\nPlatform Fee (%): -${formatCurrency(
      stats.platformFeePercentage
    )}\nPlatform Fee ($): -${formatCurrency(
      stats.platformFeeFixed
    )}\nTaxes: -${formatCurrency(
      stats.totalTaxes
    )}\n--------------------\nGross Sales: ${formatCurrency(stats.grossSales)}`;

    const avgOrderValueExplanation = `Avg. gross sales generated per initial transaction.\n\nGross Sales: ${formatCurrency(
      stats.grossSales
    )}\nFront Sales: ${stats.frontSalesCount.toLocaleString()}`;

    return [
      {
        // Gross Sales
        id: "gross_sales",
        Icon: DollarSign,
        value: formatCurrency(stats.grossSales), // Valor monetário
        explanation: grossSalesExplanation,
      },
      {
        // Total Sales
        id: "total_sales",
        Icon: BarChart3,
        value: (stats.totalSalesTransactions || 0).toLocaleString(), // Valor de contagem
      },
      {
        // Front Sales
        id: "front_sales",
        Icon: Users,
        value: (stats.frontSalesCount || 0).toLocaleString(),
      },
      {
        // Back Sales
        id: "back_sales",
        Icon: Package,
        value: (stats.backSalesCount || 0).toLocaleString(),
      },
      {
        // Average Order Value
        id: "average_order_value",
        Icon: BadgePercent,
        value: formatCurrency(stats.averageOrderValue), // Valor monetário
        explanation: avgOrderValueExplanation,
      },
    ].map((props) => ({
      ...props,
      // Puxa title, description, formula do mapa estático e adiciona loading
      title: STATS_MAP[props.id].title,
      description: STATS_MAP[props.id].description!,
      formula: STATS_MAP[props.id].formula,
      isLoading: isLoading,
    }));
  }, [stats, isLoading, formatCurrency]); // Recalcula quando stats mudar

  // --- RENDERIZAÇÃO ---
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
      {cardProps.map((props) => (
        <StatsCard
          key={props.id}
          title={props.title}
          value={props.value}
          icon={props.Icon} // Icone é passado como elemento React
          description={props.description}
          isLoading={props.isLoading}
          explanation={props.explanation}
          formula={props.formula}
        />
      ))}
    </div>
  );
}
