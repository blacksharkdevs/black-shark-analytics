import { useParams, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useDashboardData } from "@/contexts/DashboardDataContext";
import { useDashboardConfig } from "@/contexts/DashboardConfigContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import { Button } from "@/components/common/ui/button";
import { Badge } from "@/components/common/ui/badge";
import { Skeleton } from "@/components/common/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { filteredSalesData, isLoadingData } = useDashboardData();
  const { isLoading: isDateRangeLoading } = useDashboardConfig();

  const isLoading = isLoadingData || isDateRangeLoading;

  // Encontrar a transação pelo ID
  const transaction = useMemo(() => {
    return filteredSalesData.find((t) => t.id === id);
  }, [filteredSalesData, id]);

  if (isLoading) {
    return (
      <div className="container p-4 mx-auto space-y-6 md:p-8">
        <Skeleton className="w-48 h-10" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="container p-4 mx-auto space-y-6 md:p-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/transactions")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Transações
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Transação não encontrada
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Helper para formatar valores monetários
  const formatCurrency = (value: number | string) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: transaction.currency || "USD",
    }).format(num);
  };

  // Helper para formatar data
  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  // Helper para badge de status
  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      COMPLETED: "default",
      PENDING: "secondary",
      FAILED: "destructive",
      REFUNDED: "destructive",
      CHARGEBACK: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  // Helper para badge de tipo
  const getTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "outline" | "destructive"> = {
      SALE: "default",
      REFUND: "destructive",
      CHARGEBACK: "destructive",
      REBILL: "outline",
    };
    return <Badge variant={variants[type] || "outline"}>{type}</Badge>;
  };

  return (
    <div className="container p-4 mx-auto space-y-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/transactions")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div className="flex gap-2">
          {getStatusBadge(transaction.status)}
          {getTypeBadge(transaction.type)}
          {transaction.isTest && <Badge variant="outline">TEST</Badge>}
        </div>
      </div>

      {/* Título */}
      <div>
        <h1 className="text-3xl font-bold">Detalhes da Transação</h1>
        <p className="text-muted-foreground">ID: {transaction.id}</p>
        <p className="text-sm text-muted-foreground">
          ID Externo: {transaction.externalId}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Plataforma
              </p>
              <p className="text-lg">{transaction.platform}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Data de Ocorrência
              </p>
              <p className="text-lg">{formatDate(transaction.occurredAt)}</p>
            </div>
            {transaction.refundedAt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Data de Reembolso
                </p>
                <p className="text-lg">{formatDate(transaction.refundedAt)}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Tipo de Oferta
              </p>
              <p className="text-lg">{transaction.offerType || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Quantidade
              </p>
              <p className="text-lg">{transaction.quantity}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Moeda</p>
              <p className="text-lg">{transaction.currency}</p>
            </div>
          </CardContent>
        </Card>

        {/* Informações Financeiras */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Financeiras</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Valor Bruto
              </p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(transaction.grossAmount)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Impostos
              </p>
              <p className="text-lg">{formatCurrency(transaction.taxAmount)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Frete</p>
              <p className="text-lg">
                {formatCurrency(transaction.shippingAmount)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Taxa da Plataforma
              </p>
              <p className="text-lg">
                {formatCurrency(transaction.platformFee)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Comissão de Afiliado
              </p>
              <p className="text-lg">
                {formatCurrency(transaction.affiliateCommission)}
              </p>
            </div>
            <div className="pt-3 border-t">
              <p className="text-sm font-medium text-muted-foreground">
                Valor Líquido
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(transaction.netAmount)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Informações do Cliente */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {transaction.customer ? (
              <>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Nome
                  </p>
                  <p className="text-lg">
                    {transaction.customer.firstName}{" "}
                    {transaction.customer.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p className="text-lg">{transaction.customer.email}</p>
                </div>
                {transaction.customer.phone && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Telefone
                    </p>
                    <p className="text-lg">{transaction.customer.phone}</p>
                  </div>
                )}
                {transaction.customer.country && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Localização
                    </p>
                    <p className="text-lg">
                      {[
                        transaction.customer.city,
                        transaction.customer.state,
                        transaction.customer.country,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                )}
                {transaction.customer.zip && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      CEP
                    </p>
                    <p className="text-lg">{transaction.customer.zip}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">
                Informações do cliente não disponíveis
              </p>
            )}
          </CardContent>
        </Card>

        {/* Informações do Produto */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Produto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {transaction.product ? (
              <>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Nome
                  </p>
                  <p className="text-lg">{transaction.product.name}</p>
                </div>
                {transaction.product.family && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Família
                    </p>
                    <p className="text-lg">{transaction.product.family}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Unidades
                  </p>
                  <p className="text-lg">{transaction.product.unitCount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    COGS (Custo)
                  </p>
                  <p className="text-lg">
                    {formatCurrency(transaction.product.cogs)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    ID Externo
                  </p>
                  <p className="text-sm">{transaction.product.externalId}</p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">
                Informações do produto não disponíveis
              </p>
            )}
          </CardContent>
        </Card>

        {/* Informações do Afiliado */}
        {transaction.affiliate && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Informações do Afiliado</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Nome
                </p>
                <p className="text-lg">{transaction.affiliate.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Email
                </p>
                <p className="text-lg">
                  {transaction.affiliate.email || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  ID Externo
                </p>
                <p className="text-sm">{transaction.affiliate.externalId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Plataforma
                </p>
                <p className="text-lg">{transaction.affiliate.platform}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metadados */}
        {(transaction.metadata || transaction.marketingData) && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Dados Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {transaction.marketingData && (
                <div>
                  <p className="mb-2 text-sm font-medium text-muted-foreground">
                    Dados de Marketing
                  </p>
                  <pre className="p-3 overflow-auto text-xs rounded-lg bg-muted">
                    {JSON.stringify(transaction.marketingData, null, 2)}
                  </pre>
                </div>
              )}
              {transaction.metadata && (
                <div>
                  <p className="mb-2 text-sm font-medium text-muted-foreground">
                    Metadados
                  </p>
                  <pre className="p-3 overflow-auto text-xs rounded-lg bg-muted">
                    {JSON.stringify(transaction.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Timestamps */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Criado em
            </p>
            <p className="text-lg">{formatDate(transaction.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Atualizado em
            </p>
            <p className="text-lg">{formatDate(transaction.updatedAt)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
