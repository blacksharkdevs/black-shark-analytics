import { useParams, useNavigate } from "react-router-dom";
import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { format, parseISO, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Target,
  Calendar,
  ArrowLeft,
  DollarSign,
  ShoppingCart,
  Percent,
  Users,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Button } from "@/components/common/ui/button";
import { Skeleton } from "@/components/common/ui/skeleton";
import { Calendar as CalendarComponent } from "@/components/common/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/common/ui/popover";
import { formatCurrency } from "@/utils/index";
import { useDashboardData } from "@/contexts/DashboardDataContext";
import { useDashboardConfig } from "@/contexts/DashboardConfigContext";
import type { Transaction } from "@/types/index";
import { cn } from "@/lib/utils";

interface DailyMetrics {
  date: string;
  revenue: number;
  sales: number;
  commission: number;
  refunds: number;
  chargebacks: number;
  netRevenue: number;
  customers: number;
}

interface PeriodMetrics {
  totalRevenue: number;
  totalSales: number;
  totalCommission: number;
  avgDailyRevenue: number;
  avgOrderValue: number;
  refundRate: number;
  chargebackRate: number;
  commissionRate: number;
  totalCustomers: number;
  totalRefunds: number;
  totalChargebacks: number;
  bestDay: DailyMetrics | null;
  worstDay: DailyMetrics | null;
}

interface ComparisonInsight {
  type: "success" | "warning" | "danger";
  title: string;
  description: string;
  metric: string;
  change: number;
  icon: React.ReactNode;
}

interface DateRange {
  from: Date;
  to: Date;
}

