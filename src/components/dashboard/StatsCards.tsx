import { useMemo } from "react";
import { useTranslation } from "react-i18next";
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
import { formatCurrency } from "@/utils/index";

// Tipagem segura para as chaves (necessário para a lógica do useMemo)
type StatKey =
  | "gross_sales"
  | "total_sales"
  | "front_sales"
  | "back_sales"
  | "average_order_value";

export function StatsCards() {
  const { t } = useTranslation();
  const { stats, isLoadingData } = useDashboardData();
  const { isLoading: isDateRangeLoading } = useDashboardConfig();
  const isLoading = isLoadingData || isDateRangeLoading;

  // 🚨 Usamos o objeto stats com um cast seguro para garantir que as propriedades existam
  const safeStats = stats as Record<string, number>;

  // STATS_MAP traduzido dinamicamente
  const STATS_MAP: Record<
    string,
    { title: string; description: string; formula?: string }
  > = useMemo(
    () => ({
      gross_sales: {
        title: t("dashboard.stats.grossSales"),
        description: t("dashboard.stats.grossSalesDesc"),
        formula: t("dashboard.stats.grossSalesFormula"),
      },
      total_sales: {
        title: t("dashboard.stats.totalSales"),
        description: t("dashboard.stats.totalSalesDesc"),
      },
      front_sales: {
        title: t("dashboard.stats.frontSales"),
        description: t("dashboard.stats.frontSalesDesc"),
      },
      back_sales: {
        title: t("dashboard.stats.backSales"),
        description: t("dashboard.stats.backSalesDesc"),
      },
      average_order_value: {
        title: t("dashboard.stats.aov"),
        description: t("dashboard.stats.aovDesc"),
        formula: t("dashboard.stats.aovFormula"),
      },
    }),
    [t]
  );

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
  }, [STATS_MAP, safeStats, isLoading]);

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
