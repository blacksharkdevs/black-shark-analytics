/* eslint-disable @typescript-eslint/no-explicit-any */

import { type SortColumn } from "@/types/index";

type SupabaseQueryBuilder = any;

/**
 * Traduz a coluna de ordenação da UI para a coluna real do DB
 * e aplica a ordenação (Server Sort) na query do Supabase.
 * * @param query O objeto de query do Supabase.
 * @param sortColumn A coluna selecionada na UI.
 * @param sortDirection A direção da ordenação ('asc' ou 'desc').
 * @returns A query do Supabase com a ordenação aplicada.
 */
export function applyServerSort(
  query: SupabaseQueryBuilder,
  sortColumn: SortColumn,
  sortDirection: "asc" | "desc"
): SupabaseQueryBuilder {
  if (!sortColumn || sortColumn === "net_sales") {
    return query;
  }

  let actualSortColumn: string = sortColumn as string;
  const ascending = sortDirection === "asc";
  const sortOptions: {
    ascending: boolean;
    referencedTable?: string;
  } = { ascending };

  // Mapeamento e ajuste das opções de ordenação
  if (sortColumn === "product_name") {
    actualSortColumn = "product_name";
    sortOptions.referencedTable = "config_products";
  } else if (sortColumn === "revenue") {
    actualSortColumn = "total_amount_charged";
  } else if (sortColumn === "id") {
    actualSortColumn = "sale_id";
  } else if (sortColumn === "customer_name") {
    actualSortColumn = "customer_firstname";
  }

  // Aplica a ordenação
  return query.order(actualSortColumn, sortOptions);
}
