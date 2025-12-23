import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import { Button } from "@/components/common/ui/button";
import { Skeleton } from "@/components/common/ui/skeleton";
import { Switch } from "@/components/common/ui/switch";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/common/ui/hover-card";
import { Info, Plus, Minus, Layers } from "lucide-react";
import { formatCurrency } from "@/utils/index";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  totalRevenue: number;
  isGrouped?: boolean;
  groupedProducts?: Array<{ id: string; name: string }>;
}

interface ProductSelectorProps {
  availableProducts: Product[];
  selectedProductIds: string[];
  onToggleProduct: (productId: string) => void;
  isLoading: boolean;
  isProductsGrouped: boolean;
  onProductsGroupChange: (value: boolean) => void;
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
  availableProducts,
  selectedProductIds,
  onToggleProduct,
  isLoading,
  isProductsGrouped,
  onProductsGroupChange,
}: ProductSelectorProps) {
  const { t } = useTranslation();

  // Calcular índice global para cores (produtos selecionados mantêm suas cores)
  const getProductColor = (productId: string) => {
    const index = selectedProductIds.indexOf(productId);
    if (index === -1) return NEON_COLORS[0]; // Cor padrão se não selecionado
    return NEON_COLORS[index % NEON_COLORS.length];
  };

  if (isLoading) {
    return (
      <Card className="shark-card">
        <CardHeader className="px-4 py-3 md:px-6 md:py-4">
          <Skeleton className="w-48 h-6 mb-1" />
          <Skeleton className="w-64 h-4" />
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="w-full h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full shark-card">
      <CardHeader className="px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-base md:text-lg">
              {t("performance.productSelector.title")}
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {t("performance.productSelector.description")}
            </CardDescription>
          </div>

          {/* Switch de Agrupamento */}
          <div className="flex items-center gap-2">
            <HoverCard openDelay={200} closeDelay={100}>
              <HoverCardTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-6 h-6 p-0 text-muted-foreground hover:text-primary"
                >
                  <Info className="w-4 h-4" />
                </Button>
              </HoverCardTrigger>
              <HoverCardContent
                side="left"
                align="start"
                className="p-3 w-72 md:w-80 md:p-4 shark-card"
              >
                <p className="mb-2 text-xs font-semibold text-foreground">
                  {t("filters.groupProducts")}
                </p>
                <p className="mb-3 text-xs text-muted-foreground">
                  {t("filters.groupProductsDesc")}
                </p>
                <div className="p-2 rounded-lg bg-[rgba(6,182,212,0.1)] border border-primary/20">
                  <p className="text-[10px] text-muted-foreground mb-1">
                    {t("performance.groupExample")}:
                  </p>
                  <p className="text-xs text-foreground">
                    "Free Sugar Pro 3 bottles" → "Free Sugar"
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
            <label
              htmlFor="group-products-selector"
              className="text-xs transition-colors cursor-pointer md:text-sm text-muted-foreground hover:text-foreground"
            >
              {t("filters.groupProducts")}
            </label>
            <Switch
              id="group-products-selector"
              checked={isProductsGrouped}
              onCheckedChange={onProductsGroupChange}
              disabled={isLoading}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 md:px-6">
        {/* Lista Compacta de Produtos */}
        <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2">
          {availableProducts.map((product) => {
            const isSelected = selectedProductIds.includes(product.id);
            const color = getProductColor(product.id);

            const listItem = (
              <div
                key={product.id}
                className={cn(
                  "flex items-center gap-3 p-2 md:p-3 rounded-lg border transition-all duration-200",
                  "hover:bg-[rgba(6,182,212,0.05)] hover:border-primary/30",
                  isSelected
                    ? "bg-[rgba(6,182,212,0.1)] border-primary/40"
                    : "bg-[rgba(15,23,42,0.3)] border-[rgba(255,255,255,0.1)]"
                )}
              >
                {/* Indicador de cor */}
                {isSelected && (
                  <div
                    className="flex-shrink-0 w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: color,
                      boxShadow: `0 0 8px ${color}`,
                    }}
                  />
                )}

                {/* Ícone de agrupamento */}
                {product.isGrouped && (
                  <Layers className="flex-shrink-0 w-4 h-4 text-primary" />
                )}

                {/* Informações do produto */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span
                      className={cn(
                        "text-sm md:text-base font-medium truncate",
                        isSelected ? "text-foreground" : "text-muted-foreground"
                      )}
                      title={product.name}
                    >
                      {product.name}
                    </span>
                    {product.isGrouped && (
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">
                        ({product.groupedProducts?.length || 0}{" "}
                        {t("performance.productSelector.productsGrouped")})
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {formatCurrency(product.totalRevenue)}
                  </span>
                </div>

                {/* Botão de ação */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0 flex-shrink-0",
                    isSelected
                      ? "text-primary hover:text-primary/80"
                      : "text-muted-foreground hover:text-primary"
                  )}
                  onClick={() => onToggleProduct(product.id)}
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

            // Se for produto agrupado, envolver com HoverCard
            if (product.isGrouped && product.groupedProducts) {
              return (
                <HoverCard key={product.id} openDelay={200} closeDelay={100}>
                  <HoverCardTrigger asChild>{listItem}</HoverCardTrigger>
                  <HoverCardContent
                    side="top"
                    align="center"
                    className="p-3 w-72 md:w-80 md:p-4 shark-card"
                  >
                    <p className="mb-2 text-xs font-semibold text-muted-foreground">
                      {t("filters.groupedProducts")}:
                    </p>
                    <div className="space-y-1 overflow-y-auto text-xs text-foreground max-h-48">
                      {product.groupedProducts.map((p) => (
                        <div key={p.id} className="py-1">
                          • {p.name}
                        </div>
                      ))}
                    </div>
                  </HoverCardContent>
                </HoverCard>
              );
            }

            return listItem;
          })}
        </div>

        {/* Contador de produtos selecionados */}
        <div className="pt-4 mt-4 border-t border-border/50">
          <p className="text-xs text-center md:text-sm text-muted-foreground">
            {selectedProductIds.length} {t("performance.productSelector.of")}{" "}
            {availableProducts.length}{" "}
            {t("performance.productSelector.productsSelected")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
