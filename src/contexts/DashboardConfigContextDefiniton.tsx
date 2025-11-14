import { createContext } from "react";

interface DashboardConfigContextType {
  // Configuração da Coluna (Origem: DateConfigProvider)
  selectedDateConfig: string;
  setDateConfig: (optionId: string) => void;
  getCurrentDateDbColumn: () => "transaction_date" | "calc_charged_day";

  // Período Selecionado (Origem: DateRangeProvider)
  selectedDateRangeOptionId: string;
  currentDateRange: { from: Date; to: Date };
  updateDateRangeOption: (optionId: string) => void;
  updateCustomDateRange: (newRange: { from: Date; to: Date }) => void;
  isLoading: boolean;

  // Idioma
  language: string;
  setLanguage: (lang: string) => void;
}

// --- Contexto ---

export const DashboardConfigContext = createContext<
  DashboardConfigContextType | undefined
>(undefined);
