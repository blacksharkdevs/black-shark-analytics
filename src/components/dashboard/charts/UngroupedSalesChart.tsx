/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
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

interface UngroupedSalesChartProps {
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

const PLATFORM_COLORS: Record<string, string> = {
  BUYGOODS: "hsl(217, 91%, 60%)",
  CLICKBANK: "hsl(142, 76%, 36%)",
  CARTPANDA: "hsl(271, 91%, 65%)",
  STRIPE: "hsl(25, 95%, 53%)",
  PAYPAL: "hsl(340, 82%, 52%)",
  HOTMART: "hsl(48, 96%, 53%)",
  MONETIZZE: "hsl(187, 71%, 42%)",
  EDUZZ: "hsl(14, 90%, 53%)",
};

export function UngroupedSalesChart({
  data,
  dateRange,
}: UngroupedSalesChartProps) {
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

  const { chartData, platforms, chartConfig } = useMemo(() => {
    if (!dateRange || !dateRange.from || !dateRange.to) {
      return { chartData: [], platforms: [], chartConfig: {} };
    }

    const singleDayView = isSameDay(dateRange.from, dateRange.to);
    const platformsSet = new Set<string>();

    // Primeiro, identificar todas as plataformas
    data.forEach((record: Transaction) => {
      if (record.type === "SALE" && record.status === "COMPLETED") {
        platformsSet.add(record.platform);
      }
    });

    const platformsArray = Array.from(platformsSet);

    // Criar chartConfig dinâmico
    const config: Record<string, { label: string; color: string }> = {};
    platformsArray.forEach((platform) => {
      config[platform] = {
        label: platform,
        color: PLATFORM_COLORS[platform] || "hsl(0, 0%, 50%)",
      };
    });

    let finalChartData: Array<{
      name: string;
      [platform: string]: number | string;
    }> = [];

    if (singleDayView) {
      // Visualização horária por plataforma
      const hourlyData = Array.from({ length: 24 }, (_, i) => {
        const baseData: {
          name: string;
          hourIndex: number;
          [key: string]: any;
        } = {
          name: timeFormatter.format(new Date(Date.UTC(2000, 0, 1, i))),
          hourIndex: i,
        };
        platformsArray.forEach((platform) => {
          baseData[platform] = 0;
        });
        return baseData;
      });

      data.forEach((record: Transaction) => {
        const transactionDateObject = parseISO(record.createdAt);
        const hourInUTC = transactionDateObject.getUTCHours();
        const platform = record.platform;

        const targetHourEntry = hourlyData.find(
          (h) => h.hourIndex === hourInUTC
        );
        if (
          targetHourEntry &&
          record.type === "SALE" &&
          record.status === "COMPLETED"
        ) {
          targetHourEntry[platform] =
            (targetHourEntry[platform] as number) + Number(record.grossAmount);
        }
      });

      finalChartData = hourlyData.map((item) => {
        const { hourIndex, ...rest } = item;
        const formatted: { name: string; [key: string]: any } = { ...rest };
        platformsArray.forEach((platform) => {
          if (typeof formatted[platform] === "number") {
            formatted[platform] = parseFloat(formatted[platform].toFixed(2));
          }
        });
        return formatted;
      });
    } else {
      // Visualização diária por plataforma
      const aggregatedData: Record<
        string,
        { name: string; fullDateSortKey: string; [platform: string]: any }
      > = {};

      data.forEach((record: Transaction) => {
        const transactionDateObject = parseISO(record.createdAt);
        const dateKey = dateFnsFormat(transactionDateObject, "yyyy-MM-dd");

        if (!aggregatedData[dateKey]) {
          aggregatedData[dateKey] = {
            name: shortDateFormatter.format(transactionDateObject),
            fullDateSortKey: dateKey,
          };
          platformsArray.forEach((platform) => {
            aggregatedData[dateKey][platform] = 0;
          });
        }

        if (record.type === "SALE" && record.status === "COMPLETED") {
          const platform = record.platform;
          aggregatedData[dateKey][platform] =
            (aggregatedData[dateKey][platform] as number) +
            Number(record.grossAmount);
        }
      });

      finalChartData = Object.values(aggregatedData)
        .sort((a, b) => a.fullDateSortKey.localeCompare(b.fullDateSortKey))
        .map((item) => {
          const { fullDateSortKey, ...rest } = item;
          const formatted: { name: string; [key: string]: any } = { ...rest };
          platformsArray.forEach((platform) => {
            if (typeof formatted[platform] === "number") {
              formatted[platform] = parseFloat(formatted[platform].toFixed(2));
            }
          });
          return formatted;
        });
    }

    return {
      chartData: finalChartData,
      platforms: platformsArray,
      chartConfig: config as ChartConfig,
    };
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
                  if (typeof value === "number") {
                    const formattedValue = `$${value.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`;
                    const label = chartConfig[name as string]?.label || name;
                    return [formattedValue, label];
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
          {platforms.map((platform) => (
            <Line
              key={platform}
              type="monotone"
              dataKey={platform}
              name={platform}
              stroke={`var(--color-${platform})`}
              strokeWidth={2}
              dot={{
                r: 3,
                fill: `var(--color-${platform})`,
                stroke: "hsl(var(--background))",
                strokeWidth: 1.5,
              }}
              activeDot={{
                r: 5,
                fill: `var(--color-${platform})`,
                stroke: "hsl(var(--background))",
                strokeWidth: 2,
              }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
