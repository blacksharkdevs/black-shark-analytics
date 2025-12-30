import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Percent,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import { formatCurrency } from "@/utils/index";
import { useTranslation } from "react-i18next";

interface FinancialMetrics {
  netRevenue: number;
  commission: number;
  roi: number;
  bleedingRate: number;
  totalSales: number;
  totalRefunds: number;
  totalChargebacks: number;
}

interface Props {
  metrics: FinancialMetrics;
}

export function AffiliateFinancialCards({ metrics }: Props) {
  const { t } = useTranslation();

  const getBleedingColor = (rate: number) => {
    if (rate <= 5) return "text-green-400 border-green-500/30";
    if (rate <= 7) return "text-yellow-400 border-yellow-500/30";
    return "text-red-400 border-red-500/30";
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Receita Líquida Gerada */}
      <Card className="shark-card border-cyan-500/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-cyan-400" />
            <CardTitle className="text-sm font-medium">
              {t("affiliate.netRevenue")}
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            {t("affiliate.netRevenueDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-cyan-400">
            {formatCurrency(metrics.netRevenue)}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {t("affiliate.afterFees")}
          </p>
        </CardContent>
      </Card>

      {/* Comissão Paga */}
      <Card className="shark-card border-purple-500/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-400" />
            <CardTitle className="text-sm font-medium">
              {t("affiliate.commissionPaid")}
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            {t("affiliate.commissionPaidDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-400">
            {formatCurrency(metrics.commission)}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {t("affiliate.totalInvested")}
          </p>
        </CardContent>
      </Card>

      {/* ROI do Afiliado */}
      <Card
        className={`shark-card ${
          metrics.roi > 100
            ? "border-green-500/30 bg-green-950/10"
            : metrics.roi > 50
            ? "border-yellow-500/30"
            : "border-red-500/30 bg-red-950/10"
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-green-400" />
            <CardTitle className="text-sm font-medium">
              {t("affiliate.roi")}
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            {t("affiliate.roiDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`text-3xl font-bold ${
              metrics.roi > 100
                ? "text-green-400"
                : metrics.roi > 50
                ? "text-yellow-400"
                : "text-red-400"
            }`}
          >
            {metrics.roi > 0 ? "+" : ""}
            {metrics.roi.toFixed(1)}%
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs">
            {metrics.roi > 100 ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span className="text-muted-foreground">
              {metrics.roi > 100
                ? t("affiliate.profitable")
                : metrics.roi > 0
                ? t("affiliate.tightMargin")
                : t("affiliate.loss")}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Taxa de Sangramento */}
      <Card className={`shark-card ${getBleedingColor(metrics.bleedingRate)}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <CardTitle className="text-sm font-medium">
              {t("affiliate.bleedingRate")}
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            {t("affiliate.bleedingRateDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`text-3xl font-bold ${
              metrics.bleedingRate > 7
                ? "text-red-400"
                : metrics.bleedingRate > 5
                ? "text-yellow-400"
                : "text-green-400"
            }`}
          >
            {metrics.bleedingRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {metrics.totalRefunds} {t("affiliate.refunds")} +{" "}
            {metrics.totalChargebacks} {t("affiliate.chargebacks")}
          </p>
          {metrics.bleedingRate > 7 && (
            <p className="text-xs text-red-400 mt-1 font-semibold">
              ⚠️ {t("affiliate.dangerous")}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
