/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/common/ui/card";
import { Button } from "@/components/common/ui/button";
import { Skeleton } from "@/components/common/ui/skeleton";
import { ArrowLeft, FileText } from "lucide-react";
import { format as dateFnsFormat, isValid } from "date-fns";

type TransactionDetails = {
  [key: string]: any;
};

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState<TransactionDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleBack = useCallback(() => {
    navigate("/dashboard/transactions");
  }, [navigate]);

  const formatLabel = (key: string) => {
    return key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatValue = (key: string, value: any) => {
    if (value === null || value === undefined)
      return <span className="text-muted-foreground">N/A</span>;
    if (typeof value === "boolean") return value ? "Yes" : "No";

    if (
      ["transaction_date", "calc_charged_day", "created_at"].includes(key) &&
      typeof value === "string"
    ) {
      const date = new Date(value);
      if (isValid(date)) {
        return dateFnsFormat(date, "MMM dd, yyyy h:mm:ss a") + " (UTC)";
      }
      return value;
    }

    if (
      key.includes("amount") ||
      key.includes("commission") ||
      key.includes("taxes") ||
      key.includes("fee") ||
      key.includes("revenue")
    ) {
      if (typeof value === "number") {
        return `$${value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      }
    }
    return value.toString();
  };

  useEffect(() => {
    if (!id) return;

    const fetchTransaction = async () => {
      setLoading(true);
      setError(null);

      const { data, error: dbError } = await supabase
        .from("sales_data")
        .select("*")
        .eq("sale_id", id)
        .single();

      if (dbError) {
        console.error("Error fetching transaction details:", dbError);
        setError(
          "Failed to fetch transaction details. The transaction may not exist or there was a network error."
        );
        setTransaction(null);
      } else if (data) {
        setTransaction(data);
      } else {
        setError("Transaction not found.");
      }

      setLoading(false);
    };

    fetchTransaction();
  }, [id]);

  return (
    <div className="container p-4 mx-auto space-y-6 md:p-8">
      <Button
        variant="outline"
        onClick={handleBack}
        className="mb-4 border rounded-none border-border text-foreground hover:bg-accent/10"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Transactions
      </Button>

      <Card className="border rounded-none shadow-lg bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" />{" "}
            <div className="flex-1">
              <CardTitle className="text-foreground">
                Transaction Details
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Complete information for Sale ID:{" "}
                <span className="font-mono font-semibold text-primary">
                  {id}
                </span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            // 🚨 SKELETON DINÂMICO
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {[...Array(16)].map((_, i) => (
                <div
                  key={i}
                  className="flex justify-between pb-2 border-b border-border/50"
                >
                  <Skeleton className="w-1/3 h-5 rounded-none bg-accent/20" />
                  <Skeleton className="w-1/2 h-5 rounded-none bg-accent/30" />
                </div>
              ))}
            </div>
          ) : error ? (
            // 🚨 MENSAGEM DE ERRO
            <div className="py-10 text-center text-destructive">
              <p>{error}</p>
            </div>
          ) : transaction ? (
            // 🚨 CONTEÚDO DA TRANSAÇÃO
            <div className="grid grid-cols-1 text-sm md:grid-cols-2 gap-x-8 gap-y-4">
              {Object.entries(transaction)
                .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
                .map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between py-2 break-words border-b border-border/50"
                  >
                    <span className="mr-4 font-medium text-muted-foreground">
                      {formatLabel(key)}
                    </span>
                    <span className="font-medium text-right text-foreground">
                      {formatValue(key, value)}
                    </span>
                  </div>
                ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
