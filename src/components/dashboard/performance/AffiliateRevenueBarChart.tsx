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
import { BarChart3 } from "lucide-react";
import { formatCurrency } from "@/utils/index";

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

interface AffiliateRevenueBarChartProps {
  affiliateMetrics: AffiliateMetrics[];
  isLoading: boolean;
  selectedAffiliateIds: string[];
}

const NEON_COLORS = ["#00ffff", "#ff00ff", "#00ff00", "#ffff00", "#ff6b00"];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: AffiliateMetrics;
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload || !payload[0]) return null;

  const data = payload[0].payload;

  return (
    <div className="p-3 border rounded-lg shadow-lg bg-card border-border">
      <div className="mb-2 text-sm font-bold text-white">{data.name}</div>
      <div className="space-y-1 text-xs">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Receita Bruta:</span>
          <span className="font-bold text-cyan-400">
            {formatCurrency(data.totalRevenue)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Comissão:</span>
          <span className="font-bold text-magenta-400">
            {formatCurrency(data.commissionPaid)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Receita Líquida:</span>
          <span className="font-bold text-green-400">
            {formatCurrency(data.totalNet)}
          </span>
        </div>
        <div className="pt-2 mt-2 border-t border-border">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Vendas:</span>
            <span className="font-bold text-white">{data.salesCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export function AffiliateRevenueBarChart({
  affiliateMetrics,
  isLoading,
  selectedAffiliateIds,
}: AffiliateRevenueBarChartProps) {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    const filtered = affiliateMetrics.filter((a) =>
      selectedAffiliateIds.includes(a.id)
    );

    return filtered
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10); // Top 10
  }, [affiliateMetrics, selectedAffiliateIds]);

  const formatYAxisValue = (value: number): string => {
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  if (isLoading) {
    return (
      <Card className="shark-card">
        <CardHeader>
          <Skeleton className="w-48 h-6" />
          <Skeleton className="w-64 h-4 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-96" />
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="shark-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            {t("performance.affiliates.revenueByAffiliate")}
          </CardTitle>
          <CardDescription>
            {t("performance.affiliates.revenueByAffiliateDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center text-muted-foreground">
            {t("performance.noData")}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shark-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          {t("performance.affiliates.revenueByAffiliate")}
        </CardTitle>
        <CardDescription>
          {t("performance.affiliates.revenueByAffiliateDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              type="number"
              stroke="#888"
              fontSize={12}
              tickFormatter={formatYAxisValue}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#888"
              fontSize={12}
              width={90}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "#ffffff10" }}
            />
            <Bar dataKey="totalRevenue" radius={[0, 8, 8, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${entry.id}`}
                  fill={NEON_COLORS[index % NEON_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
