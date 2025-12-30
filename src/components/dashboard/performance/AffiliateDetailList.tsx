import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/common/ui/card";
import { Skeleton } from "@/components/common/ui/skeleton";
import { Badge } from "@/components/common/ui/badge";
import { Button } from "@/components/common/ui/button";
import { Focus } from "lucide-react";
import { formatCurrency } from "@/utils/index";

interface AffiliateMetrics {
  id: string;
  name: string;
  totalRevenue: number;
  totalNet: number;
  salesCount: number;
  commissionPaid: number;
  refundCount: number;
  refundRate: number;
}

interface AffiliateDetailListProps {
  affiliateMetrics: AffiliateMetrics[];
  isLoading: boolean;
  onFocusAffiliate?: (affiliateId: string) => void;
}

export function AffiliateDetailList({
  affiliateMetrics,
  isLoading,
  onFocusAffiliate,
}: AffiliateDetailListProps) {
  const { t } = useTranslation();

  const getRefundRateBadgeVariant = (
    refundRate: number
  ): "default" | "secondary" | "destructive" => {
    if (refundRate < 1) return "default";
    if (refundRate < 3) return "secondary";
    return "destructive";
  };

  const getRefundRateClass = (refundRate: number) => {
    if (refundRate < 1)
      return "bg-green-950/50 text-green-400 border-green-400/30";
    if (refundRate < 3)
      return "bg-yellow-950/50 text-yellow-400 border-yellow-400/30";
    return "bg-red-950/50 text-red-400 border-red-400/30";
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="w-full h-32" />
        ))}
      </div>
    );
  }

  if (affiliateMetrics.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        {t("performance.noData")}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {affiliateMetrics.map((affiliate) => (
        <Card
          key={affiliate.id}
          className="overflow-hidden transition-all shark-card hover:shadow-lg hover:border-cyan-500/30"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">
                  {affiliate.name}
                </h3>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <span>
                    {affiliate.salesCount}{" "}
                    {t("performance.affiliates.sales").toLowerCase()}
                  </span>
                </CardDescription>
              </div>
              {onFocusAffiliate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFocusAffiliate(affiliate.id)}
                  className="gap-2 hover:bg-cyan-500/20 hover:text-cyan-400"
                >
                  <Focus className="w-4 h-4" />
                  {t("common.focus")}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Métricas financeiras */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <div className="text-xs text-muted-foreground">
                  {t("performance.affiliates.grossRevenue")}
                </div>
                <div className="text-lg font-bold text-cyan-400">
                  {formatCurrency(affiliate.totalRevenue)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">
                  {t("performance.affiliates.netRevenue")}
                </div>
                <div className="text-lg font-bold text-green-400">
                  {formatCurrency(affiliate.totalNet)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">
                  {t("performance.affiliates.commission")}
                </div>
                <div className="text-lg font-bold text-magenta-400">
                  {formatCurrency(affiliate.commissionPaid)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">
                  {t("performance.affiliates.refundRate")}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-block px-3 py-1 text-sm font-semibold rounded-md ${getRefundRateClass(
                      affiliate.refundRate
                    )}`}
                  >
                    {affiliate.refundRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Contador de reembolsos */}
            <div className="flex items-center gap-2 pt-2 text-xs border-t border-border text-muted-foreground">
              <span>
                {affiliate.refundCount}{" "}
                {t("performance.affiliates.refunds").toLowerCase()}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
