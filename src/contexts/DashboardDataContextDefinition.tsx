/* eslint-disable @typescript-eslint/no-explicit-any */

import { type SaleRecord } from "@/lib/data";
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
  formatCurrency: (value: number) => string;
}

export const DashboardDataContext = createContext<
  DashboardDataContextType | undefined
>(undefined);
