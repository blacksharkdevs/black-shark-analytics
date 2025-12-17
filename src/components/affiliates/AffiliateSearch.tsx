import { useTranslation } from "react-i18next";
import { Search, List, Table } from "lucide-react";
import { Input } from "@/components/common/ui/input";
import { Card, CardContent } from "@/components/common/ui/card";
import { Button } from "@/components/common/ui/button";
import { cn } from "@/lib/utils";
import { AffiliateFilters } from "./AffiliateFilters";

interface AffiliateSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalResults: number;
  isLoading: boolean;
  viewMode: "list" | "table";
  onViewModeChange: (mode: "list" | "table") => void;

  // Props dos filtros
  platforms: string[];
  selectedPlatforms: string[];
  onPlatformsChange: (platforms: string[]) => void;
  minSales: string;
  onMinSalesChange: (value: string) => void;
  maxSales: string;
  onMaxSalesChange: (value: string) => void;
  minRevenue: string;
  onMinRevenueChange: (value: string) => void;
  maxRevenue: string;
  onMaxRevenueChange: (value: string) => void;
  minCommission: string;
  onMinCommissionChange: (value: string) => void;
  maxCommission: string;
  onMaxCommissionChange: (value: string) => void;
  minProfit: string;
  onMinProfitChange: (value: string) => void;
  maxProfit: string;
  onMaxProfitChange: (value: string) => void;
  minCustomers: string;
  onMinCustomersChange: (value: string) => void;
  maxCustomers: string;
  onMaxCustomersChange: (value: string) => void;
  minAov: string;
  onMinAovChange: (value: string) => void;
  maxAov: string;
  onMaxAovChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (value: "asc" | "desc") => void;
  onClearFilters: () => void;
}

export function AffiliateSearch({
  searchQuery,
  onSearchChange,
  totalResults,
  isLoading,
  viewMode,
  onViewModeChange,
  platforms,
  selectedPlatforms,
  onPlatformsChange,
  minSales,
  onMinSalesChange,
  maxSales,
  onMaxSalesChange,
  minRevenue,
  onMinRevenueChange,
  maxRevenue,
  onMaxRevenueChange,
  minCommission,
  onMinCommissionChange,
  maxCommission,
  onMaxCommissionChange,
  minProfit,
  onMinProfitChange,
  maxProfit,
  onMaxProfitChange,
  minCustomers,
  onMinCustomersChange,
  maxCustomers,
  onMaxCustomersChange,
  minAov,
  onMinAovChange,
  maxAov,
  onMaxAovChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  onClearFilters,
}: AffiliateSearchProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Filtros Avançados */}
      <AffiliateFilters
        platforms={platforms}
        selectedPlatforms={selectedPlatforms}
        onPlatformsChange={onPlatformsChange}
        minSales={minSales}
        onMinSalesChange={onMinSalesChange}
        maxSales={maxSales}
        onMaxSalesChange={onMaxSalesChange}
        minRevenue={minRevenue}
        onMinRevenueChange={onMinRevenueChange}
        maxRevenue={maxRevenue}
        onMaxRevenueChange={onMaxRevenueChange}
        minCommission={minCommission}
        onMinCommissionChange={onMinCommissionChange}
        maxCommission={maxCommission}
        onMaxCommissionChange={onMaxCommissionChange}
        minProfit={minProfit}
        onMinProfitChange={onMinProfitChange}
        maxProfit={maxProfit}
        onMaxProfitChange={onMaxProfitChange}
        minCustomers={minCustomers}
        onMinCustomersChange={onMinCustomersChange}
        maxCustomers={maxCustomers}
        onMaxCustomersChange={onMaxCustomersChange}
        minAov={minAov}
        onMinAovChange={onMinAovChange}
        maxAov={maxAov}
        onMaxAovChange={onMaxAovChange}
        sortBy={sortBy}
        onSortByChange={onSortByChange}
        sortOrder={sortOrder}
        onSortOrderChange={onSortOrderChange}
        onClearFilters={onClearFilters}
      />

      {/* Barra de Pesquisa */}
      <Card className="shark-card">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Input de Pesquisa */}
            <div className="relative flex-1">
              <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t("affiliates.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className={cn(
                  "pl-10 h-10",
                  "bg-background/50 border-white/10",
                  "focus:border-cyan-500/50 focus:ring-cyan-500/20"
                )}
                disabled={isLoading}
              />
            </div>

            {/* Contador de Resultados e Toggle de View */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-semibold text-cyan-400 tabular-nums">
                  {totalResults.toLocaleString()}
                </span>
                <span>{t("affiliates.results")}</span>
              </div>

              {/* Toggle View Mode */}
              <div className="flex items-center gap-1 p-1 border rounded-lg bg-white/5 border-white/10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewModeChange("list")}
                  className={cn(
                    "h-8 px-3 gap-2",
                    viewMode === "list"
                      ? "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 hover:text-cyan-400"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <List className="w-4 h-4" />
                  <span className="hidden text-xs sm:inline">
                    {t("affiliates.viewMode.list")}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewModeChange("table")}
                  className={cn(
                    "h-8 px-3 gap-2",
                    viewMode === "table"
                      ? "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 hover:text-cyan-400"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Table className="w-4 h-4" />
                  <span className="hidden text-xs sm:inline">
                    {t("affiliates.viewMode.table")}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
