import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { parseISO, subDays, isAfter } from "date-fns";
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

interface SharkInsightsProps {
  selectedProductIds: string[];
  availableProducts: Product[];
  filteredSalesData: Transaction[];
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
    if (selectedProductIds.length < 2) {
      return null;
    }

    // Expandir produtos agrupados
    const expandedProductIds: string[] = [];
    const productIdToDisplayId: Record<string, string> = {};

    selectedProductIds.forEach((productId) => {
      if (productId.startsWith("group:")) {
        const groupedProduct = availableProducts.find((p) => p.id === productId);
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

    // Agrupar por produto de exibição
    const productStats: Record<
      string,
      {
        displayId: string;
        name: string;
        totalRevenue: number;
        transactionCount: number;
        avgRevenue: number;
        recentRevenue: number; // últimos 3 dias
        color: string;
      }
    > = {};

    const now = new Date();
    const threeDaysAgo = subDays(now, 3);

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
          color: getProductColor(displayId),
        };
      }

      const revenue = Number(transaction.grossAmount);
      productStats[displayId].totalRevenue += revenue;
      productStats[displayId].transactionCount += 1;

      // Verificar se é dos últimos 3 dias
      const transactionDate = parseISO(transaction.createdAt);
      if (isAfter(transactionDate, threeDaysAgo)) {
        productStats[displayId].recentRevenue += revenue;
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

    // 3. A TENDÊNCIA - Crescimento recente (últimos 3 dias)
    const trend = statsArray.reduce((max, current) =>
      current.recentRevenue > max.recentRevenue ? current : max
    );

    const trendPercentage =
      (trend.recentRevenue / trend.totalRevenue) * 100;

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
        percentage: trendPercentage,
        recentRevenue: trend.recentRevenue,
      },
    };
  }, [selectedProductIds, availableProducts, filteredSalesData]);

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
        <h2 className="text-lg md:text-xl font-bold text-foreground">
          {t("performance.insights.title")}
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground">
          {t("performance.insights.description")}
        </p>
      </div>

      {/* Grid de Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                className="text-2xl md:text-3xl font-bold tabular-nums"
                style={{ color: insights.predator.product.color }}
              >
                {insights.predator.product.name}
              </p>
              <p className="text-lg md:text-xl font-semibold text-foreground mt-1">
                {formatCurrency(insights.predator.product.totalRevenue)}
              </p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
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
                className="text-2xl md:text-3xl font-bold tabular-nums"
                style={{ color: insights.strategist.product.color }}
              >
                {insights.strategist.product.name}
              </p>
              <p className="text-lg md:text-xl font-semibold text-foreground mt-1">
                {formatCurrency(insights.strategist.avgRevenue)}
                <span className="text-xs text-muted-foreground ml-1">
                  /{t("performance.insights.strategist.perSale")}
                </span>
              </p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
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
                className="text-2xl md:text-3xl font-bold tabular-nums"
                style={{ color: insights.trend.product.color }}
              >
                {insights.trend.product.name}
              </p>
              <p className="text-lg md:text-xl font-semibold text-foreground mt-1">
                {formatCurrency(insights.trend.recentRevenue)}
                <span className="text-xs text-muted-foreground ml-1">
                  {t("performance.insights.trend.recentDays")}
                </span>
              </p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("performance.insights.trend.description", {
                product: insights.trend.product.name,
                percentage: insights.trend.percentage.toFixed(0),
              })}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
