export interface AffiliatePerformanceData {
  aff_name: string;
  platform: string;
  customers: number;
  total_sales: number;
  front_sales: number;
  back_sales: number;
  total_revenue: number;
  gross_sales: number;
  refunds_and_chargebacks: number; // Já é o valor calculado (negativo)
  commission_paid: number;
  taxes: number;
  platform_fee_percentage_amount: number;
  platform_fee_transaction_amount: number;
  aov: number;
  net_sales: number;
  net_final: number; // net_sales + R+CB
  total_cogs: number; // Cost of Goods Sold
  profit: number; // net_final - total_cogs
  cash_flow: number; // profit - (gross_sales * 0.10)

  // Campos brutos necessários para o Tooltip de R+CB (usados no cálculo interno)
  total_refund_amount: number;
  total_refund_commission: number;
  total_refund_taxes: number;
  total_refund_platform_fees: number;
}

// Chaves que podem ser usadas para ordenação na tabela
export type SortableAffiliateKeys = keyof Omit<
  AffiliatePerformanceData,
  | "total_refund_amount"
  | "total_refund_commission"
  | "total_refund_taxes"
  | "total_refund_platform_fees"
>;

// Tipagem do dado bruto retornado pelo RPC do Supabase
export interface RawAffiliateData {
  aff_name: string | null;
  platform: string | null;
  customers: string | number | null;
  total_sales: string | number | null;
  front_sales: string | number | null;
  back_sales: string | number | null;
  total_revenue: string | number | null;
  refunds_and_chargebacks: string | number | null;
  commission_paid: string | number | null;
  taxes: string | number | null;
  platform_fee_percentage_amount: string | number | null;
  platform_fee_transaction_amount: string | number | null;
  net_sales: string | number | null;
  total_cogs: string | number | null;
  total_refund_amount: string | number | null;
  total_refund_commission: string | number | null;
  total_refund_taxes: string | number | null;
  total_refund_platform_fees: string | number | null;
}
