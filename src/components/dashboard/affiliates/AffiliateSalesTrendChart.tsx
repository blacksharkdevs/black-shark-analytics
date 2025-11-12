import { useMemo } from "react";
import { parseISO, format as dateFnsFormat, isSameDay } from "date-fns";
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
import { Skeleton } from "@/components/common/ui/skeleton";
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/common/ui/chart";
import { type ChartConfig } from "@/components/common/ui/chart";
import type { SaleRecord } from "@/types/index";

const chartConfig = {
  revenue: {
    label: "Revenue (USD)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const formatYAxisValue = (value: number): string => {
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

interface AffiliateSalesTrendChartProps {
  data: SaleRecord[];
  isLoading: boolean;
  dateRange: { from: Date; to: Date } | null;
}

export function AffiliateSalesTrendChart({
  data,
  isLoading,
  dateRange,
}: AffiliateSalesTrendChartProps) {
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

  const chartData = useMemo(() => {
    if (!dateRange || !dateRange.from || !dateRange.to) {
      return [];
    }

    const singleDayView = isSameDay(dateRange.from, dateRange.to);

    if (singleDayView) {
      // Hourly aggregation
      const hourlyData = Array.from({ length: 24 }, (_, i) => ({
        name: timeFormatter.format(new Date(Date.UTC(2000, 0, 1, i))),
        revenue: 0,
        hourIndex: i,
      }));

      data.forEach((record) => {
        const transactionDateObject = parseISO(record.transaction_date);
        const hourInUTC = transactionDateObject.getUTCHours();

        const targetHourEntry = hourlyData.find(
          (h) => h.hourIndex === hourInUTC
        );
        if (targetHourEntry) {
          targetHourEntry.revenue += record.revenue;
        }
      });

      return hourlyData.map((item) => ({
        name: item.name,
        revenue: parseFloat(item.revenue.toFixed(2)),
      }));
    } else {
      // Daily aggregation
      const aggregatedData = data.reduce((acc, record) => {
        const transactionDateObject = parseISO(record.transaction_date);
        const dateKey = dateFnsFormat(transactionDateObject, "yyyy-MM-dd");

        if (!acc[dateKey]) {
          acc[dateKey] = {
            name: shortDateFormatter.format(transactionDateObject),
            revenue: 0,
            fullDateSortKey: dateKey,
          };
        }
        acc[dateKey].revenue += record.revenue;
        return acc;
      }, {} as Record<string, { name: string; revenue: number; fullDateSortKey: string }>);

      return Object.values(aggregatedData)
        .sort((a, b) => a.fullDateSortKey.localeCompare(b.fullDateSortKey))
        .map((item) => ({
          name: item.name,
          revenue: parseFloat(item.revenue.toFixed(2)),
        }));
    }
  }, [data, dateRange, timeFormatter, shortDateFormatter]);

  if (isLoading) {
    return (
      <Card className="border rounded-none shadow-lg border-white/30">
        <CardHeader>
          <Skeleton className="w-48 mb-1 rounded-none h-7 bg-accent/20" />
          <Skeleton className="w-64 h-4 rounded-none bg-accent/20" />
        </CardHeader>
        <CardContent className="pb-6 pl-2 pr-6">
          <Skeleton className="h-[350px] w-full bg-accent/30 rounded-none" />
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="border rounded-none shadow-lg border-white/30">
        <CardHeader>
          <CardTitle>Sales Trend</CardTitle>
          <CardDescription>
            Revenue over the selected period (UTC).
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">
            No sales data available for the selected period.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border rounded-none shadow-lg border-white/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-foreground">Sales Trend</CardTitle>
        <CardDescription>
          Revenue over the selected period (UTC).
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-6 pl-2 pr-6">
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 10, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={formatYAxisValue}
                tickLine={false}
                axisLine={false}
                dx={-5}
              />
              <Tooltip
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    hideLabel={false}
                    formatter={(value, name) => {
                      if (name === "revenue" && typeof value === "number") {
                        return [
                          `$${value.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`,
                          chartConfig.revenue.label,
                        ];
                      }
                      return [value, name];
                    }}
                  />
                }
                cursor={{
                  stroke: "hsl(var(--accent))",
                  strokeWidth: 2,
                  strokeDasharray: "3 3",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-revenue)"
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: "var(--color-revenue)",
                  stroke: "hsl(var(--background))",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                  fill: "var(--color-revenue)",
                  stroke: "hsl(var(--background))",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
