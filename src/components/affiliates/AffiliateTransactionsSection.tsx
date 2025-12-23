import { useTranslation } from "react-i18next";
import { useState, useMemo } from "react";
import { TransactionList } from "@/components/transactions/TransactionList";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { TransactionSearch } from "@/components/transactions/TransactionSearch";
import { TransactionPagination } from "@/components/transactions/TransactionPagination";
import { Skeleton } from "@/components/common/ui/skeleton";
import type { Transaction } from "@/types/index";

interface AffiliateTransactionsSectionProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export function AffiliateTransactionsSection({
  transactions,
  isLoading,
}: AffiliateTransactionsSectionProps) {
  const { t } = useTranslation();

  // Estados para pesquisa, paginação e view mode
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"list" | "table">("table");
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Filtrar por busca
  const searchedTransactions = useMemo(() => {
    if (!searchQuery.trim()) {
      return transactions;
    }

    const query = searchQuery.toLowerCase();

    return transactions.filter((transaction) => {
      const searchFields = [
        transaction.externalId,
        transaction.id,
        transaction.product?.name,
        transaction.customer?.email,
        transaction.customer?.firstName,
        transaction.customer?.lastName,
        transaction.platform,
        transaction.offerType,
        transaction.type,
        transaction.status,
        transaction.grossAmount.toString(),
        transaction.netAmount.toString(),
      ].filter(Boolean);

      return searchFields.some((field) => field?.toLowerCase().includes(query));
    });
  }, [transactions, searchQuery]);

  // Calcular paginação
  const totalPages = Math.ceil(searchedTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = searchedTransactions.slice(
    startIndex,
    endIndex
  );

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">
        {t("affiliates.details.transactions")}
      </h2>

      <TransactionSearch
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        totalResults={searchedTransactions.length}
        isLoading={isLoading}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

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
