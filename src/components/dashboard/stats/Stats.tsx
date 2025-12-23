import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StatsCard } from "./StatsCard";
import {
  DollarSign,
  BadgePercent,
  Wallet,
  ShoppingCart,
  TrendingDown,
  ChartArea,
} from "lucide-react";
import { formatCurrency } from "@/utils/index";
import { useDashboardData } from "@/contexts/DashboardDataContext";
import { useDashboardConfig } from "@/contexts/DashboardConfigContext";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";

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
    const grossSalesExplanation = `${t(
      "dashboard.stats.explanations.grossSales.totalRevenue"
    )} ${formatCurrency(safeStats.totalRevenue || 0)}
${t("dashboard.stats.explanations.grossSales.platformFee")} -${formatCurrency(
      safeStats.totalPlatformFees || 0
    )}
${t("dashboard.stats.explanations.grossSales.taxes")} -${formatCurrency(
      safeStats.totalTaxes || 0
    )}
${t("dashboard.stats.explanations.grossSales.separator")}
${t("dashboard.stats.explanations.grossSales.grossSales")} ${formatCurrency(
      safeStats.grossSales || 0
    )}
${t("dashboard.stats.explanations.grossSales.formula")}`;

    // 2. NET SALES - Receita líquida final
    const netSalesExplanation = `${t(
      "dashboard.stats.explanations.netSales.grossSales"
    )} ${formatCurrency(safeStats.grossSales || 0)}
${t("dashboard.stats.explanations.netSales.taxes")} -${formatCurrency(
      safeStats.totalTaxes || 0
    )}
${t("dashboard.stats.explanations.netSales.platformFees")} -${formatCurrency(
      safeStats.totalPlatformFees || 0
    )}
${t("dashboard.stats.explanations.netSales.affiliateComm")} -${formatCurrency(
      safeStats.totalAffiliateCommissions || 0
    )}
${t("dashboard.stats.explanations.netSales.separator")}
${t("dashboard.stats.explanations.netSales.netPayout")} ${formatCurrency(
      safeStats.netSales || 0
    )}
${t("dashboard.stats.explanations.netSales.formula")}`;

    // 3. TOTAL SALES - Número de transações
    const totalSalesExplanation = `${t(
      "dashboard.stats.explanations.totalSales.description"
    )}

${t("dashboard.stats.explanations.totalSales.salesTransactions")} ${
      safeStats.totalSalesTransactions || 0
    }
${t("dashboard.stats.explanations.totalSales.frontSales")} ${
      safeStats.frontSalesCount || 0
    }
${t("dashboard.stats.explanations.totalSales.backSales")} ${
      safeStats.backSalesCount || 0
    }`;

    // 4. TOTAL LOSSES - Perdas (reembolsos + chargebacks em valor monetário)
    const totalLossesExplanation = `${t(
      "dashboard.stats.explanations.totalLosses.description"
    )}

${t("dashboard.stats.explanations.totalLosses.refunds")} ${
      safeStats.totalRefundsCount || 0
    } ${t("dashboard.stats.explanations.totalLosses.transactions")}
${t("dashboard.stats.explanations.totalLosses.chargebacks")} ${
      safeStats.totalChargebacksCount || 0
    } ${t("dashboard.stats.explanations.totalLosses.transactions")}
${t("dashboard.stats.explanations.totalLosses.totalLossEvents")} ${
      (safeStats.totalRefundsCount || 0) +
      (safeStats.totalChargebacksCount || 0)
    }

${t("dashboard.stats.explanations.totalLosses.note")}`;

    // 5. AVERAGE ORDER VALUE - Ticket médio
    const aovExplanation = `${t(
      "dashboard.stats.explanations.averageOrderValue.description"
    )}

${t(
  "dashboard.stats.explanations.averageOrderValue.grossSales"
)} ${formatCurrency(safeStats.grossSales || 0)}
${t("dashboard.stats.explanations.averageOrderValue.frontSales")} ${
      safeStats.frontSalesCount || 0
    }
${t("dashboard.stats.explanations.averageOrderValue.separator")}
${t(
  "dashboard.stats.explanations.averageOrderValue.averageOrderValue"
)} ${formatCurrency(safeStats.averageOrderValue || 0)}
${t("dashboard.stats.explanations.averageOrderValue.formula")}`;

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

  return (
    <div className="shark-card">
      <CardHeader className="px-4 py-3 md:px-6 md:py-4">
        <CardTitle className="flex items-center text-base md:text-lg text-foreground">
          <ChartArea className="w-4 h-4 mr-2 text-blue-600 md:w-6 md:h-6 dark:text-white" />{" "}
          {t("dashboard.stats.mainMetrics")}
        </CardTitle>
        <CardDescription className="text-xs md:text-sm text-muted-foreground">
          {t("dashboard.charts.topAffiliatesDesc")}
        </CardDescription>
      </CardHeader>
      <div className="space-y-0">
        {cardProps.map((props) => (
          <StatsCard key={props.id} {...props} />
        ))}
      </div>
    </div>
  );
}
