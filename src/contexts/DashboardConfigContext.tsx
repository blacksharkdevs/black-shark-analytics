/* eslint-disable react-refresh/only-export-components */
import {
  useState,
  useEffect,
  useCallback,
  type ReactNode,
  useMemo,
  createContext,
} from "react";
import { useTranslation } from "react-i18next";
import * as dateFns from "date-fns";

// ===================================================================
// TIPOS INTERNOS
// ===================================================================

interface DateRange {
  from: Date;
  to: Date;
}

interface DashboardConfig {
  dateRangeId?: string;
  dateColumnId?: string;
  language?: string;
}

interface DateConfigOption {
  id: string;
  name: string;
  db_column: string;
}

interface DashboardConfigContextType {
  selectedDateConfig: string;
  setDateConfig: (optionId: string) => void;
  getCurrentDateDbColumn: () => string;
  selectedDateRangeOptionId: string;
  currentDateRange: DateRange;
  updateDateRangeOption: (optionId: string) => void;
  updateCustomDateRange: (newRange: DateRange) => void;
  isLoading: boolean;
  language: string;
  setLanguage: (lang: string) => void;
}

// ===================================================================
// CONSTANTES
// ===================================================================

const DEFAULT_DATE_COLUMN_ID = "createdAt";
const DEFAULT_DATE_RANGE_ID = "last_7_days";
const DEFAULT_LANGUAGE = "pt-BR";
const CONFIG_LOCAL_STORAGE_KEY = "blackshark_dashboard_config";

const DATE_CONFIG_OPTIONS: DateConfigOption[] = [
  {
    id: "createdAt",
    name: "Data da Transação",
    db_column: "createdAt",
  },
];

// ===================================================================
// FUNÇÕES AUXILIARES INTERNAS
// ===================================================================

/**
 * Carrega configuração do localStorage.
 */
function loadConfigFromStorage(): DashboardConfig {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const stored = localStorage.getItem(CONFIG_LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    console.error("Erro ao carregar configuração do Local Storage:", e);
    return {};
  }
}

/**
 * Salva configuração no localStorage.
 */
function saveConfigToStorage(config: DashboardConfig): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const currentConfig = loadConfigFromStorage();
    const updatedConfig = { ...currentConfig, ...config };

    localStorage.setItem(
      CONFIG_LOCAL_STORAGE_KEY,
      JSON.stringify(updatedConfig)
    );
  } catch (e) {
    console.error("Erro ao salvar configuração no Local Storage:", e);
  }
}

/**
 * Retorna a coluna do banco de dados baseada no ID da configuração.
 */
function getDateDbColumn(selectedDateConfigId: string): "createdAt" {
  const currentConfig = DATE_CONFIG_OPTIONS.find(
    (opt) => opt.id === selectedDateConfigId
  );
  return (currentConfig?.db_column as "createdAt") || "createdAt";
}

/**
 * Calcula o range de datas baseado na opção selecionada.
 */
function getCalculatedDateRange(
  rangeOptionId: string,
  referenceDateUTC: Date,
  customRangeInput?: { from?: Date; to?: Date }
): { from: Date; to: Date } {
  let fromDate: Date;
  let toDate: Date;

  const todayAnchorDate = referenceDateUTC;
  const yesterday = dateFns.subDays(todayAnchorDate, 1);

  switch (rangeOptionId) {
    case "today":
      fromDate = dateFns.startOfDay(todayAnchorDate);
      toDate = dateFns.endOfDay(todayAnchorDate);
      break;
    case "yesterday":
      fromDate = dateFns.startOfDay(yesterday);
      toDate = dateFns.endOfDay(yesterday);
      break;
    case "last_7_days":
      fromDate = dateFns.startOfDay(dateFns.subDays(todayAnchorDate, 6));
      toDate = dateFns.endOfDay(todayAnchorDate);
      break;
    case "last_30_days":
      fromDate = dateFns.startOfDay(dateFns.subDays(todayAnchorDate, 29));
      toDate = dateFns.endOfDay(todayAnchorDate);
      break;
    case "this_month":
      fromDate = dateFns.startOfDay(dateFns.startOfMonth(todayAnchorDate));
      toDate = dateFns.endOfDay(dateFns.endOfMonth(todayAnchorDate));
      break;
    case "this_year":
      fromDate = dateFns.startOfDay(dateFns.startOfYear(todayAnchorDate));
      toDate = dateFns.endOfDay(dateFns.endOfYear(todayAnchorDate));
      break;
    case "custom":
      if (customRangeInput?.from) {
        fromDate = dateFns.startOfDay(customRangeInput.from);
        toDate = customRangeInput.to
          ? dateFns.endOfDay(customRangeInput.to)
          : dateFns.endOfDay(customRangeInput.from);
      } else {
        fromDate = dateFns.startOfDay(todayAnchorDate);
        toDate = dateFns.endOfDay(todayAnchorDate);
      }
      break;
    default:
      fromDate = dateFns.startOfDay(dateFns.subDays(todayAnchorDate, 6));
      toDate = dateFns.endOfDay(todayAnchorDate);
      break;
  }
  return { from: fromDate, to: toDate };
}

