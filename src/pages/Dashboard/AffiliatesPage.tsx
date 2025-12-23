import { useState, useMemo, useEffect } from "react";
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
  customerIds: Set<string>; // Para rastrear clientes únicos
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
  const [viewMode, setViewMode] = useState<"list" | "table">("table");
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // Estados para filtros
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [minSales, setMinSales] = useState("");
  const [maxSales, setMaxSales] = useState("");
  const [minRevenue, setMinRevenue] = useState("");
  const [maxRevenue, setMaxRevenue] = useState("");
  const [minCommission, setMinCommission] = useState("");
  const [maxCommission, setMaxCommission] = useState("");
  const [minProfit, setMinProfit] = useState("");
  const [maxProfit, setMaxProfit] = useState("");
  const [minCustomers, setMinCustomers] = useState("");
  const [maxCustomers, setMaxCustomers] = useState("");
  const [minAov, setMinAov] = useState("");
  const [maxAov, setMaxAov] = useState("");
  const [sortBy, setSortBy] = useState("sales");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Resetar para página 1 quando qualquer filtro mudar
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedPlatforms,
    minSales,
    maxSales,
    minRevenue,
    maxRevenue,
    minCommission,
    maxCommission,
    minProfit,
    maxProfit,
    minCustomers,
    maxCustomers,
    minAov,
    maxAov,
    sortBy,
    sortOrder,
  ]);

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
          totalCustomers: 0,
          customerIds: new Set<string>(),
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

      // Adicionar cliente único ao Set
      if (transaction.customerId) {
        metrics.customerIds.add(transaction.customerId);
      }

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
    });

    // Calcular métricas derivadas
    affiliatesMap.forEach((metrics) => {
      // Total de clientes únicos
      metrics.totalCustomers = metrics.customerIds.size;

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

  // Extrair plataformas únicas
  const availablePlatforms = useMemo(() => {
    const platforms = new Set<string>();
    affiliatesData.forEach((item) => {
      if (item.platform) platforms.add(item.platform);
    });
    return Array.from(platforms).sort();
  }, [affiliatesData]);

  // Aplicar filtros
  const filteredAffiliates = useMemo(() => {
    let filtered = [...affiliatesData];

    // Filtro por plataforma
    if (selectedPlatforms.length > 0) {
      filtered = filtered.filter((item) =>
        selectedPlatforms.includes(item.platform)
      );
    }

    // Filtro por vendas
    if (minSales) {
      const min = parseFloat(minSales);
      filtered = filtered.filter((item) => item.totalSales >= min);
    }
    if (maxSales) {
      const max = parseFloat(maxSales);
      filtered = filtered.filter((item) => item.totalSales <= max);
    }

    // Filtro por receita
    if (minRevenue) {
      const min = parseFloat(minRevenue);
      filtered = filtered.filter((item) => item.totalRevenue >= min);
    }
    if (maxRevenue) {
      const max = parseFloat(maxRevenue);
      filtered = filtered.filter((item) => item.totalRevenue <= max);
    }

    // Filtro por comissão
    if (minCommission) {
      const min = parseFloat(minCommission);
      filtered = filtered.filter((item) => item.commission >= min);
    }
    if (maxCommission) {
      const max = parseFloat(maxCommission);
      filtered = filtered.filter((item) => item.commission <= max);
    }

    // Filtro por profit
    if (minProfit) {
      const min = parseFloat(minProfit);
      filtered = filtered.filter((item) => item.profit >= min);
    }
    if (maxProfit) {
      const max = parseFloat(maxProfit);
      filtered = filtered.filter((item) => item.profit <= max);
    }

    // Filtro por clientes
    if (minCustomers) {
      const min = parseFloat(minCustomers);
      filtered = filtered.filter((item) => item.totalCustomers >= min);
    }
    if (maxCustomers) {
      const max = parseFloat(maxCustomers);
      filtered = filtered.filter((item) => item.totalCustomers <= max);
    }

    // Filtro por AOV
    if (minAov) {
      const min = parseFloat(minAov);
      filtered = filtered.filter((item) => item.aov >= min);
    }
    if (maxAov) {
      const max = parseFloat(maxAov);
      filtered = filtered.filter((item) => item.aov <= max);
    }

    // Ordenação
    filtered.sort((a, b) => {
      let valueA: number;
      let valueB: number;

      switch (sortBy) {
        case "sales":
          valueA = a.totalSales;
          valueB = b.totalSales;
          break;
        case "revenue":
          valueA = a.totalRevenue;
          valueB = b.totalRevenue;
          break;
        case "grossSales":
          valueA = a.grossSales;
          valueB = b.grossSales;
          break;
        case "commission":
          valueA = a.commission;
          valueB = b.commission;
          break;
        case "profit":
          valueA = a.profit;
          valueB = b.profit;
          break;
        case "cashFlow":
          valueA = a.cashFlow;
          valueB = b.cashFlow;
          break;
        case "customers":
          valueA = a.totalCustomers;
          valueB = b.totalCustomers;
          break;
        case "aov":
          valueA = a.aov;
          valueB = b.aov;
          break;
        default:
          valueA = a.totalSales;
          valueB = b.totalSales;
      }

      return sortOrder === "desc" ? valueB - valueA : valueA - valueB;
    });

    return filtered;
  }, [
    affiliatesData,
    selectedPlatforms,
    minSales,
    maxSales,
    minRevenue,
    maxRevenue,
    minCommission,
    maxCommission,
    minProfit,
    maxProfit,
    minCustomers,
    maxCustomers,
    minAov,
    maxAov,
    sortBy,
    sortOrder,
  ]);

  // Filtrar por busca
  const searchedAffiliates = useMemo(() => {
    if (!searchQuery.trim()) {
      return filteredAffiliates;
    }

    const query = searchQuery.toLowerCase();

    return filteredAffiliates.filter((item) => {
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
  }, [filteredAffiliates, searchQuery]);

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

  // Limpar todos os filtros
  const handleClearFilters = () => {
    setSelectedPlatforms([]);
    setMinSales("");
    setMaxSales("");
    setMinRevenue("");
    setMaxRevenue("");
    setMinCommission("");
    setMaxCommission("");
    setMinProfit("");
    setMaxProfit("");
    setMinCustomers("");
    setMaxCustomers("");
    setMinAov("");
    setMaxAov("");
    setCurrentPage(1);
  };

  return (
    <div className="container p-4 mx-auto space-y-6 md:p-8">
      {/* Barra de Pesquisa com Filtros */}
      <AffiliateSearch
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        totalResults={searchedAffiliates.length}
        isLoading={isLoading}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        platforms={availablePlatforms}
        selectedPlatforms={selectedPlatforms}
        onPlatformsChange={setSelectedPlatforms}
        minSales={minSales}
        onMinSalesChange={setMinSales}
        maxSales={maxSales}
        onMaxSalesChange={setMaxSales}
        minRevenue={minRevenue}
        onMinRevenueChange={setMinRevenue}
        maxRevenue={maxRevenue}
        onMaxRevenueChange={setMaxRevenue}
        minCommission={minCommission}
        onMinCommissionChange={setMinCommission}
        maxCommission={maxCommission}
        onMaxCommissionChange={setMaxCommission}
        minProfit={minProfit}
        onMinProfitChange={setMinProfit}
        maxProfit={maxProfit}
        onMaxProfitChange={setMaxProfit}
        minCustomers={minCustomers}
        onMinCustomersChange={setMinCustomers}
        maxCustomers={maxCustomers}
        onMaxCustomersChange={setMaxCustomers}
        minAov={minAov}
        onMinAovChange={setMinAov}
        maxAov={maxAov}
        onMaxAovChange={setMaxAov}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        onClearFilters={handleClearFilters}
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
