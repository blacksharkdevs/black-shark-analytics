import { cn } from "@/lib/utils";
import type { Product } from "@/types/index";

// 🚨 Componentes de Filtro
import { ProductFilter } from "./ProductFilter";
import { OfferTypeFilter } from "./OfferTypeFilter";
import { PlatformFilter } from "./PlatformFilter";
import { SearchFilter } from "./SearchFilter";
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
}: FiltersProps) {
  const hasSearchFilter = onSearchChange !== undefined;

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
        "grid grid-cols-1 gap-4",
        !hasSearchFilter && "md:grid-cols-2 lg:grid-cols-3",
        hasSearchFilter && "md:grid-cols-2 lg:grid-cols-4"
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
