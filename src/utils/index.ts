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

// Função atualizada para usar a nova estrutura Transaction
export const calculateRefund = (item: SaleRecord): number => {
  // Verifica se é uma ação de reembolso baseado no novo campo 'type'
  const isRefundAction = ["REFUND", "CHARGEBACK"].includes(item.type);
  if (!isRefundAction) return 0;

  // O custo do reembolso agora é baseado no netAmount (valor líquido)
  // que já considera taxas, comissões e fees da plataforma
  const cost = Math.abs(Number(item.netAmount || 0));

  return cost;
};
