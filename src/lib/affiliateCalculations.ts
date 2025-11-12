import {
  type AffiliatePerformanceData,
  type RawAffiliateData,
} from "@/types/affiliates";

/**
 * Função helper para garantir que os valores nulos/string sejam convertidos corretamente para number.
 */
const parseValue = (value: string | number | null): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "string") {
    // Tenta converter string, se falhar ou for vazio, retorna 0
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return Number(value);
};

/**
 * Pega os dados brutos de performance de afiliados do RPC do Supabase e calcula todas as métricas derivadas.
 * @param rawData O objeto de dados brutos retornado pela chamada RPC.
 * @returns O objeto AffiliatePerformanceData completo com todos os cálculos.
 */
export function calculateAffiliateMetrics(
  rawData: RawAffiliateData
): AffiliatePerformanceData {
  // --- Parseamento de Valores Brutos ---
  const totalRevenue = parseValue(rawData.total_revenue);
  const totalTaxes = parseValue(rawData.taxes);
  const platformFeePercentage = parseValue(
    rawData.platform_fee_percentage_amount
  );
  const platformFeeTransaction = parseValue(
    rawData.platform_fee_transaction_amount
  );
  const commissionPaid = parseValue(rawData.commission_paid);
  const refundsAndChargebacksRaw = parseValue(rawData.refunds_and_chargebacks);
  const netSalesRaw = parseValue(rawData.net_sales);
  const totalCogs = parseValue(rawData.total_cogs);
  const frontSales = parseValue(rawData.front_sales);

  // Valores brutos do Tooltip R+CB
  const totalRefundAmount = parseValue(rawData.total_refund_amount);
  const totalRefundCommission = parseValue(rawData.total_refund_commission);
  const totalRefundTaxes = parseValue(rawData.total_refund_taxes);
  const totalRefundPlatformFees = parseValue(
    rawData.total_refund_platform_fees
  );

  // --- 1. Cálculos Essenciais ---

  // Total Revenue - Platform Fees - Taxes
  const grossSales =
    totalRevenue - platformFeePercentage - platformFeeTransaction - totalTaxes;

  // AOV (Gross Sales / Front Sales)
  const aov = frontSales > 0 ? grossSales / frontSales : 0;

  // R+CB (Sempre um valor negativo na view, representa o custo)
  const refundsAndChargebacks = -Math.abs(refundsAndChargebacksRaw);

  // Net Final (Net Sales + R+CB)
  const netFinal = netSalesRaw + refundsAndChargebacks;

  // Profit (Net Final - COGS)
  const profit = netFinal - totalCogs;

  // Allowance (10% de Gross Sales)
  const allowance = grossSales * 0.1;

  // Cash Flow (Profit - Allowance)
  const cashFlow = profit - allowance;

  // --- 2. Retorno Final ---
  return {
    aff_name: rawData.aff_name || "N/A",
    platform: rawData.platform || "N/A",
    customers: parseValue(rawData.customers),
    total_sales: parseValue(rawData.total_sales),
    front_sales: frontSales,
    back_sales: parseValue(rawData.back_sales),
    total_revenue: totalRevenue,
    gross_sales: grossSales,
    refunds_and_chargebacks: refundsAndChargebacks,
    commission_paid: commissionPaid,
    taxes: totalTaxes,
    platform_fee_percentage_amount: platformFeePercentage,
    platform_fee_transaction_amount: platformFeeTransaction,
    aov: aov,
    net_sales: netSalesRaw,
    net_final: netFinal,
    total_cogs: totalCogs,
    profit: profit,
    cash_flow: cashFlow,

    // Tooltip R+CB
    total_refund_amount: totalRefundAmount,
    total_refund_commission: totalRefundCommission,
    total_refund_taxes: totalRefundTaxes,
    total_refund_platform_fees: totalRefundPlatformFees,
  };
}
