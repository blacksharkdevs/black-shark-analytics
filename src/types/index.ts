/* eslint-disable @typescript-eslint/no-explicit-any */

// ----------------------------------------------------------------------
// 🔹 UTILITÁRIOS (Pra lidar com a serialização do JSON)
// ----------------------------------------------------------------------

// No frontend, o Decimal do Prisma geralmente chega como string ou number.
// Se você usa JSON.stringify, vira string. Se converte antes, vira number.
export type Decimal = number | string;

// Datas no JSON viram string ISO (ex: "2023-12-25T00:00:00.000Z")
export type ISODate = string;

// ----------------------------------------------------------------------
// 🔹 ENUMS (Espelhos do Prisma)
// ----------------------------------------------------------------------

export type Platform = "BUYGOODS" | "CLICKBANK" | "CARTPANDA" | "DIGISTORE";

export type TransactionType = "SALE" | "REFUND" | "CHARGEBACK" | "REBILL";

export type OfferType = "FRONTEND" | "UPSELL" | "DOWNSELL" | "ORDER_BUMP";

export type TransactionStatus =
  | "COMPLETED"
  | "PENDING"
  | "FAILED"
  | "REFUNDED"
  | "CHARGEBACK";

export type Role = "ADMIN" | "EDITOR" | "VIEWER";

// ----------------------------------------------------------------------
// 🔹 MODELOS DE ACESSO
// ----------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  // passwordHash removido! O front nunca deve saber disso 🚫
  name: string;
  role: Role;
  lastLogin?: ISODate | null;
  createdAt: ISODate;
  updatedAt: ISODate;
}

// ----------------------------------------------------------------------
// 🔹 MODELOS DE NEGÓCIO
// ----------------------------------------------------------------------

export interface Customer {
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

  // Relações Opcionais (depende se você fez o include no backend)
  transactions?: Transaction[];
}

export interface Affiliate {
  id: string;
  externalId: string;
  platform: Platform;
  name?: string | null;
  email?: string | null;

  transactions?: Transaction[];
}

export interface Product {
  id: string;
  externalId: string;
  platform: Platform;
  name: string;
  family?: string | null;
  unitCount: number;
  cogs: Decimal; // Custo do produto
  createdAt: ISODate;

  transactions?: Transaction[];
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

  // --- FINANCEIRO ---
  grossAmount: Decimal;

  // Deduções
  taxAmount: Decimal;
  shippingAmount: Decimal;
  platformFee: Decimal;
  affiliateCommission: Decimal;

  // Resultado Final
  netAmount: Decimal;
  currency: string;

  // --- RELACIONAMENTOS (IDs) ---
  customerId: string;
  productId?: string | null;
  affiliateId?: string | null;

  // --- RELACIONAMENTOS (Objetos Populados) ---
  customer?: Customer;
  product?: Product;
  affiliate?: Affiliate;

  quantity: number;

  // Json fields no frontend viram objetos genéricos ou tipados se você souber a estrutura
  marketingData?: Record<string, any> | null;
  metadata?: Record<string, any> | null;

  isTest: boolean;
  createdAt: ISODate;
  updatedAt: ISODate;
}

// ----------------------------------------------------------------------
// 🔹 ALIASES (Para compatibilidade com código legado)
// ----------------------------------------------------------------------

// SaleRecord é um alias de Transaction para manter compatibilidade
export type SaleRecord = Transaction;

// Tipo para ordenação de colunas
export type SortColumn = keyof Transaction | "calc_charged_day" | "net_sales";
