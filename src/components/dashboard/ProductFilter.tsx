import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import { Package } from "lucide-react";
import type { Product as ProductConfig } from "@/lib/config";

interface ProductFilterProps {
  products: ProductConfig[];
  selectedProduct: string;
  onProductChange: (productId: string) => void;
}

export function ProductFilter({
  products,
  selectedProduct,
  onProductChange,
}: ProductFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Package className="hidden text-blue-600 dark:text-white sm:block" />
      <Select
        value={selectedProduct}
        onValueChange={onProductChange}
        disabled={products.length <= 1}
      >
        <SelectTrigger className="w-full transition-colors border rounded-none bg-card hover:bg-accent/20 border-input text-foreground">
          <SelectValue placeholder="Select Product" />
        </SelectTrigger>
        <SelectContent className="border rounded-none bg-card border-border">
          {products.map((product) => (
            <SelectItem
              key={product.id}
              value={product.id}
              className="rounded-none text-foreground hover:bg-accent/10 focus:bg-accent/10"
            >
              {product.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
