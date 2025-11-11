import React, { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { type SaleRecord, transformSupabaseSaleToRecord } from "@/lib/data";
import { type Product as ProductConfig } from "@/lib/config";
import { useDashboardConfig } from "@/hooks/useDashboardConfig";
import { DashboardDataContext } from "./DashboardDataContextDefinition";

const MAX_RECORDS_FOR_DASHBOARD_STATS = 50000;

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
  const [isFetchingProducts, setIsFetchingProducts] = useState(true);

  const fetchProducts = useCallback(async () => {
    setIsFetchingProducts(true);
    const { data, error } = await supabase
      .from("config_products")
      .select("merchant_id, product_name")
      .order("product_name");

    if (error) {
      console.error("Error fetching products:", error);
    } else if (data) {
      const productsForFilter = data.map((p) => ({
        id: p.merchant_id,
        name: p.product_name,
      }));
      setAvailableProducts([
        { id: "all", name: "All Products" },
        ...productsForFilter,
      ]);
    }
    setIsFetchingProducts(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const fetchAndFilterData = useCallback(async () => {
    if (
      isDateRangeLoading ||
      (isFetchingProducts &&
        selectedProduct !== "all" &&
        availableProducts.length <= 1) ||
      !currentDateRange ||
      !currentDateRange.from ||
      !currentDateRange.to
    ) {
      setIsLoadingData(false);
      setFilteredSalesData([]);
      return;
    }

    setIsLoadingData(true);

    const queryFromUTC = currentDateRange.from.toISOString();
    const queryToUTC = currentDateRange.to.toISOString();
    const dateDbColumn = getCurrentDateDbColumn();

    let query = supabase
      .from("sales_data")
      .select(
        "*,config_products!inner(merchant_id,product_name,platform_tax,platform_transaction_tax)"
      )
      .gte(dateDbColumn, queryFromUTC)
      .lte(dateDbColumn, queryToUTC);

    if (selectedProduct !== "all") {
      query = query.eq("merchant_id", selectedProduct);
    }

    if (selectedActionType !== "all") {
      switch (selectedActionType) {
        case "all_incomes":
          query = query.eq("action_type", "neworder");
          break;
        case "front_sale":
          query = query.eq("action_type", "neworder").eq("upsell", false);
          break;
        case "back_sale":
          query = query.eq("action_type", "neworder").eq("upsell", true);
          break;
        case "rebill":
          query = query.eq("action_type", "rebill");
          break;
        case "all_refunds":
          query = query.in("action_type", [
            "chargebackrefundtime",
            "refund",
            "chargeback",
          ]);
          break;
      }
    }

    query = query.limit(MAX_RECORDS_FOR_DASHBOARD_STATS);
    query = query.order(dateDbColumn, { ascending: true });

    const { data: rawSalesData, error } = await query;

    if (error) {
      console.error("Error fetching sales data:", error);
      setFilteredSalesData([]);
    } else if (rawSalesData) {
      if (rawSalesData.length === MAX_RECORDS_FOR_DASHBOARD_STATS) {
        console.warn(
          `Warning: Dashboard query reached the maximum limit of ${MAX_RECORDS_FOR_DASHBOARD_STATS} records.`
        );
      }
      const transformedData = rawSalesData.map(transformSupabaseSaleToRecord);
      setFilteredSalesData(transformedData);
    } else {
      setFilteredSalesData([]);
    }
    setIsLoadingData(false);
  }, [
    currentDateRange,
    selectedProduct,
    selectedActionType,
    isFetchingProducts,
    availableProducts,
    isDateRangeLoading,
    getCurrentDateDbColumn,
  ]);

  useEffect(() => {
    fetchAndFilterData();
  }, [fetchAndFilterData]);

  const stats = useMemo(() => {
    const totalRevenue = filteredSalesData.reduce(
      (sum, record) => sum + record.revenue,
      0
    );
    const totalTaxes = filteredSalesData.reduce(
      (sum, record) => sum + (record.taxes || 0),
      0
    );
    const platformFeePercentage = filteredSalesData.reduce(
      (sum, record) => sum + record.revenue * (record.platform_tax || 0),
      0
    );
    const platformFeeFixed = filteredSalesData.reduce(
      (sum, record) => sum + (record.platform_transaction_tax || 0),
      0
    );
    const totalPlatformFees = platformFeePercentage + platformFeeFixed;
    const grossSales = totalRevenue - totalPlatformFees - totalTaxes;

    const totalSalesTransactions = filteredSalesData.length;
    const frontSalesCount = filteredSalesData.filter(
      (record) => record.action_type === "front_sale"
    ).length;
    const backSalesCount = filteredSalesData.filter(
      (record) => record.action_type === "back_sale"
    ).length;

    const averageOrderValue =
      frontSalesCount > 0 ? grossSales / frontSalesCount : 0;

    return {
      totalRevenue,
      grossSales,
      totalTaxes,
      platformFeePercentage,
      platformFeeFixed,
      totalPlatformFees,
      totalSalesTransactions,
      frontSalesCount,
      backSalesCount,
      averageOrderValue,
    };
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
