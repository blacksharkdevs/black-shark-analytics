import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDashboardConfig } from "@/hooks/useDashboardConfig";
import { AffiliateDetailContext } from "./AffiliateDetailContextDefinition";
import type {
  AffiliateStats,
  ProductPerformance,
} from "./AffiliateDetailContextDefinition";
import { fetchAllAffiliateTransactions } from "@/services/affiliateTransactionService";
import { calculateRefund } from "@/utils/index";
import type { SaleRecord } from "@/types/index";

const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100];

interface AffiliateDetailProviderProps {
  children: React.ReactNode;
  affiliateName: string;
}

export function AffiliateDetailProvider({
  children,
  affiliateName,
}: AffiliateDetailProviderProps) {
  // CONSUMO DE CONTEXTO EXTERNO
  const {
    currentDateRange,
    getCurrentDateDbColumn,
    isLoading: isDateRangeLoading,
  } = useDashboardConfig();

  // ESTADOS PRINCIPAIS
  const [allTransactions, setAllTransactions] = useState<SaleRecord[]>([]); // TODAS as transações (para stats)
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ROWS_PER_PAGE_OPTIONS[1]);

  // --- FETCH ALL TRANSACTIONS (para stats e gráfico) ---
  const fetchAllTransactionsData = useCallback(async () => {
    console.log("🏗️ [AffiliateDetailContext] Initializing fetch for:", {
      affiliateName,
      dateRangeLoading: isDateRangeLoading,
      hasDateRange: !!currentDateRange,
    });

    // GUARD: Evita fetch se houver dependências de carregamento
    if (
      isDateRangeLoading ||
      !currentDateRange ||
      !currentDateRange.from ||
      !currentDateRange.to ||
      !affiliateName
    ) {
      console.log("⏸️ [AffiliateDetailContext] Waiting for dependencies");
      setAllTransactions([]);
      setIsLoadingData(false);
      return;
    }

    setIsLoadingData(true);

    try {
      console.log("🚀 [AffiliateDetailContext] Fetching ALL transactions");
      const { data, count } = await fetchAllAffiliateTransactions({
        affiliateName,
        currentDateRange,
        getCurrentDateDbColumn,
      });

      console.log("✅ [AffiliateDetailContext] Fetched ALL:", {
        records: data.length,
        total: count,
      });

      setAllTransactions(data);
    } catch (error) {
      console.error("❌ [AffiliateDetailContext] Error fetching:", error);
      setAllTransactions([]);
    } finally {
      setIsLoadingData(false);
    }
  }, [
    isDateRangeLoading,
    currentDateRange,
    getCurrentDateDbColumn,
    affiliateName,
  ]);

  useEffect(() => {
    fetchAllTransactionsData();
  }, [fetchAllTransactionsData]);

  // --- PAGINAÇÃO CLIENT-SIDE (das transações já carregadas) ---
  const totalTransactions = allTransactions.length;
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return allTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [allTransactions, currentPage, itemsPerPage]);

  // --- CÁLCULOS DE STATS AGREGADAS ---
  const stats = useMemo((): AffiliateStats => {
    // Separar transações por tipo (igual ao código antigo)
    const incomeTransactions = allTransactions.filter((t) =>
      ["front_sale", "back_sale", "rebill"].includes(t.action_type)
    );
    const refundTransactions = allTransactions.filter((t) =>
      ["refund", "chargeback", "chargebackrefundtime"].includes(t.action_type)
    );
    const frontSalesTransactions = incomeTransactions.filter(
      (t) => t.action_type === "front_sale"
    );

    // Gross Sales = Revenue - Platform Fees - Taxes (apenas de income transactions)
    const totalRevenue = incomeTransactions.reduce(
      (sum, t) => sum + t.revenue,
      0
    );
    const totalTaxes = incomeTransactions.reduce(
      (sum, t) => sum + (t.taxes || 0),
      0
    );
    const platformFeePercentage = incomeTransactions.reduce(
      (sum, t) => sum + t.revenue * (t.platform_tax || 0),
      0
    );
    const platformFeeFixed = incomeTransactions.reduce(
      (sum, t) => sum + (t.platform_transaction_tax || 0),
      0
    );
    const totalPlatformFees = platformFeePercentage + platformFeeFixed;
    const grossSales = totalRevenue - totalPlatformFees - totalTaxes;

    // Net Sales = Gross Sales - Commission
    const commissionPaid = incomeTransactions.reduce(
      (sum, t) => sum + (t.aff_commission || 0),
      0
    );
    const netSales = grossSales - commissionPaid;

    // Total Refunds Cost
    const totalRefundsCost = refundTransactions.reduce(
      (sum, t) => sum + calculateRefund(t),
      0
    );

    // Net Final = Net Sales - Refunds Cost
    const netFinal = netSales - totalRefundsCost;

    // COGS apenas de Front Sales
    const totalCOGS = frontSalesTransactions.reduce(
      (sum, t) => sum + (t.temp_cogs_per_user || 0),
      0
    );

    // Profit = Net Final - COGS
    const totalProfit = netFinal - totalCOGS;

    // AOV = Gross Sales / Front Sales Count
    const frontSalesCount = frontSalesTransactions.length;
    const totalSalesCount = incomeTransactions.length;
    const aov = frontSalesCount > 0 ? grossSales / frontSalesCount : 0;

    return {
      grossSales,
      totalSales: totalSalesCount,
      aov,
      totalRefunds: -totalRefundsCost, // Negativo para mostrar como custo
      netFinal,
      totalCOGS,
      totalProfit,
    };
  }, [allTransactions]);

  // Income transactions for chart
  const incomeTransactions = useMemo(() => {
    return allTransactions.filter((t) =>
      ["front_sale", "back_sale", "rebill"].includes(t.action_type)
    );
  }, [allTransactions]);

  // --- CÁLCULOS DE PERFORMANCE POR PRODUTO ---
  const productPerformance = useMemo((): ProductPerformance[] => {
    const productMap = new Map<
      string,
      {
        productName: string;
        incomeTransactions: SaleRecord[];
        refundTransactions: SaleRecord[];
      }
    >();

    allTransactions.forEach((t) => {
      const productName = t.product_name || "Unknown";
      if (!productMap.has(productName)) {
        productMap.set(productName, {
          productName,
          incomeTransactions: [],
          refundTransactions: [],
        });
      }
      const productData = productMap.get(productName)!;

      if (["front_sale", "back_sale", "rebill"].includes(t.action_type)) {
        productData.incomeTransactions.push(t);
      } else if (
        ["refund", "chargeback", "chargebackrefundtime"].includes(t.action_type)
      ) {
        productData.refundTransactions.push(t);
      }
    });

    const performanceData = Array.from(productMap.values()).map((p) => {
      const frontSalesTransactions = p.incomeTransactions.filter(
        (t) => t.action_type === "front_sale"
      );

      // Gross Sales = Revenue - Platform Fees - Taxes
      const totalRevenue = p.incomeTransactions.reduce(
        (sum, t) => sum + t.revenue,
        0
      );
      const totalTaxes = p.incomeTransactions.reduce(
        (sum, t) => sum + (t.taxes || 0),
        0
      );
      const platformFeePercentage = p.incomeTransactions.reduce(
        (sum, t) => sum + t.revenue * (t.platform_tax || 0),
        0
      );
      const platformFeeFixed = p.incomeTransactions.reduce(
        (sum, t) => sum + (t.platform_transaction_tax || 0),
        0
      );
      const totalPlatformFees = platformFeePercentage + platformFeeFixed;
      const grossSales = totalRevenue - totalPlatformFees - totalTaxes;

      // Net Sales = Gross Sales - Commission
      const commissionPaid = p.incomeTransactions.reduce(
        (sum, t) => sum + (t.aff_commission || 0),
        0
      );
      const netSales = grossSales - commissionPaid;

      // Refunds Cost
      const totalRefundsCost = p.refundTransactions.reduce(
        (sum, t) => sum + calculateRefund(t),
        0
      );

      // Net Final = Net Sales - Refunds Cost
      const netFinal = netSales - totalRefundsCost;

      // COGS apenas de Front Sales
      const cogs = frontSalesTransactions.reduce(
        (sum, t) => sum + (t.temp_cogs_per_user || 0),
        0
      );

      // Profit = Net Final - COGS
      const profit = netFinal - cogs;

      // AOV = Gross Sales / Front Sales Count
      const frontSalesCount = frontSalesTransactions.length;
      const aov = frontSalesCount > 0 ? grossSales / frontSalesCount : 0;

      return {
        product_name: p.productName,
        sales_count: p.incomeTransactions.length,
        gross_sales: grossSales,
        aov,
        refunds: totalRefundsCost,
        net_sales: netFinal,
        cogs,
        profit,
      };
    });

    // Sort by profit descending
    return performanceData.sort((a, b) => b.profit - a.profit);
  }, [allTransactions]);

  // --- HANDLERS ---
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value, 10));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => setCurrentPage(page);

  // --- CONTEXT VALUE ---
  const contextValue = {
    affiliateName,
    transactions: paginatedTransactions, // Transações paginadas para a tabela
    incomeTransactions,
    isLoading: isLoadingData || isDateRangeLoading,
    stats,
    productPerformance,
    pagination: {
      currentPage,
      totalTransactions,
      itemsPerPage,
      handleItemsPerPageChange,
      handlePageChange,
      totalPages: Math.ceil(totalTransactions / itemsPerPage),
      ROWS_PER_PAGE_OPTIONS,
    },
  };

  return (
    <AffiliateDetailContext.Provider value={contextValue}>
      {children}
    </AffiliateDetailContext.Provider>
  );
}
