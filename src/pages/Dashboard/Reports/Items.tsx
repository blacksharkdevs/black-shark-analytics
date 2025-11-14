import { useReports } from "@/hooks/useReports"; // Nosso novo hook
import { List, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/common/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/common/ui/table";
import { Skeleton } from "@/components/common/ui/skeleton";
import { Input } from "@/components/common/ui/input";
import { Button } from "@/components/common/ui/button";
import { Badge } from "@/components/common/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import { Filters as FilterControls } from "@/components/dashboard/Filters";
import {
  REPORT_ACTION_TYPES,
  ROWS_PER_PAGE_OPTIONS,
} from "@/lib/reportFilters";
import { ItemsReportProvider } from "@/contexts/ReportsContext";

function ItemsPageContent() {
  const { t } = useTranslation();

  const {
    paginatedData,
    isLoadingData,
    isFetchingProducts,
    isFetchingPlatforms,

    // Dados de Paginação
    currentPage,
    totalPages,
    itemsPerPage,
    aggregatedAndFilteredData,
    handleItemsPerPageChange,
    setCurrentPage,

    // Filtros
    availableProducts,
    selectedProduct,
    setSelectedProduct,
    selectedActionType,
    setSelectedActionType,
    availablePlatforms,
    selectedPlatform,
    setSelectedPlatform,

    // Busca
    debouncedSearch,

    // Helpers
    formatCurrency,
  } = useReports();

  const showContentSkeleton =
    isLoadingData || isFetchingProducts || isFetchingPlatforms;
  const showNoDataMessage =
    !showContentSkeleton && aggregatedAndFilteredData.length === 0;

  return (
    <div className="container p-4 mx-auto space-y-6 md:p-8">
      <div className="p-4 rounded-lg shadow bg-card/50 border-[1px] border-white/30">
        <FilterControls
          products={availableProducts}
          selectedProduct={selectedProduct}
          onProductChange={(p) => setSelectedProduct(p)} // Usamos o setter do contexto
          actionTypes={REPORT_ACTION_TYPES} // Usamos a constante da lib
          selectedActionType={selectedActionType}
          onActionTypeChange={(a) => setSelectedActionType(a)} // Usamos o setter
          isLoading={isFetchingProducts}
          platforms={availablePlatforms}
          selectedPlatform={selectedPlatform}
          onPlatformChange={(p) => setSelectedPlatform(p)} // Usamos o setter
          isPlatformLoading={isFetchingPlatforms}
        />
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <List className="w-6 h-6 text-primary" />
            <CardTitle>{t("items.title")}</CardTitle>
          </div>
          <CardDescription>{t("items.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-between gap-4 mb-4 sm:flex-row">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute w-5 h-5 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t("items.searchPlaceholder")}
                className="w-full pl-10 bg-background/70"
                onChange={(e) => debouncedSearch(e.target.value)} // Usamos o handler
              />
            </div>
          </div>

          {showContentSkeleton ? (
            <div className="space-y-2">
              {[...Array(itemsPerPage)].map((_, i) => (
                <Skeleton key={i} className="w-full h-12" />
              ))}
            </div>
          ) : showNoDataMessage ? (
            <div className="py-10 text-center text-muted-foreground">
              {t("items.noDataMessage")}
            </div>
          ) : (
            <>
              <div className="border rounded-md border-gray-400/60">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">
                        {t("items.table.rank")}
                      </TableHead>
                      <TableHead>{t("items.table.itemName")}</TableHead>
                      <TableHead>{t("items.table.platform")}</TableHead>
                      <TableHead className="text-right">
                        {t("items.table.totalSales")}
                      </TableHead>
                      <TableHead className="text-right">
                        {t("items.table.totalUnits")}
                      </TableHead>
                      <TableHead className="text-right">
                        {t("items.table.totalRevenue")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((item, index) => {
                      const rank = (currentPage - 1) * itemsPerPage + index + 1;
                      return (
                        <TableRow
                          key={`${item.productName}-${item.platform}-${item.isUpsell}`}
                        >
                          <TableCell className="font-medium">{rank}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{item.productName}</span>
                              {item.isUpsell && (
                                <Badge
                                  variant="secondary"
                                  className="border-accent text-accent"
                                >
                                  {t("items.table.backEndBadge")}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{item.platform}</TableCell>
                          <TableCell className="font-medium text-right">
                            {item.totalSales.toLocaleString()}
                          </TableCell>
                          <TableCell className="font-medium text-right">
                            {item.totalItems.toLocaleString()}
                          </TableCell>
                          <TableCell className="font-semibold text-right text-primary">
                            {formatCurrency(item.totalRevenue)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  {paginatedData.length > 0 && (
                    <TableFooter>
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="font-semibold text-muted-foreground"
                        >
                          {t("items.table.pageTotals")}
                        </TableCell>
                        <TableCell className="font-bold text-right">
                          {paginatedData
                            .reduce((sum, item) => sum + item.totalSales, 0)
                            .toLocaleString()}
                        </TableCell>
                        <TableCell className="font-bold text-right">
                          {paginatedData
                            .reduce((sum, item) => sum + item.totalItems, 0)
                            .toLocaleString()}
                        </TableCell>
                        <TableCell className="font-bold text-right text-primary">
                          {formatCurrency(
                            paginatedData.reduce(
                              (sum, item) => sum + item.totalRevenue,
                              0
                            )
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="pt-2 font-semibold text-muted-foreground"
                        >
                          {t("items.table.overallTotals")}
                        </TableCell>
                        <TableCell className="pt-2 font-bold text-right">
                          {aggregatedAndFilteredData
                            .reduce((sum, item) => sum + item.totalSales, 0)
                            .toLocaleString()}
                        </TableCell>
                        <TableCell className="pt-2 font-bold text-right">
                          {aggregatedAndFilteredData
                            .reduce((sum, item) => sum + item.totalItems, 0)
                            .toLocaleString()}
                        </TableCell>
                        <TableCell className="pt-2 font-bold text-right text-primary">
                          {formatCurrency(
                            aggregatedAndFilteredData.reduce(
                              (sum, item) => sum + item.totalRevenue,
                              0
                            )
                          )}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  )}
                </Table>
              </div>
              <div className="flex items-center justify-between py-4 space-x-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {t("items.pagination.rowsPerPage")}
                  </span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={handleItemsPerPageChange}
                  >
                    <SelectTrigger className="w-auto sm:w-[80px] bg-card hover:bg-muted transition-colors">
                      <SelectValue placeholder={itemsPerPage.toString()} />
                    </SelectTrigger>
                    <SelectContent>
                      {ROWS_PER_PAGE_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option.toString()}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <span className="text-sm text-muted-foreground">
                  {t("items.pagination.page")}{" "}
                  {totalPages > 0 ? currentPage : 0} {t("items.pagination.of")}{" "}
                  {totalPages} ({t("items.pagination.total")}:{" "}
                  {aggregatedAndFilteredData.length}{" "}
                  {t("items.pagination.uniqueItems")})
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1 || isLoadingData}
                  >
                    {t("items.pagination.previous")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={
                      currentPage === totalPages ||
                      isLoadingData ||
                      totalPages === 0
                    }
                  >
                    {t("items.pagination.next")}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ItemsPage() {
  return (
    <ItemsReportProvider>
      <ItemsPageContent />
    </ItemsReportProvider>
  );
}
