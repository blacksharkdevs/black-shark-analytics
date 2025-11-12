import type {
  Product as ProductConfig,
  ActionType as ActionTypeConfig,
} from "@/lib/config";
import { Network } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";

// 🚨 Componentes recém-criados
import { ProductFilter } from "./ProductFilter";
import { ActionTypeFilter } from "./ActionTypeFilter";
import { SearchFilter } from "./SearchFilter";
import { FiltersSkeleton } from "./FiltersSkeleton";

interface FiltersProps {
  products: ProductConfig[];
  selectedProduct: string;
  onProductChange: (productId: string) => void;
  actionTypes: ActionTypeConfig[];
  selectedActionType: string;
  onActionTypeChange: (actionTypeId: string) => void;
  isLoading?: boolean;

  // Filtro de Plataforma Opcional
  platforms?: string[];
  selectedPlatform?: string;
  onPlatformChange?: (platform: string) => void;
  isPlatformLoading?: boolean;

  // Filtro de Busca Opcional
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  searchDefaultValue?: string;
}

export function Filters({
  products,
  selectedProduct,
  onProductChange,
  actionTypes,
  selectedActionType,
  onActionTypeChange,
  isLoading = false,
  platforms,
  selectedPlatform,
  onPlatformChange,
  isPlatformLoading = false,
  searchPlaceholder,
  onSearchChange,
  searchDefaultValue,
}: FiltersProps) {
  const hasPlatformFilter =
    platforms !== undefined &&
    onPlatformChange !== undefined &&
    selectedPlatform !== undefined;

  const hasSearchFilter = onSearchChange !== undefined;

  const isTotalLoading = isLoading || isPlatformLoading;

  if (isTotalLoading) {
    return (
      <FiltersSkeleton
        hasPlatformFilter={hasPlatformFilter}
        hasSearchFilter={hasSearchFilter}
      />
    );
  }

  // 🚨 Plataforma Filter (Renderizado inline para simplicidade)
  const PlatformFilter = hasPlatformFilter && platforms && (
    <div className="flex items-center gap-2">
      <Network className="hidden w-5 h-5 text-blue-600 dark:text-white sm:block" />
      <Select
        value={selectedPlatform!}
        onValueChange={onPlatformChange!}
        disabled={platforms.length === 0}
      >
        <SelectTrigger className="w-full transition-colors border rounded-none bg-card hover:bg-accent/20 border-input text-foreground">
          <SelectValue placeholder="Filter by Platform" />
        </SelectTrigger>
        <SelectContent className="border rounded-none bg-card border-border">
          <SelectItem value="all" className="rounded-none text-foreground">
            All Platforms
          </SelectItem>
          {platforms.map((platform) => (
            <SelectItem
              key={platform}
              value={platform}
              className="rounded-none text-foreground"
            >
              {platform}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 mb-6",
        !hasSearchFilter && !hasPlatformFilter && "md:grid-cols-2",
        (hasSearchFilter || hasPlatformFilter) &&
          !(hasSearchFilter && hasPlatformFilter) &&
          "md:grid-cols-2 lg:grid-cols-3",
        hasSearchFilter && hasPlatformFilter && "md:grid-cols-2 lg:grid-cols-4"
      )}
    >
      {/* Filtro 0: Busca (Condicional) */}
      {hasSearchFilter && (
        <SearchFilter
          placeholder={searchPlaceholder}
          onSearchChange={onSearchChange!}
          defaultValue={searchDefaultValue}
        />
      )}

      {/* Filtro 1: Produtos */}
      <ProductFilter
        products={products}
        selectedProduct={selectedProduct}
        onProductChange={onProductChange}
      />

      {/* Filtro 2: Tipos de Ação */}
      <ActionTypeFilter
        actionTypes={actionTypes}
        selectedActionType={selectedActionType}
        onActionTypeChange={onActionTypeChange}
      />

      {/* Filtro 3: Plataforma (Condicional) */}
      {PlatformFilter}
    </div>
  );
}
