import type { ItemStats, SkuConfig } from "@/contexts/ReportsContextDefinition";
import type { SaleRecord } from "../types";

/**
 * Agrega os dados brutos de vendas em estatísticas de itens.
 * (skuConfigs foi removido, pois não é usado nesta etapa)
 */
export function aggregateSalesData(
  allSalesData: SaleRecord[]
): (Omit<ItemStats, "totalItems"> & { merchant_id: string })[] {
  // <-- OS PARÊNTESES CORRIGEM TUDO

  if (allSalesData.length === 0) return [];

  const itemStatsMap = allSalesData.reduce((acc, record) => {
    const productName = record.product_name_from_sale || "Unknown Item";
    const platform = record.platform || "N/A";
    // NOTA: A lógica do isUpsell está diferente da Tela 1 original.
    // A tela 1 original checava `record.action_type === 'back_sale'`
    // A tela 3 (que parece ser a base desta) checava `record.upsell === true`
    // Vou manter a sua lógica atual, mas fica de olho se é isso mesmo.
    const isUpsell = record.action_type === "back_sale";
    const key = `${productName}-${isUpsell}-${platform}`;

    if (!acc[key]) {
      acc[key] = {
        productName: productName,
        platform: platform,
        totalRevenue: 0,
        totalSales: 0,
        isUpsell: isUpsell,
        merchant_id: record.product_id,
      };
    }
    acc[key].totalRevenue += record.revenue;
    acc[key].totalSales += 1;

    return acc;
  }, {} as Record<string, Omit<ItemStats, "totalItems"> & { merchant_id: string }>);

  return Object.values(itemStatsMap);
}

/**
 * Calcula as unidades totais e filtra/ordena os itens agregados.
 */
export function processAndFilterItems(
  aggregatedItems: (Omit<ItemStats, "totalItems"> & { merchant_id: string })[],
  skuConfigs: SkuConfig[],
  searchTerm: string
): ItemStats[] {
  const skuConfigMap = new Map<string, SkuConfig>();
  skuConfigs.forEach((sku) => {
    if (sku.original_name && sku.merchant_id) {
      const key = `${sku.merchant_id}-${sku.original_name}`;
      skuConfigMap.set(key, sku);
    }
  });

  let items: ItemStats[] = aggregatedItems.map((item) => {
    const lookupKey = `${item.merchant_id}-${item.productName}`;
    const skuConfig = skuConfigMap.get(lookupKey);
    const unitCount = skuConfig?.unit_count ?? 0;
    const totalItems = item.totalSales * unitCount;

    return {
      productName: item.productName,
      platform: item.platform,
      totalRevenue: item.totalRevenue,
      totalSales: item.totalSales,
      isUpsell: item.isUpsell,
      totalItems,
    };
  });

  if (searchTerm) {
    const lowercasedTerm = searchTerm.toLowerCase();
    items = items.filter(
      (item) =>
        item.productName.toLowerCase().includes(lowercasedTerm) ||
        item.platform.toLowerCase().includes(lowercasedTerm)
    );
  }

  return items.sort((a, b) => b.totalRevenue - a.totalRevenue);
}

/**
 * Pega a fatia de dados para a página atual.
 */
export function getPaginatedData(
  data: ItemStats[],
  currentPage: number,
  itemsPerPage: number
): ItemStats[] {
  const startIndex = (currentPage - 1) * itemsPerPage;
  return data.slice(startIndex, startIndex + itemsPerPage);
}

/**
 * Formata um número como moeda (USD).
 */
export function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}
