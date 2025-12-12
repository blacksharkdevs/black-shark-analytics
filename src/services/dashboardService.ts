import { httpClient } from "@/lib/httpClient";
import { type Transaction } from "@/types/index";

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
 * @returns {Promise<Transaction[]>} Uma Promise com os dados transformados.
 */
export async function fetchSalesDataForDashboard(
  params: FetchDashboardDataParams
): Promise<Transaction[]> {
  const { currentDateRange, selectedProduct, selectedActionType } = params;

  try {
    // Construir query params
    const queryParams = new URLSearchParams();

    // Filtros de data
    queryParams.append("startDate", currentDateRange.from.toISOString());
    queryParams.append("endDate", currentDateRange.to.toISOString());

    // Filtro de produto
    if (selectedProduct !== "all") {
      queryParams.append("productId", selectedProduct);
    }

    // Filtro de tipo de ação/transação
    if (selectedActionType !== "all") {
      // Mapear action types legados para os novos tipos
      const typeMapping: Record<string, string> = {
        all_incomes: "SALE",
        front_sale: "SALE",
        back_sale: "SALE",
        rebill: "REBILL",
        all_refunds: "REFUND",
      };

      const mappedType = typeMapping[selectedActionType];
      if (mappedType) {
        queryParams.append("type", mappedType);
      }

      // Filtros adicionais para offerType se necessário
      if (selectedActionType === "front_sale") {
        queryParams.append("offerType", "FRONTEND");
      } else if (selectedActionType === "back_sale") {
        queryParams.append("offerType", "UPSELL,DOWNSELL,ORDER_BUMP");
      }
    }

    // Limite de registros
    queryParams.append("limit", MAX_RECORDS_FOR_DASHBOARD_STATS.toString());

    // Fazer requisição
    const transactions = await httpClient.get<Transaction[]>(
      `/api/v1/transactions?${queryParams.toString()}`
    );

    if (transactions.length === MAX_RECORDS_FOR_DASHBOARD_STATS) {
      console.warn(
        `Warning: Dashboard query reached the maximum limit of ${MAX_RECORDS_FOR_DASHBOARD_STATS} records.`
      );
    }

    return transactions;
  } catch (error) {
    console.error("Error fetching sales data:", error);
    return [];
  }
}
