/* eslint-disable @typescript-eslint/no-explicit-any */

import type { SaleRecord } from "@/types/index";
import { createContext } from "react";

interface ProductConfig {
  id: string;
  name: string;
}

interface OfferTypeConfig {
  id: string;
  name: string;
}

interface AffiliateConfig {
  id: string;
  name: string;
}

interface DashboardDataContextType {
  filteredSalesData: SaleRecord[];
  availableProducts: ProductConfig[];
  availableOfferTypes: OfferTypeConfig[];
  availableAffiliates: AffiliateConfig[];
  selectedProduct: string;
  setSelectedProduct: React.Dispatch<React.SetStateAction<string>>;
  selectedOfferType: string;
  setSelectedOfferType: React.Dispatch<React.SetStateAction<string>>;
  stats: any;
  isLoadingData: boolean;
}

export const DashboardDataContext = createContext<
  DashboardDataContextType | undefined
>(undefined);
