import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import { Skeleton } from "@/components/common/ui/skeleton";
import { Activity, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/utils/index";
import type { Transaction } from "@/types/index";

interface AffiliateQualityMonitorProps {
  selectedAffiliateIds: string[];
  availableAffiliates: Array<{
    id: string;
    name: string;
    totalRevenue: number;
    totalCommission: number;
  }>;
  filteredSalesData: Transaction[];
  isLoading: boolean;
}

interface QualityData {
  name: string;
  affiliateId: string;
  healthScore: number;
  sales: number;
  refunds: number;
  chargebacks: number;
  refundRate: number;
  chargebackRate: number;
  totalRevenue: number;
  status: string;
  fill: string;
}

const HEALTH_COLORS = {
  excellent: "#00ff00",
  good: "#00ffff",
  fair: "#ffff00",
  poor: "#ff6b00",
  critical: "#ff0000",
};

export function AffiliateQualityMonitor({
  selectedAffiliateIds,
  availableAffiliates,
  filteredSalesData,
  isLoading,
}: AffiliateQualityMonitorProps) {
  const { t } = useTranslation();

  const qualityData = useMemo(() => {
    if (selectedAffiliateIds.length === 0) return null;

    const data: QualityData[] = selectedAffiliateIds
      .map((affiliateId) => {
        const affiliate = availableAffiliates.find((a) => a.id === affiliateId);
        if (!affiliate) return null;

        const sales = filteredSalesData.filter(
          (t) =>
            t.affiliateId === affiliateId &&
            t.type === "SALE" &&
            t.status === "COMPLETED"
        );

        const refunds = filteredSalesData.filter(
          (t) => t.affiliateId === affiliateId && t.type === "REFUND"
        );

        const chargebacks = filteredSalesData.filter(
          (t) => t.affiliateId === affiliateId && t.type === "CHARGEBACK"
        );

        const totalRevenue = sales.reduce(
          (sum, t) => sum + Number(t.grossAmount),
          0
        );

        const refundRate =
          sales.length > 0 ? (refunds.length / sales.length) * 100 : 0;
        const chargebackRate =
          sales.length > 0 ? (chargebacks.length / sales.length) * 100 : 0;

        let healthScore = 100;
        if (sales.length === 0) {
          healthScore = 0;
        } else {
          healthScore = Math.max(0, 100 - refundRate * 2 - chargebackRate * 3);
        }

        let status = "critical";
        let fill = HEALTH_COLORS.critical;

        if (healthScore >= 95) {
          status = "excellent";
          fill = HEALTH_COLORS.excellent;
        } else if (healthScore >= 85) {
          status = "good";
          fill = HEALTH_COLORS.good;
        } else if (healthScore >= 75) {
          status = "fair";
          fill = HEALTH_COLORS.fair;
        } else if (healthScore >= 50) {
          status = "poor";
          fill = HEALTH_COLORS.poor;
        }

        return {
          name: affiliate.name,
          affiliateId,
          healthScore: Math.round(healthScore),
          sales: sales.length,
          refunds: refunds.length,
          chargebacks: chargebacks.length,
          refundRate: Math.round(refundRate * 10) / 10,
          chargebackRate: Math.round(chargebackRate * 10) / 10,
          totalRevenue,
          status,
          fill,
        };
      })
      .filter((item): item is QualityData => item !== null)
      .sort((a, b) => b.healthScore - a.healthScore);

    if (data.length === 0) return null;

    const avgHealthScore =
      data.reduce((sum, item) => sum + item.healthScore, 0) / data.length;

    const criticalCount = data.filter(
      (item) => item.status === "critical" || item.status === "poor"
    ).length;

    return {
      data,
      avgHealthScore,
      criticalCount,
    };
  }, [selectedAffiliateIds, availableAffiliates, filteredSalesData]);

  if (isLoading) {
    return (
      <Card className="shark-card">
        <CardHeader className="px-4 py-3 md:px-6 md:py-4">
          <Skeleton className="w-48 h-6 mb-1" />
          <Skeleton className="w-64 h-4" />
        </CardHeader>
        <CardContent className="pb-6">
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!qualityData || qualityData.data.length === 0) {
    return (
      <Card className="shark-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            {t("performance.qualityMonitor.title")}
          </CardTitle>
          <CardDescription>
            {t("performance.qualityMonitor.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          {t("performance.noData")}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shark-card">
      <CardHeader className="px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <Activity className="w-5 h-5" />
              {t("performance.qualityMonitor.title")}
            </CardTitle>
            <CardDescription>
              {t("performance.qualityMonitor.description")}
            </CardDescription>
          </div>
          {qualityData.criticalCount > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-red-500/20 border border-red-500">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-xs text-red-400 font-semibold">
                {qualityData.criticalCount}{" "}
                {t("performance.qualityMonitor.atRisk")}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={qualityData.data}
            margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(0, 255, 255, 0.1)"
            />
            <XAxis
              dataKey="name"
              stroke="rgb(100, 116, 139)"
              style={{ fontSize: "12px" }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              stroke="rgb(100, 116, 139)"
              style={{ fontSize: "12px" }}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(30, 41, 59, 0.95)",
                border: "1px solid rgba(0, 255, 255, 0.3)",
                borderRadius: "8px",
                color: "#fff",
              }}
              formatter={(value: number) => [
                `${value}%`,
                t("performance.qualityMonitor.healthScore"),
              ]}
              labelStyle={{ color: "#fff" }}
            />
            <ReferenceLine
              y={75}
              stroke="#ff6b00"
              strokeDasharray="3 3"
              label={{
                value: t("performance.qualityMonitor.warningLine"),
                position: "right",
                fill: "#ff6b00",
                fontSize: 10,
              }}
            />
            <Bar
              dataKey="healthScore"
              radius={[8, 8, 0, 0]}
              isAnimationActive={false}
            >
              {qualityData.data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {qualityData.data.map((affiliate) => (
            <div
              key={affiliate.affiliateId}
              className="p-4 rounded-lg bg-slate-900/50 border border-slate-700"
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-white text-sm">
                  {affiliate.name}
                </h4>
                <div
                  className="px-2 py-1 rounded text-xs font-bold"
                  style={{
                    backgroundColor: affiliate.fill,
                    color: "#000",
                  }}
                >
                  {affiliate.healthScore}%
                </div>
              </div>

              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>{t("performance.qualityMonitor.sales")}:</span>
                  <span className="text-white">{affiliate.sales}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("performance.qualityMonitor.refunds")}:</span>
                  <span
                    className={
                      affiliate.refunds > 0 ? "text-red-400" : "text-green-400"
                    }
                  >
                    {affiliate.refunds} ({affiliate.refundRate}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t("performance.qualityMonitor.chargebacks")}:</span>
                  <span
                    className={
                      affiliate.chargebacks > 0
                        ? "text-red-400"
                        : "text-green-400"
                    }
                  >
                    {affiliate.chargebacks} ({affiliate.chargebackRate}%)
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-700 mt-2">
                  <span>{t("performance.qualityMonitor.revenue")}:</span>
                  <span className="text-cyan-400">
                    {formatCurrency(affiliate.totalRevenue)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
