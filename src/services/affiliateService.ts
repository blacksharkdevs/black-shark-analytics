/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from "@/lib/supabaseClient";
import {
  type AffiliatePerformanceData,
  type RawAffiliateData,
} from "@/types/affiliates";
import { calculateAffiliateMetrics } from "@/lib/affiliateCalculations"; // Nossa função de cálculo pura

// Tipagem necessária para os parâmetros de data do hook useDashboardConfig
type DateRange = { from: Date; to: Date } | null;

/**
 * Define a estrutura dos parâmetros necessários para buscar a performance de afiliados no servidor.
 */
export interface FetchAffiliatesParams {
  currentDateRange: DateRange;
  dateDbColumn: string; // Coluna do DB para filtro de data (e.g., 'transaction_date')
  platformFilter: string;
  affNameSearch: string;
  actionTypeFilter: string;
}

/**
 * Busca a performance de afiliados no Supabase através da função RPC.
 * @param params Os parâmetros de filtro e data.
 * @returns {Promise<AffiliatePerformanceData[]>} Uma Promise com os dados de performance transformados.
 */
export async function fetchAffiliatePerformance(
  params: FetchAffiliatesParams
): Promise<AffiliatePerformanceData[]> {
  const {
    currentDateRange,
    dateDbColumn,
    platformFilter,
    affNameSearch,
    actionTypeFilter,
  } = params;

  // GUARD: Deve ser verificado no Provider, mas reforçamos aqui
  if (!currentDateRange || !currentDateRange.from || !currentDateRange.to) {
    return [];
  }

  // 1. Prepara os parâmetros para o RPC
  // O Supabase RPC prefere 'null' para ignorar filtros opcionais
  const platformParam = platformFilter === "all" ? null : platformFilter;
  const affNameParam =
    affNameSearch.trim() === "" ? null : affNameSearch.trim();

  // IMPORTANTE: A função RPC espera 'all_incomes' como string, não null!
  // Apenas quando for explicitamente 'all', passamos null
  const actionTypeParam = actionTypeFilter === "all" ? null : actionTypeFilter;

  console.log("🔧 Service: Preparando parâmetros", {
    platformFilter,
    platformParam,
    actionTypeFilter,
    actionTypeParam,
    affNameSearch,
    affNameParam,
  });

  const rpcParams: any = {
    start_date_param: currentDateRange.from.toISOString(),
    end_date_param: currentDateRange.to.toISOString(),
    date_column_name_param: dateDbColumn,
    platform_param: platformParam,
    aff_name_search_param: affNameParam,
    action_type_param: actionTypeParam,
  };

  console.log(
    "🔍 Service: Chamando RPC 'get_affiliate_performance'",
    rpcParams
  );

  // 2. Chama o RPC
  const { data, error } = await supabase.rpc(
    "get_affiliate_performance",
    rpcParams
  );

  if (error) {
    console.error("❌ Error fetching affiliate performance data:", error);
    return [];
  }

  if (data) {
    console.log(`✅ Service: Recebidos ${data.length} registros de afiliados`);
    // 3. Transforma e calcula as métricas usando a função pura
    const typedData = data.map((item: RawAffiliateData) =>
      calculateAffiliateMetrics(item)
    );
    return typedData;
  }

  console.warn("⚠️ Service: Nenhum dado retornado do RPC");
  return [];
}
