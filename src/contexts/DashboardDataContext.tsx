/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  createContext,
  useContext,
} from "react";
import { supabase } from "@/lib/supabaseClient";
import { useDashboardConfig } from "./DashboardConfigContext";

// ===================================================================
// TIPOS INTERNOS
// ===================================================================

type Decimal = number | string;
type ISODate = string;

type Platform = "BUYGOODS" | "CLICKBANK" | "CARTPANDA" | "DIGISTORE";
type TransactionType = "SALE" | "REFUND" | "CHARGEBACK" | "REBILL";
type OfferType = "FRONTEND" | "UPSELL" | "DOWNSELL" | "ORDER_BUMP";
type TransactionStatus =
  | "COMPLETED"
  | "PENDING"
  | "FAILED"
  | "REFUNDED"
  | "CHARGEBACK";

interface Customer {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  zip?: string | null;
  createdAt: ISODate;
  updatedAt: ISODate;
}

interface Affiliate {
  id: string;
  externalId: string;
  platform: Platform;
  name?: string | null;
  email?: string | null;
}

interface Product {
  id: string;
  externalId: string;
  platform: Platform;
  name: string;
  family?: string | null;
  unitCount: number;
  cogs: Decimal;
  createdAt: ISODate;
}

export interface Transaction {
  id: string;
  externalId: string;
  platform: Platform;
  type: TransactionType;
  offerType?: OfferType | null;
  status: TransactionStatus;
  occurredAt: ISODate;
  refundedAt?: ISODate | null;
  grossAmount: Decimal;
  taxAmount: Decimal;
  shippingAmount: Decimal;
  platformFee: Decimal;
  affiliateCommission: Decimal;
  netAmount: Decimal;
  currency: string;
  customerId: string;
  productId?: string | null;
  affiliateId?: string | null;
  customer?: Customer;
  product?: Product;
  affiliate?: Affiliate;
  quantity: number;
  marketingData?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
  isTest: boolean;
  createdAt: ISODate;
  updatedAt: ISODate;
}

// ⚡ ATUALIZADO: Interface completa para os novos Cards
export interface DashboardStats {
  totalRevenue: number; // Geralmente igual ao Gross Sales
  grossSales: number; // Valor bruto cobrado do cliente
  netSales: number; // Valor líquido (Gross - Fees - Refunds - Comissões)

  totalTaxes: number;
  totalPlatformFees: number;
  totalAffiliateCommissions: number; // Novo campo

  totalSalesTransactions: number;
  totalRefundsCount: number; // Novo campo
  totalChargebacksCount: number; // Novo campo

  frontSalesCount: number;
  backSalesCount: number;
  averageOrderValue: number;
}

interface DateRange {
  from: Date;
  to: Date;
}

// ===================================================================
// FUNÇÕES AUXILIARES INTERNAS
// ===================================================================

// 🚀 AUMENTADO: 1000 é pouco para análises mensais. 10k é seguro pro browser.
const MAX_RECORDS_FOR_DASHBOARD_STATS = 50000;
const BATCH_SIZE = 1000; // Supabase tem limite de ~1000 registros por query com joins

async function fetchTransactionsFromSupabase(
  dateRange: DateRange,
  dateColumn: string
): Promise<Transaction[]> {
  if (!dateRange?.from || !dateRange?.to) {
    return [];
  }

  try {
    const queryFromUTC = dateRange.from.toISOString();
    const queryToUTC = dateRange.to.toISOString();

    console.log("🔍 DashboardDataContext - Query Dates:", {
      from: queryFromUTC,
      to: queryToUTC,
    });

    let allData: Transaction[] = [];
    let rangeStart = 0;
    let hasMore = true;

    // Buscar em lotes para contornar limite do Supabase
    while (hasMore && allData.length < MAX_RECORDS_FOR_DASHBOARD_STATS) {
      const rangeEnd = rangeStart + BATCH_SIZE - 1;

      const { data, error } = await supabase
        .from("transactions")
        .select(
          `
          *,
          product:products(*),
          affiliate:affiliates(*),
          customer:customers(*)
        `
        )
        .gte(dateColumn, queryFromUTC)
        .lte(dateColumn, queryToUTC)
        .order(dateColumn, { ascending: false })
        .range(rangeStart, rangeEnd);

      if (error) {
        console.error("Erro ao buscar transações do Supabase:", error);
        break;
      }

      if (!data || data.length === 0) {
        hasMore = false;
        break;
      }

      allData = [...allData, ...(data as Transaction[])];

      // Se recebemos menos que o tamanho do lote, não há mais dados
      if (data.length < BATCH_SIZE) {
        hasMore = false;
      } else {
        rangeStart += BATCH_SIZE;
      }
    }

    if (allData.length >= MAX_RECORDS_FOR_DASHBOARD_STATS) {
      console.warn(
        `Aviso: Limite de ${MAX_RECORDS_FOR_DASHBOARD_STATS} registros atingido. Os dados podem estar incompletos.`
      );
    }

    console.log(
      `✅ ${allData.length} transações carregadas do período selecionado`
    );

    return allData;
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    return [];
  }
}