// ===================================================================
// CONTEXT DEFINITION
// ===================================================================

const DashboardConfigContext = createContext<
  DashboardConfigContextType | undefined
>(undefined);

// ===================================================================
// PROVIDER
// ===================================================================

export const DashboardConfigProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);

  const initialConfig = useMemo(() => loadConfigFromStorage(), []);

  const [selectedDateConfig, setSelectedDateConfig] = useState<string>(
    initialConfig.dateColumnId || DEFAULT_DATE_COLUMN_ID
  );

  const [selectedDateRangeOptionId, setSelectedDateRangeOptionId] =
    useState<string>(initialConfig.dateRangeId || DEFAULT_DATE_RANGE_ID);

  const [currentDateRange, setCurrentDateRange] = useState<DateRange>(() =>
    getCalculatedDateRange(
      initialConfig.dateRangeId || DEFAULT_DATE_RANGE_ID,
      new Date()
    )
  );

  const [language, setLanguageState] = useState<string>(
    initialConfig.language || DEFAULT_LANGUAGE
  );

  const saveConfig = useCallback((newConfig: DashboardConfig) => {
    saveConfigToStorage(newConfig);
  }, []);

  useEffect(() => {
    setCurrentDateRange(
      getCalculatedDateRange(selectedDateRangeOptionId, new Date())
    );
    i18n.changeLanguage(language);
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedDateRangeOptionId !== "custom") {
      setCurrentDateRange(
        getCalculatedDateRange(selectedDateRangeOptionId, new Date())
      );
    }
  }, [selectedDateRangeOptionId]);

  const setDateConfig = useCallback(
    (optionId: string) => {
      const newConfig = DATE_CONFIG_OPTIONS.find((opt) => opt.id === optionId);
      if (newConfig) {
        setSelectedDateConfig(newConfig.id);
        saveConfig({ dateColumnId: newConfig.id });
      }
    },
    [saveConfig]
  );

  const getCurrentDateDbColumn = useCallback(
    () => getDateDbColumn(selectedDateConfig),
    [selectedDateConfig]
  );

  const updateDateRangeOption = useCallback(
    (optionId: string) => {
      setIsLoading(true);
      setSelectedDateRangeOptionId(optionId);
      saveConfig({ dateRangeId: optionId });
      if (optionId !== "custom") {
        setCurrentDateRange(getCalculatedDateRange(optionId, new Date()));
      }
      setIsLoading(false);
    },
    [saveConfig]
  );

  const updateCustomDateRange = useCallback(
    (newRange: DateRange) => {
      setIsLoading(true);
      setSelectedDateRangeOptionId("custom");
      saveConfig({ dateRangeId: "custom" });
      setCurrentDateRange(
        getCalculatedDateRange("custom", new Date(), newRange)
      );
      setIsLoading(false);
    },
    [saveConfig]
  );

  const setLanguage = useCallback(
    (lang: string) => {
      setLanguageState(lang);
      i18n.changeLanguage(lang);
      localStorage.setItem("language", lang);
      saveConfig({ language: lang });
    },
    [i18n, saveConfig]
  );

  return (
    <DashboardConfigContext.Provider
      value={{
        selectedDateConfig,
        setDateConfig,
        getCurrentDateDbColumn,
        selectedDateRangeOptionId,
        currentDateRange,
        updateDateRangeOption,
        updateCustomDateRange,
        isLoading,
        language,
        setLanguage,
      }}
    >
      {children}
    </DashboardConfigContext.Provider>
  );
};

// ===================================================================
// HOOK
// ===================================================================

import { useContext } from "react";

export function useDashboardConfig() {
  const context = useContext(DashboardConfigContext);
  if (context === undefined) {
    throw new Error(
      "useDashboardConfig must be used within a DashboardConfigProvider"
    );
  }
  return context;
}
