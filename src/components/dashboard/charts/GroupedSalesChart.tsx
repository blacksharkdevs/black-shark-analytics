import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { parseISO, format as dateFnsFormat, isSameDay } from "date-fns";
import type { Transaction } from "@/types/index";
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
  ChartContainer,
  ChartTooltipContent,
} from "@/components/common/ui/chart";
import { type ChartConfig } from "@/components/common/ui/chart";

interface GroupedSalesChartProps {
  data: Transaction[];
  dateRange: { from: Date; to: Date } | null;
}

const formatYAxisValue = (value: number): string => {
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

export function GroupedSalesChart({ data, dateRange }: GroupedSalesChartProps) {
  const { t } = useTranslation();

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

  const chartConfig = {
    revenue: {
      label: t("dashboard.charts.revenueLabel"),
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  const chartData = useMemo(() => {
    if (!dateRange || !dateRange.from || !dateRange.to) {
      return [];
    }

    const singleDayView = isSameDay(dateRange.from, dateRange.to);

    if (singleDayView) {
      // Visualização horária
      const hourlyData = Array.from({ length: 24 }, (_, i) => ({
        name: timeFormatter.format(new Date(Date.UTC(2000, 0, 1, i))),
        revenue: 0,
        hourIndex: i,
      }));

      data.forEach((record: Transaction) => {
        const transactionDateObject = parseISO(record.createdAt);
        const hourInUTC = transactionDateObject.getUTCHours();

        const targetHourEntry = hourlyData.find(
          (h) => h.hourIndex === hourInUTC
        );
        if (
          targetHourEntry &&
          record.type === "SALE" &&
          record.status === "COMPLETED"
        ) {
          targetHourEntry.revenue += Number(record.grossAmount);
        }
      });

      return hourlyData.map((item) => ({
        name: item.name,
        revenue: parseFloat(item.revenue.toFixed(2)),
      }));
    } else {
      // Visualização diária
      const aggregatedData: Record<
        string,
        { name: string; revenue: number; fullDateSortKey: string }
      > = {};

      data.forEach((record: Transaction) => {
        const transactionDateObject = parseISO(record.createdAt);
        const dateKey = dateFnsFormat(transactionDateObject, "yyyy-MM-dd");

        if (!aggregatedData[dateKey]) {
          aggregatedData[dateKey] = {
            name: shortDateFormatter.format(transactionDateObject),
            revenue: 0,
            fullDateSortKey: dateKey,
          };
        }
        if (record.type === "SALE" && record.status === "COMPLETED") {
          aggregatedData[dateKey].revenue += Number(record.grossAmount);
        }
      });

      return Object.values(aggregatedData)
        .sort((a, b) => a.fullDateSortKey.localeCompare(b.fullDateSortKey))
        .map((item) => ({
          name: item.name,
          revenue: parseFloat(item.revenue.toFixed(2)),
        }));
    }
  }, [data, dateRange, timeFormatter, shortDateFormatter]);

  return (
    <ChartContainer
      config={chartConfig}
      className="h-[250px] md:h-[350px] lg:h-[400px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="name"
            stroke="hsl(var(--muted-foreground))"
            tickLine={false}
            axisLine={false}
            dy={10}
            tick={{ fontSize: 10 }}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            tickFormatter={formatYAxisValue}
            tickLine={false}
            axisLine={false}
            dx={-5}
            tick={{ fontSize: 10 }}
            width={45}
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
            wrapperStyle={{
              outline: "none",
              boxShadow: "hsl(var(--card-foreground))",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px" }} iconSize={10} />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="var(--color-revenue)"
            strokeWidth={2}
            dot={{
              r: 3,
              fill: "var(--color-revenue)",
              stroke: "hsl(var(--background))",
              strokeWidth: 1.5,
            }}
            activeDot={{
              r: 5,
              fill: "var(--color-revenue)",
              stroke: "hsl(var(--background))",
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