/**
 * Calcula estatísticas do dashboard a partir das transações.
 */
function calculateDashboardStats(salesData: Transaction[]): DashboardStats {
  // Inicializa acumuladores
  let grossSales = 0;
  let netSales = 0;
  let totalTaxes = 0;
  let totalPlatformFees = 0;
  let totalAffiliateCommissions = 0;

  let totalSalesTransactions = 0;
  let totalRefundsCount = 0;
  let totalChargebacksCount = 0;
  let frontSalesCount = 0;
  let backSalesCount = 0;

  // Loop único para performance (O(n))
  salesData.forEach((record) => {
    const type = record.type;
    const status = record.status;
    const offerType = record.offerType;

    // Métricas Financeiras (somar tudo, mesmo reembolsados, para ter histórico,
    // ou filtrar se quiser apenas "Net Realizado". Aqui somamos o bruto histórico)
    // Nota: Se quiser excluir reembolsos do Gross, adicione: && status !== 'REFUNDED'
    if (type === "SALE") {
      grossSales += Number(record.grossAmount || 0);
      netSales += Number(record.netAmount || 0); // O Net Amount do banco já deve descontar taxas
      totalTaxes += Number(record.taxAmount || 0);
      totalPlatformFees += Number(record.platformFee || 0);
      totalAffiliateCommissions += Number(record.affiliateCommission || 0);

      totalSalesTransactions += 1;

      if (offerType === "FRONTEND") {
        frontSalesCount += 1;
      } else {
        backSalesCount += 1;
      }
    }

    // Contagem de Reembolsos
    if (type === "REFUND" || status === "REFUNDED") {
      totalRefundsCount += 1;
    }

    // Contagem de Chargebacks
    if (type === "CHARGEBACK" || status === "CHARGEBACK") {
      totalChargebacksCount += 1;
    }
  });

  // AOV (Ticket Médio)
  const averageOrderValue =
    frontSalesCount > 0 ? grossSales / frontSalesCount : 0;

  return {
    totalRevenue: grossSales, // Alias
    grossSales,
    netSales,
    totalTaxes,
    totalPlatformFees,
    totalAffiliateCommissions,
    totalSalesTransactions,
    totalRefundsCount,
    totalChargebacksCount,
    frontSalesCount,
    backSalesCount,
    averageOrderValue,
  };
}

// ===================================================================
// CONTEXT DEFINITION
// ===================================================================

interface DashboardDataContextType {
  filteredSalesData: Transaction[];

  // Opções de Filtro
  availableProducts: Product[];
  availableOfferTypes: Array<{ id: string; name: string }>;
  availablePlatforms: Array<{ id: string; name: string }>;
  availableAffiliates: Array<{ id: string; name: string }>;

  // Estados Selecionados
  selectedProduct: string;
  setSelectedProduct: (productId: string) => void;

  selectedOfferType: string;
  setSelectedOfferType: (offerType: string) => void;

  selectedPlatform: string;
  setSelectedPlatform: (platform: string) => void;

  selectedAffiliate: string; // 🆕 Novo filtro
  setSelectedAffiliate: (affiliateId: string) => void; // 🆕 Novo setter

  stats: DashboardStats;
  isLoadingData: boolean;
}

const DashboardDataContext = createContext<
  DashboardDataContextType | undefined
>(undefined);

// ===================================================================
// PROVIDER
// ===================================================================

