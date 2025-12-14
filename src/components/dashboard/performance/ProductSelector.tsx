import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import { Button } from "@/components/common/ui/button";
import { Checkbox } from "@/components/common/ui/checkbox";
import { Skeleton } from "@/components/common/ui/skeleton";
import { Package, Plus, Minus } from "lucide-react";
import { formatCurrency } from "@/utils/index";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  totalRevenue: number;
}

interface ProductSelectorProps {
  topProducts: Product[];
  selectedProductIds: string[];
  onToggleProduct: (productId: string) => void;
  isLoading: boolean;
}

// Cores neon para os produtos (mesmas do gráfico)
const NEON_COLORS = [
  "#00ffff", // Ciano neon
  "#ff00ff", // Magenta neon
  "#00ff00", // Verde neon
  "#ffff00", // Amarelo neon
  "#ff6b00", // Laranja neon
];

export function ProductSelector({
  topProducts,
  selectedProductIds,
  onToggleProduct,
  isLoading,
}: ProductSelectorProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Card className="shark-card">
        <CardHeader className="px-4 py-3 md:px-6 md:py-4">
          <Skeleton className="w-48 mb-1 h-6" />
          <Skeleton className="w-64 h-4" />
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shark-card">
      <CardHeader className="px-4 py-3 md:px-6 md:py-4">
        <CardTitle className="flex items-center text-base md:text-lg text-foreground">
          <Package className="w-4 h-4 md:w-6 md:h-6 mr-2" />
          {t("performance.productSelector.title")}
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          {t("performance.productSelector.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {topProducts.map((product, index) => {
            const isSelected = selectedProductIds.includes(product.id);
            const color = NEON_COLORS[index % NEON_COLORS.length];

            return (
              <div
                key={product.id}
                className={cn(
                  "relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer",
                  "hover:shadow-lg",
                  isSelected
                    ? "bg-[rgba(6,182,212,0.05)] backdrop-blur-sm"
                    : "bg-[rgba(15,23,42,0.3)] border-[rgba(255,255,255,0.1)]"
                )}
                style={{
                  borderColor: isSelected ? color : undefined,
                  boxShadow: isSelected
                    ? `0 0 20px ${color}40, inset 0 0 10px ${color}20`
                    : undefined,
                }}
                onClick={() => onToggleProduct(product.id)}
              >
                {/* Checkbox */}
                <div className="absolute top-3 right-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleProduct(product.id)}
                    className="border-2"
                    style={{
                      borderColor: isSelected ? color : undefined,
                    }}
                  />
                </div>

                {/* Indicador de cor */}
                <div className="flex items-start gap-3">
                  <div
                    className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                    style={{
                      backgroundColor: color,
                      boxShadow: `0 0 10px ${color}`,
                    }}
                  />

                  <div className="flex-1 min-w-0 pr-8">
                    {/* Nome do produto */}
                    <h3
                      className={cn(
                        "text-sm md:text-base font-semibold mb-1 truncate",
                        isSelected ? "text-foreground" : "text-muted-foreground"
                      )}
                      title={product.name}
                    >
                      {product.name}
                    </h3>

                    {/* Receita */}
                    <p
                      className={cn(
                        "text-xs md:text-sm font-medium tabular-nums",
                        isSelected ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {formatCurrency(product.totalRevenue)}
                    </p>

                    {/* Ranking */}
                    <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                      #{index + 1} {t("performance.productSelector.topProduct")}
                    </p>
                  </div>
                </div>

                {/* Botão de ação */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "absolute bottom-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
                    isSelected && "opacity-100"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleProduct(product.id);
                  }}
                  style={{
                    color: isSelected ? color : undefined,
                  }}
                >
                  {isSelected ? (
                    <Minus className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Contador de produtos selecionados */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-xs md:text-sm text-muted-foreground text-center">
            {selectedProductIds.length} {t("performance.productSelector.of")}{" "}
            {topProducts.length}{" "}
            {t("performance.productSelector.productsSelected")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
