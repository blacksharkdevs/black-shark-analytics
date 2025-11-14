import { createContext } from "react";
import type { SkuConfig, MainProduct } from "@/types/index";

export interface SkuMappingContextType {
  // SKU Data
  skuConfigs: SkuConfig[];
  filteredSkuConfigs: SkuConfig[];
  isLoading: boolean;
  searchTerm: string;
  savingRow: string | null;

  // Main Products Data
  mainProducts: MainProduct[];

  // Actions
  setSearchTerm: (term: string) => void;
  handleInputChange: (
    merchantId: string,
    originalName: string,
    field: keyof SkuConfig,
    value: unknown
  ) => void;
  handleSaveSku: (sku: SkuConfig) => Promise<void>;
  refreshSkuData: () => Promise<void>;
}

export const SkuMappingContext = createContext<
  SkuMappingContextType | undefined
>(undefined);
