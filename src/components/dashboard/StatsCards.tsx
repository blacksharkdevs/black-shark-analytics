import { useMemo } from "react";
import { StatsCard } from "./StatsCard";
import {
  DollarSign,
  BarChart3,
  Users,
  Package,
  BadgePercent,
} from "lucide-react";

import { useDashboardData } from "@/hooks/useDashboardData";
import { useDashboardConfig } from "@/hooks/useDashboardConfig";

// Tipagem segura para as chaves (necessário para a lógica do useMemo)
type StatKey =
  | "gross_sales"
  | "total_sales"
  | "front_sales"
  | "back_sales"
  | "average_order_value";

// 🚨 Corrigindo a tipagem do STATS_MAP para Record<string, ...> para tipagem segura
const STATS_MAP: Record<
  string,
  { title: string; description: string; formula?: string }
> = {
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
  const { stats, isLoadingData, formatCurrency } = useDashboardData();
  const { isLoading: isDateRangeLoading } = useDashboardConfig();
  const isLoading = isLoadingData || isDateRangeLoading;

  // 🚨 Usamos o objeto stats com um cast seguro para garantir que as propriedades existam
  const safeStats = stats as Record<string, number>;

  const cardProps = useMemo(() => {
    // 1. CÁLCULO DE TOOLTIPS COMPLEXOS
    const grossSalesExplanation = `Total Revenue: ${formatCurrency(
      safeStats.totalRevenue
    )}\nPlatform Fee (%): -${formatCurrency(
      safeStats.platformFeePercentage
    )}\nPlatform Fee ($): -${formatCurrency(
      safeStats.platformFeeFixed
    )}\nTaxes: -${formatCurrency(
      safeStats.totalTaxes
    )}\n--------------------\nGross Sales: ${formatCurrency(
      safeStats.grossSales
    )}`;

    const avgOrderValueExplanation = `Avg. gross sales generated per initial transaction.\n\nGross Sales: ${formatCurrency(
      safeStats.grossSales
    )}\nFront Sales: ${safeStats.frontSalesCount.toLocaleString()}`;

    // 2. DEFINIÇÃO DAS PROPS
    const baseCards = [
      {
        id: "gross_sales" as StatKey,
        Icon: DollarSign,
        rawValue: safeStats.grossSales,
        explanation: grossSalesExplanation,
      },
      {
        id: "total_sales" as StatKey,
        Icon: BarChart3,
        rawValue: safeStats.totalSalesTransactions,
      },
      {
        id: "front_sales" as StatKey,
        Icon: Users,
        rawValue: safeStats.frontSalesCount,
      },
      {
        id: "back_sales" as StatKey,
        Icon: Package,
        rawValue: safeStats.backSalesCount,
      },
      {
        id: "average_order_value" as StatKey,
        Icon: BadgePercent,
        rawValue: safeStats.averageOrderValue,
        explanation: avgOrderValueExplanation,
      },
    ];

    // 3. MAPEAR E FORMATAR
    return baseCards.map((props) => {
      const config = STATS_MAP[props.id];

      // Determina o 'value' formatado e o 'rawValue' para o CountUp
      const isMonetary =
        props.id === "gross_sales" || props.id === "average_order_value";

      const value = isMonetary
        ? formatCurrency(props.rawValue)
        : (props.rawValue || 0).toLocaleString();

      return {
        ...props,
        title: config.title,
        value: value,
        description: config.description,
        formula: config.formula,
        isLoading: isLoading,
        isMonetary,
      };
    });
  }, [stats, isLoading, formatCurrency]);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
      {cardProps.map((props) => (
        <StatsCard
          key={props.id}
          title={props.title}
          value={props.value}
          rawValue={props.rawValue}
          icon={props.Icon}
          description={props.description}
          isLoading={props.isLoading}
          explanation={props.explanation}
          formula={props.formula}
          isMonetary={props.isMonetary}
        />
      ))}
    </div>
  );
}
