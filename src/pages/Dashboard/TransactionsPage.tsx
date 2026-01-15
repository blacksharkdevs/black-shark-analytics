import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDashboardData } from "@/contexts/DashboardDataContext";
import { useDashboardConfig } from "@/contexts/DashboardConfigContext";
import { TransactionList } from "@/components/transactions/TransactionList";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { TransactionSearch } from "@/components/transactions/TransactionSearch";
import { TransactionPagination } from "@/components/transactions/TransactionPagination";
import { Skeleton } from "@/components/common/ui/skeleton";

export default function TransactionsPage() {
  const { filteredSalesData, isLoadingData } = useDashboardData();
  const { isLoading: isDateRangeLoading } = useDashboardConfig();
  const [searchParams, setSearchParams] = useSearchParams();

  const isLoading = isLoadingData || isDateRangeLoading;

  // Inicializar estados a partir da URL
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1
  );
  const [viewMode, setViewMode] = useState<"list" | "table">(
    (searchParams.get("view") as "list" | "table") || "table"
  );
  const [itemsPerPage, setItemsPerPage] = useState(
    Number(searchParams.get("perPage")) || 20
  );

  // Estados para filtros avançados - ler da URL
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    searchParams.get("platforms")?.split(",").filter(Boolean) || []
  );
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    searchParams.get("statuses")?.split(",").filter(Boolean) || []
  );
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    searchParams.get("types")?.split(",").filter(Boolean) || []
  );
  const [minGrossAmount, setMinGrossAmount] = useState(
    searchParams.get("minGross") || ""
  );
  const [maxGrossAmount, setMaxGrossAmount] = useState(
    searchParams.get("maxGross") || ""
  );
  const [minNetAmount, setMinNetAmount] = useState(
    searchParams.get("minNet") || ""
  );
  const [maxNetAmount, setMaxNetAmount] = useState(
    searchParams.get("maxNet") || ""
  );
  const [sortBy, setSortBy] = useState(
    searchParams.get("sortBy") || "occurredAt"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("sortOrder") as "asc" | "desc") || "desc"
  );

  // Sincronizar estado com URL
  useEffect(() => {
    const params = new URLSearchParams();

    if (searchQuery) params.set("search", searchQuery);
    if (currentPage > 1) params.set("page", currentPage.toString());
    if (viewMode !== "table") params.set("view", viewMode);
    if (itemsPerPage !== 20) params.set("perPage", itemsPerPage.toString());
    if (selectedPlatforms.length > 0)
      params.set("platforms", selectedPlatforms.join(","));
    if (selectedStatuses.length > 0)
      params.set("statuses", selectedStatuses.join(","));
    if (selectedTypes.length > 0) params.set("types", selectedTypes.join(","));
    if (minGrossAmount) params.set("minGross", minGrossAmount);
    if (maxGrossAmount) params.set("maxGross", maxGrossAmount);
    if (minNetAmount) params.set("minNet", minNetAmount);
    if (maxNetAmount) params.set("maxNet", maxNetAmount);
    if (sortBy !== "occurredAt") params.set("sortBy", sortBy);
    if (sortOrder !== "desc") params.set("sortOrder", sortOrder);

    setSearchParams(params, { replace: true });
  }, [
    searchQuery,
    currentPage,
    viewMode,
    itemsPerPage,
    selectedPlatforms,
    selectedStatuses,
    selectedTypes,
    minGrossAmount,
    maxGrossAmount,
    minNetAmount,
    maxNetAmount,
    sortBy,
    sortOrder,
    setSearchParams,
  ]);

  // Resetar para página 1 quando qualquer filtro mudar
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedPlatforms,
    selectedStatuses,
    selectedTypes,
    minGrossAmount,
    maxGrossAmount,
    minNetAmount,
    maxNetAmount,
    sortBy,
    sortOrder,
  ]);

  // Extrair plataformas, status e tipos únicos dos dados
  const availablePlatforms = useMemo(() => {
    const platforms = new Set(
      filteredSalesData.map((t) => t.platform).filter(Boolean)
    );
    return Array.from(platforms).sort();
  }, [filteredSalesData]);

  const availableStatuses = useMemo(() => {
    const statuses = new Set(
      filteredSalesData.map((t) => t.status).filter(Boolean)
    );
    return Array.from(statuses).sort();
  }, [filteredSalesData]);

  const availableTypes = useMemo(() => {
    const types = new Set(filteredSalesData.map((t) => t.type).filter(Boolean));
    return Array.from(types).sort();
  }, [filteredSalesData]);

  // Função para limpar todos os filtros
  const handleClearFilters = () => {
    setSelectedPlatforms([]);
    setSelectedStatuses([]);
    setSelectedTypes([]);
    setMinGrossAmount("");
    setMaxGrossAmount("");
    setMinNetAmount("");
    setMaxNetAmount("");
  };

  // Aplicar filtros avançados e ordenação
  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...filteredSalesData];

    // Filtrar por plataforma
    if (selectedPlatforms.length > 0) {
      result = result.filter((t) => selectedPlatforms.includes(t.platform));
    }

    // Filtrar por status
    if (selectedStatuses.length > 0) {
      result = result.filter((t) => selectedStatuses.includes(t.status));
    }

    // Filtrar por tipo
    if (selectedTypes.length > 0) {
      result = result.filter((t) => selectedTypes.includes(t.type));
    }

    // Filtrar por grossAmount
    if (minGrossAmount) {
      const min = parseFloat(minGrossAmount);
      result = result.filter((t) => Number(t.grossAmount) >= min);
    }
    if (maxGrossAmount) {
      const max = parseFloat(maxGrossAmount);
      result = result.filter((t) => Number(t.grossAmount) <= max);
    }

    // Filtrar por netAmount
    if (minNetAmount) {
      const min = parseFloat(minNetAmount);
      result = result.filter((t) => Number(t.netAmount) >= min);
    }
    if (maxNetAmount) {
      const max = parseFloat(maxNetAmount);
      result = result.filter((t) => Number(t.netAmount) <= max);
    }

    // Ordenar
    result.sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case "occurredAt":
          compareValue =
            new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime();
          break;
        case "grossAmount":
          compareValue = Number(a.grossAmount) - Number(b.grossAmount);
          break;
        case "netAmount":
          compareValue = Number(a.netAmount) - Number(b.netAmount);
          break;
        case "status":
          compareValue = a.status.localeCompare(b.status);
          break;
        case "platform":
          compareValue = a.platform.localeCompare(b.platform);
          break;
        default:
          compareValue = 0;
      }

      return sortOrder === "asc" ? compareValue : -compareValue;
    });

    return result;
  }, [
    filteredSalesData,
    selectedPlatforms,
    selectedStatuses,
    selectedTypes,
    minGrossAmount,
    maxGrossAmount,
    minNetAmount,
    maxNetAmount,
    sortBy,
    sortOrder,
  ]);

  // Filtrar transações por pesquisa (após filtros avançados)
  const searchedTransactions = useMemo(() => {
    if (!searchQuery.trim()) {
      return filteredAndSortedTransactions;
    }

    const query = searchQuery.toLowerCase();

    return filteredAndSortedTransactions.filter((transaction) => {
      // Buscar em todos os campos relevantes
      const searchFields = [
        transaction.externalId,
        transaction.id,
        transaction.product?.name,
        transaction.customer?.email,
        transaction.customer?.firstName,
        transaction.customer?.lastName,
        transaction.affiliate?.name,
        transaction.affiliate?.email,
        transaction.platform,
        transaction.offerType,
        transaction.type,
        transaction.status,
        transaction.grossAmount.toString(),
        transaction.netAmount.toString(),
      ].filter(Boolean);

      return searchFields.some((field) => field?.toLowerCase().includes(query));
    });
  }, [filteredAndSortedTransactions, searchQuery]);

  // Calcular paginação
  const totalPages = Math.ceil(searchedTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = searchedTransactions.slice(
    startIndex,
    endIndex
  );

  // Reset para página 1 quando a pesquisa mudar
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Reset para página 1 quando items per page mudar
  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  return (
    <div className="container p-4 mx-auto space-y-6 md:p-8">
      {/* Barra de Pesquisa e Filtros */}
      <TransactionSearch
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        totalResults={searchedTransactions.length}
        isLoading={isLoading}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        platforms={availablePlatforms}
        selectedPlatforms={selectedPlatforms}
        onPlatformsChange={setSelectedPlatforms}
        statuses={availableStatuses}
        selectedStatuses={selectedStatuses}
        onStatusesChange={setSelectedStatuses}
        types={availableTypes}
        selectedTypes={selectedTypes}
        onTypesChange={setSelectedTypes}
        minGrossAmount={minGrossAmount}
        onMinGrossAmountChange={setMinGrossAmount}
        maxGrossAmount={maxGrossAmount}
        onMaxGrossAmountChange={setMaxGrossAmount}
        minNetAmount={minNetAmount}
        onMinNetAmountChange={setMinNetAmount}
        maxNetAmount={maxNetAmount}
        onMaxNetAmountChange={setMaxNetAmount}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        onClearFilters={handleClearFilters}
      />

      {/* Lista/Tabela de Transações */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-24" />
          ))}
        </div>
      ) : (
        <>
          {viewMode === "list" ? (
            <TransactionList transactions={paginatedTransactions} />
          ) : (
            <TransactionTable transactions={paginatedTransactions} />
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <TransactionPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={searchedTransactions.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
