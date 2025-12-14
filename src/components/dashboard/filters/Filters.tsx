import { cn } from "@/lib/utils";
import type { Product } from "@/types/index";

// 🚨 Componentes de Filtro
import { ProductFilter } from "./ProductFilter";
import { OfferTypeFilter } from "./OfferTypeFilter";
import { PlatformFilter } from "./PlatformFilter";
import { SearchFilter } from "./SearchFilter";
import { GroupProductsSwitch } from "./GroupProductsSwitch";
import { FiltersSkeleton } from "./FiltersSkeleton";

interface OfferTypeConfig {
  id: string;
  name: string;
}

interface PlatformConfig {
  id: string;
  name: string;
}

interface FiltersProps {
  products: Product[];
  selectedProduct: string;
  onProductChange: (productId: string) => void;

  // Filtro de Tipo de Oferta
  offerTypes: OfferTypeConfig[];
  selectedOfferType: string;
  onOfferTypeChange: (offerTypeId: string) => void;

  // Filtro de Plataforma
  platforms: PlatformConfig[];
  selectedPlatform: string;
  onPlatformChange: (platformId: string) => void;

  isLoading?: boolean;

  // Filtro de Busca Opcional
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  searchDefaultValue?: string;

  // Agrupamento de Produtos
  isProductsGrouped?: boolean;
  onProductsGroupChange?: (grouped: boolean) => void;
}

export function Filters({
  products,
  selectedProduct,
  onProductChange,
  offerTypes,
  selectedOfferType,
  onOfferTypeChange,
  platforms,
  selectedPlatform,
  onPlatformChange,
  isLoading = false,
  searchPlaceholder,
  onSearchChange,
  searchDefaultValue,
  isProductsGrouped = false,
  onProductsGroupChange,
}: FiltersProps) {
  const hasSearchFilter = onSearchChange !== undefined;
  const hasGroupSwitch = onProductsGroupChange !== undefined;

  if (isLoading) {
    return (
      <FiltersSkeleton
        hasPlatformFilter={true}
        hasSearchFilter={hasSearchFilter}
      />
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 shark-card",
        !hasSearchFilter && !hasGroupSwitch && "md:grid-cols-2 lg:grid-cols-3",
        hasSearchFilter && !hasGroupSwitch && "md:grid-cols-2 lg:grid-cols-4",
        !hasSearchFilter && hasGroupSwitch && "md:grid-cols-2 lg:grid-cols-4",
        hasSearchFilter && hasGroupSwitch && "md:grid-cols-2 lg:grid-cols-5"
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

      {/* Switch de Agrupamento (Condicional) */}
      {hasGroupSwitch && (
        <GroupProductsSwitch
          isGrouped={isProductsGrouped}
          onGroupChange={onProductsGroupChange!}
        />
      )}

      {/* Filtro 1: Produtos */}
      <ProductFilter
        products={products}
        selectedProduct={selectedProduct}
        onProductChange={onProductChange}
      />

      {/* Filtro 2: Tipo de Oferta (OfferType) */}
      <OfferTypeFilter
        offerTypes={offerTypes}
        selectedOfferType={selectedOfferType}
        onOfferTypeChange={onOfferTypeChange}
      />

      {/* Filtro 3: Plataforma */}
      <PlatformFilter
        platforms={platforms}
        selectedPlatform={selectedPlatform}
        onPlatformChange={onPlatformChange}
      />
    </div>
  );
}
