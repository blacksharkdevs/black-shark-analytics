import React, { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { type SaleRecord, transformSupabaseSaleToRecord } from "@/lib/data";
import { type Product as ProductConfig } from "@/lib/config";
import { debounce } from "@/lib/utils";
import { useDashboardConfig } from "@/hooks/useDashboardConfig";
import { TransactionsContext } from "./TransactionsContextDefinition";
import { calculateRefund } from "@/utils/index";

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
  } = useDashboardConfig();

  // ESTADOS PRINCIPAIS
  const [transactions, setTransactions] = useState<SaleRecord[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<SortColumn>(
    getCurrentDateDbColumn()
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(ROWS_PER_PAGE_OPTIONS[1]);

  // ESTADOS DE FILTRO
  const [availableProducts, setAvailableProducts] = useState<ProductConfig[]>([
    { id: "all", name: "All Products" },
  ]);
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  const [selectedActionType, setSelectedActionType] = useState<string>("all");
  const [isFetchingProducts, setIsFetchingProducts] = useState(true);
  const [availablePlatforms, setAvailablePlatforms] = useState<string[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [isFetchingPlatforms, setIsFetchingPlatforms] = useState(true);

  // Sincroniza a coluna de ordenação padrão com a configuração de data
  useEffect(() => {
    setSortColumn(getCurrentDateDbColumn());
  }, [getCurrentDateDbColumn]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsFetchingProducts(true);
      const { data, error } = await supabase
        .from("config_products")
        .select("merchant_id, product_name")
        .order("product_name");
      if (error) {
        console.error("Error fetching products:", error);
        setAvailableProducts([{ id: "all", name: "All Products" }]);
      } else if (data) {
        const productsForFilter = data.map((p) => ({
          id: p.merchant_id,
          name: p.product_name,
        }));
        setAvailableProducts([
          { id: "all", name: "All Products" },
          ...productsForFilter,
        ]);
      }
      setIsFetchingProducts(false);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchPlatforms = async () => {
      setIsFetchingPlatforms(true);
      const { data, error } = await supabase.rpc(
        "get_distinct_sales_platforms"
      );
      if (error) {
        console.error("Error fetching distinct platforms:", error);
        setAvailablePlatforms([]);
      } else if (data) {
        const distinctPlatforms = (data as Array<{ platform: string }>)
          .map((item) => item.platform)
          .sort();
        setAvailablePlatforms(distinctPlatforms);
      }
      setIsFetchingPlatforms(false);
    };
    fetchPlatforms();
  }, []);

  // --- FETCH TRANSACTIONS (Lógica Principal) ---

  const fetchTransactions = useCallback(async () => {
    const dateDbColumnToFilter = getCurrentDateDbColumn();
    const limit = itemsPerPage;
    const page = currentPage;

    // GUARD: Evita queries desnecessárias
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
    const fromRange = (page - 1) * limit;
    const toRange = fromRange + limit - 1;

    const queryFromUTC = currentDateRange.from.toISOString();
    const queryToUTC = currentDateRange.to.toISOString();

    let query = supabase
      .from("sales_data")
      .select(
        "*,customer_firstname,customer_lastname,config_products!inner(*)",
        { count: "exact" }
      )
      .gte(dateDbColumnToFilter, queryFromUTC)
      .lte(dateDbColumnToFilter, queryToUTC);

    // Aplicação dos filtros
    if (selectedProduct !== "all") {
      query = query.eq("merchant_id", selectedProduct);
    }
    if (selectedPlatform !== "all") {
      query = query.eq("platform", selectedPlatform);
    }
    if (selectedActionType !== "all") {
      switch (selectedActionType) {
        case "all_incomes":
          query = query.eq("action_type", "neworder");
          break;
        case "front_sale":
          query = query.eq("action_type", "neworder").eq("upsell", false);
          break;
        case "back_sale":
          query = query.eq("action_type", "neworder").eq("upsell", true);
          break;
        case "rebill":
          query = query.eq("action_type", "rebill");
          break;
        case "all_refunds":
          query = query.in("action_type", [
            "chargebackrefundtime",
            "refund",
            "chargeback",
          ]);
          break;
      }
    }

    // Ordenação dinâmica (Server Sort)
    if (sortColumn && sortColumn !== "net_sales") {
      let actualSortColumn: string = sortColumn;
      const sortOptions: {
        ascending: boolean;
        referencedTable?: string;
        foreignTable?: string;
      } = { ascending: sortDirection === "asc" };
      if (sortColumn === "product_name") {
        actualSortColumn = "product_name";
        sortOptions.referencedTable = "config_products";
      } else if (sortColumn === "revenue") {
        actualSortColumn = "total_amount_charged";
      } else if (sortColumn === "id") {
        actualSortColumn = "sale_id";
      } else if (sortColumn === "customer_name") {
        actualSortColumn = "customer_firstname";
      }
      query = query.order(actualSortColumn, sortOptions);
    } else {
      query = query.order(dateDbColumnToFilter, { ascending: false });
    }

    query = query.range(fromRange, toRange);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
      setTotalTransactions(0);
    } else if (data) {
      const transformedData = data.map(transformSupabaseSaleToRecord);
      setTransactions(transformedData);
      setTotalTransactions(count || 0);
    }
    setIsLoadingData(false);
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
    fetchTransactions();
  }, [fetchTransactions]);

  // --- CÁLCULOS E MEMOIZAÇÃO (Filtro Cliente e Cálculos de Página) ---

  // 1. Cálculos de Net Sales (useMemo)
  const transactionsWithNetSales = useMemo(() => {
    return transactions.map((t) => {
      const isRefundAction = [
        "refund",
        "chargeback",
        "chargebackrefundtime",
      ].includes(t.action_type);
      let netSales = 0;

      if (isRefundAction) {
        netSales = -calculateRefund(t);
      } else {
        const platformFeePercentageAmount = t.revenue * (t.platform_tax || 0);
        const platformFeeTransactionAmount = t.platform_transaction_tax || 0;
        netSales =
          t.revenue -
          (t.aff_commission || 0) -
          (t.taxes || 0) -
          platformFeePercentageAmount -
          platformFeeTransactionAmount;
      }

      return { ...t, net_sales: netSales };
    });
  }, [transactions]);

  // 2. Filtro Cliente (se houver termo de busca)
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

    if (totalTransactions !== filtered.length) {
      setTotalTransactions(filtered.length);
    }
    return filtered;
  }, [searchTerm, transactionsWithNetSales, totalTransactions]);

  // 3. Ordenação no Cliente (Net Sales e/ou busca no cliente)
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
  ]);

  // 4. Paginação no Cliente
  const paginatedTransactions = useMemo(() => {
    if (searchTerm) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      return sortedTransactions.slice(startIndex, startIndex + itemsPerPage);
    }
    return sortedTransactions;
  }, [sortedTransactions, currentPage, itemsPerPage, searchTerm]);

  // 5. Cálculos do Rodapé da Página
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
  );

  // --- HANDLERS (Funções de Estado) ---

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
  };

  // --- Retorno Final do Hook ---
  const contextValue = {
    transactions: paginatedTransactions,
    isLoading:
      isLoadingData ||
      isDateRangeLoading ||
      isFetchingProducts ||
      isFetchingPlatforms,

    // Filtros e Handlers
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
    handleSearch,

    // Ordenação
    sortState: { sortColumn, sortDirection, handleSort },

    // Paginação
    pagination: {
      currentPage,
      totalTransactions,
      itemsPerPage,
      handleItemsPerPageChange,
      handlePageChange,
      totalPages: Math.ceil(totalTransactions / itemsPerPage),
      ROWS_PER_PAGE_OPTIONS,
    },

    // Cálculos do Rodapé
    footerCalculations: {
      currentPageRevenue,
      currentPageRefundCalc,
      currentPageNetSales,
    },

    // Utilidades
    ROWS_PER_PAGE_OPTIONS,
  };

  return (
    <TransactionsContext.Provider value={contextValue}>
      {children}
    </TransactionsContext.Provider>
  );
}
