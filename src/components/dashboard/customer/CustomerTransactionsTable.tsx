import { useMemo } from "react";
import { Link } from "react-router-dom";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/common/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/common/ui/tooltip";
import { cn } from "@/lib/utils";
import type { SaleRecord } from "@/lib/data";
import {
  calculateRefund,
  formatCurrency,
  formatTransactionDate,
} from "@/utils/index";

const renderRow = (label: string, value: number, isSubtracted: boolean) => (
  <div className="grid grid-cols-2 gap-x-2">
    <span>{label}:</span>
    <span
      className={cn(
        "text-right",
        isSubtracted && value > 0 && "text-destructive"
      )}
    >
      {isSubtracted && value > 0 ? "-" : ""}
      {formatCurrency(value)}
    </span>
  </div>
);

const getRefundTooltipContent = (transaction: SaleRecord) => {
  const isRefundAction = [
    "refund",
    "chargeback",
    "chargebackrefundtime",
  ].includes(transaction.action_type);
  if (!isRefundAction) return "Not a refund transaction.";

  if (
    transaction.refund_amount !== null &&
    transaction.taxes !== null &&
    transaction.refund_amount === transaction.taxes
  ) {
    return (
      <div className="p-1 space-y-1 text-sm text-foreground">
        <p className="font-bold">Refund Cost Exempt</p>
        <p>
          Refund Amount is equal to Taxes, so this cost is not counted here.
        </p>
      </div>
    );
  }

  // Lógica de rendering da tabela de custo do refund
  if (transaction.platform === "buygoods") {
    const finalCost = calculateRefund(transaction);
    const baseRevenue = Math.abs(transaction.revenue);
    const affCommission = transaction.aff_commission || 0;
    const taxes = transaction.taxes || 0;
    const platformFeePercentageAmount =
      baseRevenue * (transaction.platform_tax || 0);
    const platformFeeTransactionAmount =
      transaction.platform_transaction_tax || 0;

    return (
      <div className="p-1 space-y-1 text-sm text-foreground">
        <p className="font-bold">BuyGoods Refund Cost</p>
        <p className="mb-2 text-xs italic">
          Formula: ABS(Revenue) - Aff Commission - Taxes - Platform Fees
        </p>
        {renderRow("Revenue", baseRevenue, false)}
        {renderRow("Aff Commission", affCommission, true)}
        {renderRow("Taxes", taxes, true)}
        {renderRow("Platform Fee (%)", platformFeePercentageAmount, true)}
        {renderRow("Platform Fee ($)", platformFeeTransactionAmount, true)}

        <hr className="my-1 border-border/50" />
        <div className="grid grid-cols-2 font-bold gap-x-2">
          <span>Total Cost:</span>
          <span className="text-right">{formatCurrency(finalCost)}</span>
        </div>
      </div>
    );
  }

  const finalCost = calculateRefund(transaction);
  return (
    <div className="p-1 space-y-1 text-sm text-foreground">
      <p className="font-bold">
        Refund Cost ({transaction.platform || "N/A"}):
      </p>
      <p className="mb-2 text-xs italic">Formula: ABS(merchant_commission)</p>
      {renderRow(
        "Merchant Commission",
        Math.abs(transaction.merchant_commission || 0),
        false
      )}
      <hr className="my-1 border-border/50" />
      <div className="grid grid-cols-2 font-bold gap-x-2">
        <span>Total Cost:</span>
        <span className="text-right">{formatCurrency(finalCost)}</span>
      </div>
    </div>
  );
};

// --- COMPONENTE DE TABELA ---

