import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import {
  ExternalLink,
  Clock,
  Package,
  User,
  Users,
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/common/ui/card";
import { Badge } from "@/components/common/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/index";
import type {
  Transaction,
  TransactionType,
  OfferType,
  Platform,
} from "@/types/index";

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  if (transactions.length === 0) {
    return (
      <Card className="shark-card">
        <CardContent className="py-12 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-semibold text-foreground">
            {t("transactions.noResults")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("transactions.noResultsDescription")}
          </p>
        </CardContent>
      </Card>
    );
  }

  const getTypeColor = (type: TransactionType) => {
    switch (type) {
      case "SALE":
        return "bg-green-500/10 text-green-400 border-green-500/30";
      case "REFUND":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      case "CHARGEBACK":
        return "bg-orange-500/10 text-orange-400 border-orange-500/30";
      case "REBILL":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/30";
    }
  };

  const getOfferTypeColor = (offerType?: OfferType | null) => {
    if (!offerType) return "bg-gray-500/10 text-gray-400";

    switch (offerType) {
      case "FRONTEND":
        return "bg-purple-500/10 text-purple-400";
      case "UPSELL":
        return "bg-cyan-500/10 text-cyan-400";
      case "DOWNSELL":
        return "bg-yellow-500/10 text-yellow-400";
      case "ORDER_BUMP":
        return "bg-pink-500/10 text-pink-400";
      default:
        return "bg-gray-500/10 text-gray-400";
    }
  };

  const getPlatformColor = (platform: Platform) => {
    switch (platform) {
      case "BUYGOODS":
        return "bg-blue-500/10 text-blue-400";
      case "CLICKBANK":
        return "bg-green-500/10 text-green-400";
      case "CARTPANDA":
        return "bg-purple-500/10 text-purple-400";
      case "DIGISTORE":
        return "bg-orange-500/10 text-orange-400";
      default:
        return "bg-gray-500/10 text-gray-400";
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = parseISO(dateString);
    const locale = i18n.language === "pt-BR" ? ptBR : enUS;
    return format(date, "dd MMM yyyy • HH:mm", { locale });
  };

  const handleNavigateToSale = (transactionId: string) => {
    navigate(`/dashboard/transactions/${transactionId}`);
  };

  const handleNavigateToCustomer = (customerId: string) => {
    navigate(`/dashboard/customers/${customerId}`);
  };

  const handleNavigateToAffiliate = (affiliateId: string) => {
    navigate(`/dashboard/affiliates/${affiliateId}`);
  };

  return (
    <div className="space-y-2">
      {transactions.map((transaction) => (
        <Card
          key={transaction.id}
          className={cn(
            "shark-card overflow-hidden",
            "hover:border-cyan-500/30 transition-all duration-200"
          )}
        >
          <CardContent className="p-3">
            <div className="flex flex-col gap-2.5">
              {/* Linha 1: ID, Data, Badges de Status */}
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                {/* ID da Venda (Clicável) */}
                <button
                  onClick={() => handleNavigateToSale(transaction.id)}
                  className={cn(
                    "flex items-center gap-2 text-sm font-mono",
                    "text-cyan-400 hover:text-cyan-300",
                    "transition-colors group w-fit"
                  )}
                >
                  <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  <span className="font-semibold">
                    #{transaction.externalId}
                  </span>
                </button>

                {/* Data e Hora */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatDateTime(transaction.occurredAt)}</span>
                </div>
              </div>

              {/* Linha 2: Badges (Type, Platform, Offer Type) */}
              <div className="flex flex-wrap gap-2">
                <Badge
                  className={cn("text-xs", getTypeColor(transaction.type))}
                >
                  {t(`transactions.types.${transaction.type}`)}
                </Badge>

                <Badge
                  className={cn(
                    "text-xs",
                    getPlatformColor(transaction.platform)
                  )}
                >
                  {transaction.platform}
                </Badge>

                {transaction.offerType && (
                  <Badge
                    className={cn(
                      "text-xs",
                      getOfferTypeColor(transaction.offerType)
                    )}
                  >
                    {t(`offerTypes.${transaction.offerType}`)}
                  </Badge>
                )}
              </div>

              {/* Linha 3: Produto, Customer, Afiliado */}
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                {/* Produto */}
                <div className="flex items-start gap-2">
                  <Package className="w-4 h-4 mt-0.5 text-purple-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">
                      {t("transactions.product")}
                    </p>
                    <p className="text-sm font-medium truncate text-foreground">
                      {transaction.product?.name ||
                        t("transactions.unknownProduct")}
                    </p>
                    {transaction.quantity > 1 && (
                      <p className="text-xs text-muted-foreground">
                        {t("transactions.quantity")}: {transaction.quantity}
                      </p>
                    )}
                  </div>
                </div>

                {/* Customer (Clicável) */}
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 mt-0.5 text-cyan-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">
                      {t("transactions.customer")}
                    </p>
                    {transaction.customer ? (
                      <button
                        onClick={() =>
                          handleNavigateToCustomer(transaction.customerId)
                        }
                        className={cn(
                          "text-sm font-medium text-cyan-400",
                          "hover:text-cyan-300 hover:underline",
                          "transition-colors text-left truncate w-full"
                        )}
                      >
                        {(transaction.customer.firstName &&
                          `${transaction.customer.firstName} ${transaction.customer.lastName}`) ||
                          transaction.customer.email}
                      </button>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {t("transactions.unknownCustomer")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Afiliado (Clicável) */}
                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 mt-0.5 text-yellow-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">
                      {t("transactions.affiliate")}
                    </p>
                    {transaction.affiliate ? (
                      <button
                        onClick={() =>
                          handleNavigateToAffiliate(transaction.affiliateId!)
                        }
                        className={cn(
                          "text-sm font-medium text-yellow-400",
                          "hover:text-yellow-300 hover:underline",
                          "transition-colors text-left truncate w-full"
                        )}
                      >
                        {transaction.affiliate.name ||
                          transaction.affiliate.email ||
                          transaction.affiliate.externalId}
                      </button>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {t("transactions.noAffiliate")}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Linha 4: Métricas Financeiras */}
              <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-white/10">
                {/* Revenue */}
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-green-500/10">
                    <DollarSign className="w-3.5 h-3.5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t("transactions.revenue")}
                    </p>
                    <p className="text-sm font-semibold text-green-400 tabular-nums">
                      {formatCurrency(Number(transaction.grossAmount))}
                    </p>
                  </div>
                </div>

                {/* Net Sales */}
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-cyan-500/10">
                    <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t("transactions.netSales")}
                    </p>
                    <p className="text-sm font-semibold text-cyan-400 tabular-nums">
                      {formatCurrency(Number(transaction.netAmount))}
                    </p>
                  </div>
                </div>

                {/* Refund Status */}
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "p-1.5 rounded",
                      transaction.status === "REFUNDED"
                        ? "bg-red-500/10"
                        : "bg-gray-500/10"
                    )}
                  >
                    <CreditCard
                      className={cn(
                        "w-3.5 h-3.5",
                        transaction.status === "REFUNDED"
                          ? "text-red-400"
                          : "text-gray-400"
                      )}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t("transactions.status")}
                    </p>
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        transaction.status === "REFUNDED"
                          ? "text-red-400"
                          : "text-gray-400"
                      )}
                    >
                      {t(`transactions.statuses.${transaction.status}`)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
