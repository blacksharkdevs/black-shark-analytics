import { useTranslation } from "react-i18next";
import { Search, List, Table } from "lucide-react";
import { Input } from "@/components/common/ui/input";
import { Card, CardContent } from "@/components/common/ui/card";
import { Button } from "@/components/common/ui/button";
import { cn } from "@/lib/utils";

interface AffiliateSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalResults: number;
  isLoading: boolean;
  viewMode: "list" | "table";
  onViewModeChange: (mode: "list" | "table") => void;
}

export function AffiliateSearch({
  searchQuery,
  onSearchChange,
  totalResults,
  isLoading,
  viewMode,
  onViewModeChange,
}: AffiliateSearchProps) {
  const { t } = useTranslation();

  return (
    <Card className="mt-5 shark-card">
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
                <span className="hidden sm:inline text-xs">
                  {t("affiliates.viewMode.table")}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
