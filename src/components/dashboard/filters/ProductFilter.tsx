import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import type { Product } from "@/types/index";
import { Package, Layers } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/common/ui/hover-card";

interface ProductFilterProps {
  products: Product[];
  selectedProduct: string;
  onProductChange: (productId: string) => void;
}

export function ProductFilter({
  products,
  selectedProduct,
  onProductChange,
}: ProductFilterProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2">
      <Package className="hidden sm:block" />
      <Select
        value={selectedProduct}
        onValueChange={onProductChange}
        disabled={products.length <= 1}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t("filters.product")} />
        </SelectTrigger>
        <SelectContent>
          {products.map((product) => {
            const productAny = product as any;
            const isGrouped = productAny.isGrouped || false;
            const displayName =
              product.name === "All Products"
                ? t("filters.allProducts")
                : isGrouped
                ? product.name
                : ` ${product.name} (${product.platform}) `;

            if (isGrouped && productAny.groupedProducts) {
              return (
                <HoverCard key={product.id} openDelay={200} closeDelay={100}>
                  <HoverCardTrigger asChild>
                    <SelectItem value={product.id}>
                      <div className="flex items-center gap-2">
                        <Layers className="w-3 h-3" />
                        {displayName}
                      </div>
                    </SelectItem>
                  </HoverCardTrigger>
                  <HoverCardContent
                    side="right"
                    align="start"
                    className="w-80 p-4"
                  >
                    <p className="mb-2 text-xs font-semibold text-muted-foreground">
                      {t("filters.groupedProducts")}:
                    </p>
                    <div className="text-xs text-foreground">
                      {productAny.groupedProducts.map((p: any) => (
                        <div key={p.id} className="py-1">
                          • {p.name}
                        </div>
                      ))}
                    </div>
                  </HoverCardContent>
                </HoverCard>
              );
            }

            return (
              <SelectItem key={product.id} value={product.id}>
                {displayName}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
