import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { useDashboardData } from "@/contexts/DashboardDataContext";
import { useDashboardConfig } from "@/contexts/DashboardConfigContext";
import { Button } from "@/components/common/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import { AffiliateMetricsSection } from "@/components/affiliates/AffiliateMetricsSection";
import { AffiliateTransactionsSection } from "@/components/affiliates/AffiliateTransactionsSection";

export default function AffiliateDetailPage() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { filteredSalesData, isLoadingData } = useDashboardData();
  const { isLoading: isDateRangeLoading } = useDashboardConfig();

  const isLoading = isLoadingData || isDateRangeLoading;

  // Filtrar transações do afiliado
  const affiliateTransactions = useMemo(() => {
    return filteredSalesData.filter(
      (transaction) => transaction.affiliateId === name
    );
  }, [filteredSalesData, name]);

  // Pegar o primeiro para ter o nome
  const affiliate = affiliateTransactions[0]?.affiliate;
  const affiliateName =
    affiliate?.name || affiliate?.email || t("affiliates.unknownAffiliate");

  // Calcular métricas do afiliado
  const metrics = useMemo(() => {
    let totalSales = 0;
    let totalRevenue = 0;
    let grossSales = 0;
    let refundsAndChargebacks = 0;
    let commission = 0;
    let taxes = 0;
    let platformFeeDollar = 0;
    let cogs = 0;
    const uniqueCustomers = new Set<string>();

    affiliateTransactions.forEach((transaction) => {
      if (transaction.customerId) {
        uniqueCustomers.add(transaction.customerId);
      }

      if (transaction.type === "SALE" && transaction.status === "COMPLETED") {
        totalSales += 1;
        totalRevenue += Number(transaction.grossAmount);
        commission += Number(transaction.affiliateCommission);
        taxes += Number(transaction.taxAmount);
        platformFeeDollar += Number(transaction.platformFee);

        const revenue = Number(transaction.grossAmount);
        const tax = Number(transaction.taxAmount);
        const platformFee = Number(transaction.platformFee);
        grossSales += revenue - tax - platformFee;

        if (transaction.product?.cogs) {
          cogs += Number(transaction.product.cogs) * transaction.quantity;
        }
      }

      if (transaction.type === "REFUND" || transaction.type === "CHARGEBACK") {
        refundsAndChargebacks += Number(transaction.grossAmount);
      }
    });

    const netSales = grossSales - commission;
    const net = netSales + refundsAndChargebacks;
    const profit = net - cogs;
    const allowance = grossSales * 0.1;
    const cashFlow = profit - allowance;
    const aov =
      uniqueCustomers.size > 0 ? grossSales / uniqueCustomers.size : 0;
    const platformFeePercent =
      totalRevenue > 0 ? (platformFeeDollar / totalRevenue) * 100 : 0;

    return {
      totalCustomers: uniqueCustomers.size,
      totalSales,
      totalRevenue,
      grossSales,
      refundsAndChargebacks,
      commission,
      taxes,
      platformFeePercent,
      platformFeeDollar,
      aov,
      netSales,
      net,
      cogs,
      profit,
      cashFlow,
    };
  }, [affiliateTransactions]);

  return (
    <div className="container p-4 mx-auto space-y-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/affiliates")}
            className="shark-button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("common.backToAffiliates")}
          </Button>
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-cyan-400" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {affiliateName}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("affiliates.details.description")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Métricas */}
      <AffiliateMetricsSection
        metrics={metrics}
        totalTransactions={affiliateTransactions.length}
        isLoading={isLoading}
      />

      {/* Seção de Transações */}
      <AffiliateTransactionsSection
        transactions={affiliateTransactions}
        isLoading={isLoading}
      />
    </div>
  );
}
