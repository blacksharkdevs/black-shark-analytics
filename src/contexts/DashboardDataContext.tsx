import React, { useState, useEffect, useMemo, useCallback } from "react";
// Removemos supabase e transformSupabaseSaleToRecord
import { type Product as ProductConfig } from "@/lib/config";
import { useDashboardConfig } from "@/hooks/useDashboardConfig";
import { DashboardDataContext } from "./DashboardDataContextDefinition";
import type { SaleRecord } from "@/types/index";

// Serviços e Lógica Reutilizada
import { fetchProductsForFilter } from "@/services/configService"; // Reutiliza
import { fetchSalesDataForDashboard } from "@/services/dashboardService"; // Novo serviço de fetch
import { calculateDashboardStats } from "@/lib/dashboardCalculations"; // Nova lógica de cálculo

// Não é mais necessário, pois está no Service
// const MAX_RECORDS_FOR_DASHBOARD_STATS = 50000;

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

  const [filteredSalesData, setFilteredSalesData] = useState<SaleRecord[]>([]);
  const [availableProducts, setAvailableProducts] = useState<ProductConfig[]>([
    { id: "all", name: "All Products" },
  ]);
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  const [selectedActionType, setSelectedActionType] = useState<string>("all");
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isFetchingProducts, setIsFetchingProducts] = useState(true); // ➡️ REFACTOR 1.1: Usando o serviço de config (reutilizado do Transactions)

  useEffect(() => {
    const loadProducts = async () => {
      setIsFetchingProducts(true);
      const products = await fetchProductsForFilter();
      setAvailableProducts(products);
      setIsFetchingProducts(false);
    };
    loadProducts();
  }, []); // ➡️ REFACTOR 2.1: Função de fetch limpa, apenas chama o serviço

  const fetchAndFilterData = useCallback(async () => {
    // 1. GUARDS: Verifica dependências de carregamento e dados de filtro
    if (
      isDateRangeLoading ||
      isFetchingProducts ||
      !currentDateRange ||
      !currentDateRange.from ||
      !currentDateRange.to
    ) {
      setIsLoadingData(false);
      setFilteredSalesData([]);
      return;
    }

    setIsLoadingData(true);

    try {
      // 2. Chamada do Service
      const salesData = await fetchSalesDataForDashboard({
        currentDateRange,
        getCurrentDateDbColumn,
        selectedProduct,
        selectedActionType,
      });

      // 3. Atualiza estado
      setFilteredSalesData(salesData);
    } catch (error) {
      console.error("Erro ao buscar dados do Dashboard no Service:", error);
      setFilteredSalesData([]);
    } finally {
      setIsLoadingData(false);
    }
  }, [
    currentDateRange,
    selectedProduct,
    selectedActionType,
    isFetchingProducts,
    isDateRangeLoading,
    getCurrentDateDbColumn,
  ]);

  useEffect(() => {
    fetchAndFilterData();
  }, [fetchAndFilterData]); // ➡️ REFACTOR 3.1: Cálculos de métricas isolados (Usando função pura)

  const stats = useMemo(() => {
    // Apenas passa o dado filtrado para a função de cálculo
    return calculateDashboardStats(filteredSalesData);
  }, [filteredSalesData]);

  const contextValue = {
    filteredSalesData,
    availableProducts,
    selectedProduct,
    setSelectedProduct,
    selectedActionType,
    setSelectedActionType,
    stats,
    isLoadingData,
    isFetchingProducts,
  };

  return (
    <DashboardDataContext.Provider value={contextValue}>
      {children}
    </DashboardDataContext.Provider>
  );
}
