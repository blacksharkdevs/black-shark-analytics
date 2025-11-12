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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import { Button } from "@/components/common/ui/button";
import { Skeleton } from "@/components/common/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/common/ui/tooltip";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useDashboardConfig } from "@/hooks/useDashboardConfig";
import { useAffiliateDetail } from "@/hooks/useAffiliateDetail";
import type { SaleRecord } from "@/types/index";
import {
  calculateRefund,
  formatCurrency,
  formatTransactionDate,
} from "@/utils/index";

const renderRow = (label: string, value: number, isSubtracted = false) => (
  <div className="grid grid-cols-2 gap-x-2">
    <span>{label}:</span>
    <span className={cn("text-right", isSubtracted && "text-destructive")}>
      {isSubtracted ? "-" : ""}
      {formatCurrency(value)}
    </span>
  </div>
);

const getRefundTooltipContent = (transaction: SaleRecord) => {
  const refundValue = calculateRefund(transaction);
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

  if (transaction.platform === "buygoods") {
    const baseRevenue = Math.abs(transaction.revenue);
    const affCommission = transaction.aff_commission || 0;
    const taxes = transaction.taxes || 0;
    const platformFeePercentageAmount =
      baseRevenue * (transaction.platform_tax || 0);
    const platformFeeTransactionAmount =
      transaction.platform_transaction_tax || 0;
    const finalCost =
      baseRevenue -
      affCommission -
      taxes -
      platformFeePercentageAmount -
      platformFeeTransactionAmount;

    return (
      <div className="p-1 space-y-1 text-sm text-foreground">
        <p className="font-bold">BuyGoods Refund Cost</p>
        <p className="mb-2 text-xs italic">
          Formula: Revenue - Aff Commission - Taxes - Platform Fees
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
        <span className="text-right">{formatCurrency(refundValue)}</span>
      </div>
    </div>
  );
};

export function AffiliateTransactionsTable() {
  const { getCurrentDateDbColumn } = useDashboardConfig();
  const { transactions, isLoading, pagination } = useAffiliateDetail();

  const {
    currentPage,
    totalTransactions,
    itemsPerPage,
    handleItemsPerPageChange,
    handlePageChange,
    totalPages,
    ROWS_PER_PAGE_OPTIONS,
  } = pagination;

  const showContentSkeleton = isLoading && transactions.length === 0;
  const showNoTransactionsMessage = !isLoading && transactions.length === 0;

  return (
    <Card className="border-[1px] border-white/30 rounded-none shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground">Transaction History</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Rows per page:
            </span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={handleItemsPerPageChange}
            >
              <SelectTrigger className="w-[80px] border border-input rounded-none">
                <SelectValue placeholder={itemsPerPage.toString()} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-white/40">
                {ROWS_PER_PAGE_OPTIONS.map((option) => (
                  <SelectItem
                    key={option}
                    value={option.toString()}
                    className="rounded-none cursor-pointer dark:bg-blue-900 dark:text-white/60 hover:dark:text-white"
                  >
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {showContentSkeleton ? (
          <div className="space-y-2">
            {[...Array(itemsPerPage)].map((_, i) => (
              <Skeleton
                key={i}
                className="w-full h-12 rounded-none bg-accent/20"
              />
            ))}
          </div>
        ) : showNoTransactionsMessage ? (
          <div className="py-10 text-center text-muted-foreground">
            No transactions found for this affiliate.
          </div>
        ) : (
          <>
            <div className="border rounded-md border-border">
              <Table>
                <TableHeader className="text-muted-foreground">
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="w-[150px]">Sale ID</TableHead>
                    <TableHead className="w-[180px]">Date (UTC)</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead className="text-right w-[120px]">
                      Revenue
                    </TableHead>
                    <TableHead className="text-right w-[120px]">
                      Net Sales
                    </TableHead>
                    <TableHead className="text-right w-[120px]">
                      Refund Calc
                    </TableHead>
                    <TableHead className="w-[150px]">Action Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-foreground">
                  {transactions.map((transaction) => {
                    const refundValue = calculateRefund(transaction);
                    const isRefundAction = [
                      "refund",
                      "chargeback",
                      "chargebackrefundtime",
                    ].includes(transaction.action_type);

                    const netSales =
                      transaction.revenue -
                      (transaction.aff_commission || 0) -
                      (transaction.taxes || 0) -
                      transaction.revenue * (transaction.platform_tax || 0) -
                      (transaction.platform_transaction_tax || 0);

                    return (
                      <TableRow
                        key={transaction.id}
                        className="hover:bg-accent/10 border-border/50"
                      >
                        <TableCell className="font-medium truncate max-w-[100px]">
                          <Link
                            to={`/dashboard/transactions/${transaction.id}`}
                            className="text-primary hover:underline"
                          >
                            {transaction.id}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {formatTransactionDate(
                            transaction[getCurrentDateDbColumn()] ||
                              transaction.transaction_date
                          )}
                        </TableCell>
                        <TableCell className="truncate max-w-[200px]">
                          {transaction.product_name}
                        </TableCell>
                        <TableCell className="truncate max-w-[150px]">
                          {transaction.customer_email ? (
                            <Link
                              to={`/dashboard/customers/${encodeURIComponent(
                                transaction.customer_email
                              )}`}
                              className="text-primary hover:underline"
                            >
                              {transaction.customer_name || "N/A"}
                            </Link>
                          ) : (
                            transaction.customer_name || "N/A"
                          )}
                        </TableCell>
                        <TableCell className="truncate max-w-[120px]">
                          {transaction.platform || "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(transaction.revenue)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right font-semibold",
                            netSales < 0 && "text-destructive"
                          )}
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="border-b border-dashed cursor-help border-muted-foreground">
                                  {formatCurrency(netSales)}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="bg-card border-border text-foreground">
                                <div className="p-1 space-y-1 text-sm">
                                  <p className="font-bold">
                                    Net Sales Breakdown:
                                  </p>
                                  <div className="grid grid-cols-2 gap-x-2">
                                    <span>Revenue:</span>
                                    <span className="text-right">
                                      {formatCurrency(transaction.revenue)}
                                    </span>
                                    <span>Aff Commission:</span>
                                    <span className="text-right text-destructive">
                                      -
                                      {formatCurrency(
                                        transaction.aff_commission || 0
                                      )}
                                    </span>
                                    <span>Taxes:</span>
                                    <span className="text-right text-destructive">
                                      -{formatCurrency(transaction.taxes || 0)}
                                    </span>
                                    <span>Platform Fee (%):</span>
                                    <span className="text-right text-destructive">
                                      -
                                      {formatCurrency(
                                        transaction.revenue *
                                          (transaction.platform_tax || 0)
                                      )}
                                    </span>
                                    <span>Platform Fee ($):</span>
                                    <span className="text-right text-destructive">
                                      -
                                      {formatCurrency(
                                        transaction.platform_transaction_tax ||
                                          0
                                      )}
                                    </span>
                                  </div>
                                  <hr className="my-1 border-border/50" />
                                  <div className="grid grid-cols-2 font-bold gap-x-2">
                                    <span>Net Sales:</span>
                                    <span className="text-right">
                                      {formatCurrency(netSales)}
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
                {transactions.length > 0 && (
                  <TableFooter className="border-t bg-accent/10 border-border">
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={5}
                        className="font-semibold text-foreground"
                      >
                        Page Total
                      </TableCell>
                      <TableCell className="font-bold text-right text-primary">
                        {formatCurrency(
                          transactions.reduce((sum, t) => sum + t.revenue, 0)
                        )}
                      </TableCell>
                      <TableCell className="font-bold text-right text-primary">
                        {formatCurrency(
                          transactions.reduce((sum, t) => {
                            const netSale =
                              t.revenue -
                              (t.aff_commission || 0) -
                              (t.taxes || 0) -
                              t.revenue * (t.platform_tax || 0) -
                              (t.platform_transaction_tax || 0);
                            return sum + netSale;
                          }, 0)
                        )}
                      </TableCell>
                      <TableCell className="font-bold text-right text-destructive">
                        {formatCurrency(
                          transactions.reduce(
                            (sum, t) => sum + calculateRefund(t),
                            0
                          )
                        )}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
            </div>
            <div className="flex items-center justify-between py-4 space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {totalPages > 0 ? currentPage : 0} of {totalPages} (Total:{" "}
                {totalTransactions} records)
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={
                  currentPage === totalPages || isLoading || totalPages === 0
                }
              >
                Next
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
