import React, { useState, useEffect, useCallback, useMemo } from "react";
// Importações limpas: removemos supabase e transformSupabaseSaleToRecord
import { type Product as ProductConfig } from "@/lib/config";
import { debounce } from "@/lib/utils";
import { useDashboardConfig } from "@/hooks/useDashboardConfig";
import { TransactionsContext } from "./TransactionsContextDefinition";
import { calculateRefund } from "@/utils/index";
import {
  fetchDistinctSalesPlatforms,
  fetchProductsForFilter,
} from "@/services/configService";
import { fetchTransactions } from "@/services/transactionsService"; // ✨ Importa a função de serviço
import type { SaleRecord } from "@/types/index";
// Os imports de lib de filtro e sort não são mais necessários aqui no Provider
import {
  calculateNetSales,
  type SaleRecordWithNetSales,
} from "@/lib/dataCalculations";

// --- Tipagens ---
type SortColumn = keyof SaleRecord | "calc_charged_day" | "net_sales";
const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100];

export function TransactionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // CONSUMO DE CONTEXTOS EXTERNOS
  const {
    currentDateRange,
    getCurrentDateDbColumn,
    isLoading: isDateRangeLoading,
  } = useDashboardConfig(); // ESTADOS PRINCIPAIS

  const [transactions, setTransactions] = useState<SaleRecord[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<SortColumn>(
    getCurrentDateDbColumn()
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(ROWS_PER_PAGE_OPTIONS[1]); // ESTADOS DE FILTRO

  const [availableProducts, setAvailableProducts] = useState<ProductConfig[]>([
    { id: "all", name: "All Products" },
  ]);
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  const [selectedActionType, setSelectedActionType] = useState<string>("all");
  const [isFetchingProducts, setIsFetchingProducts] = useState(true);
  const [availablePlatforms, setAvailablePlatforms] = useState<string[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [isFetchingPlatforms, setIsFetchingPlatforms] = useState(true);

  useEffect(() => {
    setSortColumn(getCurrentDateDbColumn());
  }, [getCurrentDateDbColumn]); // Efeitos para buscar Configurações (limpos, usando configService)

  useEffect(() => {
    const loadProducts = async () => {
      setIsFetchingProducts(true);
      const products = await fetchProductsForFilter();
      setAvailableProducts(products);
      setIsFetchingProducts(false);
    };
    loadProducts();
  }, []);

  useEffect(() => {
    const loadPlatforms = async () => {
      setIsFetchingPlatforms(true);
      const platforms = await fetchDistinctSalesPlatforms();
      setAvailablePlatforms(platforms);
      setIsFetchingPlatforms(false);
    };
    loadPlatforms();
  }, []); // --- FETCH TRANSACTIONS (Refatorado para usar o Service) ---

  const fetchTransactionsData = useCallback(async () => {
    // 1. GUARDA: Evita fetch se houver dependências de carregamento
    if (
      isDateRangeLoading ||
      isFetchingPlatforms ||
      isFetchingProducts ||
      !currentDateRange ||
      !currentDateRange.from ||
      !currentDateRange.to
    ) {
      setTransactions([]);
      setTotalTransactions(0);
      setIsLoadingData(false);
      return;
    }

    setIsLoadingData(true);

    try {
      // 2. Chama a função de serviço com todos os parâmetros de estado
      const { data, count } = await fetchTransactions({
        currentDateRange,
        getCurrentDateDbColumn,
        itemsPerPage,
        currentPage,
        selectedProduct,
        selectedPlatform,
        selectedActionType,
        sortColumn,
        sortDirection,
      }); // 3. Atualiza o estado
      setTransactions(data);
      setTotalTransactions(count);
    } catch (error) {
      console.error("Erro ao buscar transações no Service:", error);
      setTransactions([]);
      setTotalTransactions(0);
    } finally {
      setIsLoadingData(false);
    }
  }, [
    isDateRangeLoading,
    isFetchingPlatforms,
    isFetchingProducts,
    currentDateRange,
    getCurrentDateDbColumn,
    itemsPerPage,
    currentPage,
    selectedProduct,
    selectedPlatform,
    selectedActionType,
    sortColumn,
    sortDirection,
  ]);

  useEffect(() => {
    fetchTransactionsData();
  }, [fetchTransactionsData]); // --- CÁLCULOS E MEMOIZAÇÃO (Filtro Cliente e Cálculos de Página) --- // 1. Cálculos de Net Sales (limpo, usando dataCalculations)

  const transactionsWithNetSales = useMemo(() => {
    return transactions.map(calculateNetSales) as SaleRecordWithNetSales[];
  }, [transactions]); // 2. Filtro Cliente (mantido)

  const filteredTransactions = useMemo(() => {
    if (!searchTerm) {
      return transactionsWithNetSales;
    }

    const lowercasedTerm = searchTerm.toLowerCase();
    const filtered = transactionsWithNetSales.filter((t) => {
      const check = (field: string | undefined | null) =>
        field && field.toLowerCase().includes(lowercasedTerm);
      return (
        check(t.id) ||
        check(t.product_name) ||
        check(t.customer_name) ||
        check(t.aff_name) ||
        check(t.platform) ||
        check(t.customer_email)
      );
    });

    if (totalTransactions !== filtered.length && searchTerm) {
      setTotalTransactions(filtered.length);
    }
    return filtered;
  }, [searchTerm, transactionsWithNetSales, totalTransactions]); // 3. Ordenação no Cliente (mantido)

  const sortedTransactions = useMemo(() => {
    const dataToSort = searchTerm
      ? filteredTransactions
      : transactionsWithNetSales;

    if (searchTerm || sortColumn === "net_sales") {
      const sorted = [...dataToSort].sort((a, b) => {
        if (sortColumn === "net_sales") {
          return sortDirection === "asc"
            ? a.net_sales - b.net_sales
            : b.net_sales - a.net_sales;
        }
        return 0;
      });
      return sorted;
    }

    return transactionsWithNetSales;
  }, [
    transactionsWithNetSales,
    sortColumn,
    sortDirection,
    searchTerm,
    filteredTransactions,
  ]); // 4. Paginação no Cliente (mantido)

  const paginatedTransactions = useMemo(() => {
    if (searchTerm) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      return sortedTransactions.slice(startIndex, startIndex + itemsPerPage);
    }
    return sortedTransactions;
  }, [sortedTransactions, currentPage, itemsPerPage, searchTerm]); // 5. Cálculos do Rodapé da Página (mantido)

  const currentPageRevenue = useMemo(
    () => paginatedTransactions.reduce((sum, t) => sum + t.revenue, 0),
    [paginatedTransactions]
  );
  const currentPageRefundCalc = useMemo(
    () => paginatedTransactions.reduce((sum, t) => sum + calculateRefund(t), 0),
    [paginatedTransactions]
  );
  const currentPageNetSales = useMemo(
    () => paginatedTransactions.reduce((sum, t) => sum + t.net_sales, 0),
    [paginatedTransactions]
  ); // --- HANDLERS (Funções de Estado) ---

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const handleSearch = useCallback(
    debounce((term: string) => {
      setSearchTerm(term);
      setCurrentPage(1);
    }, 300),
    []
  );

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value, 10));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleFilterChange = {
    product: (newProduct: string) => {
      setSelectedProduct(newProduct);
      setCurrentPage(1);
    },
    actionType: (newActionType: string) => {
      setSelectedActionType(newActionType);
      setCurrentPage(1);
    },
    platform: (newPlatform: string) => {
      setSelectedPlatform(newPlatform);
      setCurrentPage(1);
    },
  }; // --- Retorno Final do Hook ---

  const contextValue = {
    transactions: paginatedTransactions,
    isLoading:
      isLoadingData ||
      isDateRangeLoading ||
      isFetchingProducts ||
      isFetchingPlatforms, // Filtros e Handlers

    filterState: {
      availableProducts,
      selectedProduct,
      availablePlatforms,
      selectedPlatform,
      selectedActionType,
      isFetchingProducts,
      isFetchingPlatforms,
    },
    handleFilterChange,
    handleSearch, // Ordenação

    sortState: { sortColumn, sortDirection, handleSort }, // Paginação

    pagination: {
      currentPage,
      totalTransactions,
      itemsPerPage,
      handleItemsPerPageChange,
      handlePageChange,
      totalPages: Math.ceil(totalTransactions / itemsPerPage),
      ROWS_PER_PAGE_OPTIONS,
    }, // Cálculos do Rodapé

    footerCalculations: {
      currentPageRevenue,
      currentPageRefundCalc,
      currentPageNetSales,
    }, // Utilidades

    ROWS_PER_PAGE_OPTIONS,
  };

  return (
    <TransactionsContext.Provider value={contextValue}>
      {children}
    </TransactionsContext.Provider>
  );
}
