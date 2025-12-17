import { useTranslation } from "react-i18next";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/common/ui/button";
import { Card, CardContent } from "@/components/common/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import { cn } from "@/lib/utils";

interface TransactionPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: number) => void;
}

export function TransactionPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: TransactionPaginationProps) {
  const { t } = useTranslation();

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Gerar array de páginas para mostrar
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      // Mostrar todas as páginas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar com reticências
      if (currentPage <= 3) {
        // Início
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Fim
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Meio
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <Card className="shark-card">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Info de Itens e Select */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="text-sm text-muted-foreground">
              {t("transactions.pagination.showing")}{" "}
              <span className="font-semibold text-foreground tabular-nums">
                {startItem}
              </span>{" "}
              {t("transactions.pagination.to")}{" "}
              <span className="font-semibold text-foreground tabular-nums">
                {endItem}
              </span>{" "}
              {t("transactions.pagination.of")}{" "}
              <span className="font-semibold text-foreground tabular-nums">
                {totalItems.toLocaleString()}
              </span>{" "}
              {t("transactions.pagination.items")}
            </div>

            {/* Select de Itens por Página */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground whitespace-nowrap">
                {t("transactions.itemsPerPage")}
              </label>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => onItemsPerPageChange(Number(value))}
              >
                <SelectTrigger
                  className={cn(
                    "w-[80px] h-9",
                    "bg-background/50 border-white/10",
                    "focus:border-cyan-500/50 focus:ring-cyan-500/20"
                  )}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Controles de Paginação */}
          <div className="flex items-center gap-2">
            {/* Primeira Página */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className={cn(
                "h-9 w-9",
                "bg-background/50 border-white/10",
                "hover:bg-cyan-500/10 hover:border-cyan-500/30",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>

            {/* Página Anterior */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={cn(
                "h-9 w-9",
                "bg-background/50 border-white/10",
                "hover:bg-cyan-500/10 hover:border-cyan-500/30",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {/* Números de Página */}
            <div className="items-center hidden gap-1 md:flex">
              {getPageNumbers().map((page, index) => (
                <div key={index}>
                  {page === "..." ? (
                    <span className="px-2 text-muted-foreground">...</span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPageChange(page as number)}
                      className={cn(
                        "h-9 min-w-[36px] px-3",
                        "bg-background/50 border-white/10",
                        "hover:bg-cyan-500/10 hover:border-cyan-500/30",
                        currentPage === page &&
                          "bg-cyan-500/20 border-cyan-500/50 text-cyan-400 font-semibold"
                      )}
                    >
                      {page}
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Info de Página (Mobile) */}
            <div className="flex items-center px-3 text-sm font-semibold md:hidden text-foreground tabular-nums">
              {currentPage} / {totalPages}
            </div>

            {/* Próxima Página */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={cn(
                "h-9 w-9",
                "bg-background/50 border-white/10",
                "hover:bg-cyan-500/10 hover:border-cyan-500/30",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            {/* Última Página */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className={cn(
                "h-9 w-9",
                "bg-background/50 border-white/10",
                "hover:bg-cyan-500/10 hover:border-cyan-500/30",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
