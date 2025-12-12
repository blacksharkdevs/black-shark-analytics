import { type Transaction } from "@/types/index";

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
 * @param salesData Lista de Transaction já filtradas por data/produto/ação.
 * @returns Um objeto contendo todas as estatísticas calculadas.
 */
export function calculateDashboardStats(
  salesData: Transaction[]
): DashboardStats {
  // 1. Cálculos de Agregação
  const totalRevenue = salesData.reduce(
    (sum, record) => sum + Number(record.grossAmount),
    0
  );
  const totalTaxes = salesData.reduce(
    (sum, record) => sum + Number(record.taxAmount || 0),
    0
  );
  const totalPlatformFees = salesData.reduce(
    (sum, record) => sum + Number(record.platformFee || 0),
    0
  );

  // Separar fees percentuais e fixos (se necessário)
  const platformFeePercentage = totalPlatformFees * 0.7; // Estimativa
  const platformFeeFixed = totalPlatformFees * 0.3; // Estimativa

  // 2. Cálculo do Gross Sales (netAmount já considera deduções)
  const grossSales = salesData.reduce(
    (sum, record) => sum + Number(record.netAmount),
    0
  );

  // 3. Contagem de Transações
  const totalSalesTransactions = salesData.filter(
    (record) => record.type === "SALE"
  ).length;
  const frontSalesCount = salesData.filter(
    (record) => record.type === "SALE" && record.offerType === "FRONTEND"
  ).length;
  const backSalesCount = salesData.filter(
    (record) => record.type === "SALE" && record.offerType !== "FRONTEND"
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
