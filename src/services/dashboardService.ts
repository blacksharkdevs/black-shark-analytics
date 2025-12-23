import { supabase } from "@/lib/supabaseClient";
import { type Transaction } from "@/types/index";

const MAX_RECORDS_FOR_DASHBOARD_STATS = 50000;
const BATCH_SIZE = 1000;

type DateRange = { from: Date; to: Date };

export interface FetchDashboardDataParams {
  currentDateRange: DateRange;
  getCurrentDateDbColumn: () => string;
}

/**
 * Busca todas as transações do período usando Supabase.
 * Retorna dados com relações de produto, afiliado e customer.
 * Usa paginação para contornar limite de 1000 registros do Supabase.
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

    let allData: Transaction[] = [];
    let rangeStart = 0;
    let hasMore = true;

    // Buscar em lotes para contornar limite do Supabase
    while (hasMore && allData.length < MAX_RECORDS_FOR_DASHBOARD_STATS) {
      const rangeEnd = rangeStart + BATCH_SIZE - 1;

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
        .order(dateColumn, { ascending: false })
        .range(rangeStart, rangeEnd);

      if (error) {
        console.error("Erro ao buscar transações do Supabase:", error);
        break;
      }

      if (!data || data.length === 0) {
        hasMore = false;
        break;
      }

      allData = [...allData, ...(data as Transaction[])];

      // Se recebemos menos que o tamanho do lote, não há mais dados
      if (data.length < BATCH_SIZE) {
        hasMore = false;
      } else {
        rangeStart += BATCH_SIZE;
      }
    }

    if (allData.length >= MAX_RECORDS_FOR_DASHBOARD_STATS) {
      console.warn(
        `Aviso: Limite de ${MAX_RECORDS_FOR_DASHBOARD_STATS} registros atingido.`
      );
    }

    return allData;
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    return [];
  }
}
