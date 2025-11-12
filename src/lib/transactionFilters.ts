/* eslint-disable @typescript-eslint/no-explicit-any */

type SupabaseQueryBuilder = any;

/**
 * Aplica os filtros de Tipo de Ação (Action Type) na query do Supabase.
 *
 * @param query O objeto de query do Supabase.
 * @param selectedActionType O valor do filtro selecionado (ex: 'front_sale', 'all_refunds').
 * @returns A query do Supabase com os filtros de ação aplicados.
 */

export function applyActionTypeFilter(
  query: SupabaseQueryBuilder,
  selectedActionType: string
): SupabaseQueryBuilder {
  if (selectedActionType === "all") {
    return query;
  }

  switch (selectedActionType) {
    case "all_incomes":
      return query.eq("action_type", "neworder");
    case "front_sale":
      return query.eq("action_type", "neworder").eq("upsell", false);
    case "back_sale":
      return query.eq("action_type", "neworder").eq("upsell", true);
    case "rebill":
      return query.eq("action_type", "rebill");
    case "all_refunds":
      return query.in("action_type", [
        "chargebackrefundtime",
        "refund",
        "chargeback",
      ]);
    default:
      return query;
  }
}
