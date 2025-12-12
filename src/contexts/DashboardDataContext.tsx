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

interface Transaction {
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

interface DashboardStats {
  totalRevenue: number;
  grossSales: number;
  totalTaxes: number;
  totalPlatformFees: number;
  platformFeePercentage: number;
  platformFeeFixed: number;
  totalSalesTransactions: number;
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

const MAX_RECORDS_FOR_DASHBOARD_STATS = 1000;

/**
 * Busca transações do Supabase com filtros de data.
 */
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
      .limit(MAX_RECORDS_FOR_DASHBOARD_STATS)
      .order(dateColumn, { ascending: false });

    if (error) {
      console.error("Erro ao buscar transações do Supabase:", error);
      return [];
    }

    if (data && data.length === MAX_RECORDS_FOR_DASHBOARD_STATS) {
      console.warn(
        `Aviso: Limite de ${MAX_RECORDS_FOR_DASHBOARD_STATS} registros atingido.`
      );
    }

    return (data as Transaction[]) || [];
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    return [];
  }
}

/**
 * Calcula estatísticas do dashboard a partir das transações.
 */
function calculateDashboardStats(salesData: Transaction[]): DashboardStats {
  const totalRevenue = salesData.reduce(
    (sum, record) => sum + Number(record.grossAmount),
    0
  );
  const totalTaxes = salesData.reduce(
    (sum, record) => sum + Number(record.taxAmount || 0),
    0
  );
  const totalPlatformFees = salesData.reduce(
    (sum, record) => sum + Number(record.platformFee || 0),
    0
  );

  const platformFeePercentage = totalPlatformFees * 0.7;
  const platformFeeFixed = totalPlatformFees * 0.3;

  const grossSales = salesData.reduce(
    (sum, record) => sum + Number(record.netAmount),
    0
  );

  const totalSalesTransactions = salesData.filter(
    (record) => record.type === "SALE"
  ).length;
  const frontSalesCount = salesData.filter(
    (record) => record.type === "SALE" && record.offerType === "FRONTEND"
  ).length;
  const backSalesCount = salesData.filter(
    (record) => record.type === "SALE" && record.offerType !== "FRONTEND"
  ).length;

  const averageOrderValue =
    frontSalesCount > 0 ? grossSales / frontSalesCount : 0;

  return {
    totalRevenue,
    grossSales,
    totalTaxes,
    platformFeePercentage,
    platformFeeFixed,
    totalPlatformFees,
    totalSalesTransactions,
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
  availableProducts: Array<{ id: string; name: string }>;
  availableOfferTypes: Array<{ id: string; name: string }>;
  availableAffiliates: Array<{ id: string; name: string }>;
  selectedProduct: string;
  setSelectedProduct: (productId: string) => void;
  selectedOfferType: string;
  setSelectedOfferType: (offerType: string) => void;
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
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  const [selectedOfferType, setSelectedOfferType] = useState<string>("all");
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

  const availableProducts = useMemo(() => {
    const productsMap = new Map<string, { id: string; name: string }>();

    allTransactions.forEach((transaction) => {
      if (transaction.product && transaction.productId) {
        productsMap.set(transaction.productId, {
          id: transaction.productId,
          name: transaction.product.name,
        });
      }
    });

    const products = [
      { id: "all", name: "All Products" },
      ...Array.from(productsMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
    ];

    return products;
  }, [allTransactions]);

  const availableOfferTypes = useMemo(() => {
    const offerTypesSet = new Set<string>();

    allTransactions.forEach((transaction) => {
      if (transaction.offerType) {
        offerTypesSet.add(transaction.offerType);
      }
    });

    const offerTypes = [
      { id: "all", name: "All Offers" },
      ...Array.from(offerTypesSet)
        .sort()
        .map((type) => ({
          id: type,
          name: type.charAt(0) + type.slice(1).toLowerCase(),
        })),
    ];

    return offerTypes;
  }, [allTransactions]);

  const availableAffiliates = useMemo(() => {
    const affiliatesMap = new Map<string, { id: string; name: string }>();

    allTransactions.forEach((transaction) => {
      if (transaction.affiliate && transaction.affiliateId) {
        const affiliateName =
          transaction.affiliate.name ||
          transaction.affiliate.email ||
          "Unknown";
        affiliatesMap.set(transaction.affiliateId, {
          id: transaction.affiliateId,
          name: affiliateName,
        });
      }
    });

    const affiliates = [
      { id: "all", name: "All Affiliates" },
      { id: "direct", name: "Direct (No Affiliate)" },
      ...Array.from(affiliatesMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
    ];

    return affiliates;
  }, [allTransactions]);

  const filteredSalesData = useMemo(() => {
    let filtered = allTransactions;

    if (selectedProduct !== "all") {
      filtered = filtered.filter((t) => t.productId === selectedProduct);
    }

    if (selectedOfferType !== "all") {
      filtered = filtered.filter((t) => t.offerType === selectedOfferType);
    }

    return filtered;
  }, [allTransactions, selectedProduct, selectedOfferType]);

  const stats = useMemo(() => {
    return calculateDashboardStats(filteredSalesData);
  }, [filteredSalesData]);

  const contextValue = {
    filteredSalesData,
    availableProducts,
    availableOfferTypes,
    availableAffiliates,
    selectedProduct,
    setSelectedProduct,
    selectedOfferType,
    setSelectedOfferType,
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
