import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/common/ui/badge";
import { formatCurrency } from "@/utils/index";
import type { Affiliate as AffiliateType } from "@/types/index";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/common/ui/tooltip";
import { HelpCircle, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/common/ui/card";

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
  realAov: number;
  netSales: number;
  cogs: number;
  profit: number;
}

interface AffiliateTableProps {
  affiliates: AffiliateMetrics[];
}

export function AffiliateTable({ affiliates }: AffiliateTableProps) {
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

  const TableHeader = ({
    label,
    tooltip,
  }: {
    label: string;
    tooltip?: string;
  }) => (
    <th className="px-3 py-3 text-xs font-semibold tracking-wider text-left uppercase text-muted-foreground whitespace-nowrap">
      {tooltip ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 cursor-help">
                {label}
                <HelpCircle className="w-3 h-3" />
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        label
      )}
    </th>
  );

  if (affiliates.length === 0) {
    return (
      <Card className="shark-card">
        <CardContent className="p-12 text-center">
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
    <Card className="shark-card">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-white/5 border-white/10">
              <tr>
                <TableHeader label={t("affiliates.table.name")} />
                <TableHeader label={t("affiliates.table.platform")} />
                <TableHeader
                  label={t("affiliates.table.customers")}
                  tooltip={t("affiliates.tooltips.customers")}
                />
                <TableHeader
                  label={t("affiliates.table.sales")}
                  tooltip={t("affiliates.tooltips.sales")}
                />
                <TableHeader
                  label={t("affiliates.table.totalRevenue")}
                  tooltip={t("affiliates.tooltips.totalRevenue")}
                />
                <TableHeader
                  label={t("affiliates.table.grossSales")}
                  tooltip={t("affiliates.tooltips.grossSales")}
                />
                <TableHeader
                  label={t("affiliates.table.refundsChargebacks")}
                  tooltip={t("affiliates.tooltips.refundsChargebacks")}
                />
                <TableHeader
                  label={t("affiliates.table.commission")}
                  tooltip={t("affiliates.tooltips.commission")}
                />
                <TableHeader
                  label={t("affiliates.table.taxes")}
                  tooltip={t("affiliates.tooltips.taxes")}
                />
                <TableHeader
                  label={t("affiliates.table.platformFeePercent")}
                  tooltip={t("affiliates.tooltips.platformFeePercent")}
                />
                <TableHeader
                  label={t("affiliates.table.platformFeeDollar")}
                  tooltip={t("affiliates.tooltips.platformFeeDollar")}
                />
                <TableHeader
                  label={t("affiliates.table.aov")}
                  tooltip={t("affiliates.tooltips.aov")}
                />
                <TableHeader
                  label={t("affiliates.table.realAov")}
                  tooltip={t("affiliates.tooltips.realAov")}
                />
                <TableHeader
                  label={t("affiliates.table.netSales")}
                  tooltip={t("affiliates.tooltips.netSales")}
                />
                <TableHeader
                  label={t("affiliates.table.cogs")}
                  tooltip={t("affiliates.tooltips.cogs")}
                />
                <TableHeader
                  label={t("affiliates.table.profit")}
                  tooltip={t("affiliates.tooltips.profit")}
                />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {affiliates.map((item) => {
                const affiliateName =
                  item.affiliate.name ||
                  item.affiliate.email ||
                  t("affiliates.unknownAffiliate");

                return (
                  <tr
                    key={item.affiliate.id}
                    className="transition-colors hover:bg-white/5"
                  >
                    {/* Nome */}
                    <td className="px-3 py-3 text-sm">
                      <button
                        onClick={() =>
                          handleNavigateToAffiliate(item.affiliate.id)
                        }
                        className="flex items-center gap-1.5 font-medium transition-colors text-cyan-400 hover:text-cyan-300"
                      >
                        <span className="truncate max-w-[200px]">
                          {affiliateName}
                        </span>
                        <ExternalLink className="flex-shrink-0 w-3 h-3" />
                      </button>
                    </td>

                    {/* Plataforma */}
                    <td className="px-3 py-3 text-sm">
                      <Badge
                        variant="outline"
                        className={getPlatformColor(item.platform)}
                      >
                        {item.platform}
                      </Badge>
                    </td>

                    {/* Clientes */}
                    <td className="px-3 py-3 text-sm font-medium text-right tabular-nums text-foreground">
                      {item.totalCustomers}
                    </td>

                    {/* Vendas */}
                    <td className="px-3 py-3 text-sm font-medium text-right tabular-nums text-foreground">
                      {item.totalSales}
                    </td>

                    {/* Total Revenue */}
                    <td className="px-3 py-3 text-sm font-medium text-right tabular-nums text-foreground">
                      {formatCurrency(item.totalRevenue)}
                    </td>

                    {/* Gross Sales */}
                    <td className="px-3 py-3 text-sm font-medium text-right text-green-400 tabular-nums">
                      {formatCurrency(item.grossSales)}
                    </td>

                    {/* R+CB */}
                    <td className="px-3 py-3 text-sm font-medium text-right text-red-400 tabular-nums">
                      {formatCurrency(item.refundsAndChargebacks)}
                    </td>

                    {/* Commission */}
                    <td className="px-3 py-3 text-sm font-medium text-right tabular-nums text-foreground">
                      {formatCurrency(item.commission)}
                    </td>

                    {/* Taxes */}
                    <td className="px-3 py-3 text-sm font-medium text-right tabular-nums text-foreground">
                      {formatCurrency(item.taxes)}
                    </td>

                    {/* Platform Fee % */}
                    <td className="px-3 py-3 text-sm font-medium text-right tabular-nums text-foreground">
                      {item.platformFeePercent.toFixed(2)}%
                    </td>

                    {/* Platform Fee $ */}
                    <td className="px-3 py-3 text-sm font-medium text-right tabular-nums text-foreground">
                      {formatCurrency(item.platformFeeDollar)}
                    </td>

                    {/* AOV */}
                    <td className="px-3 py-3 text-sm font-medium text-right tabular-nums text-cyan-400">
                      {formatCurrency(item.aov)}
                    </td>

                    {/* Real AOV */}
                    <td className="px-3 py-3 text-sm font-medium text-right tabular-nums text-foreground">
                      {formatCurrency(item.realAov)}
                    </td>

                    {/* Net Sales */}
                    <td className="px-3 py-3 text-sm font-medium text-right tabular-nums text-foreground">
                      {formatCurrency(item.netSales)}
                    </td>

                    {/* COGS */}
                    <td className="px-3 py-3 text-sm font-medium text-right tabular-nums text-foreground">
                      {formatCurrency(item.cogs)}
                    </td>

                    {/* Profit */}
                    <td className="px-3 py-3 text-sm font-medium text-right tabular-nums text-cyan-400">
                      {formatCurrency(item.profit)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
