// import { createContext } from "react";

// export interface AffiliatePerformanceData {
//   aff_name: string;
//   platform: string;
//   customers: number;
//   total_sales: number;
//   front_sales: number;
//   back_sales: number;
//   total_revenue: number;
//   gross_sales: number;
//   refunds_and_chargebacks: number;
//   commission_paid: number;
//   taxes: number;
//   platform_fee_percentage_amount: number;
//   platform_fee_transaction_amount: number;
//   aov: number;
//   net_sales: number;
//   net_final: number;
//   total_cogs: number;
//   profit: number;
//   cash_flow: number;
//   total_refund_amount: number;
//   total_refund_commission: number;
//   total_refund_taxes: number;
//   total_refund_platform_fees: number;
// }

// export type SortableAffiliateKeys = keyof Omit<
//   AffiliatePerformanceData,
//   | "total_refund_amount"
//   | "total_refund_commission"
//   | "total_refund_taxes"
//   | "total_refund_platform_fees"
// >;

// export interface AffiliatesContextType {
//   // Dados e Status
//   affiliateData: AffiliatePerformanceData[];
//   isLoading: boolean;
//   showContentSkeleton: boolean;
//   showNoDataMessage: boolean;

//   // Filtros e Handlers
//   filterState: {
//     availablePlatforms: string[];
//     selectedPlatform: string;
//     selectedActionType: string;
//     isFetchingPlatforms: boolean;
//   };
//   handleFilterChange: {
//     platform: (platform: string) => void;
//     actionType: (actionType: string) => void;
//   };
//   handleSearch: (term: string) => void;

//   // Ordenação
//   sortState: {
//     sortColumn: SortableAffiliateKeys;
//     sortDirection: "asc" | "desc";
//     handleSort: (column: SortableAffiliateKeys) => void;
//   };

//   // Paginação
//   pagination: {
//     currentPage: number;
//     itemsPerPage: number;
//     handleItemsPerPageChange: (value: string) => void;
//     totalPages: number;
//   };

//   // Utilidades
//   formatCurrency: (value: number | string) => string;
//   renderSortIcon: (column: SortableAffiliateKeys) => React.ReactNode;
//   getRefundTooltipContent: (item: AffiliatePerformanceData) => React.ReactNode;
//   topAffiliatesIndices: Set<number>;
// }

// export const AffiliatesContext = createContext<
//   AffiliatesContextType | undefined
// >(undefined);
