import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Input } from "@/components/common/ui/input";
import { Card, CardContent } from "@/components/common/ui/card";
import { cn } from "@/lib/utils";

interface TransactionSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalResults: number;
  isLoading: boolean;
}

export function TransactionSearch({
  searchQuery,
  onSearchChange,
  totalResults,
  isLoading,
}: TransactionSearchProps) {
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

          {/* Contador de Resultados */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-semibold text-cyan-400 tabular-nums">
              {totalResults.toLocaleString()}
            </span>
            <span>{t("transactions.results")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
