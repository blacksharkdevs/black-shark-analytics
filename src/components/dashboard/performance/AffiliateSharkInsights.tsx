import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import { Crown, Zap, TrendingUp, Target } from "lucide-react";
import { formatCurrency } from "@/utils/index";
import type { Transaction } from "@/types/index";

interface Affiliate {
  id: string;
  name: string;
  totalRevenue: number;
  totalCommission: number;
}

interface DateRange {
  from: Date;
  to: Date;
}

interface AffiliateSharkInsightsProps {
  selectedAffiliateIds: string[];
  availableAffiliates: Affiliate[];
  filteredSalesData: Transaction[];
  dateRange: DateRange | null;
}

interface AffiliateMetrics {
  name: string;
  salesCount: number;
  totalRevenue: number;
  totalCommission: number;
  totalCustomers: number;
  avgOrderValue: number;
  commissionRate: number;
}

export function AffiliateSharkInsights({
  selectedAffiliateIds,
  availableAffiliates,
  filteredSalesData,
  dateRange,
}: AffiliateSharkInsightsProps) {
  const { t } = useTranslation();

  const insights = useMemo(() => {
    if (selectedAffiliateIds.length === 0 || !dateRange) return null;

    const affiliateSales = filteredSalesData.filter(
      (t) =>
        selectedAffiliateIds.includes(t.affiliateId || "") &&
        t.type === "SALE" &&
        t.status === "COMPLETED"
    );

    if (affiliateSales.length === 0) return null;

    const affiliateMetrics = new Map<string, AffiliateMetrics>();

    selectedAffiliateIds.forEach((id) => {
      const affiliate = availableAffiliates.find((a) => a.id === id);
      if (!affiliate) return;

      const sales = affiliateSales.filter((t) => t.affiliateId === id);
      const totalRevenue = sales.reduce(
        (sum, t) => sum + Number(t.grossAmount),
        0
      );
      const totalCommission = sales.reduce(
        (sum, t) => sum + Number(t.affiliateCommission),
        0
      );
      const totalCustomers = new Set(sales.map((t) => t.customerId)).size;

      affiliateMetrics.set(id, {
        name: affiliate.name,
        salesCount: sales.length,
        totalRevenue,
        totalCommission,
        totalCustomers,
        avgOrderValue: sales.length > 0 ? totalRevenue / sales.length : 0,
        commissionRate:
          totalRevenue > 0 ? (totalCommission / totalRevenue) * 100 : 0,
      });
    });

    const metricsArray = Array.from(affiliateMetrics.entries());

    const topByRevenue = metricsArray.reduce<[string, AffiliateMetrics | null]>(
      (max, [id, metrics]) =>
        metrics.totalRevenue > (max[1]?.totalRevenue || 0)
          ? [id, metrics]
          : max,
      ["", null]
    );

    const topByCommission = metricsArray.reduce<
      [string, AffiliateMetrics | null]
    >(
      (max, [id, metrics]) =>
        metrics.totalCommission > (max[1]?.totalCommission || 0)
          ? [id, metrics]
          : max,
      ["", null]
    );

    const topByCustomers = metricsArray.reduce<
      [string, AffiliateMetrics | null]
    >(
      (max, [id, metrics]) =>
        metrics.totalCustomers > (max[1]?.totalCustomers || 0)
          ? [id, metrics]
          : max,
      ["", null]
    );

    const bestAOV = metricsArray.reduce<[string, AffiliateMetrics | null]>(
      (max, [id, metrics]) =>
        metrics.avgOrderValue > (max[1]?.avgOrderValue || 0)
          ? [id, metrics]
          : max,
      ["", null]
    );

    return {
      affiliateMetrics,
      topByRevenue,
      topByCommission,
      topByCustomers,
      bestAOV,
    };
  }, [selectedAffiliateIds, availableAffiliates, filteredSalesData, dateRange]);

  if (!insights || !insights.topByRevenue[1]) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
      <Card className="shark-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Crown className="h-4 w-4 text-yellow-400" />
            {t("performance.sharkInsights.topByRevenue")}
          </CardTitle>
          <CardDescription className="text-xs">
            {t("performance.sharkInsights.topByRevenueDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {insights.topByRevenue[1] ? (
            <div>
              <div className="text-lg font-bold text-white">
                {insights.topByRevenue[1].name}
              </div>
              <div className="text-2xl font-bold text-cyan-400 mt-2">
                {formatCurrency(insights.topByRevenue[1].totalRevenue)}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {insights.topByRevenue[1].salesCount}{" "}
                {t("performance.sharkInsights.sales")}
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">
              {t("performance.noData")}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shark-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4 text-yellow-400" />
            {t("performance.sharkInsights.topByCommission")}
          </CardTitle>
          <CardDescription className="text-xs">
            {t("performance.sharkInsights.topByCommissionDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {insights.topByCommission[1] ? (
            <div>
              <div className="text-lg font-bold text-white">
                {insights.topByCommission[1].name}
              </div>
              <div className="text-2xl font-bold text-magenta-400 mt-2">
                {formatCurrency(insights.topByCommission[1].totalCommission)}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {insights.topByCommission[1].commissionRate.toFixed(1)}%{" "}
                {t("performance.sharkInsights.rate")}
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">
              {t("performance.noData")}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shark-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-green-400" />
            {t("performance.sharkInsights.topByCustomers")}
          </CardTitle>
          <CardDescription className="text-xs">
            {t("performance.sharkInsights.topByCustomersDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {insights.topByCustomers[1] ? (
            <div>
              <div className="text-lg font-bold text-white">
                {insights.topByCustomers[1].name}
              </div>
              <div className="text-2xl font-bold text-green-400 mt-2">
                {insights.topByCustomers[1].totalCustomers}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {t("performance.sharkInsights.customers")}
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">
              {t("performance.noData")}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shark-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-purple-400" />
            {t("performance.sharkInsights.bestAOV")}
          </CardTitle>
          <CardDescription className="text-xs">
            {t("performance.sharkInsights.bestAOVDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {insights.bestAOV[1] ? (
            <div>
              <div className="text-lg font-bold text-white">
                {insights.bestAOV[1].name}
              </div>
              <div className="text-2xl font-bold text-purple-400 mt-2">
                {formatCurrency(insights.bestAOV[1].avgOrderValue)}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {t("performance.sharkInsights.perSale")}
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">
              {t("performance.noData")}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
