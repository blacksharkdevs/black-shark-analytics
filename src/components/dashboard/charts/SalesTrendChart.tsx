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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card"; // Migrado
import { Skeleton } from "@/components/common/ui/skeleton"; // Migrado
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/common/ui/chart"; // Assumindo que este wrapper existe
import { type ChartConfig } from "@/components/common/ui/chart";
import { useDashboardData } from "@/contexts/DashboardDataContext";
import { useDashboardConfig } from "@/contexts/DashboardConfigContext";

// --- FORMATADORES UTC ---
// Formata o valor do YAxis (eixo vertical)
const formatYAxisValue = (value: number): string => {
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

export function SalesTrendChart() {
  const { t } = useTranslation();
  // 🔑 CONSUMO: Puxando dados e estados dos Contextos
  const { filteredSalesData: data, isLoadingData } = useDashboardData();
  const { currentDateRange: dateRange, isLoading: isDateRangeLoading } =
    useDashboardConfig();

  const isLoading = isLoadingData || isDateRangeLoading;

  // Config do gráfico traduzida
  const chartConfig = useMemo(
    () => ({
      revenue: {
        label: t("dashboard.charts.revenueLabel"),
        color: "hsl(var(--primary))",
      },
    }),
    [t]
  ) satisfies ChartConfig;

  // Intl formatters explicitly using UTC for display consistency
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

  // --- LÓGICA DE AGREGAÇÃO E TRANSFORMAÇÃO DE DADOS (useMemo) ---
  const { chartData, xAxisTickFormatter } = useMemo(() => {
    // 🚨 Logica de guarda
    if (!dateRange || !dateRange.from || !dateRange.to) {
      return {
        chartData: [],
        xAxisTickFormatter: (v: string) => v,
        isSingleDayView: false,
      };
    }

    const singleDayView = isSameDay(dateRange.from, dateRange.to);
    let aggregatedData: Record<
      string,
      { name: string; revenue: number; fullDateSortKey: string }
    > = {};
    let finalChartData: Array<{ name: string; revenue: number }> = [];

    if (singleDayView) {
      // --- VISUALIZAÇÃO HORÁRIA (Single Day) ---
      const hourlyData = Array.from({ length: 24 }, (_, i) => ({
        name: timeFormatter.format(new Date(Date.UTC(2000, 0, 1, i))),
        revenue: 0,
        hourIndex: i,
      }));

      data.forEach((record: Transaction) => {
        // Usar createdAt para filtrar por data de criação no sistema
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
      finalChartData = hourlyData.map((item) => ({
        name: item.name,
        revenue: parseFloat(item.revenue.toFixed(2)),
      }));
    } else {
      // --- VISUALIZAÇÃO DIÁRIA (Multi Day) ---
      aggregatedData = data.reduce(
        (
          acc: Record<
            string,
            { name: string; revenue: number; fullDateSortKey: string }
          >,
          record: Transaction
        ) => {
          // Usar createdAt para filtrar por data de criação no sistema
          const transactionDateObject = parseISO(record.createdAt);
          const dateKey = dateFnsFormat(transactionDateObject, "yyyy-MM-dd");

          if (!acc[dateKey]) {
            acc[dateKey] = {
              name: shortDateFormatter.format(transactionDateObject),
              revenue: 0,
              fullDateSortKey: dateKey,
            };
          }
          // Apenas vendas completadas
          if (record.type === "SALE" && record.status === "COMPLETED") {
            acc[dateKey].revenue += Number(record.grossAmount);
          }
          return acc;
        },
        {} as Record<
          string,
          { name: string; revenue: number; fullDateSortKey: string }
        >
      );

      finalChartData = Object.values(aggregatedData)
        .sort((a, b) => a.fullDateSortKey.localeCompare(b.fullDateSortKey))
        .map((item) => ({
          name: item.name,
          revenue: parseFloat(item.revenue.toFixed(2)),
        }));
    }

    return {
      chartData: finalChartData,
      xAxisTickFormatter: (value: string) => value, // Mantido simples, pois o nome já está formatado
      isSingleDayView: singleDayView,
    };
  }, [data, dateRange, timeFormatter, shortDateFormatter]); // Dependências do useMemo

  // --- RENDERIZAÇÃO CONDICIONAL ---

  if (isLoading) {
    return (
      // 🚨 CORES DINÂMICAS E DESIGN RETO
      <Card className="col-span-1 lg:col-span-3">
        <CardHeader>
          <Skeleton className="w-48 mb-1 h-7" />
          <Skeleton className="w-64 h-4" />
        </CardHeader>
        <CardContent className="pb-6 pl-2 pr-6">
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="col-span-1 lg:col-span-3">
        <CardHeader>
          <CardTitle>{t("dashboard.charts.salesTrend")}</CardTitle>
          <CardDescription>
            {t("dashboard.charts.salesTrendDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">
            {t("dashboard.charts.noSalesData")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 lg:col-span-2 shark-card">
      <CardHeader>
        <CardTitle className="text-foreground">
          {t("dashboard.charts.salesTrend")}
        </CardTitle>
        <CardDescription>
          {t("dashboard.charts.salesTrendDesc")}
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
                tickFormatter={xAxisTickFormatter}
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
                      // Tooltip formatter para moeda
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
                // 🚨 CORES DINÂMICAS: Stroke do cursor e sombra do Tooltip
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
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                // 🚨 COR DINÂMICA: Usa a variável CSS do ChartConfig
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
