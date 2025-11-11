import { ArrowUpDown, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/common/ui/table"; // Migrado
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/common/ui/card"; // Migrado
import { Input } from "@/components/common/ui/input"; // Migrado
import { Button } from "@/components/common/ui/button"; // Migrado
import { Skeleton } from "@/components/common/ui/skeleton"; // Migrado
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select"; // Migrado
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/common/ui/tooltip"; // Migrado
import { Link } from "react-router-dom"; // Migrado para React Router
import { cn } from "@/lib/utils";
import { Filters as FilterControls } from "../Filters"; // Assumindo que este está na mesma pasta

import { useDashboardConfig } from "@/hooks/useDashboardConfig"; // Para getCurrentDateDbColumn
import { useTransactions } from "@/hooks/useTransactions";
import type { SaleRecord } from "@/lib/data";
import { ACTION_TYPES } from "@/lib/config";
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

export function TransactionsTable() {
  // 🔑 CONSUMO DE DADOS E ESTADOS
  const {
    transactions: paginatedTransactions,
    isLoading: isLoadingTotal,
    filterState,
    handleFilterChange,
    handleSearch,
    sortState,
    pagination,
    footerCalculations,
    ROWS_PER_PAGE_OPTIONS,
  } = useTransactions();

  const { getCurrentDateDbColumn } = useDashboardConfig();

  const { sortColumn, sortDirection, handleSort } = sortState;

  const {
    currentPage,
    totalTransactions,
    itemsPerPage,
    handleItemsPerPageChange,
    handlePageChange,
    totalPages,
  } = pagination;

  const {
    availableProducts,
    selectedProduct,
    availablePlatforms,
    selectedPlatform,
    selectedActionType,
    isFetchingProducts,
    isFetchingPlatforms,
  } = filterState;

  const { currentPageRevenue, currentPageNetSales, currentPageRefundCalc } =
    footerCalculations;

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
      // Lógica BuyGoods (reproduzida do useTransactions)
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

    // Default logic for others
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

  // --- UTILS DE RENDERIZAÇÃO ---

  const renderSortIcon = (
    column: keyof SaleRecord | "calc_charged_day" | "net_sales"
  ) => {
    if (sortColumn !== column)
      return <ArrowUpDown className="w-4 h-4 ml-2 opacity-30" />;
    return sortDirection === "asc" ? (
      <ArrowUpDown className="w-4 h-4 ml-2 text-white transform rotate-180 dark:text-yellow-500" /> // Usamos text-accent
    ) : (
      <ArrowUpDown className="w-4 h-4 ml-2 text-white dark:text-yellow-500" />
    );
  };

  const tableHeaders: {
    key: keyof SaleRecord | "calc_charged_day" | "refund_calc" | "net_sales";
    label: string;
    sortable?: boolean;
    className?: string;
  }[] = [
    { key: "id", label: "Sale ID", sortable: true, className: "w-[150px]" },
    {
      key: getCurrentDateDbColumn(),
      label: "Date (UTC)",
      sortable: true,
      className: "w-[180px]",
    },
    { key: "product_name", label: "Product", sortable: true },
    { key: "customer_name", label: "Customer", sortable: true },
    { key: "aff_name", label: "Affiliate", sortable: true },
    { key: "platform", label: "Platform", sortable: true },
    {
      key: "revenue",
      label: "Revenue",
      sortable: true,
      className: "text-right w-[120px]",
    },
    {
      key: "net_sales",
      label: "Net Sales",
      sortable: true,
      className: "text-right w-[120px]",
    },
    {
      key: "refund_calc",
      label: "Refund Calc",
      sortable: false,
      className: "text-right w-[120px]",
    },
    { key: "customer_email", label: "Customer Email", sortable: true },
    {
      key: "action_type",
      label: "Action Type",
      sortable: true,
      className: "w-[150px]",
    },
  ];

  // --- CONDICIONAIS DE RENDERIZAÇÃO ---
  const showContentSkeleton =
    isLoadingTotal && paginatedTransactions.length === 0;
  const showNoTransactionsMessage =
    !isLoadingTotal && paginatedTransactions.length === 0;

  return (
    <div className="container p-0 mx-auto space-y-6">
      {/* --- 1. Filtros e Busca --- */}
      <div className="p-4 border-[1px] border-white/30 rounded-none shadow">
        <FilterControls
          products={availableProducts}
          selectedProduct={selectedProduct}
          onProductChange={handleFilterChange.product}
          actionTypes={ACTION_TYPES}
          selectedActionType={selectedActionType}
          onActionTypeChange={handleFilterChange.actionType}
          isLoading={isFetchingProducts}
          platforms={availablePlatforms}
          selectedPlatform={selectedPlatform}
          onPlatformChange={handleFilterChange.platform}
          isPlatformLoading={isFetchingPlatforms}
        />
      </div>

      {/* --- 2. Tabela de Transações --- */}
      <Card className="border-[1px] border-white/30 rounded-none shadow-lg ">
        <CardHeader>
          <CardTitle className="text-foreground">All Transactions</CardTitle>
          <CardDescription>
            Browse, search, and filter through all sales records (Dates in UTC).
          </CardDescription>
          <div className="flex flex-col items-center justify-between gap-4 pt-4 mt-4 border-t sm:flex-row border-border/50">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute w-5 h-5 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search anything on this page..."
                className="w-full pl-10 border rounded-none bg-card border-input"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center w-full gap-2 sm:w-auto">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Rows per page:
              </span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={handleItemsPerPageChange}
              >
                <SelectTrigger className="w-full sm:w-[80px] border border-input rounded-none">
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
              No transactions found for the selected filters.
            </div>
          ) : (
            <>
              <div className="border rounded-md border-border">
                <Table>
                  <TableHeader className="text-muted-foreground">
                    <TableRow className="hover:bg-transparent border-border/50">
                      {tableHeaders.map((header) => (
                        <TableHead
                          key={header.key as string}
                          className={cn(
                            "cursor-pointer hover:bg-accent/10",
                            header.className,
                            header.sortable &&
                              (sortColumn === header.key
                                ? "text-accent dark:text-yellow-500 font-semibold"
                                : "")
                          )}
                          onClick={() =>
                            header.sortable &&
                            handleSort(
                              header.key as
                                | keyof SaleRecord
                                | "calc_charged_day"
                                | "net_sales"
                            )
                          }
                        >
                          <div
                            className={cn(
                              "flex items-center",
                              header.className?.includes("text-right") &&
                                "justify-end"
                            )}
                          >
                            {header.label}
                            {header.sortable &&
                              renderSortIcon(
                                header.key as
                                  | keyof SaleRecord
                                  | "calc_charged_day"
                                  | "net_sales"
                              )}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-foreground">
                    {paginatedTransactions.map((transaction) => {
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
                          <TableCell className="truncate max-w-[150px]">
                            {transaction.aff_name || "N/A"}
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
                                  {/* Tooltip de Net Sales (adaptado do seu código antigo) */}
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
                                        -
                                        {formatCurrency(transaction.taxes || 0)}
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
                          <TableCell className="truncate max-w-[200px]">
                            {transaction.customer_email || "N/A"}
                          </TableCell>
                          <TableCell className="capitalize">
                            {transaction.action_type.replace(/_/g, " ")}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  {paginatedTransactions.length > 0 && (
                    <TableFooter className="border-t bg-accent/10 border-border">
                      <TableRow className="hover:bg-transparent">
                        <TableCell
                          colSpan={6}
                          className="font-semibold text-foreground"
                        >
                          Page Total
                        </TableCell>
                        <TableCell className="font-bold text-right text-primary">
                          {formatCurrency(currentPageRevenue)}
                        </TableCell>
                        <TableCell className="font-bold text-right text-primary">
                          {formatCurrency(currentPageNetSales)}
                        </TableCell>
                        <TableCell className="font-bold text-right text-destructive">
                          {currentPageRefundCalc > 0
                            ? `-${formatCurrency(currentPageRefundCalc)}`
                            : formatCurrency(currentPageRefundCalc)}
                        </TableCell>
                        <TableCell colSpan={2}></TableCell>
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
                  disabled={currentPage === 1 || isLoadingTotal}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {totalPages > 0 ? currentPage : 0} of {totalPages}{" "}
                  (Total: {totalTransactions} records)
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={
                    currentPage === totalPages ||
                    isLoadingTotal ||
                    totalPages === 0
                  }
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
