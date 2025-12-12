import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StatsCard } from "./StatsCard";
import {
  DollarSign,
  BadgePercent,
  Wallet,
  ShoppingCart,
  TrendingDown,
} from "lucide-react";
import { formatCurrency } from "@/utils/index";
import { useDashboardData } from "@/contexts/DashboardDataContext";
import { useDashboardConfig } from "@/contexts/DashboardConfigContext";

// 1. Adicionei as novas chaves aqui
type StatKey =
  | "gross_sales"
  | "net_sales"
  | "total_sales"
  | "total_losses"
  | "average_order_value";

// Interface importada do contexto para garantir consistência
interface DashboardStats {
  totalRevenue: number;
  grossSales: number;
  netSales: number;
  totalTaxes: number;
  totalPlatformFees: number;
  totalAffiliateCommissions: number;
  totalSalesTransactions: number;
  totalRefundsCount: number;
  totalChargebacksCount: number;
  frontSalesCount: number;
  backSalesCount: number;
  averageOrderValue: number;
}

export function StatsCards() {
  const { t } = useTranslation();
  const { stats, isLoadingData } = useDashboardData();
  const { isLoading: isDateRangeLoading } = useDashboardConfig();
  const isLoading = isLoadingData || isDateRangeLoading;

  // Cast seguro tipado
  const safeStats = stats as unknown as DashboardStats;

  const STATS_MAP = useMemo(
    () => ({
      gross_sales: {
        title: t("dashboard.stats.grossSales"),
        description: t("dashboard.stats.grossSalesDesc"),
      },
      net_sales: {
        title: t("dashboard.stats.netSales"),
        description: t("dashboard.stats.netSalesDesc"),
      },
      total_sales: {
        title: t("dashboard.stats.totalSalesCount"),
        description: t("dashboard.stats.totalSalesCountDesc"),
      },
      total_losses: {
        title: t("dashboard.stats.totalLosses"),
        description: t("dashboard.stats.totalLossesDesc"),
      },
      average_order_value: {
        title: t("dashboard.stats.averageOrderValue"),
        description: t("dashboard.stats.averageOrderValueDesc"),
      },
    }),
    [t]
  );

  const cardProps = useMemo(() => {
    // --- EXPLICAÇÕES DETALHADAS PARA CADA CARD ---

    // 1. GROSS SALES - Receita após taxas de plataforma
    const grossSalesExplanation = `Total Revenue: ${formatCurrency(
      safeStats.totalRevenue || 0
    )}
Platform Fee (%): -${formatCurrency(safeStats.totalPlatformFees || 0)}
Taxes: -${formatCurrency(safeStats.totalTaxes || 0)}
--------------------
Gross Sales: ${formatCurrency(safeStats.grossSales || 0)}
Formula: Total Revenue - Platform Fees - Taxes`;

    // 2. NET SALES - Receita líquida final
    const netSalesExplanation = `Gross Sales: ${formatCurrency(
      safeStats.grossSales || 0
    )}
(-) Taxes: -${formatCurrency(safeStats.totalTaxes || 0)}
(-) Platform Fees: -${formatCurrency(safeStats.totalPlatformFees || 0)}
(-) Affiliate Comm.: -${formatCurrency(
      safeStats.totalAffiliateCommissions || 0
    )}
--------------------
Net Payout: ${formatCurrency(safeStats.netSales || 0)}
Formula: Gross - Taxes - Platform Fees - Commissions`;

    // 3. TOTAL SALES - Número de transações
    const totalSalesExplanation = `Total completed sales transactions in the selected period, calculated after all filters are applied.

Sales Transactions: ${safeStats.totalSalesTransactions || 0}
Front Sales: ${safeStats.frontSalesCount || 0}
Back Sales: ${safeStats.backSalesCount || 0}`;

    // 4. TOTAL LOSSES - Perdas (reembolsos + chargebacks em valor monetário)
    // Precisamos calcular o valor total perdido
    // Como não temos o valor exato, vamos usar uma aproximação
    const totalLossesExplanation = `Total monetary losses from refunds and chargebacks in the selected period.

Refunds: ${safeStats.totalRefundsCount || 0} transactions
Chargebacks: ${safeStats.totalChargebacksCount || 0} transactions
Total Loss Events: ${
      (safeStats.totalRefundsCount || 0) +
      (safeStats.totalChargebacksCount || 0)
    }

Note: Losses include all negative transactions (refunds, chargebacks, etc.)`;

    // 5. AVERAGE ORDER VALUE - Ticket médio
    const aovExplanation = `The average gross sales generated per front sale transaction, calculated after all filters are applied.

Gross Sales: ${formatCurrency(safeStats.grossSales || 0)}
Front Sales: ${safeStats.frontSalesCount || 0}
--------------------
Average Order Value: ${formatCurrency(safeStats.averageOrderValue || 0)}
Formula: Gross Sales / Front Sales`;

    // --- DEFINIÇÃO DOS CARDS ---
    const baseCards = [
      {
        id: "gross_sales" as StatKey,
        icon: DollarSign,
        rawValue: safeStats.grossSales || 0,
        explanation: grossSalesExplanation,
        isMonetary: true,
      },
      {
        id: "net_sales" as StatKey,
        icon: Wallet,
        rawValue: safeStats.netSales || 0,
        explanation: netSalesExplanation,
        isMonetary: true,
      },
      {
        id: "total_sales" as StatKey,
        icon: ShoppingCart,
        rawValue: safeStats.totalSalesTransactions || 0,
        explanation: totalSalesExplanation,
        isMonetary: false,
      },
      {
        id: "total_losses" as StatKey,
        icon: TrendingDown,
        rawValue:
          (safeStats.totalRefundsCount || 0) +
          (safeStats.totalChargebacksCount || 0),
        explanation: totalLossesExplanation,
        isMonetary: false,
      },
      {
        id: "average_order_value" as StatKey,
        icon: BadgePercent,
        rawValue: safeStats.averageOrderValue || 0,
        explanation: aovExplanation,
        isMonetary: true,
      },
    ];

    return baseCards.map((props) => {
      const config = STATS_MAP[props.id];

      let value = "";

      if (props.isMonetary) {
        value = formatCurrency(props.rawValue);
      } else {
        value = (props.rawValue || 0).toLocaleString();
      }

      return {
        ...props,
        title: config.title,
        value: value,
        description: config.description,
        isLoading: isLoading,
      };
    });
  }, [STATS_MAP, safeStats, isLoading]);

  // Ajustar grid para comportar mais cards (ex: grid-cols-4 ou grid-cols-5 com wrap)
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cardProps.map((props) => (
        <StatsCard key={props.id} {...props} />
      ))}
    </div>
  );
}
