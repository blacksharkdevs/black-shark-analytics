import { supabase } from "@/lib/supabaseClient";
import { type Transaction } from "@/types/index";

const MAX_RECORDS_FOR_DASHBOARD_STATS = 1000;

type DateRange = { from: Date; to: Date };

export interface FetchDashboardDataParams {
  currentDateRange: DateRange;
  getCurrentDateDbColumn: () => string;
}

/**
 * Busca todas as transações do período usando Supabase.
 * Retorna dados com relações de produto, afiliado e customer.
 */
export async function fetchSalesDataForDashboard(
  params: FetchDashboardDataParams
): Promise<Transaction[]> {
  const { currentDateRange, getCurrentDateDbColumn } = params;

  if (!currentDateRange?.from || !currentDateRange?.to) {
    return [];
  }

  try {
    const queryFromUTC = currentDateRange.from.toISOString();
    const queryToUTC = currentDateRange.to.toISOString();
    const dateColumn = getCurrentDateDbColumn();

    // Query Supabase com todas as relações
    const { data, error } = await supabase
      .from("transactions")
      .select(
        `
        *,
        product:products(*),
        affiliate:affiliates(*),
        customer:customers(*)
      `
      )
      .gte(dateColumn, queryFromUTC)
      .lte(dateColumn, queryToUTC)
      .limit(MAX_RECORDS_FOR_DASHBOARD_STATS)
      .order(dateColumn, { ascending: false });

    if (error) {
      console.error("Erro ao buscar transações do Supabase:", error);
      return [];
    }

    if (data && data.length === MAX_RECORDS_FOR_DASHBOARD_STATS) {
      console.warn(
        `Aviso: Limite de ${MAX_RECORDS_FOR_DASHBOARD_STATS} registros atingido.`
      );
    }

    return (data as Transaction[]) || [];
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    return [];
  }
}