export function DashboardDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    currentDateRange,
    getCurrentDateDbColumn,
    isLoading: isDateRangeLoading,
  } = useDashboardConfig();

  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);

  // Filtros
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  const [selectedOfferType, setSelectedOfferType] = useState<string>("all");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedAffiliate, setSelectedAffiliate] = useState<string>("all"); // 🆕

  const [isLoadingData, setIsLoadingData] = useState(true);

  const fetchAllTransactions = useCallback(async () => {
    if (
      isDateRangeLoading ||
      !currentDateRange ||
      !currentDateRange.from ||
      !currentDateRange.to
    ) {
      setIsLoadingData(false);
      setAllTransactions([]);
      return;
    }

    setIsLoadingData(true);

    try {
      const dateColumn = getCurrentDateDbColumn();
      const transactions = await fetchTransactionsFromSupabase(
        currentDateRange,
        dateColumn
      );

      console.log(`Fetched ${transactions.length} transactions for dashboard.`);
      setAllTransactions(transactions);
    } catch (error) {
      console.error("Erro ao buscar dados do Dashboard:", error);
      setAllTransactions([]);
    } finally {
      setIsLoadingData(false);
    }
  }, [currentDateRange, isDateRangeLoading, getCurrentDateDbColumn]);

  useEffect(() => {
    fetchAllTransactions();
  }, [fetchAllTransactions]);

  // --- MEMOS PARA LISTAS DE FILTROS ---

  const availableProducts = useMemo(() => {
    const productsMap = new Map<string, Product>();
    allTransactions.forEach((transaction) => {
      if (transaction.product && transaction.productId) {
        productsMap.set(transaction.productId, transaction.product);
      }
    });

    const allProductsOption: Product = {
      id: "all",
      externalId: "all",
      platform: "BUYGOODS", // dummy
      name: "All Products",
      family: null,
      unitCount: 0,
      cogs: 0,
      createdAt: new Date().toISOString(),
    };

    return [
      allProductsOption,
      ...Array.from(productsMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
    ];
  }, [allTransactions]);

  const availableOfferTypes = useMemo(() => {
    const offerTypesSet = new Set<string>();
    allTransactions.forEach((transaction) => {
      if (transaction.offerType) {
        offerTypesSet.add(transaction.offerType);
      }
    });

    return [
      { id: "all", name: "All Offers" },
      ...Array.from(offerTypesSet)
        .sort()
        .map((type) => ({
          id: type,
          name: type.charAt(0) + type.slice(1).toLowerCase(), // Capitalize
        })),
    ];
  }, [allTransactions]);

  const availableAffiliates = useMemo(() => {
    const affiliatesMap = new Map<string, { id: string; name: string }>();
    allTransactions.forEach((transaction) => {
      if (transaction.affiliateId) {
        // Lógica defensiva para nome
        const affiliateName =
          transaction.affiliate?.name ||
          transaction.affiliate?.email ||
          (transaction.affiliateId === "direct"
            ? "Direct"
            : "Unknown Affiliate");

        affiliatesMap.set(transaction.affiliateId, {
          id: transaction.affiliateId,
          name: affiliateName,
        });
      }
    });

    return [
      { id: "all", name: "All Affiliates" },
      ...Array.from(affiliatesMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
    ];
  }, [allTransactions]);

  const availablePlatforms = useMemo(() => {
    const platformsSet = new Set<string>();
    allTransactions.forEach((transaction) => {
      if (transaction.platform) platformsSet.add(transaction.platform);
    });

    return [
      { id: "all", name: "All Platforms" },
      ...Array.from(platformsSet)
        .sort()
        .map((platform) => ({
          id: platform,
          name: platform,
        })),
    ];
  }, [allTransactions]);

  // --- FILTRAGEM DOS DADOS ---

  const filteredSalesData = useMemo(() => {
    let filtered = allTransactions;

    if (selectedProduct !== "all") {
      filtered = filtered.filter((t) => t.productId === selectedProduct);
    }

    if (selectedOfferType !== "all") {
      filtered = filtered.filter((t) => t.offerType === selectedOfferType);
    }

    if (selectedPlatform !== "all") {
      filtered = filtered.filter((t) => t.platform === selectedPlatform);
    }

    // 🆕 Filtro de Afiliado implementado
    if (selectedAffiliate !== "all") {
      filtered = filtered.filter((t) => t.affiliateId === selectedAffiliate);
    }

    return filtered;
  }, [
    allTransactions,
    selectedProduct,
    selectedOfferType,
    selectedPlatform,
    selectedAffiliate,
  ]);

  const stats = useMemo(() => {
    return calculateDashboardStats(filteredSalesData);
  }, [filteredSalesData]);

  const contextValue = {
    filteredSalesData,
    availableProducts,
    availableOfferTypes,
    availablePlatforms,
    availableAffiliates,

    selectedProduct,
    setSelectedProduct,
    selectedOfferType,
    setSelectedOfferType,
    selectedPlatform,
    setSelectedPlatform,
    selectedAffiliate, // Exportando novo estado
    setSelectedAffiliate, // Exportando novo setter

    stats,
    isLoadingData,
  };

  return (
    <DashboardDataContext.Provider value={contextValue}>
      {children}
    </DashboardDataContext.Provider>
  );
}

// ===================================================================
// HOOK
// ===================================================================

export function useDashboardData() {
  const context = useContext(DashboardDataContext);
  if (context === undefined) {
    throw new Error(
      "useDashboardData must be used within a DashboardDataProvider"
    );
  }
  return context;
}
