import { supabase } from "@/lib/supabaseClient";
import { transformSupabaseSaleToRecord } from "@/lib/data";
import { type SaleRecord } from "@/types/index";

type DateRange = { from: Date; to: Date } | null;

/**
 * Parâmetros para buscar transações de um afiliado específico.
 */
export interface FetchAffiliateTransactionsParams {
  affiliateName: string;
  currentDateRange: DateRange;
  getCurrentDateDbColumn: () => string;
}

/**
 * Parâmetros para buscar transações paginadas.
 */
export interface FetchAffiliateTransactionsPaginatedParams
  extends FetchAffiliateTransactionsParams {
  itemsPerPage: number;
  currentPage: number;
}

/**
 * Resultado da busca de transações do afiliado.
 */
export interface FetchAffiliateTransactionsResult {
  data: SaleRecord[];
  count: number;
}

/**
 * Busca TODAS as transações de um afiliado específico (sem paginação).
 * Usado para cálculos de stats, gráficos e performance por produto.
 *
 * @param params - Parâmetros incluindo nome do afiliado e date range
 * @returns Promise com todos os dados transformados e a contagem total
 */
export async function fetchAllAffiliateTransactions(
  params: FetchAffiliateTransactionsParams
): Promise<FetchAffiliateTransactionsResult> {
  const { affiliateName, currentDateRange, getCurrentDateDbColumn } = params;

  const dateDbColumnToFilter = getCurrentDateDbColumn();

  // Guard: Validate date range
  if (!currentDateRange || !currentDateRange.from || !currentDateRange.to) {
    console.warn("⚠️ [AffiliateTransactionService] Invalid date range");
    return { data: [], count: 0 };
  }

  // Guard: Validate affiliate name
  if (!affiliateName || affiliateName.trim() === "") {
    console.warn("⚠️ [AffiliateTransactionService] Invalid affiliate name");
    return { data: [], count: 0 };
  }

  const queryFromUTC = currentDateRange.from.toISOString();
  const queryToUTC = currentDateRange.to.toISOString();

  console.log(
    "🔍 [AffiliateTransactionService] Fetching ALL transactions for:",
    {
      affiliateName,
      dateRange: { from: queryFromUTC, to: queryToUTC },
    }
  );

  try {
    const query = supabase
      .from("sales_data")
      .select("*, config_products!inner(*)", {
        count: "exact",
      })
      .eq("aff_name", affiliateName)
      .gte(dateDbColumnToFilter, queryFromUTC)
      .lte(dateDbColumnToFilter, queryToUTC)
      .order("transaction_date", { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error("❌ [AffiliateTransactionService] Error fetching:", error);
      return { data: [], count: 0 };
    }

    if (data) {
      const transformedData = data.map(transformSupabaseSaleToRecord);
      console.log("✅ [AffiliateTransactionService] Fetched ALL:", {
        records: transformedData.length,
        total: count,
      });
      return { data: transformedData, count: count || 0 };
    }

    return { data: [], count: 0 };
  } catch (err) {
    console.error("❌ [AffiliateTransactionService] Unexpected error:", err);
    return { data: [], count: 0 };
  }
}

/**
 * Busca transações paginadas de um afiliado específico.
 * Usado apenas para exibição na tabela de transações.
 *
 * @param params - Parâmetros incluindo nome do afiliado, date range e paginação
 * @returns Promise com os dados paginados transformados e a contagem total
 */
export async function fetchAffiliateTransactions(
  params: FetchAffiliateTransactionsPaginatedParams
): Promise<FetchAffiliateTransactionsResult> {
  const {
    affiliateName,
    currentDateRange,
    getCurrentDateDbColumn,
    itemsPerPage: limit,
    currentPage: page,
  } = params;

  const dateDbColumnToFilter = getCurrentDateDbColumn();
  const fromRange = (page - 1) * limit;
  const toRange = fromRange + limit - 1;

  // Guard: Validate date range
  if (!currentDateRange || !currentDateRange.from || !currentDateRange.to) {
    console.warn("⚠️ [AffiliateTransactionService] Invalid date range");
    return { data: [], count: 0 };
  }

  // Guard: Validate affiliate name
  if (!affiliateName || affiliateName.trim() === "") {
    console.warn("⚠️ [AffiliateTransactionService] Invalid affiliate name");
    return { data: [], count: 0 };
  }

  const queryFromUTC = currentDateRange.from.toISOString();
  const queryToUTC = currentDateRange.to.toISOString();

  console.log("🔍 [AffiliateTransactionService] Fetching transactions for:", {
    affiliateName,
    dateRange: { from: queryFromUTC, to: queryToUTC },
    page,
    limit,
  });

  try {
    const query = supabase
      .from("sales_data")
      .select("*, config_products!inner(*)", {
        count: "exact",
      })
      .eq("aff_name", affiliateName)
      .gte(dateDbColumnToFilter, queryFromUTC)
      .lte(dateDbColumnToFilter, queryToUTC)
      .order(dateDbColumnToFilter, { ascending: false })
      .range(fromRange, toRange);

    const { data, error, count } = await query;

    if (error) {
      console.error("❌ [AffiliateTransactionService] Error fetching:", error);
      return { data: [], count: 0 };
    }

    if (data) {
      const transformedData = data.map(transformSupabaseSaleToRecord);
      console.log("✅ [AffiliateTransactionService] Fetched:", {
        records: transformedData.length,
        total: count,
      });
      return { data: transformedData, count: count || 0 };
    }

    return { data: [], count: 0 };
  } catch (err) {
    console.error("❌ [AffiliateTransactionService] Unexpected error:", err);
    return { data: [], count: 0 };
  }
}
