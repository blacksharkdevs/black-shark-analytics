import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDashboardConfig } from "@/hooks/useDashboardConfig";
import { DashboardDataContext } from "./DashboardDataContextDefinition";
import type { Transaction } from "@/types/index";

import { fetchSalesDataForDashboard } from "@/services/dashboardService";
import { calculateDashboardStats } from "@/lib/dashboardCalculations";

export function DashboardDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    currentDateRange,
    getCurrentDateDbColumn,
    isLoading: isDateRangeLoading,
  } = useDashboardConfig();

  // Estado de dados brutos (todas as transações sem filtro de produto/offerType)
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);

  // Filtros
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  const [selectedOfferType, setSelectedOfferType] = useState<string>("all");

  // Loading states
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Buscar todas as transações (sem filtros de produto/offerType)
  const fetchAllTransactions = useCallback(async () => {
    if (
      isDateRangeLoading ||
      !currentDateRange ||
      !currentDateRange.from ||
      !currentDateRange.to
    ) {
      setIsLoadingData(false);
      setAllTransactions([]);
      return;
    }

    setIsLoadingData(true);

    try {
      // Buscar TODAS as transações do período (sem filtro de produto/offerType)
      const transactions = await fetchSalesDataForDashboard({
        currentDateRange,
        getCurrentDateDbColumn,
        selectedProduct: "all", // Forçar buscar todos
        selectedActionType: "all", // Forçar buscar todos
      });

      setAllTransactions(transactions);
    } catch (error) {
      console.error("Erro ao buscar dados do Dashboard:", error);
      setAllTransactions([]);
    } finally {
      setIsLoadingData(false);
    }
  }, [currentDateRange, isDateRangeLoading, getCurrentDateDbColumn]);

  useEffect(() => {
    fetchAllTransactions();
  }, [fetchAllTransactions]); // ➡️ REFACTOR 3.1: Cálculos de métricas isolados (Usando função pura)

  // Extrair produtos únicos das transações
  const availableProducts = useMemo(() => {
    const productsMap = new Map<string, { id: string; name: string }>();

    allTransactions.forEach((transaction) => {
      if (transaction.product && transaction.productId) {
        productsMap.set(transaction.productId, {
          id: transaction.productId,
          name: transaction.product.name,
        });
      }
    });

    const products = [
      { id: "all", name: "All Products" },
      ...Array.from(productsMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
    ];

    return products;
  }, [allTransactions]);

  // Extrair offerTypes únicos das transações
  const availableOfferTypes = useMemo(() => {
    const offerTypesSet = new Set<string>();

    allTransactions.forEach((transaction) => {
      if (transaction.offerType) {
        offerTypesSet.add(transaction.offerType);
      }
    });

    const offerTypes = [
      { id: "all", name: "All Offers" },
      ...Array.from(offerTypesSet)
        .sort()
        .map((type) => ({
          id: type,
          name: type.charAt(0) + type.slice(1).toLowerCase(),
        })),
    ];

    return offerTypes;
  }, [allTransactions]);

  // Extrair afiliados únicos das transações
  const availableAffiliates = useMemo(() => {
    const affiliatesMap = new Map<string, { id: string; name: string }>();

    allTransactions.forEach((transaction) => {
      if (transaction.affiliate && transaction.affiliateId) {
        const affiliateName =
          transaction.affiliate.name ||
          transaction.affiliate.email ||
          "Unknown";
        affiliatesMap.set(transaction.affiliateId, {
          id: transaction.affiliateId,
          name: affiliateName,
        });
      }
    });

    const affiliates = [
      { id: "all", name: "All Affiliates" },
      { id: "direct", name: "Direct (No Affiliate)" },
      ...Array.from(affiliatesMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
    ];

    return affiliates;
  }, [allTransactions]);

  // Aplicar filtros localmente
  const filteredSalesData = useMemo(() => {
    let filtered = allTransactions;

    // Filtro de produto
    if (selectedProduct !== "all") {
      filtered = filtered.filter((t) => t.productId === selectedProduct);
    }

    // Filtro de offerType
    if (selectedOfferType !== "all") {
      filtered = filtered.filter((t) => t.offerType === selectedOfferType);
    }

    return filtered;
  }, [allTransactions, selectedProduct, selectedOfferType]);

  // Calcular stats com dados filtrados
  const stats = useMemo(() => {
    return calculateDashboardStats(filteredSalesData);
  }, [filteredSalesData]);

  const contextValue = {
    filteredSalesData,
    availableProducts,
    availableOfferTypes,
    availableAffiliates,
    selectedProduct,
    setSelectedProduct,
    selectedOfferType,
    setSelectedOfferType,
    stats,
    isLoadingData,
  };

  return (
    <DashboardDataContext.Provider value={contextValue}>
      {children}
    </DashboardDataContext.Provider>
  );
}
