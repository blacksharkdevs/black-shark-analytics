import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDashboardData } from "@/contexts/DashboardDataContext";
import { useDashboardConfig } from "@/contexts/DashboardConfigContext";
import { TransactionList } from "@/components/transactions/TransactionList";
import { TransactionSearch } from "@/components/transactions/TransactionSearch";
import { TransactionPagination } from "@/components/transactions/TransactionPagination";
import { Skeleton } from "@/components/common/ui/skeleton";

const ITEMS_PER_PAGE = 20;

export default function TransactionsPage() {
  const { t } = useTranslation();
  const { filteredSalesData, isLoadingData } = useDashboardData();
  const { isLoading: isDateRangeLoading } = useDashboardConfig();

  const isLoading = isLoadingData || isDateRangeLoading;

  // Estado para pesquisa e paginação
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

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
  const totalPages = Math.ceil(searchedTransactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTransactions = searchedTransactions.slice(
    startIndex,
    endIndex
  );

  // Reset para página 1 quando a pesquisa mudar
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return (
    <div className="w-full mx-auto space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold md:text-3xl text-foreground">
          {t("transactions.title")}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          {t("transactions.description")}
        </p>
      </div>

      {/* Barra de Pesquisa */}
      <TransactionSearch
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        totalResults={searchedTransactions.length}
        isLoading={isLoading}
      />

      {/* Lista de Transações */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-24" />
          ))}
        </div>
      ) : (
        <>
          <TransactionList transactions={paginatedTransactions} />

          {/* Paginação */}
          {totalPages > 1 && (
            <TransactionPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={searchedTransactions.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
}
