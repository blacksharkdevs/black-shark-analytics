import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  parseISO,
  differenceInDays,
  differenceInHours,
  isAfter,
} from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import { Crown, Zap, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/utils/index";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/types/index";

interface Product {
  id: string;
  name: string;
  totalRevenue: number;
  isGrouped?: boolean;
  groupedProducts?: Array<{ id: string; name: string }>;
}

interface DateRange {
  from: Date;
  to: Date;
}

interface SharkInsightsProps {
  selectedProductIds: string[];
  availableProducts: Product[];
  filteredSalesData: Transaction[];
  dateRange: DateRange | null;
}

// Cores neon para os produtos (mesmas do gráfico)
const NEON_COLORS = [
  "#00ffff", // Ciano neon
  "#ff00ff", // Magenta neon
  "#00ff00", // Verde neon
  "#ffff00", // Amarelo neon
  "#ff6b00", // Laranja neon
];

export function SharkInsights({
  selectedProductIds,
  availableProducts,
  filteredSalesData,
  dateRange,
}: SharkInsightsProps) {
  const { t } = useTranslation();

  // Calcular insights
  const insights = useMemo(() => {
    // Obter cor do produto baseado no índice de seleção
    const getProductColor = (productId: string) => {
      const index = selectedProductIds.indexOf(productId);
      if (index === -1) return NEON_COLORS[0];
      return NEON_COLORS[index % NEON_COLORS.length];
    };

    if (selectedProductIds.length < 2 || !dateRange) {
      return null;
    }

    // Expandir produtos agrupados
    const expandedProductIds: string[] = [];
    const productIdToDisplayId: Record<string, string> = {};

    selectedProductIds.forEach((productId) => {
      if (productId.startsWith("group:")) {
        const groupedProduct = availableProducts.find(
          (p) => p.id === productId
        );
        if (groupedProduct && groupedProduct.groupedProducts) {
          groupedProduct.groupedProducts.forEach((p) => {
            expandedProductIds.push(p.id);
            productIdToDisplayId[p.id] = productId;
          });
        }
      } else {
        expandedProductIds.push(productId);
        productIdToDisplayId[productId] = productId;
      }
    });

    // Filtrar transações dos produtos selecionados
    const relevantTransactions = filteredSalesData.filter(
      (t) =>
        expandedProductIds.includes(t.product?.id || "") &&
        t.type === "SALE" &&
        t.status === "COMPLETED"
    );

    if (relevantTransactions.length === 0) {
      return null;
    }

    // Calcular duração do período e definir estratégia de tendência
    const periodDays = differenceInDays(dateRange.to, dateRange.from);
    const periodHours = differenceInHours(dateRange.to, dateRange.from);

    // Determinar ponto de corte para "período recente"
    // Se é 1 dia (24h): usar segunda metade (últimas 12h)
    // Se é até 7 dias: usar segunda metade do período
    // Se é mais de 7 dias: usar últimos 30% do período
    let trendCutoffDate: Date;
    let trendLabel: string;

    if (periodHours <= 24) {
      // Período de 1 dia: comparar últimas 12h
      const halfPeriod = Math.floor(periodHours / 2);
      trendCutoffDate = new Date(
        dateRange.to.getTime() - halfPeriod * 60 * 60 * 1000
      );
      trendLabel = t("performance.insights.trend.last12Hours");
    } else if (periodDays <= 7) {
      // Período de até 7 dias: comparar segunda metade
      const halfPeriod = Math.floor(periodDays / 2);
      trendCutoffDate = new Date(
        dateRange.to.getTime() - halfPeriod * 24 * 60 * 60 * 1000
      );
      trendLabel = t("performance.insights.trend.recentPeriod", {
        days: halfPeriod,
      });
    } else {
      // Período longo: comparar últimos 30%
      const recentDays = Math.floor(periodDays * 0.3);
      trendCutoffDate = new Date(
        dateRange.to.getTime() - recentDays * 24 * 60 * 60 * 1000
      );
      trendLabel = t("performance.insights.trend.recentPeriod", {
        days: recentDays,
      });
    }

    // Agrupar por produto de exibição
    const productStats: Record<
      string,
      {
        displayId: string;
        name: string;
        totalRevenue: number;
        transactionCount: number;
        avgRevenue: number;
        recentRevenue: number;
        earlyRevenue: number;
        color: string;
      }
    > = {};

    relevantTransactions.forEach((transaction) => {
      const productId = transaction.product?.id || "";
      const displayId = productIdToDisplayId[productId];

      if (!productStats[displayId]) {
        const product = availableProducts.find((p) => p.id === displayId);
        productStats[displayId] = {
          displayId,
          name: product?.name || "Unknown",
          totalRevenue: 0,
          transactionCount: 0,
          avgRevenue: 0,
          recentRevenue: 0,
          earlyRevenue: 0,
          color: getProductColor(displayId),
        };
      }

      const revenue = Number(transaction.grossAmount);
      productStats[displayId].totalRevenue += revenue;
      productStats[displayId].transactionCount += 1;

      // Classificar entre período recente e período inicial
      const transactionDate = parseISO(transaction.createdAt);
      if (isAfter(transactionDate, trendCutoffDate)) {
        productStats[displayId].recentRevenue += revenue;
      } else {
        productStats[displayId].earlyRevenue += revenue;
      }
    });

    // Calcular média de receita por transação
    Object.values(productStats).forEach((stat) => {
      stat.avgRevenue = stat.totalRevenue / stat.transactionCount;
    });

    const statsArray = Object.values(productStats);

    // 1. O PREDADOR - Maior volume total
    const predator = statsArray.reduce((max, current) =>
      current.totalRevenue > max.totalRevenue ? current : max
    );

    const secondPlace = statsArray
      .filter((s) => s.displayId !== predator.displayId)
      .reduce((max, current) =>
        current.totalRevenue > max.totalRevenue ? current : max
      );

    const predatorAdvantage =
      ((predator.totalRevenue - secondPlace.totalRevenue) /
        secondPlace.totalRevenue) *
      100;

    // 2. O ESTRATEGISTA - Melhor eficiência (receita média por transação)
    const strategist = statsArray.reduce((max, current) =>
      current.avgRevenue > max.avgRevenue ? current : max
    );

    const secondBestEfficiency = statsArray
      .filter((s) => s.displayId !== strategist.displayId)
      .reduce((max, current) =>
        current.avgRevenue > max.avgRevenue ? current : max
      );

    const efficiencyAdvantage =
      ((strategist.avgRevenue - secondBestEfficiency.avgRevenue) /
        secondBestEfficiency.avgRevenue) *
      100;

    // 3. A TENDÊNCIA - Produto com melhor momento atual
    // Calcula qual produto está performando melhor no período recente vs período inicial
    const trendStats = statsArray.map((stat) => {
      // Evitar divisão por zero
      if (stat.earlyRevenue === 0) {
        return {
          ...stat,
          growthRate: stat.recentRevenue > 0 ? Infinity : 0,
        };
      }
      // Calcular taxa de crescimento: (recente - inicial) / inicial * 100
      const growthRate =
        ((stat.recentRevenue - stat.earlyRevenue) / stat.earlyRevenue) * 100;
      return { ...stat, growthRate };
    });

    const trend = trendStats.reduce((max, current) =>
      current.growthRate > max.growthRate ? current : max
    );

    return {
      predator: {
        product: predator,
        advantage: predatorAdvantage,
        secondPlace: secondPlace.name,
      },
      strategist: {
        product: strategist,
        advantage: efficiencyAdvantage,
        avgRevenue: strategist.avgRevenue,
      },
      trend: {
        product: trend,
        growthRate: trend.growthRate,
        recentRevenue: trend.recentRevenue,
        label: trendLabel,
      },
    };
  }, [selectedProductIds, availableProducts, filteredSalesData, dateRange, t]);

  // Não renderizar se não houver insights
  if (!insights) {
    if (selectedProductIds.length === 1) {
      return (
        <Card className="shark-card border-yellow-500/20">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t("performance.insights.needMoreProducts")}
            </p>
          </CardContent>
        </Card>
      );
    }
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold md:text-xl text-foreground">
          {t("performance.insights.title")}
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground">
          {t("performance.insights.description")}
        </p>
      </div>

      {/* Grid de Insights */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: O PREDADOR */}
        <Card
          className={cn(
            "shark-card overflow-hidden",
            "hover:shadow-lg transition-all duration-300"
          )}
          style={{
            borderLeft: `4px solid ${insights.predator.product.color}`,
          }}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div
                className="p-2 rounded-lg"
                style={{
                  backgroundColor: `${insights.predator.product.color}20`,
                }}
              >
                <Crown
                  className="w-5 h-5"
                  style={{ color: insights.predator.product.color }}
                />
              </div>
              <div className="flex-1">
                <CardTitle className="text-sm text-muted-foreground">
                  {t("performance.insights.predator.title")}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t("performance.insights.predator.subtitle")}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p
                className="text-2xl font-bold md:text-3xl tabular-nums"
                style={{ color: insights.predator.product.color }}
              >
                {insights.predator.product.name}
              </p>
              <p className="mt-1 text-lg font-semibold md:text-xl text-foreground">
                {formatCurrency(insights.predator.product.totalRevenue)}
              </p>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {t("performance.insights.predator.description", {
                product: insights.predator.product.name,
                percentage: insights.predator.advantage.toFixed(0),
                secondPlace: insights.predator.secondPlace,
              })}
            </p>
          </CardContent>
        </Card>

        {/* Card 2: O ESTRATEGISTA */}
        <Card
          className={cn(
            "shark-card overflow-hidden",
            "hover:shadow-lg transition-all duration-300"
          )}
          style={{
            borderLeft: `4px solid ${insights.strategist.product.color}`,
          }}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div
                className="p-2 rounded-lg"
                style={{
                  backgroundColor: `${insights.strategist.product.color}20`,
                }}
              >
                <Zap
                  className="w-5 h-5"
                  style={{ color: insights.strategist.product.color }}
                />
              </div>
              <div className="flex-1">
                <CardTitle className="text-sm text-muted-foreground">
                  {t("performance.insights.strategist.title")}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t("performance.insights.strategist.subtitle")}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p
                className="text-2xl font-bold md:text-3xl tabular-nums"
                style={{ color: insights.strategist.product.color }}
              >
                {insights.strategist.product.name}
              </p>
              <p className="mt-1 text-lg font-semibold md:text-xl text-foreground">
                {formatCurrency(insights.strategist.avgRevenue)}
                <span className="ml-1 text-xs text-muted-foreground">
                  /{t("performance.insights.strategist.perSale")}
                </span>
              </p>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {t("performance.insights.strategist.description", {
                product: insights.strategist.product.name,
                percentage: insights.strategist.advantage.toFixed(0),
              })}
            </p>
          </CardContent>
        </Card>

        {/* Card 3: A TENDÊNCIA */}
        <Card
          className={cn(
            "shark-card overflow-hidden",
            "hover:shadow-lg transition-all duration-300"
          )}
          style={{
            borderLeft: `4px solid ${insights.trend.product.color}`,
          }}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div
                className="p-2 rounded-lg"
                style={{
                  backgroundColor: `${insights.trend.product.color}20`,
                }}
              >
                <TrendingUp
                  className="w-5 h-5"
                  style={{ color: insights.trend.product.color }}
                />
              </div>
              <div className="flex-1">
                <CardTitle className="text-sm text-muted-foreground">
                  {t("performance.insights.trend.title")}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t("performance.insights.trend.subtitle")}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p
                className="text-2xl font-bold md:text-3xl tabular-nums"
                style={{ color: insights.trend.product.color }}
              >
                {insights.trend.product.name}
              </p>
              <p className="mt-1 text-lg font-semibold md:text-xl text-foreground">
                {insights.trend.growthRate === Infinity ? (
                  <>
                    <span className="text-green-400">↑ Novo</span>
                    <span className="ml-1 text-xs text-muted-foreground">
                      {insights.trend.label}
                    </span>
                  </>
                ) : (
                  <>
                    <span
                      className={cn(
                        insights.trend.growthRate >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      )}
                    >
                      {insights.trend.growthRate >= 0 ? "↑" : "↓"}{" "}
                      {Math.abs(insights.trend.growthRate).toFixed(0)}%
                    </span>
                    <span className="ml-1 text-xs text-muted-foreground">
                      {insights.trend.label}
                    </span>
                  </>
                )}
              </p>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {insights.trend.growthRate === Infinity
                ? t("performance.insights.trend.descriptionNew", {
                    product: insights.trend.product.name,
                    revenue: formatCurrency(insights.trend.recentRevenue),
                  })
                : insights.trend.growthRate >= 0
                ? t("performance.insights.trend.descriptionGrowth", {
                    product: insights.trend.product.name,
                    percentage: Math.abs(insights.trend.growthRate).toFixed(0),
                  })
                : t("performance.insights.trend.descriptionDecline", {
                    product: insights.trend.product.name,
                    percentage: Math.abs(insights.trend.growthRate).toFixed(0),
                  })}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
