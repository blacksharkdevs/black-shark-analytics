import { createContext } from "react";
import type { SaleRecord } from "@/types/index";

export interface AffiliateStats {
  grossSales: number;
  totalSales: number;
  aov: number;
  totalRefunds: number;
  netFinal: number;
  totalCOGS: number;
  totalProfit: number;
}

export interface ProductPerformance {
  product_name: string;
  sales_count: number;
  gross_sales: number;
  aov: number;
  refunds: number;
  net_sales: number;
  cogs: number;
  profit: number;
}

export interface AffiliateDetailContextValue {
  // Estado principal
  affiliateName: string;
  transactions: SaleRecord[];
  incomeTransactions: SaleRecord[]; // Para o gráfico
  isLoading: boolean;

  // Stats agregadas
  stats: AffiliateStats;

  // Performance por produto
  productPerformance: ProductPerformance[];

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
}

export const AffiliateDetailContext =
  createContext<AffiliateDetailContextValue | null>(null);
