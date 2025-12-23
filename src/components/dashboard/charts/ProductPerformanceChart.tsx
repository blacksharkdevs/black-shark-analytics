import { useMemo } from "react";
import { useTranslation } from "react-i18next";
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
import { Button } from "@/components/common/ui/button";
import { Skeleton } from "@/components/common/ui/skeleton";
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/common/ui/chart";
import { TrendingUp, Maximize2, Minimize2 } from "lucide-react";
import { useDashboardData } from "@/contexts/DashboardDataContext";
import { useDashboardConfig } from "@/contexts/DashboardConfigContext";
import type { Transaction } from "@/types/index";

interface Product {
  id: string;
  name: string;
  totalRevenue: number;
  isGrouped?: boolean;
  groupedProducts?: Array<{ id: string; name: string }>;
}

interface ProductPerformanceChartProps {
  selectedProductIds: string[];
  isLoading: boolean;
  availableProducts: Product[];
  isFullWidth: boolean;
  onToggleFullWidth: () => void;
}

// Cores neon para os produtos
const NEON_COLORS = [
  "#00ffff", // Ciano neon
  "#ff00ff", // Magenta neon
  "#00ff00", // Verde neon
  "#ffff00", // Amarelo neon
  "#ff6b00", // Laranja neon
];

// Formata o valor do YAxis
const formatYAxisValue = (value: number): string => {
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

export function ProductPerformanceChart({
  selectedProductIds,
  isLoading,
  availableProducts,
  isFullWidth,
  onToggleFullWidth,
}: ProductPerformanceChartProps) {
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

  // Processar dados do gráfico
  const { chartData, productNames, chartConfig } = useMemo(() => {
    if (!dateRange || !dateRange.from || !dateRange.to) {
      return { chartData: [], productNames: {}, chartConfig: {} };
    }

    const singleDayView = isSameDay(dateRange.from, dateRange.to);
    const productNamesMap: Record<string, string> = {};
    const config: Record<string, { label: string; color: string }> = {};

    // Expandir produtos agrupados para suas IDs individuais
    const expandedProductIds: string[] = [];
    const productIdToChartKey: Record<string, string> = {};

    selectedProductIds.forEach((productId) => {
      if (productId.startsWith("group:")) {
        // É um produto agrupado
        const groupedProduct = availableProducts.find(
          (p) => p.id === productId
        );
        if (groupedProduct && groupedProduct.groupedProducts) {
          // Adicionar todas as IDs dos produtos no grupo
          groupedProduct.groupedProducts.forEach((p) => {
            expandedProductIds.push(p.id);
            productIdToChartKey[p.id] = productId; // Mapear ID individual para a chave do grupo
          });
        }
      } else {
        // É um produto normal
        expandedProductIds.push(productId);
        productIdToChartKey[productId] = productId;
      }
    });

    // Filtrar transações dos produtos selecionados (incluindo produtos agrupados expandidos)
    const filteredData = data.filter(
      (record: Transaction) =>
        expandedProductIds.includes(record.product?.id || "") &&
        record.type === "SALE" &&
        record.status === "COMPLETED"
    );

    // Mapear nomes de produtos e criar config
    selectedProductIds.forEach((productId, index) => {
      const product = availableProducts.find((p) => p.id === productId);
      if (product) {
        productNamesMap[productId] = product.name;
        config[productId] = {
          label: product.name,
          color: NEON_COLORS[index % NEON_COLORS.length],
        };
      }
    });

    let finalChartData: Array<Record<string, number | string>> = [];

    if (singleDayView) {
      // Visualização horária
      const hourlyData = Array.from({ length: 24 }, (_, i) => {
        const dataPoint: Record<string, number | string> = {
          name: timeFormatter.format(new Date(Date.UTC(2000, 0, 1, i))),
          hourIndex: i,
        };
        selectedProductIds.forEach((id) => {
          dataPoint[id] = 0;
        });
        return dataPoint;
      });

      filteredData.forEach((record: Transaction) => {
        const transactionDateObject = parseISO(record.createdAt);
        const hourInUTC = transactionDateObject.getUTCHours();
        const productId = record.product?.id || "";
        const chartKey = productIdToChartKey[productId]; // Usar a chave do gráfico (pode ser "group:X" ou ID normal)

        const targetHourEntry = hourlyData.find(
          (h) => h.hourIndex === hourInUTC
        );
        if (targetHourEntry && chartKey) {
          targetHourEntry[chartKey] =
            Number(targetHourEntry[chartKey]) + Number(record.grossAmount);
        }
      });

      finalChartData = hourlyData.map((item) => {
        const formattedItem: Record<string, number | string> = {
          name: item.name as string,
        };
        selectedProductIds.forEach((id) => {
          formattedItem[id] = parseFloat((Number(item[id]) || 0).toFixed(2));
        });
        return formattedItem;
      });
    } else {
      // Visualização diária
      const dailyData: Record<string, Record<string, number | string>> = {};

      filteredData.forEach((record: Transaction) => {
        const transactionDateObject = parseISO(record.createdAt);
        const dateKey = dateFnsFormat(transactionDateObject, "yyyy-MM-dd");
        const productId = record.product?.id || "";
        const chartKey = productIdToChartKey[productId]; // Usar a chave do gráfico

        if (!dailyData[dateKey]) {
          const dataPoint: Record<string, number | string> = {
            name: shortDateFormatter.format(transactionDateObject),
            fullDateSortKey: dateKey,
          };
          selectedProductIds.forEach((id) => {
            dataPoint[id] = 0;
          });
          dailyData[dateKey] = dataPoint;
        }

        if (chartKey) {
          dailyData[dateKey][chartKey] =
            Number(dailyData[dateKey][chartKey]) + Number(record.grossAmount);
        }
      });

      finalChartData = Object.values(dailyData)
        .sort((a, b) =>
          String(a.fullDateSortKey).localeCompare(String(b.fullDateSortKey))
        )
        .map((item) => {
          const formattedItem: Record<string, number | string> = {
            name: item.name as string,
          };
          selectedProductIds.forEach((id) => {
            formattedItem[id] = parseFloat((Number(item[id]) || 0).toFixed(2));
          });
          return formattedItem;
        });
    }

    return {
      chartData: finalChartData,
      productNames: productNamesMap,
      chartConfig: config,
    };
  }, [
    data,
    dateRange,
    selectedProductIds,
    timeFormatter,
    shortDateFormatter,
    availableProducts,
  ]);

  if (isLoading) {
    return (
      <Card className="shark-card">
        <CardHeader className="px-4 py-3 md:px-6 md:py-4">
          <Skeleton className="w-48 mb-1 h-7" />
          <Skeleton className="w-64 h-4" />
        </CardHeader>
        <CardContent className="pb-6 pl-2 pr-6">
          <Skeleton className="h-[400px] md:h-[500px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0 || selectedProductIds.length === 0) {
    return (
      <Card className="shark-card">
        <CardHeader className="px-4 py-3 md:px-6 md:py-4">
          <CardTitle className="flex items-center text-base md:text-lg text-foreground">
            <TrendingUp className="w-4 h-4 mr-2 md:w-6 md:h-6" />
            {t("performance.chartTitle")}
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            {t("performance.chartDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] md:h-[500px] flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            {selectedProductIds.length === 0
              ? t("performance.noProductsSelected")
              : t("performance.noData")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full shark-card">
      <CardHeader className="px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="flex items-center text-base md:text-lg text-foreground">
              <TrendingUp className="w-4 h-4 mr-2 md:w-6 md:h-6" />
              {t("performance.chartTitle")}
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {t("performance.chartDescription")}
            </CardDescription>
          </div>

          {/* Botão de Toggle Layout */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleFullWidth}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary"
            title={
              isFullWidth
                ? t("performance.layoutSideBySide")
                : t("performance.layoutFullWidth")
            }
          >
            {isFullWidth ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
            <span className="hidden text-xs md:inline">
              {isFullWidth
                ? t("performance.layoutSideBySide")
                : t("performance.layoutFullWidth")}
            </span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-4 pl-1 pr-2 md:pb-6 md:pl-2 md:pr-6">
        <ChartContainer
          config={chartConfig}
          className="h-[350px] md:h-[450px] lg:h-[500px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.3}
              />
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
                        return [
                          `$${value.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`,
                          productNames[name as string] || name,
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
              <Legend
                wrapperStyle={{ fontSize: "11px" }}
                iconSize={10}
                formatter={(value) => productNames[value] || value}
              />
              {selectedProductIds.map((productId, index) => (
                <Line
                  key={productId}
                  type="monotone"
                  dataKey={productId}
                  stroke={NEON_COLORS[index % NEON_COLORS.length]}
                  strokeWidth={2}
                  dot={{
                    r: 3,
                    fill: NEON_COLORS[index % NEON_COLORS.length],
                    stroke: "hsl(var(--background))",
                    strokeWidth: 1.5,
                  }}
                  activeDot={{
                    r: 5,
                    fill: NEON_COLORS[index % NEON_COLORS.length],
                    stroke: "hsl(var(--background))",
                    strokeWidth: 2,
                  }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
