import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { ExternalLink, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/common/ui/card";
import { Badge } from "@/components/common/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/index";
import type { Transaction, TransactionType, Platform } from "@/types/index";

interface TransactionTableProps {
  transactions: Transaction[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
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
    return format(date, "dd/MM/yy HH:mm", { locale });
  };

  const handleNavigateToCustomer = (customerId: string) => {
    navigate(`/dashboard/customers/${customerId}`);
  };

  const handleNavigateToAffiliate = (affiliateId: string) => {
    navigate(`/dashboard/affiliates/${affiliateId}`);
  };

  return (
    <Card className="overflow-hidden shark-card">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-white/5 border-white/10">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left uppercase text-muted-foreground">
                  {t("transactions.table.id")}
                </th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left uppercase text-muted-foreground">
                  {t("transactions.table.date")}
                </th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left uppercase text-muted-foreground">
                  {t("transactions.table.type")}
                </th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left uppercase text-muted-foreground">
                  {t("transactions.table.product")}
                </th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left uppercase text-muted-foreground">
                  {t("transactions.table.customer")}
                </th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left uppercase text-muted-foreground">
                  {t("transactions.table.affiliate")}
                </th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left uppercase text-muted-foreground">
                  {t("transactions.table.platform")}
                </th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wider text-right uppercase text-muted-foreground">
                  {t("transactions.table.revenue")}
                </th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wider text-right uppercase text-muted-foreground">
                  {t("transactions.table.net")}
                </th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wider text-center uppercase text-muted-foreground">
                  {t("transactions.table.status")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="transition-colors hover:bg-white/5"
                >
                  {/* ID */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <a
                      target="_blank"
                      href={`/dashboard/transactions/${transaction.id}`}
                      className={cn(
                        "flex items-center gap-1.5 text-xs font-mono cursor-pointer",
                        "text-cyan-400 hover:text-cyan-300",
                        "transition-colors group"
                      )}
                    >
                      <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      <span>#{transaction.externalId.slice(0, 8)}</span>
                    </a>
                  </td>

                  {/* Data */}
                  <td className="px-4 py-3 text-xs whitespace-nowrap text-muted-foreground">
                    {formatDateTime(transaction.occurredAt)}
                  </td>

                  {/* Tipo */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge
                      className={cn("text-xs", getTypeColor(transaction.type))}
                    >
                      {t(`transactions.types.${transaction.type}`)}
                    </Badge>
                  </td>

                  {/* Produto */}
                  <td className="px-4 py-3 max-w-[200px]">
                    <div className="text-xs truncate text-foreground">
                      {transaction.product?.name ||
                        t("transactions.unknownProduct")}
                    </div>
                    {transaction.quantity > 1 && (
                      <div className="text-xs text-muted-foreground">
                        Qtd: {transaction.quantity}
                      </div>
                    )}
                  </td>

                  {/* Customer */}
                  <td className="px-4 py-3 max-w-[150px]">
                    {transaction.customer ? (
                      <button
                        onClick={() =>
                          handleNavigateToCustomer(transaction.customerId)
                        }
                        className={cn(
                          "text-xs text-cyan-400",
                          "hover:text-cyan-300 hover:underline",
                          "transition-colors truncate block"
                        )}
                      >
                        {(transaction.customer.firstName &&
                          `${transaction.customer.firstName} ${transaction.customer.lastName}`) ||
                          transaction.customer.email}
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {t("transactions.unknownCustomer")}
                      </span>
                    )}
                  </td>

                  {/* Afiliado */}
                  <td className="px-4 py-3 max-w-[150px]">
                    {transaction.affiliate ? (
                      <button
                        onClick={() =>
                          handleNavigateToAffiliate(transaction.affiliateId!)
                        }
                        className={cn(
                          "text-xs text-yellow-400",
                          "hover:text-yellow-300 hover:underline",
                          "transition-colors truncate block"
                        )}
                      >
                        {transaction.affiliate.name ||
                          transaction.affiliate.email ||
                          transaction.affiliate.externalId}
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {t("transactions.noAffiliate")}
                      </span>
                    )}
                  </td>

                  {/* Plataforma */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge
                      className={cn(
                        "text-xs",
                        getPlatformColor(transaction.platform)
                      )}
                    >
                      {transaction.platform}
                    </Badge>
                  </td>

                  {/* Revenue */}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <span className="text-xs font-semibold text-green-400 tabular-nums">
                      {formatCurrency(Number(transaction.grossAmount))}
                    </span>
                  </td>

                  {/* Net */}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <span className="text-xs font-semibold text-cyan-400 tabular-nums">
                      {formatCurrency(Number(transaction.netAmount))}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <Badge
                      className={cn(
                        "text-xs",
                        transaction.status === "REFUNDED"
                          ? "bg-red-500/10 text-red-400 border-red-500/30"
                          : "bg-gray-500/10 text-gray-400 border-gray-500/30"
                      )}
                    >
                      {t(`transactions.statuses.${transaction.status}`)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
