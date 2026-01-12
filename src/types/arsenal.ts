import type { Product } from "./index";

// ===================================================================
// TIPOS DE AGRUPAMENTO
// ===================================================================

/**
 * Regra de matching para incluir produtos em um grupo
 */
export interface ProductMatchRule {
  type:
    | "contains"
    | "startsWith"
    | "endsWith"
    | "regex"
    | "exact"
    | "productIds";
  value: string | string[];
  caseSensitive?: boolean;
}

/**
 * Upsell/Downsell dentro de um produto agrupado
 */
export interface ProductGroupOffer {
  id: string;
  name: string;
  offerType: "UPSELL" | "DOWNSELL" | "ORDER_BUMP";
  matchRules: ProductMatchRule[];
  color?: string;
  order: number;
}

/**
 * Produto Agrupado Customizado
 */
export interface CustomProductGroup {
  id: string;
  name: string;
  description?: string;
  matchRules: ProductMatchRule[];
  offers: ProductGroupOffer[];
  color?: string;
  icon?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Arsenal de Agrupamentos
 */
export interface ProductGroupingArsenal {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  customGroups: CustomProductGroup[];
  config: {
    autoGroupUngrouped: boolean;
    showIndividualProducts: boolean;
    sortBy: "name" | "revenue" | "sales" | "custom";
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Produto processado após aplicar arsenal
 */
export interface ProcessedProduct {
  id: string;
  type: "custom-group" | "auto-group" | "individual";
  name: string;
  displayName?: string;
  description?: string;
  icon?: string;
  color?: string;
  originalProducts: Product[];
  offerBreakdown?: {
    frontend: Product[];
    upsells: Map<string, Product[]>;
    downsells: Map<string, Product[]>;
    orderBumps: Map<string, Product[]>;
  };
  customGroupId?: string;
  totalProducts: number;
  isSelectable: boolean;
}
