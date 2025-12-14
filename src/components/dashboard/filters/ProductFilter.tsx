import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import type { Product } from "@/types/index";
import { Package } from "lucide-react";
import { useTranslation } from "react-i18next";

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
        <SelectTrigger className="w-full transition-colors">
          <SelectValue placeholder={t("filters.product")} />
        </SelectTrigger>
        <SelectContent className="">
          {products.map((product) => (
            <SelectItem key={product.id} value={product.id} className="">
              {product.name === "All Products"
                ? t("filters.allProducts")
                : ` ${product.name} (${product.platform}) `}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
