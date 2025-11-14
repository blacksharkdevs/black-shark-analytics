import { useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/common/ui/card";
import { Button } from "@/components/common/ui/button";
import { Skeleton } from "@/components/common/ui/skeleton";
import { ArrowLeft, User } from "lucide-react";
import { useCustomerHistory } from "@/hooks/useCustomerHistory";
import { CustomerTransactionsTable } from "@/components/dashboard/customer/CustomerTransactionsTable";

function CustomersDetailPageContent() {
  const { t } = useTranslation();
  const params = useParams();
  const navigate = useNavigate();
  const email = decodeURIComponent(params.email as string);

  const { transactions, loading, error, customerName, customerEmail } =
    useCustomerHistory(email);

  const handleBack = useCallback(
    () => navigate("/dashboard/transactions"),
    [navigate]
  );

  const showContentSkeleton = loading && transactions.length === 0;
  const showNoTransactionsMessage = !loading && transactions.length === 0;

  return (
    <div className="container p-4 mx-auto space-y-6 md:p-8">
      <Button
        variant="outline"
        onClick={handleBack}
        className="mb-4 border rounded-none border-border text-foreground hover:bg-accent/10"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t("common.backToTransactions")}
      </Button>

      <Card className="border rounded-none shadow-lg bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-blue-600" />
            <div className="flex-1">
              <CardTitle className="text-foreground">
                {t("customers.details.title")}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {t("customers.details.description")}{" "}
                <span className="font-mono font-semibold text-primary">
                  {customerName || customerEmail}
                </span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showContentSkeleton ? (
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="w-full h-12 rounded-none bg-accent/20"
                />
              ))}
            </div>
          ) : error ? (
            <div className="py-10 text-center text-destructive">
              <p>{error}</p>
            </div>
          ) : showNoTransactionsMessage ? (
            <div className="py-10 text-center text-muted-foreground">
              {t("customers.details.noTransactions")}
            </div>
          ) : (
            <CustomerTransactionsTable transactions={transactions} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function CustomersDetailPage() {
  return <CustomersDetailPageContent />;
}
