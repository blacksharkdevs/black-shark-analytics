import { TransactionsProvider } from "@/contexts/TransactionsContext";
import { TransactionsTable } from "@/components/dashboard/transactions/TransactionsTable";

function TransactionsPageContent() {
  return <TransactionsTable />;
}

export default function TransactionsPage() {
  return (
    <TransactionsProvider>
      <TransactionsPageContent />
    </TransactionsProvider>
  );
}
