import { TransactionsContext } from "@/contexts/TransactionsContextDefinition";
import { useContext } from "react";

export function useTransactions() {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error(
      "useTransactions must be used within a TransactionsProvider"
    );
  }
  return context;
}
