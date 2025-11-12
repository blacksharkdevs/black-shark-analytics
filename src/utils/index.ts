import type { SaleRecord } from "@/types/index";
import * as dateFns from "date-fns";

export const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD" });

export const formatTransactionDate = (dateString: string) => {
  if (!dateString) return "N/A";
  try {
    const dateObject = dateFns.parseISO(dateString);
    return dateFns.format(dateObject, "dd/MM/yy HH:mm");
  } catch (e) {
    console.error("Error formatting date:", e);
    return dateString;
  }
};

export const calculateRefund = (item: SaleRecord): number => {
  const isRefundAction = [
    "refund",
    "chargeback",
    "chargebackrefundtime",
  ].includes(item.action_type);
  if (!isRefundAction) return 0;
  if (
    item.refund_amount !== null &&
    item.taxes !== null &&
    item.refund_amount === item.taxes
  ) {
    return 0;
  }
  let cost = 0;
  if (item.platform === "buygoods") {
    const baseRevenue = Math.abs(item.revenue);
    const affCommission = item.aff_commission || 0;
    const taxes = item.taxes || 0;
    const platformFeePercentageAmount = baseRevenue * (item.platform_tax || 0);
    const platformFeeTransactionAmount = item.platform_transaction_tax || 0;
    cost =
      baseRevenue -
      affCommission -
      taxes -
      platformFeePercentageAmount -
      platformFeeTransactionAmount;
  } else {
    cost = Math.abs(item.merchant_commission || 0);
  }
  return cost;
};
