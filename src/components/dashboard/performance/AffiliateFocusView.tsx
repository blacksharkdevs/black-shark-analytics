import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Target,
  Calendar,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { formatCurrency } from "@/utils/index";
import { Button } from "@/components/common/ui/button";
import { Skeleton } from "@/components/common/ui/skeleton";
import type { Transaction } from "@/types/index";

interface AffiliateFocusViewProps {
  affiliateId: string;
  affiliateName: string;
  filteredSalesData: Transaction[];
  isLoading: boolean;
  onBack: () => void;
}

interface DailyMetrics {
  date: string;
  revenue: number;
  sales: number;
  commission: number;
  refunds: number;
  netRevenue: number;
}

interface PeriodMetrics {
  totalRevenue: number;
  totalSales: number;
  totalCommission: number;
  avgDailyRevenue: number;
  avgOrderValue: number;
  refundRate: number;
  commissionRate: number;
  bestDay: DailyMetrics | null;
  worstDay: DailyMetrics | null;
}

interface ComparisonInsight {
  type: "success" | "warning" | "danger";
  title: string;
  description: string;
  metric: string;
  change: number;
}

export function AffiliateFocusView({
  affiliateId,
  affiliateName,
  filteredSalesData,
  isLoading,
  onBack,
}: AffiliateFocusViewProps) {
  const { t } = useTranslation();
  const [compareMode, setCompareMode] = useState(false);

  // Dados do afiliado
  const affiliateData = useMemo(() => {
    return filteredSalesData.filter((t) => t.affiliateId === affiliateId);
  }, [filteredSalesData, affiliateId]);

  // Agrupar por dia
  const dailyMetrics = useMemo(() => {
    const metricsMap = new Map<string, DailyMetrics>();

    affiliateData.forEach((transaction) => {
      const date = format(parseISO(transaction.occurredAt), "yyyy-MM-dd");

      if (!metricsMap.has(date)) {
        metricsMap.set(date, {
          date,
          revenue: 0,
          sales: 0,
          commission: 0,
          refunds: 0,
          netRevenue: 0,
        });
      }

      const metrics = metricsMap.get(date)!;

      if (transaction.type === "SALE" && transaction.status === "COMPLETED") {
        metrics.revenue += Number(transaction.grossAmount);
        metrics.sales += 1;
        metrics.commission += Number(transaction.affiliateCommission);
        metrics.netRevenue += Number(transaction.netAmount);
      }

      if (transaction.type === "REFUND") {
        metrics.refunds += 1;
        metrics.netRevenue -= Number(transaction.grossAmount);
      }
    });

    return Array.from(metricsMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }, [affiliateData]);

  // Dividir em 2 períodos para comparação
  const { period1, period2 } = useMemo(() => {
    if (dailyMetrics.length === 0) {
      return { period1: [], period2: [] };
    }

    const midPoint = Math.floor(dailyMetrics.length / 2);
    return {
      period1: dailyMetrics.slice(0, midPoint),
      period2: dailyMetrics.slice(midPoint),
    };
  }, [dailyMetrics]);

  // Calcular métricas por período
  const calculatePeriodMetrics = (data: DailyMetrics[]): PeriodMetrics => {
    if (data.length === 0) {
      return {
        totalRevenue: 0,
        totalSales: 0,
        totalCommission: 0,
        avgDailyRevenue: 0,
        avgOrderValue: 0,
        refundRate: 0,
        commissionRate: 0,
        bestDay: null,
        worstDay: null,
      };
    }

    const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
    const totalSales = data.reduce((sum, d) => sum + d.sales, 0);
    const totalCommission = data.reduce((sum, d) => sum + d.commission, 0);
    const totalRefunds = data.reduce((sum, d) => sum + d.refunds, 0);

    const bestDay = [...data].sort((a, b) => b.revenue - a.revenue)[0];
    const worstDay = [...data]
      .filter((d) => d.sales > 0)
      .sort((a, b) => a.revenue - b.revenue)[0];

    return {
      totalRevenue,
      totalSales,
      totalCommission,
      avgDailyRevenue: totalRevenue / data.length,
      avgOrderValue: totalSales > 0 ? totalRevenue / totalSales : 0,
      refundRate: totalSales > 0 ? (totalRefunds / totalSales) * 100 : 0,
      commissionRate:
        totalRevenue > 0 ? (totalCommission / totalRevenue) * 100 : 0,
      bestDay: bestDay || null,
      worstDay: worstDay || null,
    };
  };

  const period1Metrics = useMemo(
    () => calculatePeriodMetrics(period1),
    [period1]
  );
  const period2Metrics = useMemo(
    () => calculatePeriodMetrics(period2),
    [period2]
  );
  const overallMetrics = useMemo(
    () => calculatePeriodMetrics(dailyMetrics),
    [dailyMetrics]
  );

  // Gerar insights de comparação
  const comparisonInsights = useMemo((): ComparisonInsight[] => {
    if (!compareMode || period1.length === 0 || period2.length === 0) {
      return [];
    }

    const insights: ComparisonInsight[] = [];

    // Receita
    const revenueChange =
      period1Metrics.totalRevenue > 0
        ? ((period2Metrics.totalRevenue - period1Metrics.totalRevenue) /
            period1Metrics.totalRevenue) *
          100
        : 0;

    if (revenueChange > 10) {
      insights.push({
        type: "success",
        title: t("performance.affiliateFocus.insights.revenueGrowth"),
        description: t("performance.affiliateFocus.insights.revenueGrowthDesc"),
        metric: t("performance.affiliateFocus.insights.revenue"),
        change: revenueChange,
      });
    } else if (revenueChange < -10) {
      insights.push({
        type: "danger",
        title: t("performance.affiliateFocus.insights.revenueDecline"),
        description: t(
          "performance.affiliateFocus.insights.revenueDeclineDesc"
        ),
        metric: t("performance.affiliateFocus.insights.revenue"),
        change: revenueChange,
      });
    } else {
      insights.push({
        type: "warning",
        title: t("performance.affiliateFocus.insights.revenueStable"),
        description: t("performance.affiliateFocus.insights.revenueStableDesc"),
        metric: t("performance.affiliateFocus.insights.revenue"),
        change: revenueChange,
      });
    }

    // AOV
    const aovChange =
      period1Metrics.avgOrderValue > 0
        ? ((period2Metrics.avgOrderValue - period1Metrics.avgOrderValue) /
            period1Metrics.avgOrderValue) *
          100
        : 0;

    if (aovChange > 5) {
      insights.push({
        type: "success",
        title: t("performance.affiliateFocus.insights.aovImproved"),
        description: t("performance.affiliateFocus.insights.aovImprovedDesc"),
        metric: t("performance.affiliateFocus.insights.aov"),
        change: aovChange,
      });
    } else if (aovChange < -5) {
      insights.push({
        type: "warning",
        title: t("performance.affiliateFocus.insights.aovDeclined"),
        description: t("performance.affiliateFocus.insights.aovDeclinedDesc"),
        metric: t("performance.affiliateFocus.insights.aov"),
        change: aovChange,
      });
    }

    // Refund Rate
    const refundChange = period2Metrics.refundRate - period1Metrics.refundRate;

    if (refundChange < -0.5) {
      insights.push({
        type: "success",
        title: t("performance.affiliateFocus.insights.refundImproved"),
        description: t(
          "performance.affiliateFocus.insights.refundImprovedDesc"
        ),
        metric: t("performance.affiliateFocus.insights.refundRate"),
        change: refundChange,
      });
    } else if (refundChange > 1) {
      insights.push({
        type: "danger",
        title: t("performance.affiliateFocus.insights.refundIncreased"),
        description: t(
          "performance.affiliateFocus.insights.refundIncreasedDesc"
        ),
        metric: t("performance.affiliateFocus.insights.refundRate"),
        change: refundChange,
      });
    } else if (period2Metrics.refundRate < 1) {
      insights.push({
        type: "success",
        title: t("performance.affiliateFocus.insights.refundExcellent"),
        description: t(
          "performance.affiliateFocus.insights.refundExcellentDesc"
        ),
        metric: t("performance.affiliateFocus.insights.refundRate"),
        change: 0,
      });
    }

    return insights;
  }, [
    compareMode,
    period1Metrics,
    period2Metrics,
    period1.length,
    period2.length,
    t,
  ]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="w-full h-32" />
        <Skeleton className="w-full h-96" />
      </div>
    );
  }

  if (dailyMetrics.length === 0) {
    return (
      <Card className="shark-card">
        <CardHeader>
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mb-4 w-fit"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("common.back")}
          </Button>
          <CardTitle>{affiliateName}</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          {t("performance.noData")}
        </CardContent>
      </Card>
    );
  }

  const currentMetrics = compareMode ? period2Metrics : overallMetrics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shark-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="mb-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("common.back")}
              </Button>
              <CardTitle className="text-2xl">{affiliateName}</CardTitle>
              <CardDescription>
                {t("performance.affiliateFocus.subtitle")}
              </CardDescription>
            </div>
            <Button
              variant={compareMode ? "default" : "outline"}
              onClick={() => setCompareMode(!compareMode)}
              className="gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              {compareMode
                ? t("performance.affiliateFocus.comparing")
                : t("performance.affiliateFocus.enableCompare")}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card className="shark-card border-cyan-500/20">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">
              {compareMode
                ? t("performance.affiliateFocus.period2")
                : t("performance.affiliateFocus.total")}
            </CardDescription>
            <CardTitle className="text-sm font-medium">
              {t("performance.affiliateFocus.totalRevenue")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-400">
              {formatCurrency(currentMetrics.totalRevenue)}
            </div>
            {compareMode && (
              <div className="flex items-center gap-2 mt-2 text-xs">
                {period2Metrics.totalRevenue > period1Metrics.totalRevenue ? (
                  <TrendingUp className="w-3 h-3 text-green-400" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-400" />
                )}
                <span
                  className={
                    period2Metrics.totalRevenue > period1Metrics.totalRevenue
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {(
                    ((period2Metrics.totalRevenue -
                      period1Metrics.totalRevenue) /
                      period1Metrics.totalRevenue) *
                    100
                  ).toFixed(1)}
                  %
                </span>
                <span className="text-muted-foreground">
                  vs {t("performance.affiliateFocus.period1")}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total Sales */}
        <Card className="shark-card border-green-500/20">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">
              {compareMode
                ? t("performance.affiliateFocus.period2")
                : t("performance.affiliateFocus.total")}
            </CardDescription>
            <CardTitle className="text-sm font-medium">
              {t("performance.affiliateFocus.totalSales")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {currentMetrics.totalSales}
            </div>
            {compareMode && (
              <div className="flex items-center gap-2 mt-2 text-xs">
                {period2Metrics.totalSales > period1Metrics.totalSales ? (
                  <TrendingUp className="w-3 h-3 text-green-400" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-400" />
                )}
                <span
                  className={
                    period2Metrics.totalSales > period1Metrics.totalSales
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {(
                    ((period2Metrics.totalSales - period1Metrics.totalSales) /
                      period1Metrics.totalSales) *
                    100
                  ).toFixed(1)}
                  %
                </span>
                <span className="text-muted-foreground">
                  vs {t("performance.affiliateFocus.period1")}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AOV */}
        <Card className="shark-card border-purple-500/20">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">
              {compareMode
                ? t("performance.affiliateFocus.period2")
                : t("performance.affiliateFocus.average")}
            </CardDescription>
            <CardTitle className="text-sm font-medium">
              {t("performance.affiliateFocus.avgOrderValue")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">
              {formatCurrency(currentMetrics.avgOrderValue)}
            </div>
            {compareMode && (
              <div className="flex items-center gap-2 mt-2 text-xs">
                {period2Metrics.avgOrderValue > period1Metrics.avgOrderValue ? (
                  <TrendingUp className="w-3 h-3 text-green-400" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-400" />
                )}
                <span
                  className={
                    period2Metrics.avgOrderValue > period1Metrics.avgOrderValue
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {(
                    ((period2Metrics.avgOrderValue -
                      period1Metrics.avgOrderValue) /
                      period1Metrics.avgOrderValue) *
                    100
                  ).toFixed(1)}
                  %
                </span>
                <span className="text-muted-foreground">
                  vs {t("performance.affiliateFocus.period1")}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Refund Rate */}
        <Card
          className={`shark-card ${
            currentMetrics.refundRate > 3
              ? "border-red-500/50"
              : currentMetrics.refundRate > 1
              ? "border-yellow-500/50"
              : "border-green-500/50"
          }`}
        >
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">
              {compareMode
                ? t("performance.affiliateFocus.period2")
                : t("performance.affiliateFocus.current")}
            </CardDescription>
            <CardTitle className="text-sm font-medium">
              {t("performance.affiliateFocus.refundRate")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                currentMetrics.refundRate > 3
                  ? "text-red-400"
                  : currentMetrics.refundRate > 1
                  ? "text-yellow-400"
                  : "text-green-400"
              }`}
            >
              {currentMetrics.refundRate.toFixed(1)}%
            </div>
            {compareMode && (
              <div className="flex items-center gap-2 mt-2 text-xs">
                {period2Metrics.refundRate < period1Metrics.refundRate ? (
                  <TrendingDown className="w-3 h-3 text-green-400" />
                ) : (
                  <TrendingUp className="w-3 h-3 text-red-400" />
                )}
                <span
                  className={
                    period2Metrics.refundRate < period1Metrics.refundRate
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {(
                    period2Metrics.refundRate - period1Metrics.refundRate
                  ).toFixed(1)}
                  pp
                </span>
                <span className="text-muted-foreground">
                  vs {t("performance.affiliateFocus.period1")}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights Acionáveis */}
      {compareMode && comparisonInsights.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {comparisonInsights.map((insight, index) => (
            <Card
              key={index}
              className={`shark-card ${
                insight.type === "success"
                  ? "border-green-500/30 bg-green-950/10"
                  : insight.type === "warning"
                  ? "border-yellow-500/30 bg-yellow-950/10"
                  : "border-red-500/30 bg-red-950/10"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  {insight.type === "success" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                  ) : insight.type === "warning" ? (
                    <Target className="w-5 h-5 text-yellow-400 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-sm font-semibold text-white">
                      {insight.title}
                    </CardTitle>
                    <CardDescription className="mt-1 text-xs">
                      {insight.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-muted-foreground">
                    {insight.metric}:
                  </span>
                  <span
                    className={`text-lg font-bold ${
                      insight.type === "success"
                        ? "text-green-400"
                        : insight.type === "warning"
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {insight.change > 0 ? "+" : ""}
                    {insight.change.toFixed(1)}
                    {insight.metric.includes("Rate") ? "pp" : "%"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Melhor e Pior Dia */}
      {currentMetrics.bestDay && currentMetrics.worstDay && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Melhor Dia */}
          <Card className="shark-card border-green-500/30 bg-green-950/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="w-5 h-5 text-green-400" />
                {t("performance.affiliateFocus.bestDay")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground">
                    {format(
                      parseISO(currentMetrics.bestDay.date),
                      "EEEE, dd 'de' MMMM",
                      {
                        locale: ptBR,
                      }
                    )}
                  </div>
                  <div className="mt-1 text-3xl font-bold text-green-400">
                    {formatCurrency(currentMetrics.bestDay.revenue)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border">
                  <div>
                    <div className="text-xs text-muted-foreground">
                      {t("performance.affiliateFocus.sales")}
                    </div>
                    <div className="text-lg font-semibold text-white">
                      {currentMetrics.bestDay.sales}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      {t("performance.affiliateFocus.commission")}
                    </div>
                    <div className="text-lg font-semibold text-white">
                      {formatCurrency(currentMetrics.bestDay.commission)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pior Dia */}
          <Card className="shark-card border-red-500/30 bg-red-950/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="w-5 h-5 text-red-400" />
                {t("performance.affiliateFocus.worstDay")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground">
                    {format(
                      parseISO(currentMetrics.worstDay.date),
                      "EEEE, dd 'de' MMMM",
                      {
                        locale: ptBR,
                      }
                    )}
                  </div>
                  <div className="mt-1 text-3xl font-bold text-red-400">
                    {formatCurrency(currentMetrics.worstDay.revenue)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border">
                  <div>
                    <div className="text-xs text-muted-foreground">
                      {t("performance.affiliateFocus.sales")}
                    </div>
                    <div className="text-lg font-semibold text-white">
                      {currentMetrics.worstDay.sales}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      {t("performance.affiliateFocus.commission")}
                    </div>
                    <div className="text-lg font-semibold text-white">
                      {formatCurrency(currentMetrics.worstDay.commission)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráfico de Performance Diária */}
      <Card className="shark-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            {t("performance.affiliateFocus.dailyPerformance")}
          </CardTitle>
          <CardDescription>
            {compareMode
              ? t("performance.affiliateFocus.comparingPeriods")
              : t("performance.affiliateFocus.revenueByDay")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            {compareMode ? (
              <BarChart
                data={[
                  ...period1.map((d) => ({ ...d, period: "P1" })),
                  ...period2.map((d) => ({ ...d, period: "P2" })),
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="date"
                  stroke="#888"
                  fontSize={12}
                  tickFormatter={(date) => format(parseISO(date), "dd/MM")}
                />
                <YAxis
                  stroke="#888"
                  fontSize={12}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #333",
                    borderRadius: "8px",
                  }}
                  labelFormatter={(date) =>
                    format(parseISO(date as string), "dd/MM/yyyy")
                  }
                  formatter={(value: number) => [
                    formatCurrency(value),
                    "Receita",
                  ]}
                />
                <Bar dataKey="revenue" fill="#00ffff" opacity={0.7} />
                {currentMetrics.bestDay && (
                  <ReferenceLine
                    y={currentMetrics.bestDay.revenue}
                    stroke="#00ff00"
                    strokeDasharray="3 3"
                    label={{ value: "Melhor", fill: "#00ff00", fontSize: 10 }}
                  />
                )}
              </BarChart>
            ) : (
              <LineChart data={dailyMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="date"
                  stroke="#888"
                  fontSize={12}
                  tickFormatter={(date) => format(parseISO(date), "dd/MM")}
                />
                <YAxis
                  stroke="#888"
                  fontSize={12}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #333",
                    borderRadius: "8px",
                  }}
                  labelFormatter={(date) =>
                    format(parseISO(date as string), "dd/MM/yyyy")
                  }
                  formatter={(value: number) => [
                    formatCurrency(value),
                    "Receita",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#00ffff"
                  strokeWidth={2}
                  dot={{ fill: "#00ffff", r: 4 }}
                />
                {overallMetrics.bestDay && (
                  <ReferenceLine
                    y={overallMetrics.bestDay.revenue}
                    stroke="#00ff00"
                    strokeDasharray="3 3"
                    label={{ value: "Melhor", fill: "#00ff00", fontSize: 10 }}
                  />
                )}
                {overallMetrics.worstDay && (
                  <ReferenceLine
                    y={overallMetrics.worstDay.revenue}
                    stroke="#ff0000"
                    strokeDasharray="3 3"
                    label={{ value: "Pior", fill: "#ff0000", fontSize: 10 }}
                  />
                )}
              </LineChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
