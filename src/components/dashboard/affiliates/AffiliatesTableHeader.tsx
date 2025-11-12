import { ArrowUpDown } from "lucide-react";
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
  label: string;
  className?: string;
  isNumeric?: boolean;
  tooltip?: string;
}

const tableHeaders: TableHeaderItem[] = [
  { key: "aff_name", label: "Affiliate Name", className: "w-[200px]" },
  { key: "platform", label: "Platform", className: "w-[150px]" },
  {
    key: "customers",
    label: "Customers",
    className: "text-right",
    isNumeric: true,
  },
  {
    key: "total_sales",
    label: "Sales",
    className: "text-right",
    isNumeric: true,
  },
  {
    key: "front_sales",
    label: "Front",
    className: "text-right",
    isNumeric: true,
  },
  {
    key: "back_sales",
    label: "Back",
    className: "text-right",
    isNumeric: true,
  },
  {
    key: "total_revenue",
    label: "Total Revenue",
    className: "text-right",
    isNumeric: true,
  },
  {
    key: "gross_sales",
    label: "Gross Sales",
    className: "text-right",
    isNumeric: true,
    tooltip: "Total Revenue - Platform Fees - Taxes",
  },
  {
    key: "refunds_and_chargebacks",
    label: "R+CB",
    className: "text-right",
    isNumeric: true,
    tooltip:
      "Total cost of all Refunds and Chargebacks. See tooltip for details on the calculation.",
  },
  {
    key: "commission_paid",
    label: "Commission",
    className: "text-right",
    isNumeric: true,
  },
  { key: "taxes", label: "Taxes", className: "text-right", isNumeric: true },
  {
    key: "platform_fee_percentage_amount",
    label: "Platform Fee (%)",
    className: "text-right",
    isNumeric: true,
  },
  {
    key: "platform_fee_transaction_amount",
    label: "Platform Fee ($)",
    className: "text-right",
    isNumeric: true,
  },
  {
    key: "aov",
    label: "AOV",
    className: "text-right",
    isNumeric: true,
    tooltip: "Gross Sales / Front Sales",
  },
  {
    key: "net_sales",
    label: "Net Sales",
    className: "text-right",
    isNumeric: true,
    tooltip: "Gross Sales - Commission",
  },
  {
    key: "net_final",
    label: "Net",
    className: "text-right",
    isNumeric: true,
    tooltip: "Net Sales + R+CB",
  },
  {
    key: "total_cogs",
    label: "COGS",
    className: "text-right",
    isNumeric: true,
    tooltip: "Cost of Goods Sold (Cost of Goods Sold)",
  },
  {
    key: "profit",
    label: "Profit",
    className: "text-right",
    isNumeric: true,
    tooltip: "Net - COGS",
  },
  {
    key: "cash_flow",
    label: "Cash Flow",
    className: "text-right font-bold text-primary",
    isNumeric: true,
    tooltip: "Profit - (Gross Sales * 10%)",
  },
];

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
              {header.tooltip ? (
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <span className="border-b border-dashed cursor-help border-muted-foreground">
                        {header.label}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{header.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                header.label
              )}
              {renderSortIcon(header.key)}
            </div>
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}