export function CustomerTransactionsTable({
  transactions,
}: {
  transactions: SaleRecord[];
}) {
  // NOTA: O useMemo foi trazido para este componente, pois ele é burro e precisa calcular os totais

  const transactionsWithNetSales = useMemo(() => {
    // 🚨 A propriedade net_sales DEVE ser adicionada na interface SaleRecord em lib/data.ts.
    // Assumimos que o array 'transactions' já vem com a propriedade net_sales calculada pelo useCustomerHistory.
    return transactions;
  }, [transactions]);

  const pageTotals = useMemo(() => {
    return transactionsWithNetSales.reduce(
      (acc, t) => {
        acc.revenue += t.revenue;
        // 🚨 Assumimos que net_sales existe no objeto SaleRecord com a correção da interface.
        acc.net_sales += t.net_sales;
        acc.refund_calc += calculateRefund(t);
        return acc;
      },
      { revenue: 0, net_sales: 0, refund_calc: 0 }
    );
  }, [transactionsWithNetSales]);

  return (
    <div className="border rounded-none border-border">
      <Table>
        <TableHeader className="text-muted-foreground">
          <TableRow className="hover:bg-transparent border-border/50">
            <TableHead>Sale ID</TableHead>
            <TableHead>Date (UTC)</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Affiliate</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
            <TableHead className="text-right">Net Sales</TableHead>
            <TableHead className="text-right">Refund Calc</TableHead>
            <TableHead>Action Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="text-foreground">
          {transactionsWithNetSales.map((transaction) => {
            const refundValue = calculateRefund(transaction);
            const isRefundAction = [
              "refund",
              "chargeback",
              "chargebackrefundtime",
            ].includes(transaction.action_type);
            return (
              <TableRow
                key={transaction.id}
                className="hover:bg-accent/10 border-border/50"
              >
                <TableCell>
                  {/* Link para o detalhe da transação */}
                  <Link
                    to={`/dashboard/transactions/${transaction.id}`}
                    className="text-primary hover:underline"
                  >
                    {transaction.id}
                  </Link>
                </TableCell>
                <TableCell>
                  {formatTransactionDate(transaction.transaction_date)}
                </TableCell>
                <TableCell>{transaction.product_name}</TableCell>
                <TableCell>{transaction.aff_name || "N/A"}</TableCell>
                <TableCell>{transaction.platform || "N/A"}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(transaction.revenue)}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-semibold",
                    transaction.net_sales < 0 && "text-destructive"
                  )}
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="border-b border-dashed cursor-help border-muted-foreground">
                          {formatCurrency(transaction.net_sales)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="bg-card border-border text-foreground">
                        <div className="p-1 space-y-1 text-sm">
                          <p className="font-bold">Net Sales Breakdown:</p>
                          <div className="grid grid-cols-2 gap-x-2">
                            {renderRow("Revenue", transaction.revenue, false)}
                            {renderRow(
                              "Aff Commission",
                              transaction.aff_commission || 0,
                              true
                            )}
                            {renderRow("Taxes", transaction.taxes || 0, true)}
                            {renderRow(
                              "Platform Fee (%):",
                              transaction.revenue *
                                (transaction.platform_tax || 0),
                              true
                            )}
                            {renderRow(
                              "Platform Fee ($):",
                              transaction.platform_transaction_tax || 0,
                              true
                            )}
                          </div>
                          <hr className="my-1 border-border/50" />
                          <div className="grid grid-cols-2 font-bold gap-x-2">
                            <span>Net Sales:</span>
                            <span className="text-right">
                              {formatCurrency(transaction.net_sales)}
                            </span>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-semibold",
                    refundValue > 0 && "text-destructive"
                  )}
                >
                  {isRefundAction ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="border-b border-dashed cursor-help border-muted-foreground">
                            {formatCurrency(refundValue)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="bg-card border-border text-foreground">
                          {getRefundTooltipContent(transaction)}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    "N/A"
                  )}
                </TableCell>
                <TableCell className="capitalize">
                  {transaction.action_type.replace(/_/g, " ")}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter className="border-t bg-accent/10 border-border">
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={5} className="font-semibold text-foreground">
              Page Total
            </TableCell>
            <TableCell className="font-bold text-right text-primary">
              {formatCurrency(pageTotals.revenue)}
            </TableCell>
            <TableCell className="font-bold text-right text-primary">
              {formatCurrency(pageTotals.net_sales)}
            </TableCell>
            <TableCell className="font-bold text-right text-destructive">
              {pageTotals.refund_calc > 0
                ? `-${formatCurrency(pageTotals.refund_calc)}`
                : formatCurrency(pageTotals.refund_calc)}
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
