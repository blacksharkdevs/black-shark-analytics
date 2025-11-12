import { supabase } from "@/lib/supabaseClient";
import { transformSupabaseSaleToRecord } from "@/lib/data";
import { applyActionTypeFilter } from "@/lib/transactionFilters";
import { applyServerSort } from "@/lib/transactionSort";
import { type SaleRecord, type SortColumn } from "@/types/index";

// Usamos 'any' aqui para o tipo de data range, pois não temos a definição exata do useDashboardConfig
type DateRange = { from: Date; to: Date } | null;

/**
 * Define a estrutura dos parâmetros necessários para buscar transações no servidor.
 */
export interface FetchTransactionsParams {
  currentDateRange: DateRange;
  getCurrentDateDbColumn: () => string;
  itemsPerPage: number;
  currentPage: number;
  selectedProduct: string;
  selectedPlatform: string;
  selectedActionType: string;
  sortColumn: SortColumn;
  sortDirection: "asc" | "desc";
}

/**
 * Resultado da busca de transações.
 */
export interface FetchTransactionsResult {
  data: SaleRecord[];
  count: number;
}

/**
 * Busca transações no Supabase, aplicando filtros, paginação e ordenação no servidor.
 * Esta função contém toda a lógica de construção da query SQL.
 *
 * @param params Os parâmetros de filtro e paginação.
 * @returns {Promise<FetchTransactionsResult>} Uma Promise com os dados transformados e a contagem total.
 */
export async function fetchTransactions(
  params: FetchTransactionsParams
): Promise<FetchTransactionsResult> {
  const {
    currentDateRange,
    getCurrentDateDbColumn,
    itemsPerPage: limit,
    currentPage: page,
    selectedProduct,
    selectedPlatform,
    selectedActionType,
    sortColumn,
    sortDirection,
  } = params;

  const dateDbColumnToFilter = getCurrentDateDbColumn();
  const fromRange = (page - 1) * limit;
  const toRange = fromRange + limit - 1;

  // A validação de data range é responsabilidade do Provider/Hook que chama,
  // mas adicionamos guards para garantir que a query seja segura.
  if (!currentDateRange || !currentDateRange.from || !currentDateRange.to) {
    return { data: [], count: 0 };
  }

  const queryFromUTC = currentDateRange.from.toISOString();
  const queryToUTC = currentDateRange.to.toISOString();

  let query = supabase
    .from("sales_data")
    .select("*,customer_firstname,customer_lastname,config_products!inner(*)", {
      count: "exact",
    })
    .gte(dateDbColumnToFilter, queryFromUTC)
    .lte(dateDbColumnToFilter, queryToUTC);

  // 1. Aplicação de filtros básicos
  if (selectedProduct !== "all") {
    query = query.eq("merchant_id", selectedProduct);
  }
  if (selectedPlatform !== "all") {
    query = query.eq("platform", selectedPlatform);
  }

  // 2. Aplicação de filtros de Ação (logica externa)
  query = applyActionTypeFilter(query, selectedActionType);

  // 3. Ordenação dinâmica (logica externa)
  if (sortColumn && sortColumn !== "net_sales") {
    query = applyServerSort(query, sortColumn, sortDirection);
  } else {
    // Ordenação padrão por data se for Net Sales (cliente) ou nenhum sort.
    query = query.order(dateDbColumnToFilter, { ascending: false });
  }

  // 4. Paginação no servidor
  query = query.range(fromRange, toRange);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching transactions:", error);
    return { data: [], count: 0 };
  }

  if (data) {
    const transformedData = data.map(transformSupabaseSaleToRecord);
    return { data: transformedData, count: count || 0 };
  }

  return { data: [], count: 0 };
}
