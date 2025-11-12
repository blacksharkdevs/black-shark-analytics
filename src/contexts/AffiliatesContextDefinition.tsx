import React from "react";
import {
  type AffiliatePerformanceData,
  type SortableAffiliateKeys,
} from "@/types/affiliates";

/**
 * Define a estrutura de todo o estado e handlers que serão expostos pelo contexto.
 */
export interface AffiliatesContextValue {
  // Dados
  affiliateData: AffiliatePerformanceData[];

  // Loading States
  isLoadingData: boolean;
  isFetchingPlatforms: boolean;
  isDateRangeLoading: boolean;

  // Filtros e Handlers
  filterState: {
    availablePlatforms: string[];
    selectedPlatform: string;
    selectedActionType: string;
    searchTermAffiliate: string;
  };
  handleFilterChange: {
    platform: (platform: string) => void;
    actionType: (actionType: string) => void;
    search: (term: string) => void;
  };

  // Ordenação
  sortState: {
    sortColumn: SortableAffiliateKeys;
    sortDirection: "asc" | "desc";
    handleSort: (column: SortableAffiliateKeys) => void;
  };

  // Paginação
  pagination: {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalAffiliatesCount: number; // Total de afiliados SEM paginação
    handlePageChange: (page: number) => void;
    handleItemsPerPageChange: (value: string) => void;
    ROWS_PER_PAGE_OPTIONS: number[];
  };
}

export const AffiliatesContext = React.createContext<
  AffiliatesContextValue | undefined
>(undefined);
