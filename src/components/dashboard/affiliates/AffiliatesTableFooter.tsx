import { TableCell, TableFooter, TableRow } from "@/components/common/ui/table";
import { formatCurrency } from "@/utils/index";
import { type AffiliatePerformanceData } from "@/types/affiliates";

interface AffiliatesTableFooterProps {
  data: AffiliatePerformanceData[];
}

export function AffiliatesTableFooter({ data }: AffiliatesTableFooterProps) {
  if (data.length === 0) return null;

  const totals = {
    refunds_and_chargebacks: data.reduce(
      (sum, item) => sum + item.refunds_and_chargebacks,
      0
    ),
    commission_paid: data.reduce((sum, item) => sum + item.commission_paid, 0),
    taxes: data.reduce((sum, item) => sum + item.taxes, 0),
    platform_fee_percentage_amount: data.reduce(
      (sum, item) => sum + item.platform_fee_percentage_amount,
      0
    ),
    platform_fee_transaction_amount: data.reduce(
      (sum, item) => sum + item.platform_fee_transaction_amount,
      0
    ),
    net_sales: data.reduce((sum, item) => sum + item.net_sales, 0),
    net_final: data.reduce((sum, item) => sum + item.net_final, 0),
    total_cogs: data.reduce((sum, item) => sum + item.total_cogs, 0),
    profit: data.reduce((sum, item) => sum + item.profit, 0),
    cash_flow: data.reduce((sum, item) => sum + item.cash_flow, 0),
    gross_sales: data.reduce((sum, item) => sum + item.gross_sales, 0),
    total_revenue: data.reduce((sum, item) => sum + item.total_revenue, 0),
  };

  return (
    <TableFooter>
      <TableRow>
        <TableCell colSpan={8} className="font-semibold text-muted-foreground">
          Page Totals
        </TableCell>
        <TableCell className="font-bold text-right text-destructive">
          {formatCurrency(totals.refunds_and_chargebacks)}
        </TableCell>
        <TableCell className="font-bold text-right">
          {formatCurrency(totals.commission_paid)}
        </TableCell>
        <TableCell className="font-bold text-right">
          {formatCurrency(totals.taxes)}
        </TableCell>
        <TableCell className="font-bold text-right">
          {formatCurrency(totals.platform_fee_percentage_amount)}
        </TableCell>
        <TableCell className="font-bold text-right">
          {formatCurrency(totals.platform_fee_transaction_amount)}
        </TableCell>
        <TableCell></TableCell>
        <TableCell className="font-bold text-right">
          {formatCurrency(totals.net_sales)}
        </TableCell>
        <TableCell className="font-bold text-right">
          {formatCurrency(totals.net_final)}
        </TableCell>
        <TableCell className="font-bold text-right text-destructive">
          -{formatCurrency(totals.total_cogs)}
        </TableCell>
        <TableCell className="font-bold text-right">
          {formatCurrency(totals.profit)}
        </TableCell>
        <TableCell className="font-bold text-right text-primary">
          {formatCurrency(totals.cash_flow)}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell
          colSpan={1}
          className="pt-2 font-semibold text-muted-foreground"
        >
          Page Total Gross & Revenue
        </TableCell>
        <TableCell
          colSpan={1}
          className="pt-2 font-bold text-left text-primary"
        >
          Gross: {formatCurrency(totals.gross_sales)}
        </TableCell>

        <TableCell
          colSpan={1}
          className="pt-2 font-bold text-left text-primary"
        >
          Revenue: {formatCurrency(totals.total_revenue)}
        </TableCell>
      </TableRow>
    </TableFooter>
  );
}
