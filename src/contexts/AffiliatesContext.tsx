// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { useState, useEffect, useCallback, useMemo } from "react";
// import { supabase } from "@/lib/supabaseClient";
// import { useDashboardConfig } from "@/hooks/useDashboardConfig";
// import { debounce } from "@/lib/utils";
// import {
//   AffiliatesContext,
//   type AffiliatePerformanceData,
//   type SortableAffiliateKeys,
// } from "./AffiliatesContextDefinition";

// const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

// export function AffiliatesProvider({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const {
//     currentDateRange,
//     getCurrentDateDbColumn,
//     isLoading: isDateRangeLoading,
//   } = useDashboardConfig();

//   // ESTADOS
//   const [affiliateData, setAffiliateData] = useState<
//     AffiliatePerformanceData[]
//   >([]);
//   const [isLoadingData, setIsLoadingData] = useState(true);
//   const [sortColumn, setSortColumn] =
//     useState<SortableAffiliateKeys>("total_revenue");
//   const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(ROWS_PER_PAGE_OPTIONS[1]);
//   const [availablePlatforms, setAvailablePlatforms] = useState<string[]>([]);
//   const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
//   const [searchTermAffiliate, setSearchTermAffiliate] = useState<string>("");
//   const [isFetchingPlatforms, setIsFetchingPlatforms] = useState(true);
//   const [selectedActionType, setSelectedActionType] =
//     useState<string>("all_incomes");

//   // --- UTILS ---

//   const formatCurrency = useCallback((value: number | string) => {
//     const num = Number(value) || 0;
//     return num.toLocaleString("en-US", {
//       style: "currency",
//       currency: "USD",
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     });
//   }, []);

//   // --- FETCHING DE PLATAFORMAS (Side Effect) ---
//   useEffect(() => {
//     const fetchPlatforms = async () => {
//       setIsFetchingPlatforms(true);
//       const { data, error } = await supabase.rpc(
//         "get_distinct_sales_platforms"
//       );
//       if (error) {
//         console.error("Error fetching distinct platforms:", error);
//         setAvailablePlatforms([]);
//       } else if (data) {
//         const distinctPlatforms = (data as Array<{ platform: string }>)
//           .map((item) => item.platform)
//           .sort();
//         setAvailablePlatforms(distinctPlatforms);
//       }
//       setIsFetchingPlatforms(false);
//     };
//     fetchPlatforms();
//   }, []);

//   // --- FETCH DATA (Lógica Principal RPC) ---
//   const fetchAffiliateData = useCallback(async () => {
//     if (
//       isDateRangeLoading ||
//       !currentDateRange ||
//       !currentDateRange.from ||
//       !currentDateRange.to
//     ) {
//       setAffiliateData([]);
//       setIsLoadingData(false);
//       return;
//     }

//     setIsLoadingData(true);

//     const dateDbColumn = getCurrentDateDbColumn();
//     const queryFromUTC = currentDateRange.from.toISOString();
//     const queryToUTC = currentDateRange.to.toISOString();

//     // RPC Parameters
//     const rpcParams = {
//       start_date_param: queryFromUTC,
//       end_date_param: queryToUTC,
//       date_column_name_param: dateDbColumn,
//       platform_param: selectedPlatform === "all" ? null : selectedPlatform,
//       aff_name_search_param:
//         searchTermAffiliate.trim() === "" ? null : searchTermAffiliate.trim(),
//       action_type_param:
//         selectedActionType === "all" ? null : selectedActionType,
//     };

//     const { data, error } = await supabase.rpc(
//       "get_affiliate_performance",
//       rpcParams
//     );

//     if (error) {
//       console.error("Error fetching affiliate performance data:", error);
//       setAffiliateData([]);
//     } else if (data) {
//       // Transformação e Cálculo no cliente (Gross Sales, Profit, etc.)
//       const typedData = (data as any[]).map((item) => {
//         const totalRevenue = parseFloat(item.total_revenue) || 0;
//         const totalTaxes = parseFloat(item.taxes) || 0;
//         const platformFeePercentage =
//           parseFloat(item.platform_fee_percentage_amount) || 0;
//         const platformFeeTransaction =
//           parseFloat(item.platform_fee_transaction_amount) || 0;

