import { useParams, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import { ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import { Button } from "@/components/common/ui/button";
import { Skeleton } from "@/components/common/ui/skeleton";
import { useDashboardData } from "@/contexts/DashboardDataContext";
import { useDashboardConfig } from "@/contexts/DashboardConfigContext";
import { AffiliateFinancialCards } from "@/components/dashboard/performance/AffiliateFinancialCards";
import { AffiliateTrendChart } from "@/components/dashboard/performance/AffiliateTrendChart";
import { AffiliateQualityGauge } from "@/components/dashboard/performance/AffiliateQualityGauge";
import { AffiliateProductBreakdown } from "@/components/dashboard/performance/AffiliateProductBreakdown";

interface DailyMetrics {
  date: string;
  revenue: number;
  commission: number;
  sales: number;
}

interface ProductMetrics {
  productId: string;
  productName: string;
  sales: number;
  revenue: number;
  commission: number;
  refunds: number;
  refundRate: number;
}

export default function AffiliatePerformanceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { filteredSalesData, isLoadingData } = useDashboardData();
  const { isLoading: isDateRangeLoading } = useDashboardConfig();

  const isLoading = isLoadingData || isDateRangeLoading;

  // Dados do afiliado
  const affiliateData = useMemo(() => {
    const data = filteredSalesData.filter((t) => t.affiliateId === id);
    const name = data[0]?.affiliate?.name || `Affiliate ${id}`;
    return { data, name };
  }, [filteredSalesData, id]);

  // 1. CARTÃO DE VISITA FINANCEIRO - 4 cards principais
  const financialMetrics = useMemo(() => {
    let grossRevenue = 0;
    let netRevenue = 0;
    let commission = 0;
    let totalSales = 0;
    let totalRefunds = 0;
    let totalChargebacks = 0;

    affiliateData.data.forEach((transaction) => {
      if (transaction.type === "SALE" && transaction.status === "COMPLETED") {
        grossRevenue += Number(transaction.grossAmount);
        netRevenue += Number(transaction.netAmount);
        commission += Number(transaction.affiliateCommission);
        totalSales += 1;
      }
      if (transaction.type === "REFUND") totalRefunds += 1;
      if (transaction.type === "CHARGEBACK") totalChargebacks += 1;
    });

    // ROI = (Lucro / Investimento) * 100
    // Lucro = Receita Bruta - Comissão
    // Investimento = Comissão
    const roi =
      commission > 0 ? ((grossRevenue - commission) / commission) * 100 : 0;
    const bleedingRate =
      totalSales > 0
        ? ((totalRefunds + totalChargebacks) / totalSales) * 100
        : 0;

    return {
      netRevenue,
      commission,
      roi,
      bleedingRate,
      totalSales,
      totalRefunds,
      totalChargebacks,
    };
  }, [affiliateData.data]);

  // 2. TENDÊNCIA DE PERFORMANCE - Gráfico com 3 métricas
  const dailyTrend = useMemo(() => {
    const dailyMap = new Map<string, DailyMetrics>();

    affiliateData.data.forEach((t) => {
      const date = format(parseISO(t.occurredAt), "yyyy-MM-dd");

      if (!dailyMap.has(date)) {
        dailyMap.set(date, { date, revenue: 0, commission: 0, sales: 0 });
      }

      const day = dailyMap.get(date)!;

      if (t.type === "SALE" && t.status === "COMPLETED") {
        day.revenue += Number(t.grossAmount);
        day.commission += Number(t.affiliateCommission);
        day.sales += 1;
      }
    });

    return Array.from(dailyMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }, [affiliateData.data]);

  // 3. ANÁLISE DE QUALIDADE - Chargeback rate
  const chargebackRate = useMemo(() => {
    const totalSales = affiliateData.data.filter(
      (t) => t.type === "SALE" && t.status === "COMPLETED"
    ).length;
    const totalChargebacks = affiliateData.data.filter(
      (t) => t.type === "CHARGEBACK"
    ).length;

    return totalSales > 0 ? (totalChargebacks / totalSales) * 100 : 0;
  }, [affiliateData.data]);

  // 4. BREAKDOWN POR PRODUTO
  const productBreakdown = useMemo(() => {
    const productMap = new Map<string, ProductMetrics>();

    affiliateData.data.forEach((t) => {
      const productId = t.productId || "unknown";
      const productName = t.product?.name || "Produto Desconhecido";

      if (!productMap.has(productId)) {
        productMap.set(productId, {
          productId,
          productName,
          sales: 0,
          revenue: 0,
          commission: 0,
          refunds: 0,
          refundRate: 0,
        });
      }

      const product = productMap.get(productId)!;

      if (t.type === "SALE" && t.status === "COMPLETED") {
        product.sales += 1;
        product.revenue += Number(t.grossAmount);
        product.commission += Number(t.affiliateCommission);
      }

      if (t.type === "REFUND") product.refunds += 1;
    });

    return Array.from(productMap.values())
      .map((p) => ({
        ...p,
        refundRate: p.sales > 0 ? (p.refunds / p.sales) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [affiliateData.data]);

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
              className="mb-4 w-fit"
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
      {/* Header */}
      <Card className="shark-card">
        <CardHeader>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard/performance/affiliates")}
            className="mb-2 w-fit"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("affiliate.backToAffiliates")}
          </Button>
          <CardTitle className="text-2xl">{affiliateData.name}</CardTitle>
          <CardDescription>{t("affiliate.completeAnalysis")}</CardDescription>
        </CardHeader>
      </Card>

      {/* 1. CARTÃO DE VISITA FINANCEIRO */}
      <AffiliateFinancialCards metrics={financialMetrics} />

      {/* 2. GRÁFICO DE TENDÊNCIA */}
      <AffiliateTrendChart data={dailyTrend} />

      {/* 3. ANÁLISE DE QUALIDADE (GAUGE DE CHARGEBACK) */}
      <AffiliateQualityGauge chargebackRate={chargebackRate} />

      {/* 4. BREAKDOWN POR PRODUTO */}
      <AffiliateProductBreakdown products={productBreakdown} />
    </div>
  );
}
