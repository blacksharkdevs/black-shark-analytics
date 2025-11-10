import { TransactionsProvider } from "@/contexts/TransactionsContext";
import { TransactionsTable } from "@/components/dashboard/transactions/TransactionsTable";

export default function TransactionsPage() {
  return (
    <TransactionsProvider>
      <TransactionsTable />
    </TransactionsProvider>
  );
}