//         const grossSales =
//           totalRevenue -
//           platformFeePercentage -
//           platformFeeTransaction -
//           totalTaxes;
//         const frontSales = Number(item.front_sales) || 0;
//         const netSales = parseFloat(item.net_sales) || 0;
//         const refundsAndChargebacks = -Math.abs(
//           parseFloat(item.refunds_and_chargebacks) || 0
//         );
//         const netFinal = netSales + refundsAndChargebacks;
//         const totalCogs = parseFloat(item.total_cogs) || 0;
//         const profit = netFinal - totalCogs;
//         const allowance = grossSales * 0.1;
//         const cashFlow = profit - allowance;

//         return {
//           aff_name: item.aff_name || "N/A",
//           platform: item.platform || "N/A",
//           customers: Number(item.customers) || 0,
//           total_sales: Number(item.total_sales) || 0,
//           front_sales: frontSales,
//           back_sales: Number(item.back_sales) || 0,
//           total_revenue: totalRevenue,
//           gross_sales: grossSales,
//           refunds_and_chargebacks: refundsAndChargebacks,
//           commission_paid: parseFloat(item.commission_paid) || 0,
//           taxes: totalTaxes,
//           platform_fee_percentage_amount: platformFeePercentage,
//           platform_fee_transaction_amount: platformFeeTransaction,
//           aov: frontSales > 0 ? grossSales / frontSales : 0,
//           net_sales: netSales,
//           net_final: netFinal,
//           total_cogs: totalCogs,
//           profit: profit,
//           cash_flow: cashFlow,
//           // Dados para o Tooltip (do RPC)
//           total_refund_amount: parseFloat(item.total_refund_amount) || 0,
//           total_refund_commission:
//             parseFloat(item.total_refund_commission) || 0,
//           total_refund_taxes: parseFloat(item.total_refund_taxes) || 0,
//           total_refund_platform_fees:
//             parseFloat(item.total_refund_platform_fees) || 0,
//         };
//       });
//       setAffiliateData(typedData as AffiliatePerformanceData[]);
//     }
//     setIsLoadingData(false);
//   }, [
//     isDateRangeLoading,
//     currentDateRange,
//     getCurrentDateDbColumn,
//     selectedPlatform,
//     searchTermAffiliate,
//     selectedActionType,
//   ]);

//   // Roda o fetch quando os filtros ou data range mudam
//   useEffect(() => {
//     if (currentDateRange) {
//       fetchAffiliateData();
//     }
//   }, [fetchAffiliateData, currentDateRange]);

//   // --- LÓGICA DE ORDENAÇÃO E PAGINAÇÃO (Client Side) ---

//   const sortedAffiliateData = useMemo(() => {
//     if (!affiliateData) return [];
//     return [...affiliateData].sort((a, b) => {
//       const aValue = a[sortColumn];
//       const bValue = b[sortColumn];

//       if (typeof aValue === "string" && typeof bValue === "string") {
//         return sortDirection === "asc"
//           ? aValue.localeCompare(bValue)
//           : bValue.localeCompare(aValue);
//       }
//       if (typeof aValue === "number" && typeof bValue === "number") {
//         return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
//       }
//       return 0;
//     });
//   }, [affiliateData, sortColumn, sortDirection]);

//   const paginatedData = useMemo(() => {
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     return sortedAffiliateData.slice(startIndex, startIndex + itemsPerPage);
//   }, [sortedAffiliateData, currentPage, itemsPerPage]);

//   const totalPages = Math.ceil(sortedAffiliateData.length / itemsPerPage);

//   // Identificação dos Top 3 Afiliados (por Revenue) - Usado para destacar linhas
//   const topAffiliatesIndices = useMemo(() => {
//     if (affiliateData.length === 0) return new Set<number>();
//     const sortedByRevenue = [...affiliateData].sort(
//       (a, b) => b.total_revenue - a.total_revenue
//     );
//     // Retorna um Set com os índices dos top 3 no array original antes de ser paginado/filtrado
//     const top3Affiliates = sortedByRevenue
//       .slice(0, 3)
//       .map((item) => ({ aff_name: item.aff_name, platform: item.platform }));

