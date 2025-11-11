import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { type SaleRecord, transformSupabaseSaleToRecord } from "@/lib/data";
import { calculateRefund } from "@/utils/index";

export function useCustomerHistory(customerEmail: string) {
  const [transactions, setTransactions] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- FETCH DE TRANSAÇÕES POR EMAIL ---
  useEffect(() => {
    if (!customerEmail) return;

    const fetchCustomerTransactions = async () => {
      setLoading(true);
      setError(null);

      // 🔑 Query para buscar todas as transações do cliente
      const { data, error: dbError } = await supabase
        .from("sales_data")
        .select("*, config_products!inner(*)")
        .eq("customer_email", customerEmail)
        .order("transaction_date", { ascending: false });

      if (dbError) {
        console.error("Error fetching customer transactions:", dbError);
        setTransactions([]);
        setError("Failed to load customer history.");
      } else if (data) {
        const transformedData = data.map(transformSupabaseSaleToRecord);
        setTransactions(transformedData);

        // Extrai o nome do cliente da primeira transação (se existir)
        if (transformedData.length > 0) {
          setCustomerName(transformedData[0].customer_name);
        }
      } else {
        setTransactions([]);
      }

      setLoading(false);
    };

    fetchCustomerTransactions();
  }, [customerEmail]);

  // --- CÁLCULOS DE NET SALES (useMemo) ---
  const transactionsWithNetSales = useMemo(() => {
    return transactions.map((t) => {
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
    });
  }, [transactions]);

  // --- CÁLCULOS DE TOTAIS DA PÁGINA (useMemo) ---
  const pageTotals = useMemo(() => {
    return transactionsWithNetSales.reduce(
      (acc, t) => {
        acc.revenue += t.revenue;
        acc.net_sales += t.net_sales;
        acc.refund_calc += calculateRefund(t);
        return acc;
      },
      { revenue: 0, net_sales: 0, refund_calc: 0 }
    );
  }, [transactionsWithNetSales]);

  return {
    transactions: transactionsWithNetSales, // Dados já com net_sales
    loading,
    error,
    customerName,
    customerEmail,
    pageTotals,
  };
}
