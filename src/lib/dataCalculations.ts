// Imports necessários:
import { calculateRefund } from "@/utils/index";
import type { SaleRecord } from "@/types/index";

// Definindo o tipo de saída
export type SaleRecordWithNetSales = SaleRecord & { net_sales: number };

/**
 * Adiciona o campo 'net_sales' a uma transação, aplicando a lógica de cálculo.
 * Esta é uma função pura (sem dependências de estado).
 */
export function calculateNetSales(t: SaleRecord): SaleRecordWithNetSales {
  const isRefundAction = [
    "refund",
    "chargeback",
    "chargebackrefundtime",
  ].includes(t.action_type);
  let netSales = 0;

  if (isRefundAction) {
    netSales = -calculateRefund(t);
  } else {
    const platformFeePercentageAmount = t.revenue * (t.platform_tax || 0);
    const platformFeeTransactionAmount = t.platform_transaction_tax || 0;

    netSales =
      t.revenue -
      (t.aff_commission || 0) -
      (t.taxes || 0) -
      platformFeePercentageAmount -
      platformFeeTransactionAmount;
  }

  return { ...t, net_sales: netSales };
}
