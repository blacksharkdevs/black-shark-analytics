import { supabase } from "@/lib/supabaseClient";
import { transformSupabaseSaleToRecord } from "@/lib/data";
import { MAX_RECORDS_FOR_REPORTS } from "@/lib/reportFilters";
import type { SaleRecord } from "../types";
import type { SkuConfig } from "@/contexts/ReportsContextDefinition";

type DateDbColumn = "transaction_date" | "calc_charged_day";

interface ReportFilters {
  dateRange: { from: Date; to: Date };
  dateDbColumn: DateDbColumn;
  selectedProduct: string;
  selectedPlatform: string;
  selectedActionType: string;
}

/**
 * Busca os dados de vendas e SKUs do Supabase com base nos filtros.
 */
export async function fetchReportData(
  filters: ReportFilters
): Promise<[SaleRecord[], SkuConfig[]]> {
  const {
    dateRange,
    dateDbColumn,
    selectedProduct,
    selectedPlatform,
    selectedActionType,
  } = filters;

  const queryFromUTC = dateRange.from.toISOString();
  const queryToUTC = dateRange.to.toISOString();

  let salesQuery = supabase
    .from("sales_data")
    .select(
      "sale_id,transaction_date,calc_charged_day,total_amount_charged,product_quantity,merchant_id,action_type,upsell,customer_email,aff_name,product_name,platform,config_products!inner(merchant_id,product_name)"
    )
    .gte(dateDbColumn, queryFromUTC)
    .lte(dateDbColumn, queryToUTC);

  if (selectedProduct !== "all") {
    salesQuery = salesQuery.eq("merchant_id", selectedProduct);
  }
  if (selectedPlatform !== "all") {
    salesQuery = salesQuery.eq("platform", selectedPlatform);
  }
  if (selectedActionType !== "all") {
    switch (selectedActionType) {
      case "all_incomes":
        salesQuery = salesQuery.eq("action_type", "neworder");
        break;
      case "front_sale":
        salesQuery = salesQuery
          .eq("action_type", "neworder")
          .eq("upsell", false);
        break;
      case "back_sale":
        salesQuery = salesQuery
          .eq("action_type", "neworder")
          .eq("upsell", true);
        break;
      case "rebill":
        salesQuery = salesQuery.eq("action_type", "rebill");
        break;
      case "all_refunds":
        salesQuery = salesQuery.in("action_type", [
          "chargebackrefundtime",
          "refund",
          "chargeback",
        ]);
        break;
    }
  }

  salesQuery = salesQuery
    .limit(MAX_RECORDS_FOR_REPORTS)
    .order(dateDbColumn, { ascending: true });

  const [salesResult, skuResult] = await Promise.all([
    salesQuery,
    supabase
      .from("products_skus")
      .select("merchant_id, original_name, unit_count"),
  ]);

  // Processar Vendas
  let allSalesData: SaleRecord[] = [];
  if (salesResult.error) {
    console.error("Error fetching sales data:", salesResult.error);
  } else if (salesResult.data) {
    if (salesResult.data.length === MAX_RECORDS_FOR_REPORTS) {
      console.warn(
        `Warning: Report query reached the maximum limit of ${MAX_RECORDS_FOR_REPORTS} records.`
      );
    }
    allSalesData = salesResult.data.map(transformSupabaseSaleToRecord);
  }

  // Processar SKUs
  let skuConfigs: SkuConfig[] = [];
  if (skuResult.error) {
    console.error("Error fetching SKU configs:", skuResult.error);
  } else {
    skuConfigs = (skuResult.data as SkuConfig[]) || [];
  }

  return [allSalesData, skuConfigs];
}

/**
 * Busca os produtos disponíveis para o filtro.
 */
export async function fetchProductsFilter() {
  const { data, error } = await supabase
    .from("config_products")
    .select("merchant_id, product_name")
    .order("product_name");

  if (error) {
    return [{ id: "all", name: "All Products" }];
  }

  const productsForFilter = data.map((p) => ({
    id: p.merchant_id,
    name: p.product_name,
  }));
  return [{ id: "all", name: "All Products" }, ...productsForFilter];
}

/**
 * Busca as plataformas disponíveis para o filtro.
 */
export async function fetchPlatformsFilter() {
  const { data, error } = await supabase.rpc("get_distinct_sales_platforms");

  if (error) {
    return [];
  }

  const distinctPlatforms = data
    .map((item: { platform: string }) => item.platform)
    .sort();
  return distinctPlatforms;
}
