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
import { DollarSign, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/utils/index";
import type { Transaction } from "@/types/index";

interface ProfitWaterfallProps {
  filteredSalesData: Transaction[];
  isLoading: boolean;
}

interface WaterfallData {
  name: string;
  value: number;
  fill: string;
  type: "positive" | "negative" | "total";
}

export function ProfitWaterfall({
  filteredSalesData,
  isLoading,
}: ProfitWaterfallProps) {
  const { t } = useTranslation();

  const waterfallData = useMemo(() => {
    // Filtrar apenas vendas completadas
    const sales = filteredSalesData.filter(
      (t) => t.type === "SALE" && t.status === "COMPLETED"
    );

    if (sales.length === 0) {
      return null;
    }

    // Calcular totais
    const grossRevenue = sales.reduce(
      (sum, t) => sum + Number(t.grossAmount),
      0
    );
    const platformFees = sales.reduce(
      (sum, t) => sum + Number(t.platformFee),
      0
    );
    const taxes = sales.reduce((sum, t) => sum + Number(t.taxAmount), 0);
    const affiliateCommissions = sales.reduce(
      (sum, t) => sum + Number(t.affiliateCommission),
      0
    );
    const shipping = sales.reduce(
      (sum, t) => sum + Number(t.shippingAmount),
      0
    );

    // Calcular COGS (Custo dos Produtos)
    const cogs = sales.reduce((sum, t) => {
      if (t.product && t.product.cogs) {
        return sum + Number(t.product.cogs) * t.quantity;
      }
      return sum;
    }, 0);

    const netProfit = sales.reduce((sum, t) => sum + Number(t.netAmount), 0);

    // Construir dados do waterfall
    const data: WaterfallData[] = [
      {
        name: t("performance.waterfall.grossRevenue"),
        value: grossRevenue,
        fill: "#ffffff",
        type: "positive",
      },
      {
        name: t("performance.waterfall.platformFees"),
        value: -platformFees,
        fill: "#ff6b6b",
        type: "negative",
      },
      {
        name: t("performance.waterfall.taxes"),
        value: -taxes,
        fill: "#ff8787",
        type: "negative",
      },
      {
        name: t("performance.waterfall.affiliateCommissions"),
        value: -affiliateCommissions,
        fill: "#ffa94d",
        type: "negative",
      },
      {
        name: t("performance.waterfall.shipping"),
        value: -shipping,
        fill: "#ffb366",
        type: "negative",
      },
      {
        name: t("performance.waterfall.cogs"),
        value: -cogs,
        fill: "#ffc078",
        type: "negative",
      },
      {
        name: t("performance.waterfall.netProfit"),
        value: netProfit,
        fill: "#00ffff",
        type: "total",
      },
    ];

    return {
      data,
      grossRevenue,
      netProfit,
      totalDeductions:
        platformFees + taxes + affiliateCommissions + shipping + cogs,
      profitMargin: (netProfit / grossRevenue) * 100,
    };
  }, [filteredSalesData, t]);

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

  if (!waterfallData) {
    return (
      <Card className="shark-card">
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {t("performance.waterfall.noData")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shark-card">
      <CardHeader className="px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cyan-500/10">
            <DollarSign className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base md:text-lg">
              {t("performance.waterfall.title")}
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {t("performance.waterfall.description")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Métricas Resumidas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs text-muted-foreground">
              {t("performance.waterfall.grossRevenue")}
            </p>
            <p className="text-lg font-bold text-white">
              {formatCurrency(waterfallData.grossRevenue)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            <p className="text-xs text-muted-foreground">
              {t("performance.waterfall.netProfit")}
            </p>
            <p className="text-lg font-bold text-cyan-400">
              {formatCurrency(waterfallData.netProfit)}
            </p>
          </div>
        </div>

        {/* Margem de Lucro */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
          <TrendingDown className="w-4 h-4 text-red-400" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">
              {t("performance.waterfall.totalDeductions")}
            </p>
            <p className="text-sm font-semibold text-red-400">
              {formatCurrency(waterfallData.totalDeductions)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              {t("performance.waterfall.profitMargin")}
            </p>
            <p className="text-sm font-semibold text-cyan-400">
              {waterfallData.profitMargin.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Gráfico Waterfall */}
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={waterfallData.data}
              margin={{ top: 20, right: 10, left: 10, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fill: "#94a3b8", fontSize: 10 }}
              />
              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 10 }}
                tickFormatter={(value) =>
                  `${value >= 0 ? "" : "-"}${formatCurrency(Math.abs(value))}`
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#e2e8f0" }}
                formatter={(value: number) => [
                  formatCurrency(Math.abs(value)),
                  value < 0
                    ? t("performance.waterfall.deduction")
                    : t("performance.waterfall.revenue"),
                ]}
              />
              <ReferenceLine y={0} stroke="#ffffff30" strokeDasharray="3 3" />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {waterfallData.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
