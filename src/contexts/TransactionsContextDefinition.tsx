import { createContext } from "react";
import type { SaleRecord } from "@/lib/data"; // Importar tipos necessários
import type { Product as ProductConfig } from "@/lib/config";

interface TransactionsContextType {
  // Dados e Status
  transactions: SaleRecord[];
  isLoading: boolean;

  // Filtros e Handlers
  filterState: {
    availableProducts: ProductConfig[];
    selectedProduct: string;
    availablePlatforms: string[];
    selectedPlatform: string;
    selectedActionType: string;
    isFetchingProducts: boolean;
    isFetchingPlatforms: boolean;
  };
  handleFilterChange: {
    product: (newProduct: string) => void;
    actionType: (newActionType: string) => void;
    platform: (newPlatform: string) => void;
  };
  handleSearch: (term: string) => void;

  // Ordenação
  sortState: {
    sortColumn: keyof SaleRecord | "calc_charged_day" | "net_sales";
    sortDirection: "asc" | "desc";
    handleSort: (
      column: keyof SaleRecord | "calc_charged_day" | "net_sales"
    ) => void;
  };

  // Paginação
  pagination: {
    currentPage: number;
    totalTransactions: number;
    itemsPerPage: number;
    handleItemsPerPageChange: (value: string) => void;
    handlePageChange: (page: number) => void;
    totalPages: number;
    ROWS_PER_PAGE_OPTIONS: number[];
  };

  // Cálculos do Rodapé
  footerCalculations: {
    currentPageRevenue: number;
    currentPageRefundCalc: number;
    currentPageNetSales: number;
    calculateRefund: (item: SaleRecord) => number;
  };

  // Utilidades
  ROWS_PER_PAGE_OPTIONS: number[];
  formatCurrency: (value: number | string) => string;
  formatTransactionDate: (dateString: string) => string;
}

export const TransactionsContext = createContext<
  TransactionsContextType | undefined
>(undefined);
