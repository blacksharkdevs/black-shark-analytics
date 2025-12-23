import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/common/ui/card";
import { Badge } from "@/components/common/ui/badge";
import { Users, ExternalLink } from "lucide-react";
import { formatCurrency } from "@/utils/index";
import type { Affiliate as AffiliateType } from "@/types/index";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/common/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface AffiliateMetrics {
  affiliate: AffiliateType;
  platform: string;
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

interface AffiliateListProps {
  affiliates: AffiliateMetrics[];
}

export function AffiliateList({ affiliates }: AffiliateListProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "BUYGOODS":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "CLICKBANK":
        return "bg-green-500/10 text-green-400 border-green-500/30";
      case "CARTPANDA":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "DIGISTORE":
        return "bg-orange-500/10 text-orange-400 border-orange-500/30";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/30";
    }
  };

  const handleNavigateToAffiliate = (affiliateId: string) => {
    navigate(`/dashboard/affiliates/${affiliateId}`);
  };

  if (affiliates.length === 0) {
    return (
      <Card className="shark-card">
        <CardContent className="p-12 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            {t("affiliates.noResults")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("affiliates.noResultsDescription")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {affiliates.map((item) => {
        const affiliateName =
          item.affiliate.name ||
          item.affiliate.email ||
          t("affiliates.unknownAffiliate");

        return (
          <Card
            key={item.affiliate.id}
            className="overflow-hidden transition-all shark-card hover:border-cyan-500/30"
          >
            <CardContent className="p-3">
              <div className="space-y-2">
                {/* Linha 1: Nome + Plataforma */}
                <div className="flex items-start justify-between gap-2">
                  <button
                    onClick={() => handleNavigateToAffiliate(item.affiliate.id)}
                    className="flex items-center gap-2 text-sm font-semibold transition-colors text-cyan-400 hover:text-cyan-300"
                  >
                    <Users className="w-4 h-4" />
                    {affiliateName}
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <Badge
                    variant="outline"
                    className={getPlatformColor(item.platform)}
                  >
                    {item.platform}
                  </Badge>
                </div>

                {/* Linha 2: Métricas de volume */}
                <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="p-1.5 rounded bg-white/5 cursor-help">
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                            {t("affiliates.table.customers")}
                            <HelpCircle className="w-2.5 h-2.5" />
                          </div>
                          <div className="font-semibold text-foreground">
                            {item.totalCustomers}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("affiliates.tooltips.customers")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="p-1.5 rounded bg-white/5 cursor-help">
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                            {t("affiliates.table.sales")}
                            <HelpCircle className="w-2.5 h-2.5" />
                          </div>
                          <div className="font-semibold text-foreground">
                            {item.totalSales}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("affiliates.tooltips.sales")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="p-1.5 rounded bg-white/5 cursor-help">
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                            {t("affiliates.table.totalRevenue")}
                            <HelpCircle className="w-2.5 h-2.5" />
                          </div>
                          <div className="font-semibold text-foreground">
                            {formatCurrency(item.totalRevenue)}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("affiliates.tooltips.totalRevenue")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="p-1.5 rounded bg-white/5 cursor-help">
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                            {t("affiliates.table.grossSales")}
                            <HelpCircle className="w-2.5 h-2.5" />
                          </div>
                          <div className="font-semibold text-green-400">
                            {formatCurrency(item.grossSales)}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("affiliates.tooltips.grossSales")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Linha 3: Deduções e taxas */}
                <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="p-1.5 rounded bg-white/5 cursor-help">
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                            {t("affiliates.table.refundsChargebacks")}
                            <HelpCircle className="w-2.5 h-2.5" />
                          </div>
                          <div className="font-semibold text-red-400">
                            {formatCurrency(item.refundsAndChargebacks)}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("affiliates.tooltips.refundsChargebacks")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="p-1.5 rounded bg-white/5 cursor-help">
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                            {t("affiliates.table.commission")}
                            <HelpCircle className="w-2.5 h-2.5" />
                          </div>
                          <div className="font-semibold text-foreground">
                            {formatCurrency(item.commission)}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("affiliates.tooltips.commission")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="p-1.5 rounded bg-white/5 cursor-help">
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                            {t("affiliates.table.taxes")}
                            <HelpCircle className="w-2.5 h-2.5" />
                          </div>
                          <div className="font-semibold text-foreground">
                            {formatCurrency(item.taxes)}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("affiliates.tooltips.taxes")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="p-1.5 rounded bg-white/5 cursor-help">
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                            {t("affiliates.table.platformFeeDollar")}
                            <HelpCircle className="w-2.5 h-2.5" />
                          </div>
                          <div className="font-semibold text-foreground">
                            {formatCurrency(item.platformFeeDollar)}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("affiliates.tooltips.platformFeeDollar")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Linha 4: Métricas calculadas */}
                <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="p-1.5 rounded bg-white/5 cursor-help">
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                            {t("affiliates.table.platformFeePercent")}
                            <HelpCircle className="w-2.5 h-2.5" />
                          </div>
                          <div className="font-semibold text-foreground">
                            {item.platformFeePercent.toFixed(2)}%
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("affiliates.tooltips.platformFeePercent")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="p-1.5 rounded bg-white/5 cursor-help">
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                            {t("affiliates.table.aov")}
                            <HelpCircle className="w-2.5 h-2.5" />
                          </div>
                          <div className="font-semibold text-cyan-400">
                            {formatCurrency(item.aov)}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("affiliates.tooltips.aov")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="p-1.5 rounded bg-white/5 cursor-help">
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                            {t("affiliates.table.netSales")}
                            <HelpCircle className="w-2.5 h-2.5" />
                          </div>
                          <div className="font-semibold text-foreground">
                            {formatCurrency(item.netSales)}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("affiliates.tooltips.netSales")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="p-1.5 rounded bg-white/5 cursor-help">
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                            {t("affiliates.table.net")}
                            <HelpCircle className="w-2.5 h-2.5" />
                          </div>
                          <div className="font-semibold text-foreground">
                            {formatCurrency(item.net)}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("affiliates.tooltips.net")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Linha 5: Métricas finais */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="p-1.5 rounded bg-white/5 cursor-help">
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                            {t("affiliates.table.cogs")}
                            <HelpCircle className="w-2.5 h-2.5" />
                          </div>
                          <div className="font-semibold text-foreground">
                            {formatCurrency(item.cogs)}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("affiliates.tooltips.cogs")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="p-1.5 rounded bg-white/5 cursor-help">
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                            {t("affiliates.table.profit")}
                            <HelpCircle className="w-2.5 h-2.5" />
                          </div>
                          <div className="font-semibold text-cyan-400">
                            {formatCurrency(item.profit)}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("affiliates.tooltips.profit")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="p-1.5 rounded bg-white/5 cursor-help">
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                            {t("affiliates.table.cashFlow")}
                            <HelpCircle className="w-2.5 h-2.5" />
                          </div>
                          <div className="font-semibold text-green-400">
                            {formatCurrency(item.cashFlow)}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("affiliates.tooltips.cashFlow")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
