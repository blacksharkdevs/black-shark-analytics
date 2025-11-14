import { createContext } from "react";
import type { ProductConfig, SaleRecord } from "../types";

export interface SkuConfig {
  merchant_id: string | null;
  original_name: string;
  unit_count: number | null;
}

// --- Tipos de Dados Processados ---

export interface ItemStats {
  productName: string;
  totalRevenue: number;
  totalSales: number;
  totalItems: number;
  isUpsell: boolean;
  platform: string;
}

// --- Tipos para o Contexto ---

export interface ItemsReportContext {
  // Dados brutos
  allSalesData: SaleRecord[];
  skuConfigs: SkuConfig[];

  // Dados processados
  aggregatedAndFilteredData: ItemStats[];
  paginatedData: ItemStats[];

  // Estado da UI
  isLoadingData: boolean;

  // Estado de Paginação
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (rows: number) => void;
  handleItemsPerPageChange: (value: string) => void;

  // Estado de Filtros
  availableProducts: ProductConfig[];
  selectedProduct: string;
  setSelectedProduct: (id: string) => void;

  selectedActionType: string;
  setSelectedActionType: (type: string) => void;

  availablePlatforms: string[];
  selectedPlatform: string;
  setSelectedPlatform: (platform: string) => void;

  isFetchingProducts: boolean;
  isFetchingPlatforms: boolean;

  // Estado de Busca
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  debouncedSearch: (term: string) => void;

  // Helpers
  formatCurrency: (value: number) => string;
}

export const ItemsReportContext = createContext<ItemsReportContext | null>(
  null
);
