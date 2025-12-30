import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { parseISO, isSameDay } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import { Button } from "@/components/common/ui/button";
import { Skeleton } from "@/components/common/ui/skeleton";
import { ChartContainer } from "@/components/common/ui/chart";
import { TrendingUp, Maximize2, Minimize2 } from "lucide-react";
import { useDashboardData } from "@/contexts/DashboardDataContext";
import { useDashboardConfig } from "@/contexts/DashboardConfigContext";
import type { Transaction } from "@/types/index";

interface Affiliate {
  id: string;
  name: string;
  totalRevenue: number;
  totalCommission: number;
}

interface AffiliatePerformanceChartProps {
  selectedAffiliateIds: string[];
  isLoading: boolean;
  availableAffiliates: Affiliate[];
  isFullWidth: boolean;
  onToggleFullWidth: () => void;
}

const NEON_COLORS = ["#00ffff", "#ff00ff", "#00ff00", "#ffff00", "#ff6b00"];

const formatYAxisValue = (value: number): string => {
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

export function AffiliatePerformanceChart({
  selectedAffiliateIds,
  isLoading,
  availableAffiliates,
  isFullWidth,
  onToggleFullWidth,
}: AffiliatePerformanceChartProps) {
  const { t } = useTranslation();
  const { filteredSalesData: data } = useDashboardData();
  const { currentDateRange: dateRange } = useDashboardConfig();

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("default", {
        timeZone: "UTC",
        hour: "numeric",
        hour12: true,
      }),
    []
  );

  const shortDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("default", {
        timeZone: "UTC",
        month: "short",
        day: "numeric",
      }),
    []
  );

  const { chartData, affiliateNames, chartConfig } = useMemo(() => {
    if (!dateRange || !dateRange.from || !dateRange.to) {
      return { chartData: [], affiliateNames: {}, chartConfig: {} };
    }

    const singleDayView = isSameDay(dateRange.from, dateRange.to);
    const affiliateNamesMap: Record<string, string> = {};
    const config: Record<string, { label: string; color: string }> = {};

    selectedAffiliateIds.forEach((affiliateId, index) => {
      const affiliate = availableAffiliates.find((a) => a.id === affiliateId);
      if (affiliate) {
        affiliateNamesMap[affiliateId] = affiliate.name;
        config[affiliateId] = {
          label: affiliate.name,
          color: NEON_COLORS[index % NEON_COLORS.length],
        };
      }
    });

    const filteredData = data.filter(
      (record: Transaction) =>
        selectedAffiliateIds.includes(record.affiliateId || "") &&
        record.type === "SALE" &&
        record.status === "COMPLETED"
    );

    const groupedByTime = new Map<string, Record<string, number>>();

    filteredData.forEach((transaction: Transaction) => {
      if (!transaction.occurredAt) return;

      const date = parseISO(transaction.occurredAt);
      let timeKey = "";

      if (singleDayView) {
        timeKey = timeFormatter.format(date);
      } else {
        timeKey = shortDateFormatter.format(date);
      }

      if (!groupedByTime.has(timeKey)) {
        groupedByTime.set(timeKey, {});
      }

      const dayData = groupedByTime.get(timeKey)!;
      const affiliateId = transaction.affiliateId || "unknown";

      if (!dayData[affiliateId]) {
        dayData[affiliateId] = 0;
      }

      dayData[affiliateId] += Number(transaction.grossAmount);
    });

    const sortedKeys = Array.from(groupedByTime.keys()).sort((a, b) => {
      if (singleDayView) {
        const aHour = parseInt(a);
        const bHour = parseInt(b);
        return aHour - bHour;
      }
      return a.localeCompare(b);
    });

    const chartDataArray = sortedKeys.map((timeKey) => {
      const dayData = groupedByTime.get(timeKey) || {};
      return {
        time: timeKey,
        ...dayData,
      };
    });

    return {
      chartData: chartDataArray,
      affiliateNames: affiliateNamesMap,
      chartConfig: config,
    };
  }, [
    dateRange,
    data,
    selectedAffiliateIds,
    availableAffiliates,
    timeFormatter,
    shortDateFormatter,
  ]);

  if (isLoading) {
    return (
      <Card className="shark-card">
        <CardHeader className="flex items-center justify-between pb-4">
          <div className="space-y-2">
            <Skeleton className="w-48 h-6 mb-1" />
            <Skeleton className="w-64 h-4" />
          </div>
          <Skeleton className="w-10 h-10" />
        </CardHeader>
        <CardContent className="pb-6">
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (selectedAffiliateIds.length === 0 || chartData.length === 0) {
    return (
      <Card className="shark-card">
        <CardHeader className="flex items-center justify-between pb-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="w-5 h-5" />
              {t("performance.affiliateChart.title")}
            </CardTitle>
            <CardDescription>
              {t("performance.affiliateChart.description")}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFullWidth}
            className="text-muted-foreground"
          >
            {isFullWidth ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-96 text-muted-foreground">
          {t("performance.noDataSelected")}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shark-card">
      <CardHeader className="flex items-center justify-between pb-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="w-5 h-5" />
            {t("performance.affiliateChart.title")}
          </CardTitle>
          <CardDescription>
            {t("performance.affiliateChart.description")}
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleFullWidth}
          className="text-muted-foreground"
        >
          {isFullWidth ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent className="pb-6">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(0, 255, 255, 0.1)"
              />
              <XAxis
                dataKey="time"
                stroke="rgb(100, 116, 139)"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="rgb(100, 116, 139)"
                tickFormatter={formatYAxisValue}
                style={{ fontSize: "12px" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(30, 41, 59, 0.95)",
                  border: "1px solid rgba(0, 255, 255, 0.3)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value: number) => formatCurrency(value)}
                labelStyle={{ color: "#fff" }}
              />
              <Legend wrapperStyle={{ color: "rgb(148, 163, 184)" }} />
              {selectedAffiliateIds.map((affiliateId, index) => (
                <Line
                  key={affiliateId}
                  type="monotone"
                  dataKey={affiliateId}
                  stroke={NEON_COLORS[index % NEON_COLORS.length]}
                  name={affiliateNames[affiliateId] || affiliateId}
                  dot={false}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
