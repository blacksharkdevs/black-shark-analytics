import { type SaleRecord } from "@/types/index"; // Assumindo que SaleRecord está aqui

/**
 * Define a estrutura das estatísticas calculadas para o Dashboard.
 */
export interface DashboardStats {
  totalRevenue: number;
  grossSales: number;
  totalTaxes: number;
  totalPlatformFees: number;
  platformFeePercentage: number;
  platformFeeFixed: number;
  totalSalesTransactions: number;
  frontSalesCount: number;
  backSalesCount: number;
  averageOrderValue: number;
}

/**
 * Calcula todas as métricas financeiras e de transação a partir dos dados de vendas brutos.
 * Esta é uma função pura, ideal para testes de unidade.
 *
 * @param salesData Lista de SaleRecord já filtradas por data/produto/ação.
 * @returns Um objeto contendo todas as estatísticas calculadas.
 */
export function calculateDashboardStats(
  salesData: SaleRecord[]
): DashboardStats {
  // 1. Cálculos de Agregação
  const totalRevenue = salesData.reduce(
    (sum, record) => sum + record.revenue,
    0
  );
  const totalTaxes = salesData.reduce(
    (sum, record) => sum + (record.taxes || 0),
    0
  );
  const platformFeePercentage = salesData.reduce(
    (sum, record) => sum + record.revenue * (record.platform_tax || 0),
    0
  );
  const platformFeeFixed = salesData.reduce(
    (sum, record) => sum + (record.platform_transaction_tax || 0),
    0
  );
  const totalPlatformFees = platformFeePercentage + platformFeeFixed;

  // 2. Cálculo do Gross Sales
  const grossSales = totalRevenue - totalPlatformFees - totalTaxes;

  // 3. Contagem de Transações
  const totalSalesTransactions = salesData.length;
  const frontSalesCount = salesData.filter(
    (record) => record.action_type === "front_sale"
  ).length;
  const backSalesCount = salesData.filter(
    (record) => record.action_type === "back_sale"
  ).length;

  // 4. Cálculo da Média
  const averageOrderValue =
    frontSalesCount > 0 ? grossSales / frontSalesCount : 0;

  return {
    totalRevenue,
    grossSales,
    totalTaxes,
    platformFeePercentage,
    platformFeeFixed,
    totalPlatformFees,
    totalSalesTransactions,
    frontSalesCount,
    backSalesCount,
    averageOrderValue,
  };
}
