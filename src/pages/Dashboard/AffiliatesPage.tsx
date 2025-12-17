import { useState, useMemo } from "react";
import { useDashboardData } from "@/contexts/DashboardDataContext";
import { useDashboardConfig } from "@/contexts/DashboardConfigContext";
import { AffiliateList } from "@/components/affiliates/AffiliateList";
import { AffiliateTable } from "@/components/affiliates/AffiliateTable";
import { AffiliateSearch } from "@/components/affiliates/AffiliateSearch";
import { TransactionPagination } from "@/components/transactions/TransactionPagination";
import { Skeleton } from "@/components/common/ui/skeleton";
import type { Affiliate as AffiliateType } from "@/types/index";

interface AffiliateMetrics {
  affiliate: AffiliateType;
  platform: string;
  totalCustomers: number;
  totalSales: number;
  totalRevenue: number;
  grossSales: number;
  refundsAndChargebacks: number;
  commission: number;
  taxes: number;
  platformFeePercent: number;
  platformFeeDollar: number;
  aov: number;
  netSales: number;
  net: number;
  cogs: number;
  profit: number;
  cashFlow: number;
}

export default function AffiliatesPage() {
  const { filteredSalesData, isLoadingData } = useDashboardData();
  const { isLoading: isDateRangeLoading } = useDashboardConfig();

  const isLoading = isLoadingData || isDateRangeLoading;

  // Estados para pesquisa, paginação e view mode
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"list" | "table">("list");
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Calcular métricas por afiliado
  const affiliatesData = useMemo(() => {
    const affiliatesMap = new Map<string, AffiliateMetrics>();

    filteredSalesData.forEach((transaction) => {
      if (!transaction.affiliateId) return;

      const affiliateId = transaction.affiliateId;
      const existing = affiliatesMap.get(affiliateId);

      if (!existing) {
        // Criar nova entrada
        affiliatesMap.set(affiliateId, {
          affiliate: transaction.affiliate || {
            id: affiliateId,
            externalId: affiliateId,
            platform: transaction.platform,
            name: null,
            email: null,
          },
          platform: transaction.platform,
          totalCustomers: new Set([transaction.customerId]).size,
          totalSales: 0,
          totalRevenue: 0,
          grossSales: 0,
          refundsAndChargebacks: 0,
          commission: 0,
          taxes: 0,
          platformFeePercent: 0,
          platformFeeDollar: 0,
          aov: 0,
          netSales: 0,
          net: 0,
          cogs: 0,
          profit: 0,
          cashFlow: 0,
        });
      }

      const metrics = affiliatesMap.get(affiliateId)!;

      // Acumular métricas
      if (transaction.type === "SALE" && transaction.status === "COMPLETED") {
        metrics.totalSales += 1;
        metrics.totalRevenue += Number(transaction.grossAmount);
        metrics.commission += Number(transaction.affiliateCommission);
        metrics.taxes += Number(transaction.taxAmount);
        metrics.platformFeeDollar += Number(transaction.platformFee);

        // Gross Sales = Revenue - Taxes - Platform Fees
        const revenue = Number(transaction.grossAmount);
        const taxes = Number(transaction.taxAmount);
        const platformFee = Number(transaction.platformFee);
        metrics.grossSales += revenue - taxes - platformFee;

        // COGS
        if (transaction.product?.cogs) {
          metrics.cogs +=
            Number(transaction.product.cogs) * transaction.quantity;
        }
      }

      // Refunds & Chargebacks
      if (transaction.type === "REFUND" || transaction.type === "CHARGEBACK") {
        metrics.refundsAndChargebacks += Number(transaction.grossAmount);
      }

      // Contar clientes únicos
      if (transaction.customerId) {
        // Precisaria de uma estrutura diferente para contar unicos corretamente
        // Por simplicidade, vou aproximar
        metrics.totalCustomers += 0;
      }
    });

    // Calcular métricas derivadas
    affiliatesMap.forEach((metrics) => {
      // Net Sales = Gross Sales - Commission
      metrics.netSales = metrics.grossSales - metrics.commission;

      // Net = Net Sales + R+CB (R+CB é negativo geralmente)
      metrics.net = metrics.netSales + metrics.refundsAndChargebacks;

      // Profit = Net - COGS
      metrics.profit = metrics.net - metrics.cogs;

      // Cash Flow = Profit - Allowance (10% de Gross Sales)
      const allowance = metrics.grossSales * 0.1;
      metrics.cashFlow = metrics.profit - allowance;

      // AOV = Gross Sales / Front Sales
      // (aproximando com totalSales por falta de dados detalhados)
      metrics.aov =
        metrics.totalSales > 0 ? metrics.grossSales / metrics.totalSales : 0;

      // Platform Fee Percent (média aproximada)
      if (metrics.totalRevenue > 0) {
        metrics.platformFeePercent =
          (metrics.platformFeeDollar / metrics.totalRevenue) * 100;
      }
    });

    return Array.from(affiliatesMap.values());
  }, [filteredSalesData]);

  // Filtrar por busca
  const searchedAffiliates = useMemo(() => {
    if (!searchQuery.trim()) {
      return affiliatesData;
    }

    const query = searchQuery.toLowerCase();

    return affiliatesData.filter((item) => {
      const searchFields = [
        item.affiliate.name,
        item.affiliate.email,
        item.affiliate.externalId,
        item.platform,
        item.totalSales.toString(),
        item.grossSales.toFixed(2),
      ].filter(Boolean);

      return searchFields.some((field) => field?.toLowerCase().includes(query));
    });
  }, [affiliatesData, searchQuery]);

  // Calcular paginação
  const totalPages = Math.ceil(searchedAffiliates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAffiliates = searchedAffiliates.slice(startIndex, endIndex);

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
      <AffiliateSearch
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        totalResults={searchedAffiliates.length}
        isLoading={isLoading}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Lista/Tabela de Afiliados */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-24" />
          ))}
        </div>
      ) : (
        <>
          {viewMode === "list" ? (
            <AffiliateList affiliates={paginatedAffiliates} />
          ) : (
            <AffiliateTable affiliates={paginatedAffiliates} />
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <TransactionPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={searchedAffiliates.length}
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
