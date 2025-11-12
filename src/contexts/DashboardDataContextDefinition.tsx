/* eslint-disable @typescript-eslint/no-explicit-any */

import type { SaleRecord } from "@/types/index";
import { type Product as ProductConfig } from "@/lib/config";
import { createContext } from "react";

interface DashboardDataContextType {
  filteredSalesData: SaleRecord[];
  availableProducts: ProductConfig[];
  selectedProduct: string;
  setSelectedProduct: React.Dispatch<React.SetStateAction<string>>;
  selectedActionType: string;
  setSelectedActionType: React.Dispatch<React.SetStateAction<string>>;
  stats: any;
  isLoadingData: boolean;
  isFetchingProducts: boolean;
}

export const DashboardDataContext = createContext<
  DashboardDataContextType | undefined
>(undefined);