export default function AffiliatePerformanceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { filteredSalesData, isLoadingData } = useDashboardData();
  const { isLoading: isDateRangeLoading } = useDashboardConfig();

  const isLoading = isLoadingData || isDateRangeLoading;

  // Estados para modo de comparação
  const [compareMode, setCompareMode] = useState(false);
  const [period1Range, setPeriod1Range] = useState<DateRange | null>(null);
  const [period2Range, setPeriod2Range] = useState<DateRange | null>(null);

  // Encontrar dados do afiliado
  const affiliateData = useMemo(() => {
    const data = filteredSalesData.filter((t) => t.affiliateId === id);
    const name = data[0]?.affiliate?.name || `Affiliate ${id}`;
    return { data, name };
  }, [filteredSalesData, id]);

  // Filtrar dados por período customizado
  const filterByDateRange = (data: Transaction[], range: DateRange | null) => {
    if (!range) return data;
    return data.filter((t) => {
      const date = parseISO(t.occurredAt);
      return date >= range.from && date <= range.to;
    });
  };

  // Calcular métricas diárias
  const calculateDailyMetrics = useCallback(
    (data: Transaction[]): DailyMetrics[] => {
      const metricsMap = new Map<string, DailyMetrics>();

      data.forEach((transaction) => {
        const date = format(parseISO(transaction.occurredAt), "yyyy-MM-dd");

        if (!metricsMap.has(date)) {
          metricsMap.set(date, {
            date,
            revenue: 0,
            sales: 0,
            commission: 0,
            refunds: 0,
            chargebacks: 0,
            netRevenue: 0,
            customers: 0,
          });
        }

        const metrics = metricsMap.get(date)!;

        if (transaction.type === "SALE" && transaction.status === "COMPLETED") {
          metrics.revenue += Number(transaction.grossAmount);
          metrics.sales += 1;
          metrics.commission += Number(transaction.affiliateCommission);
          metrics.netRevenue += Number(transaction.netAmount);
          metrics.customers += 1;
        }

        if (transaction.type === "REFUND") {
          metrics.refunds += 1;
          metrics.netRevenue -= Number(transaction.grossAmount);
        }

        if (transaction.type === "CHARGEBACK") {
          metrics.chargebacks += 1;
          metrics.netRevenue -= Number(transaction.grossAmount);
        }
      });

      return Array.from(metricsMap.values()).sort((a, b) =>
        a.date.localeCompare(b.date)
      );
    },
    []
  );

  // Calcular métricas por período
  const calculatePeriodMetrics = useCallback(
    (data: Transaction[]): PeriodMetrics => {
      const daily = calculateDailyMetrics(data);

      if (daily.length === 0) {
        return {
          totalRevenue: 0,
          totalSales: 0,
          totalCommission: 0,
          avgDailyRevenue: 0,
          avgOrderValue: 0,
          refundRate: 0,
          chargebackRate: 0,
          commissionRate: 0,
          totalCustomers: 0,
          totalRefunds: 0,
          totalChargebacks: 0,
          bestDay: null,
          worstDay: null,
        };
      }

      const totalRevenue = daily.reduce((sum, d) => sum + d.revenue, 0);
      const totalSales = daily.reduce((sum, d) => sum + d.sales, 0);
      const totalCommission = daily.reduce((sum, d) => sum + d.commission, 0);
      const totalRefunds = daily.reduce((sum, d) => sum + d.refunds, 0);
      const totalChargebacks = daily.reduce((sum, d) => sum + d.chargebacks, 0);
      const totalCustomers = daily.reduce((sum, d) => sum + d.customers, 0);

      const bestDay = [...daily].sort((a, b) => b.revenue - a.revenue)[0];
      const worstDay = [...daily]
        .filter((d) => d.sales > 0)
        .sort((a, b) => a.revenue - b.revenue)[0];

      return {
        totalRevenue,
        totalSales,
        totalCommission,
        avgDailyRevenue: totalRevenue / daily.length,
        avgOrderValue: totalSales > 0 ? totalRevenue / totalSales : 0,
        refundRate: totalSales > 0 ? (totalRefunds / totalSales) * 100 : 0,
        chargebackRate:
          totalSales > 0 ? (totalChargebacks / totalSales) * 100 : 0,
        commissionRate:
          totalRevenue > 0 ? (totalCommission / totalRevenue) * 100 : 0,
        totalCustomers,
        totalRefunds,
        totalChargebacks,
        bestDay: bestDay || null,
        worstDay: worstDay || null,
      };
    },
    [calculateDailyMetrics]
  );

  // Dados filtrados por período
  const period1Data = useMemo(
    () => filterByDateRange(affiliateData.data, period1Range),
    [affiliateData.data, period1Range]
  );

  const period2Data = useMemo(
    () => filterByDateRange(affiliateData.data, period2Range),
    [affiliateData.data, period2Range]
  );

  const defaultData = useMemo(() => affiliateData.data, [affiliateData.data]);

  // Métricas calculadas
  const period1Metrics = useMemo(
    () => calculatePeriodMetrics(period1Data),
    [period1Data, calculatePeriodMetrics]
  );

  const period2Metrics = useMemo(
    () => calculatePeriodMetrics(period2Data),
    [period2Data, calculatePeriodMetrics]
  );

  const defaultMetrics = useMemo(
    () => calculatePeriodMetrics(defaultData),
    [defaultData, calculatePeriodMetrics]
  );

  // Insights de comparação
  const comparisonInsights = useMemo((): ComparisonInsight[] => {
    if (!compareMode || !period1Range || !period2Range) return [];

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
        icon: <TrendingUp className="w-5 h-5" />,
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
        icon: <TrendingDown className="w-5 h-5" />,
      });
    }

    // AOV
    const aovChange =
      period1Metrics.avgOrderValue > 0
        ? ((period2Metrics.avgOrderValue - period1Metrics.avgOrderValue) /
            period1Metrics.avgOrderValue) *
          100
        : 0;

    if (Math.abs(aovChange) > 5) {
      insights.push({
        type: aovChange > 0 ? "success" : "warning",
        title:
          aovChange > 0
            ? t("performance.affiliateFocus.insights.aovImproved")
            : t("performance.affiliateFocus.insights.aovDeclined"),
        description:
          aovChange > 0
            ? t("performance.affiliateFocus.insights.aovImprovedDesc")
            : t("performance.affiliateFocus.insights.aovDeclinedDesc"),
        metric: t("performance.affiliateFocus.insights.aov"),
        change: aovChange,
        icon: <Target className="w-5 h-5" />,
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
        icon: <CheckCircle2 className="w-5 h-5" />,
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
        icon: <AlertCircle className="w-5 h-5" />,
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
        icon: <CheckCircle2 className="w-5 h-5" />,
      });
    }

    return insights;
  }, [
    compareMode,
    period1Range,
    period2Range,
    period1Metrics,
    period2Metrics,
    t,
  ]);

  const currentMetrics =
    compareMode && period2Range ? period2Metrics : defaultMetrics;
  const dailyMetrics = useMemo(
    () =>
      calculateDailyMetrics(
        compareMode && period2Range ? period2Data : defaultData
      ),
    [compareMode, period2Range, period2Data, defaultData, calculateDailyMetrics]
  );

  if (isLoading) {
    return (
      <div className="container p-4 mx-auto space-y-6 md:p-8">
        <Skeleton className="w-full h-32" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="w-full h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!affiliateData.data || affiliateData.data.length === 0) {
    return (
      <div className="container p-4 mx-auto">
        <Card className="shark-card">
          <CardHeader>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard/performance/affiliates")}
              className="w-fit mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("common.back")}
            </Button>
            <CardTitle>{affiliateData.name}</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            {t("performance.noData")}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container p-4 mx-auto space-y-6 md:p-8">
      {/* Header com controles */}
      <Card className="shark-card">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard/performance/affiliates")}
                className="mb-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("common.back")}
              </Button>
              <CardTitle className="text-2xl">{affiliateData.name}</CardTitle>
              <CardDescription>
                {t("performance.affiliateFocus.subtitle")}
              </CardDescription>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant={compareMode ? "default" : "outline"}
                onClick={() => setCompareMode(!compareMode)}
                className="gap-2"
              >
                <Calendar className="w-4 h-4" />
                {compareMode
                  ? t("performance.affiliateFocus.comparing")
                  : t("performance.affiliateFocus.enableCompare")}
              </Button>
            </div>
          </div>

          {/* Seletores de Período */}
          {compareMode && (
            <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
              {/* Período 1 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  {t("performance.affiliateFocus.period1")}
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !period1Range && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {period1Range?.from ? (
                        period1Range.to ? (
                          <>
                            {format(period1Range.from, "dd MMM yyyy", {
                              locale: ptBR,
                            })}{" "}
                            -{" "}
                            {format(period1Range.to, "dd MMM yyyy", {
                              locale: ptBR,
                            })}
                          </>
                        ) : (
                          format(period1Range.from, "dd MMM yyyy", {
                            locale: ptBR,
                          })
                        )
                      ) : (
                        <span>
                          {t("performance.affiliateFocus.selectPeriod")}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      initialFocus
                      mode="range"
                      defaultMonth={period1Range?.from}
                      selected={{
                        from: period1Range?.from,
                        to: period1Range?.to,
                      }}
                      onSelect={(range) => {
                        if (
                          range &&
                          "from" in range &&
                          range.from &&
                          "to" in range &&
                          range.to
                        ) {
                          setPeriod1Range({
                            from: startOfDay(range.from),
                            to: endOfDay(range.to),
                          });
                        }
                      }}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Período 2 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  {t("performance.affiliateFocus.period2")}
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !period2Range && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {period2Range?.from ? (
                        period2Range.to ? (
                          <>
                            {format(period2Range.from, "dd MMM yyyy", {
                              locale: ptBR,
                            })}{" "}
                            -{" "}
                            {format(period2Range.to, "dd MMM yyyy", {
                              locale: ptBR,
                            })}
                          </>
                        ) : (
                          format(period2Range.from, "dd MMM yyyy", {
                            locale: ptBR,
                          })
                        )
                      ) : (
                        <span>
                          {t("performance.affiliateFocus.selectPeriod")}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      initialFocus
                      mode="range"
                      defaultMonth={period2Range?.from}
                      selected={{
                        from: period2Range?.from,
                        to: period2Range?.to,
                      }}
                      onSelect={(range) => {
                        if (
                          range &&
                          "from" in range &&
                          range.from &&
                          "to" in range &&
                          range.to
                        ) {
                          setPeriod2Range({
                            from: startOfDay(range.from),
                            to: endOfDay(range.to),
                          });
                        }
                      }}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Stats Cards - Linha 1 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card className="shark-card border-cyan-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-cyan-400" />
              <CardTitle className="text-sm font-medium">
                {t("performance.affiliateFocus.totalRevenue")}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-400">
              {formatCurrency(currentMetrics.totalRevenue)}
            </div>
            {compareMode && period1Range && period2Range && (
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
                  {period1Metrics.totalRevenue > 0
                    ? (
                        ((period2Metrics.totalRevenue -
                          period1Metrics.totalRevenue) /
                          period1Metrics.totalRevenue) *
                        100
                      ).toFixed(1)
                    : "0.0"}
                  %
                </span>
                <span className="text-muted-foreground">vs P1</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total Sales */}
        <Card className="shark-card border-green-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-green-400" />
              <CardTitle className="text-sm font-medium">
                {t("performance.affiliateFocus.totalSales")}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {currentMetrics.totalSales}
            </div>
            {compareMode && period1Range && period2Range && (
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
                  {period1Metrics.totalSales > 0
                    ? (
                        ((period2Metrics.totalSales -
                          period1Metrics.totalSales) /
                          period1Metrics.totalSales) *
                        100
                      ).toFixed(1)
                    : "0.0"}
                  %
                </span>
                <span className="text-muted-foreground">vs P1</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AOV */}
        <Card className="shark-card border-purple-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              <CardTitle className="text-sm font-medium">
                {t("performance.affiliateFocus.avgOrderValue")}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">
              {formatCurrency(currentMetrics.avgOrderValue)}
            </div>
            {compareMode && period1Range && period2Range && (
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
                  {period1Metrics.avgOrderValue > 0
                    ? (
                        ((period2Metrics.avgOrderValue -
                          period1Metrics.avgOrderValue) /
                          period1Metrics.avgOrderValue) *
                        100
                      ).toFixed(1)
                    : "0.0"}
                  %
                </span>
                <span className="text-muted-foreground">vs P1</span>
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
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <CardTitle className="text-sm font-medium">
                {t("performance.affiliateFocus.refundRate")}
              </CardTitle>
            </div>
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
            {compareMode && period1Range && period2Range && (
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
                <span className="text-muted-foreground">vs P1</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards - Linha 2 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Commission Paid */}
        <Card className="shark-card border-magenta-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-magenta-400" />
              <CardTitle className="text-sm font-medium">
                {t("performance.affiliateFocus.totalCommission")}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-magenta-400">
              {formatCurrency(currentMetrics.totalCommission)}
            </div>
            {compareMode && period1Range && period2Range && (
              <div className="flex items-center gap-2 mt-2 text-xs">
                {period2Metrics.totalCommission >
                period1Metrics.totalCommission ? (
                  <TrendingUp className="w-3 h-3 text-green-400" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-400" />
                )}
                <span
                  className={
                    period2Metrics.totalCommission >
                    period1Metrics.totalCommission
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {period1Metrics.totalCommission > 0
                    ? (
                        ((period2Metrics.totalCommission -
                          period1Metrics.totalCommission) /
                          period1Metrics.totalCommission) *
                        100
                      ).toFixed(1)
                    : "0.0"}
                  %
                </span>
                <span className="text-muted-foreground">vs P1</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Commission Rate */}
        <Card className="shark-card border-orange-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-orange-400" />
              <CardTitle className="text-sm font-medium">
                {t("performance.affiliateFocus.commissionRate")}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">
              {currentMetrics.commissionRate.toFixed(1)}%
            </div>
            {compareMode && period1Range && period2Range && (
              <div className="flex items-center gap-2 mt-2 text-xs">
                {period2Metrics.commissionRate <
                period1Metrics.commissionRate ? (
                  <TrendingDown className="w-3 h-3 text-green-400" />
                ) : (
                  <TrendingUp className="w-3 h-3 text-red-400" />
                )}
                <span
                  className={
                    period2Metrics.commissionRate <
                    period1Metrics.commissionRate
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {(
                    period2Metrics.commissionRate -
                    period1Metrics.commissionRate
                  ).toFixed(1)}
                  pp
                </span>
                <span className="text-muted-foreground">vs P1</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total Customers */}
        <Card className="shark-card border-blue-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <CardTitle className="text-sm font-medium">
                {t("performance.affiliateFocus.totalCustomers")}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {currentMetrics.totalCustomers}
            </div>
            {compareMode && period1Range && period2Range && (
              <div className="flex items-center gap-2 mt-2 text-xs">
                {period2Metrics.totalCustomers >
                period1Metrics.totalCustomers ? (
                  <TrendingUp className="w-3 h-3 text-green-400" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-400" />
                )}
                <span
                  className={
                    period2Metrics.totalCustomers >
                    period1Metrics.totalCustomers
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {period1Metrics.totalCustomers > 0
                    ? (
                        ((period2Metrics.totalCustomers -
                          period1Metrics.totalCustomers) /
                          period1Metrics.totalCustomers) *
                        100
                      ).toFixed(1)
                    : "0.0"}
                  %
                </span>
                <span className="text-muted-foreground">vs P1</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chargeback Rate */}
        <Card className="shark-card border-red-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <CardTitle className="text-sm font-medium">
                {t("performance.affiliateFocus.chargebackRate")}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {currentMetrics.chargebackRate.toFixed(1)}%
            </div>
            {compareMode && period1Range && period2Range && (
              <div className="flex items-center gap-2 mt-2 text-xs">
                {period2Metrics.chargebackRate <
                period1Metrics.chargebackRate ? (
                  <TrendingDown className="w-3 h-3 text-green-400" />
                ) : (
                  <TrendingUp className="w-3 h-3 text-red-400" />
                )}
                <span
                  className={
                    period2Metrics.chargebackRate <
                    period1Metrics.chargebackRate
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {(
                    period2Metrics.chargebackRate -
                    period1Metrics.chargebackRate
                  ).toFixed(1)}
                  pp
                </span>
                <span className="text-muted-foreground">vs P1</span>
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
                  <div
                    className={
                      insight.type === "success"
                        ? "text-green-400"
                        : insight.type === "warning"
                        ? "text-yellow-400"
                        : "text-red-400"
                    }
                  >
                    {insight.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm font-semibold text-white">
                      {insight.title}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
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
                  <div className="text-3xl font-bold text-green-400 mt-1">
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
                  <div className="text-3xl font-bold text-red-400 mt-1">
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
            {compareMode && period1Range && period2Range
              ? t("performance.affiliateFocus.comparingPeriods")
              : t("performance.affiliateFocus.revenueByDay")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
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
              {currentMetrics.bestDay && (
                <ReferenceLine
                  y={currentMetrics.bestDay.revenue}
                  stroke="#00ff00"
                  strokeDasharray="3 3"
                  label={{ value: "Melhor", fill: "#00ff00", fontSize: 10 }}
                />
              )}
              {currentMetrics.worstDay && (
                <ReferenceLine
                  y={currentMetrics.worstDay.revenue}
                  stroke="#ff0000"
                  strokeDasharray="3 3"
                  label={{ value: "Pior", fill: "#ff0000", fontSize: 10 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
