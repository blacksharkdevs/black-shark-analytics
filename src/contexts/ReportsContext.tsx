import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import * as reportService from "@/services/reportService";
import {
  aggregateSalesData,
  processAndFilterItems,
  getPaginatedData,
  formatCurrency,
} from "@/lib/reportCalculations";
import { ROWS_PER_PAGE_OPTIONS } from "@/lib/reportFilters";
import { debounce } from "@/lib/utils";
import type { ProductConfig, SaleRecord } from "../types";
import { ItemsReportContext, type SkuConfig } from "./ReportsContextDefinition";
import { useDashboardConfig } from "@/hooks/useDashboardConfig";

interface ItemsReportProviderProps {
  children: ReactNode;
}

export function ItemsReportProvider({ children }: ItemsReportProviderProps) {
  // Hooks globais
  const {
    currentDateRange,
    isLoading: isDateRangeLoading,
    getCurrentDateDbColumn,
  } = useDashboardConfig();

  // Estados de Dados
  const [allSalesData, setAllSalesData] = useState<SaleRecord[]>([]);
  const [skuConfigs, setSkuConfigs] = useState<SkuConfig[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Estados de Filtros
  const [availableProducts, setAvailableProducts] = useState<ProductConfig[]>([
    { id: "all", name: "All Products" },
  ]);
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  const [selectedActionType, setSelectedActionType] = useState<string>("all");
  const [isFetchingProducts, setIsFetchingProducts] = useState(true);

  const [availablePlatforms, setAvailablePlatforms] = useState<string[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [isFetchingPlatforms, setIsFetchingPlatforms] = useState(true);

  // Estado de Busca
  const [searchTerm, setSearchTerm] = useState("");

  // Estados de Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ROWS_PER_PAGE_OPTIONS[1]);

  // --- EFEITOS DE BUSCA DE DADOS ---

  // Buscar filtros de produtos
  useEffect(() => {
    const fetchProducts = async () => {
      setIsFetchingProducts(true);
      const products = await reportService.fetchProductsFilter();
      setAvailableProducts(products);
      setIsFetchingProducts(false);
    };
    fetchProducts();
  }, []);

  // Buscar filtros de plataformas
  useEffect(() => {
    const fetchPlatforms = async () => {
      setIsFetchingPlatforms(true);
      const platforms = await reportService.fetchPlatformsFilter();
      setAvailablePlatforms(platforms);
      setIsFetchingPlatforms(false);
    };
    fetchPlatforms();
  }, []);

  // Buscar dados principais (vendas e SKUs)
  const fetchAllData = useCallback(async () => {
    const dateDbColumn = getCurrentDateDbColumn();

    if (
      isDateRangeLoading ||
      (isFetchingProducts && selectedProduct !== "all") ||
      isFetchingPlatforms ||
      !currentDateRange
    ) {
      setIsLoadingData(false);
      setAllSalesData([]);
      return;
    }

    setIsLoadingData(true);

    const [sales, skus] = await reportService.fetchReportData({
      dateRange: currentDateRange,
      dateDbColumn,
      selectedProduct,
      selectedPlatform,
      selectedActionType,
    });

    setAllSalesData(sales);
    setSkuConfigs(skus);
    setIsLoadingData(false);
  }, [
    currentDateRange,
    selectedProduct,
    selectedActionType,
    selectedPlatform,
    isFetchingProducts,
    isDateRangeLoading,
    getCurrentDateDbColumn,
    isFetchingPlatforms,
  ]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // --- HANDLERS (Manipuladores) ---

  const debouncedSearch = useCallback(
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

  // --- DADOS PROCESSADOS (useMemo) ---

  // Etapa 1: Agregar dados brutos
  const aggregatedData = useMemo(
    () => aggregateSalesData(allSalesData),
    [allSalesData, skuConfigs]
  );

  // Etapa 2: Calcular unidades, filtrar por busca e ordenar
  const aggregatedAndFilteredData = useMemo(
    () => processAndFilterItems(aggregatedData, skuConfigs, searchTerm),
    [aggregatedData, skuConfigs, searchTerm]
  );

  // Etapa 3: Paginar os dados filtrados
  const paginatedData = useMemo(
    () =>
      getPaginatedData(aggregatedAndFilteredData, currentPage, itemsPerPage),
    [aggregatedAndFilteredData, currentPage, itemsPerPage]
  );

  // Etapa 4: Calcular total de páginas
  const totalPages = Math.ceil(aggregatedAndFilteredData.length / itemsPerPage);

  // --- VALOR DO CONTEXTO ---
  const value: ItemsReportContext = {
    // Dados
    allSalesData,
    skuConfigs,
    aggregatedAndFilteredData,
    paginatedData,
    // Estado UI
    isLoadingData,
    // Paginação
    currentPage,
    itemsPerPage,
    totalPages,
    setCurrentPage,
    setItemsPerPage,
    handleItemsPerPageChange,
    // Filtros
    availableProducts,
    selectedProduct,
    setSelectedProduct: (id: string) => {
      setSelectedProduct(id);
      setCurrentPage(1); // Resetar página ao mudar filtro
    },
    selectedActionType,
    setSelectedActionType: (type: string) => {
      setSelectedActionType(type);
      setCurrentPage(1); // Resetar página ao mudar filtro
    },
    availablePlatforms,
    selectedPlatform,
    setSelectedPlatform: (platform: string) => {
      setSelectedPlatform(platform);
      setCurrentPage(1); // Resetar página ao mudar filtro
    },
    isFetchingProducts,
    isFetchingPlatforms,
    // Busca
    searchTerm,
    setSearchTerm, // Note: preferir usar o debouncedSearch
    debouncedSearch,
    // Helpers
    formatCurrency,
  };

  // 4. Retornar o Provedor com o valor
  return (
    <ItemsReportContext.Provider value={value}>
      {children}
    </ItemsReportContext.Provider>
  );
}
