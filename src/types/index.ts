export type ProductConfig = {
  id: string; // merchant_id
  name: string; // product_name
};

export interface SaleRecord {
  id: string;
  transaction_date: string; // This is a UTC string from Supabase
  calc_charged_day?: string | null; // Optional UTC string from Supabase
  revenue: number;
  sales_count: number;
  product_id: string;
  product_name: string; // This will be from config_products
  product_name_from_sale?: string | null; // This will be from sales_data
  action_type: string;
  customer_name?: string | null;
  customer_email?: string | null;
  aff_commission?: number | null;
  taxes?: number | null;
  aff_name?: string | null;
  platform?: string | null;
  // Fields for refund calculation
  merchant_commission?: number | null;
  refund_amount?: number | null;
  payout_model_check?: string | null; // To check if it's CPA
  initial_revenue_for_refund?: number | null; // The original total_amount_charged for a refund line
  // Fields for Gross Sales calculation
  platform_tax?: number | null;
  platform_transaction_tax?: number | null;
  // Field for COGS
  temp_cogs_per_user?: number | null;
  net_sales: number;
}

export type SortColumn = keyof SaleRecord | "calc_charged_day" | "net_sales";
