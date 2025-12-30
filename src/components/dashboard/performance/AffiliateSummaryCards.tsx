import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import { Crown, TrendingUp, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/utils/index";
import { Skeleton } from "@/components/common/ui/skeleton";

interface AffiliateMetrics {
  id: string;
  name: string;
  totalRevenue: number;
  totalNet: number;
  salesCount: number;
  commissionPaid: number;
  refundCount: number;
  refundRate: number;
}

interface AffiliateSummaryCardsProps {
  affiliateMetrics: AffiliateMetrics[];
  isLoading: boolean;
}

export function AffiliateSummaryCards({
  affiliateMetrics,
  isLoading,
}: AffiliateSummaryCardsProps) {
  const { t } = useTranslation();

  const { topByRevenue, topByVolume, highestRefundRate } = useMemo(() => {
    if (affiliateMetrics.length === 0) {
      return {
        topByRevenue: null,
        topByVolume: null,
        highestRefundRate: null,
      };
    }

    const topRevenue = [...affiliateMetrics].sort(
      (a, b) => b.totalRevenue - a.totalRevenue
    )[0];

    const topVolume = [...affiliateMetrics].sort(
      (a, b) => b.salesCount - a.salesCount
    )[0];

    const highestRefund = [...affiliateMetrics].sort(
      (a, b) => b.refundRate - a.refundRate
    )[0];

    return {
      topByRevenue: topRevenue,
      topByVolume: topVolume,
      highestRefundRate: highestRefund,
    };
  }, [affiliateMetrics]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="shark-card">
            <CardHeader className="pb-3">
              <Skeleton className="w-32 h-5" />
              <Skeleton className="w-24 h-4 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="w-40 h-8" />
              <Skeleton className="w-32 h-4 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {/* Top Affiliate by Revenue */}
      <Card className="shark-card border-cyan-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Crown className="w-5 h-5 text-yellow-400" />
            {t("performance.affiliates.topByRevenue")}
          </CardTitle>
          <CardDescription className="text-xs">
            {t("performance.affiliates.topByRevenueDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topByRevenue ? (
            <div>
              <div className="text-lg font-bold text-white">
                {topByRevenue.name}
              </div>
              <div className="mt-2 text-3xl font-bold text-cyan-400">
                {formatCurrency(topByRevenue.totalRevenue)}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {topByRevenue.salesCount} {t("performance.affiliates.sales")} •{" "}
                {formatCurrency(topByRevenue.commissionPaid)}{" "}
                {t("performance.affiliates.commission")}
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              {t("performance.noData")}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Affiliate by Volume */}
      <Card className="shark-card border-green-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-5 h-5 text-green-400" />
            {t("performance.affiliates.topByVolume")}
          </CardTitle>
          <CardDescription className="text-xs">
            {t("performance.affiliates.topByVolumeDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topByVolume ? (
            <div>
              <div className="text-lg font-bold text-white">
                {topByVolume.name}
              </div>
              <div className="mt-2 text-3xl font-bold text-green-400">
                {topByVolume.salesCount}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {formatCurrency(topByVolume.totalRevenue)}{" "}
                {t("performance.affiliates.revenue")} •{" "}
                {topByVolume.refundRate.toFixed(1)}%{" "}
                {t("performance.affiliates.refundRate")}
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              {t("performance.noData")}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Highest Refund Rate - Alert Style */}
      <Card
        className={`shark-card ${
          highestRefundRate && highestRefundRate.refundRate > 3
            ? "border-red-500/50 bg-red-950/20"
            : "border-yellow-500/20"
        }`}
      >
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle
              className={`h-5 w-5 ${
                highestRefundRate && highestRefundRate.refundRate > 3
                  ? "text-red-400"
                  : "text-yellow-400"
              }`}
            />
            {t("performance.affiliates.highestRefundRate")}
          </CardTitle>
          <CardDescription className="text-xs">
            {t("performance.affiliates.highestRefundRateDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {highestRefundRate ? (
            <div>
              <div className="text-lg font-bold text-white">
                {highestRefundRate.name}
              </div>
              <div
                className={`mt-2 text-3xl font-bold ${
                  highestRefundRate.refundRate > 3
                    ? "text-red-400"
                    : highestRefundRate.refundRate > 1
                    ? "text-yellow-400"
                    : "text-green-400"
                }`}
              >
                {highestRefundRate.refundRate.toFixed(1)}%
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {highestRefundRate.refundCount}{" "}
                {t("performance.affiliates.refunds")} /{" "}
                {highestRefundRate.salesCount}{" "}
                {t("performance.affiliates.sales")}
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              {t("performance.noData")}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
