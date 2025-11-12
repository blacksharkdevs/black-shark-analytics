import { Link } from "react-router-dom";
import { TableCell, TableRow } from "@/components/common/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/common/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/index";
import { type AffiliatePerformanceData } from "@/types/affiliates";

interface AffiliatesTableRowProps {
  item: AffiliatePerformanceData;
  isTopAffiliate: boolean;
}

export function AffiliatesTableRow({
  item,
  isTopAffiliate,
}: AffiliatesTableRowProps) {
  const getRefundTooltipContent = (item: AffiliatePerformanceData) => {
    const renderRow = (label: string, value: number, isSubtracted = false) => (
      <div className="grid grid-cols-2 gap-x-2">
        <span>{label}:</span>
        <span className={cn("text-right", isSubtracted && "text-destructive")}>
          {isSubtracted ? "-" : ""}
          {formatCurrency(Math.abs(value))}
        </span>
      </div>
    );

    if (item.platform === "buygoods") {
      return (
        <div className="p-2 text-sm w-[280px] space-y-1">
          <p className="font-bold">BuyGoods R+CB Cost</p>
          <p className="mb-2 text-xs italic">
            Formula: Revenue - Aff Comm - Taxes - Platform Fees
          </p>
          {renderRow("Total Refund Amount", item.total_refund_amount)}
          <hr className="my-1 border-dashed" />
          {renderRow("Aff Commission", item.total_refund_commission, true)}
          {renderRow("Taxes", item.total_refund_taxes, true)}
          {renderRow("Platform Fees", item.total_refund_platform_fees, true)}
          <hr className="my-1" />
          <div className="grid grid-cols-2 font-bold gap-x-2">
            <span>Final R+CB Cost:</span>
            <span
              className={cn(
                "text-right",
                item.refunds_and_chargebacks < 0 && "text-destructive"
              )}
            >
              {formatCurrency(item.refunds_and_chargebacks)}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="p-2 text-sm">
        <p className="font-bold">{item.platform} R+CB Cost</p>
        <p className="mb-2 text-xs italic">
          For each refund/chargeback, the cost is the absolute value of the
          original merchant commission.
        </p>
        <div className="grid grid-cols-2 font-bold gap-x-2">
          <span>Final R+CB Cost:</span>
          <span
            className={cn(
              "text-right",
              item.refunds_and_chargebacks < 0 && "text-destructive"
            )}
          >
            {formatCurrency(item.refunds_and_chargebacks)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <TableRow
      className={cn(
        "hover:bg-muted/50",
        isTopAffiliate && "bg-primary/5 hover:bg-primary/10"
      )}
    >
      <TableCell className="font-medium">
        <Link
          to={`/dashboard/affiliates/${encodeURIComponent(item.aff_name)}`}
          className="text-primary hover:underline"
        >
          {item.aff_name}
        </Link>
      </TableCell>
      <TableCell>{item.platform}</TableCell>
      <TableCell className="text-right">
        {item.customers.toLocaleString()}
      </TableCell>
      <TableCell className="text-right">
        {item.total_sales.toLocaleString()}
      </TableCell>
      <TableCell className="text-right">
        {item.front_sales.toLocaleString()}
      </TableCell>
      <TableCell className="text-right">
        {item.back_sales.toLocaleString()}
      </TableCell>
      <TableCell className="text-right">
        {formatCurrency(item.total_revenue)}
      </TableCell>
      <TableCell className="text-right">
        {formatCurrency(item.gross_sales)}
      </TableCell>
      <TableCell className="text-right text-destructive">
        <TooltipProvider>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <span className="border-b border-dashed cursor-help border-muted-foreground">
                {formatCurrency(item.refunds_and_chargebacks)}
              </span>
            </TooltipTrigger>
            <TooltipContent>{getRefundTooltipContent(item)}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell className="text-right">
        {formatCurrency(item.commission_paid)}
      </TableCell>
      <TableCell className="text-right">{formatCurrency(item.taxes)}</TableCell>
      <TableCell className="text-right">
        {formatCurrency(item.platform_fee_percentage_amount)}
      </TableCell>
      <TableCell className="text-right">
        {formatCurrency(item.platform_fee_transaction_amount)}
      </TableCell>
      <TableCell className="text-right">{formatCurrency(item.aov)}</TableCell>
      <TableCell className="text-right">
        {formatCurrency(item.net_sales)}
      </TableCell>
      <TableCell className="text-right">
        {formatCurrency(item.net_final)}
      </TableCell>
      <TableCell className="text-right text-destructive">
        -{formatCurrency(item.total_cogs)}
      </TableCell>
      <TableCell
        className={cn(
          "text-right font-bold",
          item.profit > 0 ? "text-foreground" : "text-destructive"
        )}
      >
        {formatCurrency(item.profit)}
      </TableCell>
      <TableCell
        className={cn(
          "text-right font-bold",
          item.cash_flow > 0 ? "text-primary" : "text-destructive"
        )}
      >
        {formatCurrency(item.cash_flow)}
      </TableCell>
    </TableRow>
  );
}
