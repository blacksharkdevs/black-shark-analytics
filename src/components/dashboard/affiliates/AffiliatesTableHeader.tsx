import { ArrowUpDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TableHead, TableHeader, TableRow } from "@/components/common/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/common/ui/tooltip";
import { cn } from "@/lib/utils";
import { type SortableAffiliateKeys } from "@/types/affiliates";

interface TableHeaderItem {
  key: SortableAffiliateKeys;
  labelKey: string;
  className?: string;
  isNumeric?: boolean;
  tooltipKey?: string;
}

interface AffiliatesTableHeaderProps {
  sortColumn: SortableAffiliateKeys;
  sortDirection: "asc" | "desc";
  onSort: (column: SortableAffiliateKeys) => void;
}

export function AffiliatesTableHeader({
  sortColumn,
  sortDirection,
  onSort,
}: AffiliatesTableHeaderProps) {
  const { t } = useTranslation();

  const tableHeaders: TableHeaderItem[] = [
    {
      key: "aff_name",
      labelKey: "affiliates.table.affiliateName",
      className: "w-[200px]",
    },
    {
      key: "platform",
      labelKey: "affiliates.table.platform",
      className: "w-[150px]",
    },
    {
      key: "customers",
      labelKey: "affiliates.table.customers",
      className: "text-right",
      isNumeric: true,
    },
    {
      key: "total_sales",
      labelKey: "affiliates.table.sales",
      className: "text-right",
      isNumeric: true,
    },
    {
      key: "front_sales",
      labelKey: "affiliates.table.front",
      className: "text-right",
      isNumeric: true,
    },
    {
      key: "back_sales",
      labelKey: "affiliates.table.back",
      className: "text-right",
      isNumeric: true,
    },
    {
      key: "total_revenue",
      labelKey: "affiliates.table.totalRevenue",
      className: "text-right",
      isNumeric: true,
    },
    {
      key: "gross_sales",
      labelKey: "affiliates.table.grossSales",
      className: "text-right",
      isNumeric: true,
      tooltipKey: "affiliates.tableTooltips.grossSales",
    },
    {
      key: "refunds_and_chargebacks",
      labelKey: "affiliates.table.rcb",
      className: "text-right",
      isNumeric: true,
      tooltipKey: "affiliates.tableTooltips.rcb",
    },
    {
      key: "commission_paid",
      labelKey: "affiliates.table.commissionPaid",
      className: "text-right",
      isNumeric: true,
    },
    {
      key: "taxes",
      labelKey: "affiliates.table.taxes",
      className: "text-right",
      isNumeric: true,
    },
    {
      key: "platform_fee_percentage_amount",
      labelKey: "affiliates.table.platformFeePercent",
      className: "text-right",
      isNumeric: true,
    },
    {
      key: "platform_fee_transaction_amount",
      labelKey: "affiliates.table.platformFeeDollar",
      className: "text-right",
      isNumeric: true,
    },
    {
      key: "aov",
      labelKey: "affiliates.table.aov",
      className: "text-right",
      isNumeric: true,
      tooltipKey: "affiliates.tableTooltips.aov",
    },
    {
      key: "net_sales",
      labelKey: "affiliates.table.netSales",
      className: "text-right",
      isNumeric: true,
      tooltipKey: "affiliates.tableTooltips.netSales",
    },
    {
      key: "net_final",
      labelKey: "affiliates.table.net",
      className: "text-right",
      isNumeric: true,
      tooltipKey: "affiliates.tableTooltips.net",
    },
    {
      key: "total_cogs",
      labelKey: "affiliates.table.cogsColumn",
      className: "text-right",
      isNumeric: true,
      tooltipKey: "affiliates.tableTooltips.cogs",
    },
    {
      key: "profit",
      labelKey: "affiliates.table.profitColumn",
      className: "text-right",
      isNumeric: true,
      tooltipKey: "affiliates.tableTooltips.profit",
    },
    {
      key: "cash_flow",
      labelKey: "affiliates.table.cashFlow",
      className: "text-right font-bold text-primary",
      isNumeric: true,
      tooltipKey: "affiliates.tableTooltips.cashFlow",
    },
  ];

  const renderSortIcon = (column: SortableAffiliateKeys) => {
    if (sortColumn !== column)
      return <ArrowUpDown className="w-4 h-4 ml-2 opacity-30" />;
    return sortDirection === "asc" ? (
      <ArrowUpDown className="w-4 h-4 ml-2 transform rotate-180 text-primary" />
    ) : (
      <ArrowUpDown className="w-4 h-4 ml-2 text-primary" />
    );
  };

  return (
    <TableHeader>
      <TableRow>
        {tableHeaders.map((header) => (
          <TableHead
            key={header.key}
            className={cn(
              "cursor-pointer hover:bg-muted/50 whitespace-nowrap",
              header.className,
              sortColumn === header.key ? "text-primary" : ""
            )}
            onClick={() => onSort(header.key)}
          >
            <div
              className={cn(
                "flex items-center",
                header.isNumeric ? "justify-end" : "justify-start"
              )}
            >
              {header.tooltipKey ? (
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <span className="border-b border-dashed cursor-help border-muted-foreground">
                        {t(header.labelKey)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="bg-blue-950">
                      <p>{t(header.tooltipKey)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                t(header.labelKey)
              )}
              {renderSortIcon(header.key)}
            </div>
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}
