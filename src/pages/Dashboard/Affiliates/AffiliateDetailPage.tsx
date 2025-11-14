import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import { Button } from "@/components/common/ui/button";
import { Skeleton } from "@/components/common/ui/skeleton";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Wallet,
  HandCoins,
  Target,
  ArrowLeft,
  User,
} from "lucide-react";
import { AffiliateDetailProvider } from "@/contexts/AffiliateDetailContext";
import { useAffiliateDetail } from "@/hooks/useAffiliateDetail";
import { useDashboardConfig } from "@/hooks/useDashboardConfig";
import { AffiliateTransactionsTable } from "@/components/dashboard/affiliates/AffiliateTransactionsTable";
import { AffiliateProductPerformanceTable } from "@/components/dashboard/affiliates/AffiliateProductPerformanceTable";
import { AffiliateSalesTrendChart } from "@/components/dashboard/affiliates/AffiliateSalesTrendChart";
import { formatCurrency } from "@/utils/index";

function AffiliateDetailContent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { name } = useParams<{ name: string }>();
  const affiliateName = decodeURIComponent(name || "");
  const { stats, incomeTransactions, isLoading } = useAffiliateDetail();
  const { currentDateRange } = useDashboardConfig();

  function SimpleStatsCard({
    title,
    value,
    icon: Icon,
    isLoading,
  }: {
    title: string;
    value: string;
    icon: React.ElementType;
    isLoading: boolean;
  }) {
    if (isLoading) {
      return (
        <Card className="border rounded-none shadow-lg border-white/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <Skeleton className="w-3/4 h-4 rounded-none bg-accent/20" />
            <Skeleton className="w-6 h-6 rounded-none bg-accent/20" />
          </CardHeader>
          <CardContent>
            <Skeleton className="w-1/2 h-8 mb-1 rounded-none bg-accent/30" />
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="transition-shadow duration-300 border rounded-none shadow-lg hover:shadow-xl border-white/30">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="text-blue-600 dark:text-white">
            <Icon className="w-7 h-7" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{value}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container p-4 mx-auto space-y-6 md:p-8">
      {/* Header */}
      <Button
        variant="outline"
        onClick={() => navigate("/dashboard/affiliates")}
        className="mb-4 border rounded-none border-border text-foreground hover:bg-accent/10"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t("common.backToAffiliates")}
      </Button>
      <div className="flex items-center gap-4">
        <User className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold dark:text-white">
            {t("affiliates.details.title", { name: affiliateName })}
          </h1>
          <p className="text-foreground">
            {t("affiliates.details.description")}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <SimpleStatsCard
          title={t("dashboard.stats.grossSales")}
          value={formatCurrency(stats.grossSales)}
          icon={DollarSign}
          isLoading={isLoading}
        />
        <SimpleStatsCard
          title={t("dashboard.stats.totalSales")}
          value={stats.totalSales.toString()}
          icon={ShoppingCart}
          isLoading={isLoading}
        />
        <SimpleStatsCard
          title={t("dashboard.stats.aov")}
          value={formatCurrency(stats.aov)}
          icon={TrendingUp}
          isLoading={isLoading}
        />
        <SimpleStatsCard
          title={t("dashboard.stats.refunds")}
          value={formatCurrency(stats.totalRefunds)}
          icon={TrendingDown}
          isLoading={isLoading}
        />
        <SimpleStatsCard
          title={t("dashboard.stats.netFinal")}
          value={formatCurrency(stats.netFinal)}
          icon={Wallet}
          isLoading={isLoading}
        />
        <SimpleStatsCard
          title={t("dashboard.stats.totalCOGS")}
          value={formatCurrency(stats.totalCOGS)}
          icon={HandCoins}
          isLoading={isLoading}
        />
        <SimpleStatsCard
          title={t("dashboard.stats.profit")}
          value={formatCurrency(stats.totalProfit)}
          icon={Target}
          isLoading={isLoading}
        />
      </div>

      {/* Sales Trend Chart */}
      <AffiliateSalesTrendChart
        data={incomeTransactions}
        isLoading={isLoading}
        dateRange={currentDateRange}
      />

      {/* Product Performance Table */}
      <AffiliateProductPerformanceTable />

      {/* Transaction History */}
      <AffiliateTransactionsTable />
    </div>
  );
}

export default function AffiliateDetailPage() {
  const { name } = useParams<{ name: string }>();
  const affiliateName = decodeURIComponent(name || "");

  return (
    <AffiliateDetailProvider affiliateName={affiliateName}>
      <AffiliateDetailContent />
    </AffiliateDetailProvider>
  );
}
