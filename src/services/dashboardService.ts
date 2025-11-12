import { supabase } from "@/lib/supabaseClient";
import { transformSupabaseSaleToRecord } from "@/lib/data";
import { applyActionTypeFilter } from "@/lib/transactionFilters";
import { type SaleRecord } from "@/types/index"; // Assumindo que os tipos estão aqui

// Definição do limite máximo de registros para garantir performance do cálculo no cliente
const MAX_RECORDS_FOR_DASHBOARD_STATS = 50000;

// Tipagem necessária
type DateRange = { from: Date; to: Date };

/**
 * Define a estrutura dos parâmetros necessários para buscar dados do Dashboard.
 */
export interface FetchDashboardDataParams {
  currentDateRange: DateRange;
  getCurrentDateDbColumn: () => string;
  selectedProduct: string;
  selectedActionType: string;
}

/**
 * Busca e filtra os dados de vendas para o Dashboard.
 * Aplica filtros de data, produto e tipo de ação, limitando o número de registros.
 *
 * @param params Os parâmetros de filtro.
 * @returns {Promise<SaleRecord[]>} Uma Promise com os dados transformados.
 */
export async function fetchSalesDataForDashboard(
  params: FetchDashboardDataParams
): Promise<SaleRecord[]> {
  const {
    currentDateRange,
    getCurrentDateDbColumn,
    selectedProduct,
    selectedActionType,
  } = params;

  const queryFromUTC = currentDateRange.from.toISOString();
  const queryToUTC = currentDateRange.to.toISOString();
  const dateDbColumn = getCurrentDateDbColumn();

  let query = supabase
    .from("sales_data")
    .select(
      // Seleção de colunas otimizada para os cálculos do dashboard
      "*,config_products!inner(merchant_id,product_name,platform_tax,platform_transaction_tax)"
    )
    .gte(dateDbColumn, queryFromUTC)
    .lte(dateDbColumn, queryToUTC);

  // Aplicação de filtros de Produto
  if (selectedProduct !== "all") {
    query = query.eq("merchant_id", selectedProduct);
  }

  // Aplicação de filtros de Ação (reutilizando a lógica do Transactions)
  query = applyActionTypeFilter(query, selectedActionType);

  // Limitação e Ordenação
  query = query.limit(MAX_RECORDS_FOR_DASHBOARD_STATS);
  query = query.order(dateDbColumn, { ascending: true }); // Ordena para gráficos de tendência

  const { data: rawSalesData, error } = await query;

  if (error) {
    console.error("Error fetching sales data:", error);
    return [];
  }

  if (rawSalesData && rawSalesData.length === MAX_RECORDS_FOR_DASHBOARD_STATS) {
    console.warn(
      `Warning: Dashboard query reached the maximum limit of ${MAX_RECORDS_FOR_DASHBOARD_STATS} records.`
    );
  }

  // Transforma e retorna
  return rawSalesData ? rawSalesData.map(transformSupabaseSaleToRecord) : [];
}
