/* eslint-disable @typescript-eslint/no-explicit-any */
import * as dateFns from "date-fns";

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

export const transformSupabaseSaleToRecord = (dbRecord: any): SaleRecord => {
  let derivedActionType = dbRecord.action_type;

  if (dbRecord.action_type === "neworder") {
    derivedActionType = dbRecord.upsell ? "back_sale" : "front_sale";
  }
  return {
    id: String(dbRecord.sale_id),
    transaction_date: dbRecord.transaction_date, // Keep as UTC string
    calc_charged_day: dbRecord.calc_charged_day, // Keep as UTC string
    revenue: parseFloat(dbRecord.total_amount_charged) || 0,
    sales_count: Number(dbRecord.product_quantity) || 0,
    product_id: String(dbRecord.merchant_id),
    product_name:
      dbRecord.config_products && dbRecord.config_products.product_name
        ? dbRecord.config_products.product_name
        : "Unknown Product",
    product_name_from_sale: dbRecord.product_name, // Capture product_name from sales_data
    action_type: derivedActionType,
    customer_name: [dbRecord.customer_firstname, dbRecord.customer_lastname]
      .filter(Boolean)
      .join(" "),
    customer_email: dbRecord.customer_email,
    aff_commission: parseFloat(dbRecord.aff_commission) || 0,
    taxes: parseFloat(dbRecord.taxes) || 0,
    aff_name: dbRecord.aff_name,
    platform: dbRecord.platform,
    // Add fields for refund calculation
    merchant_commission: parseFloat(dbRecord.merchant_commission) || 0,
    refund_amount: parseFloat(dbRecord.refund_amount) || 0,
    payout_model_check: dbRecord.commission_plan?.commission_type || null, // from the join
    initial_revenue_for_refund: parseFloat(dbRecord.initial_revenue) || 0,
    // Add fields for gross sales
    platform_tax: dbRecord.config_products?.platform_tax
      ? parseFloat(dbRecord.config_products.platform_tax)
      : 0,
    platform_transaction_tax: dbRecord.config_products?.platform_transaction_tax
      ? parseFloat(dbRecord.config_products.platform_transaction_tax)
      : 0,
    // Add COGS field
    temp_cogs_per_user: dbRecord.config_products?.temp_cogs_per_user
      ? parseFloat(dbRecord.config_products.temp_cogs_per_user)
      : 0,
  };
};

export const getCalculatedDateRange = (
  rangeOptionId: string,
  referenceDateUTC: Date,
  customRangeInput?: { from?: Date; to?: Date }
): { from: Date; to: Date } => {
  let fromDate: Date;
  let toDate: Date;

  const todayAnchorDate = referenceDateUTC;

  switch (rangeOptionId) {
    case "today":
      fromDate = dateFns.startOfDay(todayAnchorDate);
      toDate = dateFns.endOfDay(todayAnchorDate);
      break;
    case "yesterday":
      const yesterday = dateFns.subDays(todayAnchorDate, 1);
      fromDate = dateFns.startOfDay(yesterday);
      toDate = dateFns.endOfDay(yesterday);
      break;
    case "last_7_days":
      fromDate = dateFns.startOfDay(dateFns.subDays(todayAnchorDate, 6));
      toDate = dateFns.endOfDay(todayAnchorDate);
      break;
    case "last_30_days":
      fromDate = dateFns.startOfDay(dateFns.subDays(todayAnchorDate, 29));
      toDate = dateFns.endOfDay(todayAnchorDate);
      break;
    case "this_month":
      fromDate = dateFns.startOfDay(dateFns.startOfMonth(todayAnchorDate));
      toDate = dateFns.endOfDay(dateFns.endOfMonth(todayAnchorDate));
      break;
    case "this_year":
      fromDate = dateFns.startOfDay(dateFns.startOfYear(todayAnchorDate));
      toDate = dateFns.endOfDay(dateFns.endOfYear(todayAnchorDate));
      break;
    case "custom":
      if (customRangeInput?.from) {
        // A standard date from the picker is at UTC midnight.
        // We set the range from the start of the 'from' day to the end of the 'to' day.
        fromDate = dateFns.startOfDay(customRangeInput.from);
        toDate = customRangeInput.to
          ? dateFns.endOfDay(customRangeInput.to)
          : dateFns.endOfDay(customRangeInput.from); // If no 'to' date, it's a single day selection.
      } else {
        // Fallback if no custom range is provided
        fromDate = dateFns.startOfDay(todayAnchorDate);
        toDate = dateFns.endOfDay(todayAnchorDate);
      }
      break;
    default:
      fromDate = dateFns.startOfDay(dateFns.subDays(todayAnchorDate, 6));
      toDate = dateFns.endOfDay(todayAnchorDate);
      break;
  }
  return { from: fromDate, to: toDate };
};