//     return new Set(
//       top3Affiliates.map((topAff) =>
//         affiliateData.findIndex(
//           (item) =>
//             item.aff_name === topAff.aff_name &&
//             item.platform === topAff.platform
//         )
//       )
//     );
//   }, [affiliateData]);

//   // --- HANDLERS ---

//   const handleSort = (column: SortableAffiliateKeys) => {
//     if (sortColumn === column) {
//       setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
//     } else {
//       setSortColumn(column);
//       setSortDirection("asc");
//     }
//     setCurrentPage(1);
//   };

//   const handleSearch = useCallback(
//     debounce((term: string) => {
//       setSearchTermAffiliate(term);
//       setCurrentPage(1);
//     }, 300),
//     []
//   );

//   const handleItemsPerPageChange = (value: string) => {
//     setItemsPerPage(parseInt(value, 10));
//     setCurrentPage(1);
//   };

//   const handlePageChange = (page: number) => setCurrentPage(page);

//   const handlePlatformChange = (platform: string) => {
//     setSelectedPlatform(platform);
//     setCurrentPage(1);
//   };
//   const handleActionTypeChange = (actionType: string) => {
//     setSelectedActionType(actionType);
//     setCurrentPage(1);
//   };

//   // --- CONDICIONAIS DE RENDERIZAÇÃO ---
//   const showContentSkeleton =
//     (isLoadingData || isFetchingPlatforms) && affiliateData.length === 0;
//   const showNoDataMessage =
//     !isLoadingData && !isFetchingPlatforms && affiliateData.length === 0;

//   // --- TOOLTIP DE REEMBOLSO (Lógica) ---
//   const getRefundTooltipContent = (item: AffiliatePerformanceData) => {
//     // ... (Lógica de renderização do Tooltip BuyGoods/Default - Usa item.total_refund_amount, etc.) ...
//     // Simplificado para este contexto, mas a lógica completa estará no componente UI,
//     // pois ela precisa de renderRow e cn.
//     // Aqui, retornamos um objeto com os dados para o Tooltip renderizar.

//     if (item.platform === "buygoods") {
//       return {
//         title: "BuyGoods R+CB Cost",
//         isBuyGoods: true,
//         refundAmount: item.total_refund_amount,
//         commission: item.total_refund_commission,
//         taxes: item.total_refund_taxes,
//         platformFees: item.total_refund_platform_fees,
//         finalCost: item.refunds_and_chargebacks,
//       };
//     }

//     return {
//       title: `${item.platform} R+CB Cost`,
//       isBuyGoods: false,
//       finalCost: item.refunds_and_chargebacks,
//     };
//   };

//   // --- Retorno Final do Contexto ---
//   const contextValue = {
//     affiliateData: paginatedData, // Dados da página atual
//     isLoading: isLoadingData || isDateRangeLoading || isFetchingPlatforms,

//     // Filtros
//     filterState: {
//       availablePlatforms,
//       selectedPlatform,
//       selectedActionType,
//       isFetchingPlatforms,
//     },
//     handleFilterChange: {
//       platform: handlePlatformChange,
//       actionType: handleActionTypeChange,
//     },
//     handleSearch,

//     // Ordenação
//     sortState: { sortColumn, sortDirection, handleSort },

//     // Paginação
//     pagination: {
//       currentPage,
//       totalPages,
//       itemsPerPage: itemsPerPage,
//       handleItemsPerPageChange,
//       handlePageChange,
//       totalRecords: sortedAffiliateData.length,
//       ROWS_PER_PAGE_OPTIONS,
//     },

//     // Utilidades e Status
//     formatCurrency,
//     showContentSkeleton,
//     showNoDataMessage,
//     topAffiliatesIndices,
//     getRefundTooltipContent,
//   };

//   return (
//     <AffiliatesContext.Provider value={contextValue}>
//       {children}
//     </AffiliatesContext.Provider>
//   );
// }
