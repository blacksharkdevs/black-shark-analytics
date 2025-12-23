import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  List,
  Table,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Input } from "@/components/common/ui/input";
import { Card, CardContent } from "@/components/common/ui/card";
import { Button } from "@/components/common/ui/button";
import { Badge } from "@/components/common/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/common/ui/collapsible";
import { cn } from "@/lib/utils";
import { TransactionFilters } from "./TransactionFilters";

interface TransactionSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalResults: number;
  isLoading: boolean;
  viewMode: "list" | "table";
  onViewModeChange: (mode: "list" | "table") => void;

  // Filtros (opcionais)
  platforms?: string[];
  selectedPlatforms?: string[];
  onPlatformsChange?: (platforms: string[]) => void;

  statuses?: string[];
  selectedStatuses?: string[];
  onStatusesChange?: (statuses: string[]) => void;

  types?: string[];
  selectedTypes?: string[];
  onTypesChange?: (types: string[]) => void;

  minGrossAmount?: string;
  onMinGrossAmountChange?: (value: string) => void;
  maxGrossAmount?: string;
  onMaxGrossAmountChange?: (value: string) => void;

  minNetAmount?: string;
  onMinNetAmountChange?: (value: string) => void;
  maxNetAmount?: string;
  onMaxNetAmountChange?: (value: string) => void;

  sortBy?: string;
  onSortByChange?: (value: string) => void;
  sortOrder?: "asc" | "desc";
  onSortOrderChange?: (value: "asc" | "desc") => void;

  onClearFilters?: () => void;
}

export function TransactionSearch({
  searchQuery,
  onSearchChange,
  totalResults,
  isLoading,
  viewMode,
  onViewModeChange,
  platforms,
  selectedPlatforms,
  onPlatformsChange,
  statuses,
  selectedStatuses,
  onStatusesChange,
  types,
  selectedTypes,
  onTypesChange,
  minGrossAmount,
  onMinGrossAmountChange,
  maxGrossAmount,
  onMaxGrossAmountChange,
  minNetAmount,
  onMinNetAmountChange,
  maxNetAmount,
  onMaxNetAmountChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  onClearFilters,
}: TransactionSearchProps) {
  const { t } = useTranslation();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Verificar se os filtros estão disponíveis (props fornecidas)
  const hasFilters = !!(
    platforms &&
    selectedPlatforms &&
    onPlatformsChange &&
    statuses &&
    selectedStatuses &&
    onStatusesChange &&
    types &&
    selectedTypes &&
    onTypesChange &&
    minGrossAmount !== undefined &&
    onMinGrossAmountChange &&
    maxGrossAmount !== undefined &&
    onMaxGrossAmountChange &&
    minNetAmount !== undefined &&
    onMinNetAmountChange &&
    maxNetAmount !== undefined &&
    onMaxNetAmountChange &&
    sortBy &&
    onSortByChange &&
    sortOrder &&
    onSortOrderChange &&
    onClearFilters
  );

  const hasActiveFilters =
    (selectedPlatforms?.length || 0) > 0 ||
    (selectedStatuses?.length || 0) > 0 ||
    (selectedTypes?.length || 0) > 0 ||
    minGrossAmount ||
    maxGrossAmount ||
    minNetAmount ||
    maxNetAmount;

  return (
    <Card className="mt-5 shark-card">
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Input de Pesquisa */}
          <div className="relative flex-1">
            <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("transactions.searchPlaceholder")}
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
              <span>{t("transactions.results")}</span>
            </div>

            {/* Toggle View Mode */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
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
                <span className="hidden sm:inline text-xs">
                  {t("transactions.viewMode.list")}
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
                <span className="hidden sm:inline text-xs">
                  {t("transactions.viewMode.table")}
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Botão de Filtros Avançados (apenas se props fornecidas) */}
        {hasFilters && (
          <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 gap-2 text-muted-foreground hover:text-foreground"
              >
                <Filter className="w-3.5 h-3.5" />
                <span className="text-xs">
                  {t("transactions.filters.title")}
                </span>
                {hasActiveFilters && (
                  <Badge className="h-4 px-1.5 text-[10px] bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30">
                    {t("transactions.filters.active")}
                  </Badge>
                )}
                {isFiltersOpen ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="pt-3">
              <TransactionFilters
                platforms={platforms!}
                selectedPlatforms={selectedPlatforms!}
                onPlatformsChange={onPlatformsChange!}
                statuses={statuses!}
                selectedStatuses={selectedStatuses!}
                onStatusesChange={onStatusesChange!}
                types={types!}
                selectedTypes={selectedTypes!}
                onTypesChange={onTypesChange!}
                minGrossAmount={minGrossAmount!}
                onMinGrossAmountChange={onMinGrossAmountChange!}
                maxGrossAmount={maxGrossAmount!}
                onMaxGrossAmountChange={onMaxGrossAmountChange!}
                minNetAmount={minNetAmount!}
                onMinNetAmountChange={onMinNetAmountChange!}
                maxNetAmount={maxNetAmount!}
                onMaxNetAmountChange={onMaxNetAmountChange!}
                sortBy={sortBy!}
                onSortByChange={onSortByChange!}
                sortOrder={sortOrder!}
                onSortOrderChange={onSortOrderChange!}
                onClearFilters={onClearFilters!}
              />
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
