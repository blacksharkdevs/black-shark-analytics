import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useDashboardConfig } from "@/hooks/useDashboardConfig";
import {
  AffiliatesContext,
  type AffiliatesContextValue,
} from "./AffiliatesContextDefinition";
import {
  type AffiliatePerformanceData,
  type SortableAffiliateKeys,
} from "@/types/affiliates";
import { fetchAffiliatePerformance } from "@/services/affiliateService";
import { fetchDistinctSalesPlatforms } from "@/services/configService"; // Reutilizando a lógica de plataformas
import { debounce } from "@/lib/utils";
import { AFFILIATE_ACTION_TYPES } from "@/lib/config"; // Assumindo que este array existe

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];
const DEFAULT_SORT_COLUMN: SortableAffiliateKeys = "total_revenue";
const DEFAULT_ACTION_TYPE =
  AFFILIATE_ACTION_TYPES.find((a) => a.id === "all_incomes")?.id ||
  "all_incomes";

export const AffiliatesProvider = ({ children }: { children: ReactNode }) => {
  // --- CONSUMO DE CONTEXTOS EXTERNOS ---
  const {
    currentDateRange,
    getCurrentDateDbColumn,
    isLoading: isDateRangeLoading,
  } = useDashboardConfig();

  console.log("🏗️ AffiliatesProvider montado/atualizado", {
    currentDateRange,
    isDateRangeLoading,
  });

  // --- ESTADOS PRINCIPAIS ---
  const [rawAffiliateData, setRawAffiliateData] = useState<
    AffiliatePerformanceData[]
  >([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // --- ESTADOS DE FILTRO/BUSCA ---
  const [availablePlatforms, setAvailablePlatforms] = useState<string[]>([]);
  const [isFetchingPlatforms, setIsFetchingPlatforms] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedActionType, setSelectedActionType] =
    useState<string>(DEFAULT_ACTION_TYPE);
  const [searchTermAffiliate, setSearchTermAffiliate] = useState<string>("");

  // --- ESTADOS DE TABELA ---
  const [sortColumn, setSortColumn] =
    useState<SortableAffiliateKeys>(DEFAULT_SORT_COLUMN);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ROWS_PER_PAGE_OPTIONS[1]);

  // --- LÓGICA DE FETCH DE CONFIGURAÇÃO (PLATAFORMAS) ---
  useEffect(() => {
    const loadPlatforms = async () => {
      setIsFetchingPlatforms(true);
      // Reutilizando o serviço de configuração que já criamos
      const platforms = await fetchDistinctSalesPlatforms();
      setAvailablePlatforms(platforms);
      setIsFetchingPlatforms(false);
    };
    loadPlatforms();
  }, []);

  // --- LÓGICA PRINCIPAL DE FETCH DE DADOS (USANDO SERVICE) ---
  const loadAffiliatesData = useCallback(async () => {
    // GUARD: Impede fetches desnecessários antes que as dependências estejam prontas
    // IMPORTANTE: NÃO bloqueamos se isFetchingPlatforms, pois as plataformas carregam em paralelo
    if (
      isDateRangeLoading ||
      !currentDateRange ||
      !currentDateRange.from ||
      !currentDateRange.to
    ) {
      console.log("⏸️ AffiliatesContext: Aguardando date range...", {
        isDateRangeLoading,
        currentDateRange,
      });
      setRawAffiliateData([]);
      setIsLoadingData(false);
      return;
    }

    console.log("🚀 AffiliatesContext: Iniciando fetch de afiliados", {
      dateRange: currentDateRange,
      platform: selectedPlatform,
      actionType: selectedActionType,
      searchTerm: searchTermAffiliate,
    });

    setIsLoadingData(true);

    try {
      // Chamada ao Service
      const data = await fetchAffiliatePerformance({
        currentDateRange: currentDateRange,
        dateDbColumn: getCurrentDateDbColumn(),
        platformFilter: selectedPlatform,
        affNameSearch: searchTermAffiliate,
        actionTypeFilter: selectedActionType,
      });

      console.log("✅ AffiliatesContext: Dados recebidos", {
        count: data.length,
        sample: data[0],
      });

      setRawAffiliateData(data);
      setCurrentPage(1); // Sempre volta para a página 1 ao recarregar dados
    } catch (error) {
      console.error("❌ Erro ao carregar dados de afiliados:", error);
      setRawAffiliateData([]);
    } finally {
      setIsLoadingData(false);
    }
  }, [
    isDateRangeLoading,
    currentDateRange,
    getCurrentDateDbColumn,
    selectedPlatform,
    searchTermAffiliate,
    selectedActionType,
  ]);

  // Dispara o fetch sempre que um filtro relevante muda
  useEffect(() => {
    loadAffiliatesData();
  }, [loadAffiliatesData]);

  // --- LÓGICA CLIENT-SIDE (Ordenação, Paginação) ---

  // 1. Ordenação
  const sortedAffiliateData = useMemo(() => {
    if (!rawAffiliateData) return [];

    const sorted = [...rawAffiliateData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      // Ordenação de Strings
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      // Ordenação de Números
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });

    return sorted;
  }, [rawAffiliateData, sortColumn, sortDirection]);

  // 2. Paginação
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedAffiliateData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedAffiliateData, currentPage, itemsPerPage]);

  const totalAffiliatesCount = sortedAffiliateData.length;
  const totalPages = Math.ceil(totalAffiliatesCount / itemsPerPage);

  // --- HANDLERS ---

  const handleSort = useCallback(
    (column: SortableAffiliateKeys) => {
      // Se a coluna for a mesma, inverte a direção, caso contrário, seta para 'asc'
      setSortDirection((prev) =>
        sortColumn === column && prev === "asc" ? "desc" : "asc"
      );
      setSortColumn(column);
      setCurrentPage(1);
    },
    [sortColumn]
  );

  // Usamos um debounce para a busca, evitando múltiplas chamadas API enquanto o usuário digita
  const debouncedSearch = useMemo(
    () => debounce((term: string) => setSearchTermAffiliate(term), 300),
    []
  );

  const handleSearch = useCallback(
    (term: string) => {
      // A busca real é feita no loadAffiliatesData (disparado pelo useEffect), então apenas setamos o termo
      debouncedSearch(term);
    },
    [debouncedSearch]
  );

  const handlePlatformChange = useCallback((platform: string) => {
    setSelectedPlatform(platform);
    // O useEffect do loadAffiliatesData fará o fetch.
  }, []);

  const handleActionTypeChange = useCallback((actionType: string) => {
    setSelectedActionType(actionType);
    // O useEffect do loadAffiliatesData fará o fetch.
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleItemsPerPageChange = useCallback((value: string) => {
    setItemsPerPage(parseInt(value, 10));
    setCurrentPage(1);
  }, []);

  // --- Context Value (Dados que a UI Consome) ---
  const contextValue: AffiliatesContextValue = useMemo(
    () => ({
      // Dados
      affiliateData: paginatedData,

      // Loading States
      isLoadingData: isLoadingData,
      isFetchingPlatforms: isFetchingPlatforms,
      isDateRangeLoading: isDateRangeLoading, // Consumido do hook externo

      // Filtros e Handlers
      filterState: {
        availablePlatforms: availablePlatforms,
        selectedPlatform: selectedPlatform,
        selectedActionType: selectedActionType,
        searchTermAffiliate: searchTermAffiliate,
      },
      handleFilterChange: {
        platform: handlePlatformChange,
        actionType: handleActionTypeChange,
        search: handleSearch,
      },

      // Ordenação
      sortState: {
        sortColumn: sortColumn,
        sortDirection: sortDirection,
        handleSort: handleSort,
      },

      // Paginação
      pagination: {
        currentPage: currentPage,
        totalPages: totalPages,
        itemsPerPage: itemsPerPage,
        totalAffiliatesCount: totalAffiliatesCount,
        handlePageChange: handlePageChange,
        handleItemsPerPageChange: handleItemsPerPageChange,
        ROWS_PER_PAGE_OPTIONS: ROWS_PER_PAGE_OPTIONS,
      },
    }),
    [
      paginatedData,
      isLoadingData,
      isFetchingPlatforms,
      isDateRangeLoading,
      availablePlatforms,
      selectedPlatform,
      selectedActionType,
      searchTermAffiliate,
      sortColumn,
      sortDirection,
      handleSort,
      handlePlatformChange,
      handleActionTypeChange,
      handleSearch,
      currentPage,
      totalPages,
      itemsPerPage,
      totalAffiliatesCount,
      handlePageChange,
      handleItemsPerPageChange,
    ]
  );

  return (
    <AffiliatesContext.Provider value={contextValue}>
      {children}
    </AffiliatesContext.Provider>
  );
};
