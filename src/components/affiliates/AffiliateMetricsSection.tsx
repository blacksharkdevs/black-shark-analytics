import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import { Skeleton } from "@/components/common/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/common/ui/tooltip";
import { HelpCircle } from "lucide-react";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Wallet,
  HandCoins,
  Target,
  Users,
  Package,
  CreditCard,
  Percent,
} from "lucide-react";
import { formatCurrency } from "@/utils/index";

interface AffiliateMetrics {
  totalCustomers: number;
  totalSales: number;
  totalRevenue: number;
  grossSales: number;
  refundsAndChargebacks: number;
  commission: number;
  taxes: number;
  platformFeePercent: number;
  platformFeeDollar: number;
  aov: number;
  netSales: number;
  net: number;
  cogs: number;
  profit: number;
  cashFlow: number;
}

interface AffiliateMetricsSectionProps {
  metrics: AffiliateMetrics;
  totalTransactions: number;
  isLoading: boolean;
}

function StatsCard({
  title,
  value,
  icon: Icon,
  tooltip,
  color = "text-foreground",
  isLoading,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  tooltip?: string;
  color?: string;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Card className="shark-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <Skeleton className="w-3/4 h-4" />
          <Skeleton className="w-6 h-6" />
        </CardHeader>
        <CardContent>
          <Skeleton className="w-1/2 h-8 mb-1" />
        </CardContent>
      </Card>
    );
  }

  const cardContent = (
    <Card className="transition-shadow shark-card hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {tooltip ? (
            <div className="flex items-center gap-1">
              {title}
              <HelpCircle className="w-3 h-3" />
            </div>
          ) : (
            title
          )}
        </CardTitle>
        <Icon className={`w-5 h-5 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
      </CardContent>
    </Card>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{cardContent}</TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return cardContent;
}

export function AffiliateMetricsSection({
  metrics,
  isLoading,
}: AffiliateMetricsSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Primeira linha de stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t("affiliates.table.customers")}
          value={metrics.totalCustomers.toString()}
          icon={Users}
          tooltip={t("affiliates.tooltips.customers")}
          isLoading={isLoading}
        />
        <StatsCard
          title={t("affiliates.table.sales")}
          value={metrics.totalSales.toString()}
          icon={ShoppingCart}
          tooltip={t("affiliates.tooltips.sales")}
          isLoading={isLoading}
        />
        <StatsCard
          title={t("affiliates.table.totalRevenue")}
          value={formatCurrency(metrics.totalRevenue)}
          icon={DollarSign}
          tooltip={t("affiliates.tooltips.totalRevenue")}
          isLoading={isLoading}
        />
        <StatsCard
          title={t("affiliates.table.grossSales")}
          value={formatCurrency(metrics.grossSales)}
          icon={TrendingUp}
          tooltip={t("affiliates.tooltips.grossSales")}
          color="text-green-400"
          isLoading={isLoading}
        />
      </div>

      {/* Segunda linha de stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t("affiliates.table.refundsChargebacks")}
          value={formatCurrency(metrics.refundsAndChargebacks)}
          icon={TrendingDown}
          tooltip={t("affiliates.tooltips.refundsChargebacks")}
          color="text-red-400"
          isLoading={isLoading}
        />
        <StatsCard
          title={t("affiliates.table.commission")}
          value={formatCurrency(metrics.commission)}
          icon={CreditCard}
          tooltip={t("affiliates.tooltips.commission")}
          isLoading={isLoading}
        />
        <StatsCard
          title={t("affiliates.table.taxes")}
          value={formatCurrency(metrics.taxes)}
          icon={Wallet}
          tooltip={t("affiliates.tooltips.taxes")}
          isLoading={isLoading}
        />
        <StatsCard
          title={t("affiliates.table.platformFeeDollar")}
          value={formatCurrency(metrics.platformFeeDollar)}
          icon={DollarSign}
          tooltip={t("affiliates.tooltips.platformFeeDollar")}
          isLoading={isLoading}
        />
      </div>

      {/* Terceira linha de stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t("affiliates.table.aov")}
          value={formatCurrency(metrics.aov)}
          icon={TrendingUp}
          tooltip={t("affiliates.tooltips.aov")}
          color="text-cyan-400"
          isLoading={isLoading}
        />
        <StatsCard
          title={t("affiliates.table.netSales")}
          value={formatCurrency(metrics.netSales)}
          icon={Package}
          tooltip={t("affiliates.tooltips.netSales")}
          isLoading={isLoading}
        />
        <StatsCard
          title={t("affiliates.table.cogs")}
          value={formatCurrency(metrics.cogs)}
          icon={HandCoins}
          tooltip={t("affiliates.tooltips.cogs")}
          isLoading={isLoading}
        />
        <StatsCard
          title={t("affiliates.table.platformFeePercent")}
          value={`${metrics.platformFeePercent.toFixed(2)}%`}
          icon={Percent}
          tooltip={t("affiliates.tooltips.platformFeePercent")}
          isLoading={isLoading}
        />
      </div>

      {/* Quarta linha - métricas finais */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatsCard
          title={t("affiliates.table.profit")}
          value={formatCurrency(metrics.profit)}
          icon={Target}
          tooltip={t("affiliates.tooltips.profit")}
          color="text-cyan-400"
          isLoading={isLoading}
        />
        <StatsCard
          title={t("affiliates.table.cashFlow")}
          value={formatCurrency(metrics.cashFlow)}
          icon={TrendingUp}
          tooltip={t("affiliates.tooltips.cashFlow")}
          color="text-green-400"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
