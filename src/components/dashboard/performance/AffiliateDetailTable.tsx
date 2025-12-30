import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/common/ui/table";
import { Skeleton } from "@/components/common/ui/skeleton";
import {
  Table as TableIcon,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Focus,
  List,
} from "lucide-react";
import { formatCurrency } from "@/utils/index";
import { Button } from "@/components/common/ui/button";
import { AffiliateDetailList } from "./AffiliateDetailList";

interface AffiliateMetrics {
  id: string;
  name: string;
  totalRevenue: number;
  totalNet: number;
  salesCount: number;
  commissionPaid: number;
  refundCount: number;
  refundRate: number;
}

interface AffiliateDetailTableProps {
  affiliateMetrics: AffiliateMetrics[];
  isLoading: boolean;
  selectedAffiliateIds: string[];
  onFocusAffiliate?: (affiliateId: string) => void;
}

type SortField =
  | "name"
  | "salesCount"
  | "totalRevenue"
  | "commissionPaid"
  | "refundRate";
type SortDirection = "asc" | "desc";

export function AffiliateDetailTable({
  affiliateMetrics,
  isLoading,
  selectedAffiliateIds,
  onFocusAffiliate,
}: AffiliateDetailTableProps) {
  const { t } = useTranslation();
  const [sortField, setSortField] = useState<SortField>("totalRevenue");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [viewMode, setViewMode] = useState<"list" | "table">("table");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedData = useMemo(() => {
    const filtered = affiliateMetrics.filter((a) =>
      selectedAffiliateIds.includes(a.id)
    );

    return [...filtered].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === "asc"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
  }, [affiliateMetrics, selectedAffiliateIds, sortField, sortDirection]);

  const getRefundRateClass = (refundRate: number) => {
    if (refundRate < 1) return "bg-green-950/50 text-green-400 font-semibold";
    if (refundRate < 3) return "bg-yellow-950/50 text-yellow-400 font-semibold";
    return "bg-red-950/50 text-red-400 font-bold";
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1 opacity-30" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4 ml-1 text-cyan-400" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-1 text-cyan-400" />
    );
  };

  if (isLoading) {
    return (
      <Card className="shark-card">
        <CardHeader>
          <Skeleton className="w-48 h-6" />
          <Skeleton className="w-64 h-4 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="w-full h-12" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sortedData.length === 0) {
    return (
      <Card className="shark-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TableIcon className="w-5 h-5 text-cyan-400" />
                {t("performance.affiliates.detailTable")}
              </CardTitle>
              <CardDescription>
                {t("performance.affiliates.detailTableDesc")}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="gap-2"
              >
                <List className="w-4 h-4" />
                {t("transactions.viewMode.list")}
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="gap-2"
              >
                <TableIcon className="w-4 h-4" />
                {t("transactions.viewMode.table")}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40 text-muted-foreground">
            {t("performance.noData")}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shark-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TableIcon className="w-5 h-5 text-cyan-400" />
              {t("performance.affiliates.detailTable")}
            </CardTitle>
            <CardDescription>
              {t("performance.affiliates.detailTableDesc")}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="gap-2"
            >
              <List className="w-4 h-4" />
              {t("transactions.viewMode.list")}
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="gap-2"
            >
              <TableIcon className="w-4 h-4" />
              {t("transactions.viewMode.table")}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === "list" ? (
          <AffiliateDetailList
            affiliateMetrics={sortedData}
            isLoading={isLoading}
            onFocusAffiliate={onFocusAffiliate}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-white">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center h-auto p-0 hover:bg-transparent"
                      onClick={() => handleSort("name")}
                    >
                      {t("performance.affiliates.affiliateName")}
                      <SortIcon field="name" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right text-white">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center h-auto p-0 ml-auto hover:bg-transparent"
                      onClick={() => handleSort("salesCount")}
                    >
                      {t("performance.affiliates.salesCount")}
                      <SortIcon field="salesCount" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right text-white">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center h-auto p-0 ml-auto hover:bg-transparent"
                      onClick={() => handleSort("totalRevenue")}
                    >
                      {t("performance.affiliates.grossRevenue")}
                      <SortIcon field="totalRevenue" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right text-white">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center h-auto p-0 ml-auto hover:bg-transparent"
                      onClick={() => handleSort("commissionPaid")}
                    >
                      {t("performance.affiliates.commission")}
                      <SortIcon field="commissionPaid" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right text-white">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center h-auto p-0 ml-auto hover:bg-transparent"
                      onClick={() => handleSort("refundRate")}
                    >
                      {t("performance.affiliates.refundRate")}
                      <SortIcon field="refundRate" />
                    </Button>
                  </TableHead>
                  {onFocusAffiliate && (
                    <TableHead className="w-24 text-center text-white">
                      {t("performance.affiliates.actions")}
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((affiliate) => (
                  <TableRow
                    key={affiliate.id}
                    className="transition-colors border-border hover:bg-white/5"
                  >
                    <TableCell className="font-medium text-white">
                      {affiliate.name}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {affiliate.salesCount}
                    </TableCell>
                    <TableCell className="font-semibold text-right text-cyan-400">
                      {formatCurrency(affiliate.totalRevenue)}
                    </TableCell>
                    <TableCell className="font-semibold text-right text-magenta-400">
                      {formatCurrency(affiliate.commissionPaid)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div
                        className={`inline-block px-3 py-1 rounded-md ${getRefundRateClass(
                          affiliate.refundRate
                        )}`}
                      >
                        {affiliate.refundRate.toFixed(1)}%
                      </div>
                    </TableCell>
                    {onFocusAffiliate && (
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onFocusAffiliate(affiliate.id)}
                          className="gap-2 hover:bg-cyan-500/20 hover:text-cyan-400"
                        >
                          <Focus className="w-4 h-4" />
                          {t("common.focus")}
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Legenda para heatmap - só mostra na view de tabela */}
        {viewMode === "table" && (
          <div className="flex items-center justify-end gap-4 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border rounded bg-green-950/50 border-green-400/30"></div>
              <span>{"< 1%"} (Excelente)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border rounded bg-yellow-950/50 border-yellow-400/30"></div>
              <span>1-3% (Atenção)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border rounded bg-red-950/50 border-red-400/30"></div>
              <span>{"> 3%"} (Crítico)</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
