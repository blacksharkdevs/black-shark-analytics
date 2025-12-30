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
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import { Skeleton } from "@/components/common/ui/skeleton";
import { DollarSign } from "lucide-react";
import { formatCurrency } from "@/utils/index";
import type { Transaction } from "@/types/index";

interface AffiliateCommissionAnalyzerProps {
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

interface CommissionData {
  name: string;
  commission: number;
  revenue: number;
  rate: number;
  fill: string;
}

const NEON_COLORS = ["#00ffff", "#ff00ff", "#00ff00", "#ffff00", "#ff6b00"];

export function AffiliateCommissionAnalyzer({
  selectedAffiliateIds,
  availableAffiliates,
  filteredSalesData,
  isLoading,
}: AffiliateCommissionAnalyzerProps) {
  const { t } = useTranslation();

  const commissionData = useMemo(() => {
    if (selectedAffiliateIds.length === 0) return null;

    const data: CommissionData[] = selectedAffiliateIds
      .map((affiliateId, index) => {
        const affiliate = availableAffiliates.find((a) => a.id === affiliateId);
        if (!affiliate) return null;

        const sales = filteredSalesData.filter(
          (t) =>
            t.affiliateId === affiliateId &&
            t.type === "SALE" &&
            t.status === "COMPLETED"
        );

        const totalRevenue = sales.reduce(
          (sum, t) => sum + Number(t.grossAmount),
          0
        );
        const totalCommission = sales.reduce(
          (sum, t) => sum + Number(t.affiliateCommission),
          0
        );

        const rate =
          totalRevenue > 0 ? (totalCommission / totalRevenue) * 100 : 0;

        return {
          name: affiliate.name,
          commission: totalCommission,
          revenue: totalRevenue,
          rate,
          fill: NEON_COLORS[index % NEON_COLORS.length],
        };
      })
      .filter((item): item is CommissionData => item !== null)
      .sort((a, b) => b.commission - a.commission);

    if (data.length === 0) return null;

    const totalCommission = data.reduce(
      (sum, item) => sum + item.commission,
      0
    );
    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const avgRate =
      totalRevenue > 0 ? (totalCommission / totalRevenue) * 100 : 0;

    return {
      data,
      totalCommission,
      totalRevenue,
      avgRate,
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

  if (!commissionData || commissionData.data.length === 0) {
    return (
      <Card className="shark-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            {t("performance.commissionAnalyzer.title")}
          </CardTitle>
          <CardDescription>
            {t("performance.commissionAnalyzer.description")}
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
        <CardTitle className="flex items-center gap-2 text-white">
          <DollarSign className="w-5 h-5" />
          {t("performance.commissionAnalyzer.title")}
        </CardTitle>
        <CardDescription>
          {t("performance.commissionAnalyzer.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={commissionData.data}
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
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              style={{ fontSize: "12px" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(30, 41, 59, 0.95)",
                border: "1px solid rgba(0, 255, 255, 0.3)",
                borderRadius: "8px",
                color: "#fff",
              }}
              formatter={(value: number, name: string) => {
                if (name === "commission") {
                  return [
                    formatCurrency(value),
                    t("performance.commissionAnalyzer.commission"),
                  ];
                }
                return [formatCurrency(value), name];
              }}
              labelStyle={{ color: "#fff" }}
            />
            <Bar
              dataKey="commission"
              radius={[8, 8, 0, 0]}
              isAnimationActive={false}
            >
              {commissionData.data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700">
            <div className="text-xs text-muted-foreground mb-1">
              {t("performance.commissionAnalyzer.totalCommission")}
            </div>
            <div className="text-xl font-bold text-cyan-400">
              {formatCurrency(commissionData.totalCommission)}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700">
            <div className="text-xs text-muted-foreground mb-1">
              {t("performance.commissionAnalyzer.totalRevenue")}
            </div>
            <div className="text-xl font-bold text-white">
              {formatCurrency(commissionData.totalRevenue)}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700">
            <div className="text-xs text-muted-foreground mb-1">
              {t("performance.commissionAnalyzer.avgRate")}
            </div>
            <div className="text-xl font-bold text-yellow-400">
              {commissionData.avgRate.toFixed(2)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
