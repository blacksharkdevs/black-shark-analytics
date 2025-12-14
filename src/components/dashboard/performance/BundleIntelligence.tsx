import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import { Skeleton } from "@/components/common/ui/skeleton";
import { Layers, Package } from "lucide-react";
import { formatCurrency } from "@/utils/index";
import type { Transaction } from "@/types/index";

interface BundleIntelligenceProps {
  filteredSalesData: Transaction[];
  isLoading: boolean;
}

interface BundleData {
  unitCount: number;
  salesCount: number;
  revenue: number;
  percentage: number;
  profitMargin: number;
  color: string;
}

const BUNDLE_COLORS = ["#00ffff", "#ff00ff", "#00ff00", "#ffff00", "#ff6b00"];

export function BundleIntelligence({
  filteredSalesData,
  isLoading,
}: BundleIntelligenceProps) {
  const { t } = useTranslation();

  const bundleData = useMemo(() => {
    // Filtrar apenas vendas completadas
    const sales = filteredSalesData.filter(
      (t) => t.type === "SALE" && t.status === "COMPLETED"
    );

    if (sales.length === 0) {
      return null;
    }

    // Agrupar por unitCount
    const bundleMap = new Map<number, BundleData>();

    sales.forEach((transaction) => {
      const unitCount = transaction.product?.unitCount || 1;
      const revenue = Number(transaction.grossAmount);
      const netAmount = Number(transaction.netAmount);
      const profitMargin = revenue > 0 ? (netAmount / revenue) * 100 : 0;

      if (!bundleMap.has(unitCount)) {
        bundleMap.set(unitCount, {
          unitCount,
          salesCount: 0,
          revenue: 0,
          percentage: 0,
          profitMargin: 0,
          color: BUNDLE_COLORS[bundleMap.size % BUNDLE_COLORS.length],
        });
      }

      const bundle = bundleMap.get(unitCount)!;
      bundle.salesCount += 1;
      bundle.revenue += revenue;
      bundle.profitMargin += profitMargin;
    });

    // Calcular percentagens
    const totalRevenue = Array.from(bundleMap.values()).reduce(
      (sum, b) => sum + b.revenue,
      0
    );
    const totalSales = Array.from(bundleMap.values()).reduce(
      (sum, b) => sum + b.salesCount,
      0
    );

    bundleMap.forEach((bundle) => {
      bundle.percentage = (bundle.revenue / totalRevenue) * 100;
      bundle.profitMargin = bundle.profitMargin / bundle.salesCount;
    });

    // Ordenar por unitCount
    const bundles = Array.from(bundleMap.values()).sort(
      (a, b) => a.unitCount - b.unitCount
    );

    // Calcular ticket médio
    const averageTicket = totalRevenue / totalSales;

    // Encontrar o bundle mais lucrativo
    const mostProfitable = bundles.reduce((max, current) =>
      current.profitMargin > max.profitMargin ? current : max
    );

    return {
      bundles,
      totalRevenue,
      totalSales,
      averageTicket,
      mostProfitable,
    };
  }, [filteredSalesData]);

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

  if (!bundleData) {
    return (
      <Card className="shark-card">
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {t("performance.bundle.noData")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shark-card">
      <CardHeader className="px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Layers className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base md:text-lg">
              {t("performance.bundle.title")}
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {t("performance.bundle.description")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Ticket Médio Central */}
        <div className="relative">
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bundleData.bundles}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="revenue"
                  label={({ unitCount, percentage }) =>
                    `${unitCount} un (${percentage.toFixed(0)}%)`
                  }
                  labelLine={{ stroke: "#ffffff30", strokeWidth: 1 }}
                >
                  {bundleData.bundles.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Ticket Médio no Centro */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-xs text-muted-foreground">
              {t("performance.bundle.averageTicket")}
            </p>
            <p className="text-xl font-bold text-white md:text-2xl">
              {formatCurrency(bundleData.averageTicket)}
            </p>
          </div>
        </div>

        {/* Lista de Bundles */}
        <div className="space-y-2">
          {bundleData.bundles.map((bundle) => (
            <div
              key={bundle.unitCount}
              className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: bundle.color }}
              />
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Package className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {bundle.unitCount} {t("performance.bundle.units")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {bundle.salesCount} {t("performance.bundle.sales")} •{" "}
                    {bundle.percentage.toFixed(1)}%{" "}
                    {t("performance.bundle.ofRevenue")}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-foreground">
                  {formatCurrency(bundle.revenue)}
                </p>
                <p className="text-xs text-cyan-400">
                  {bundle.profitMargin.toFixed(1)}%{" "}
                  {t("performance.bundle.margin")}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bundle Mais Lucrativo */}
        <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/20">
              <Layers className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">
                {t("performance.bundle.mostProfitable")}
              </p>
              <p className="text-sm font-bold text-cyan-400">
                {bundleData.mostProfitable.unitCount}{" "}
                {t("performance.bundle.units")} •{" "}
                {bundleData.mostProfitable.profitMargin.toFixed(1)}%{" "}
                {t("performance.bundle.margin")}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
