import { useState, useMemo } from "react";
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

  const isLoading = isLoadingData || isDateRangeLoading;

  // Estado para pesquisa, paginação e view mode
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"list" | "table">("table");
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Filtrar transações por pesquisa
  const searchedTransactions = useMemo(() => {
    if (!searchQuery.trim()) {
      return filteredSalesData;
    }

    const query = searchQuery.toLowerCase();

    return filteredSalesData.filter((transaction) => {
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
  }, [filteredSalesData, searchQuery]);

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
      {/* Barra de Pesquisa */}
      <TransactionSearch
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        totalResults={searchedTransactions.length}
        isLoading={isLoading}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
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
