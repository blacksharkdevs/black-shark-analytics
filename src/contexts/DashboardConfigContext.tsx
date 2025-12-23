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
// FUNÇÕES AUXILIARES INTERNAS (AJUSTADO PARA BRASIL UTC-3)
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

// --- 🚨 LÓGICA DE FUSO HORÁRIO (BRT -> UTC) 🚨 ---

// Offset do Brasil (Brasília) em relação ao UTC é -3 horas (na maior parte do ano).
// Se quiser suporte a horário de verão antigo ou fusos diferentes, use date-fns-tz.
// Aqui vamos no manual robusto para -03:00.
const BRT_OFFSET_HOURS = 3;

/**
 * Cria uma data UTC que representa o INÍCIO do dia no Brasil (00:00:00 BRT).
 * Ex: 12/12 00:00 BRT -> 12/12 03:00 UTC
 */
function getBrazilStartOfDayInUTC(date: Date): Date {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();

  // Converte para UTC adicionando o offset de 3 horas
  // 00:00 BRT + 3h = 03:00 UTC
  // Nota: Usamos Date.UTC para forçar a criação em UTC puro com os componentes certos
  return new Date(Date.UTC(y, m, d, BRT_OFFSET_HOURS, 0, 0, 0));
}

/**
 * Cria uma data UTC que representa o FINAL do dia no Brasil (23:59:59 BRT).
 * Ex: 12/12 23:59 BRT -> 13/12 02:59 UTC
 */
function getBrazilEndOfDayInUTC(date: Date): Date {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();

  // 23:59:59.999 BRT + 3h = 02:59:59.999 UTC do dia seguinte
  return new Date(Date.UTC(y, m, d, 23 + BRT_OFFSET_HOURS, 59, 59, 999));
}

/**
 * Subtrai dias de uma data (mantendo a lógica local).
 */
function subtractDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

/**
 * Início do mês Brasil em UTC
 */
function getBrazilStartOfMonthInUTC(date: Date): Date {
  const y = date.getFullYear();
  const m = date.getMonth();
  // Dia 1, 00:00 BRT -> 03:00 UTC
  return new Date(Date.UTC(y, m, 1, BRT_OFFSET_HOURS, 0, 0, 0));
}

/**
 * Fim do mês Brasil em UTC
 */
function getBrazilEndOfMonthInUTC(date: Date): Date {
  const y = date.getFullYear();
  const m = date.getMonth();
  // Dia 0 do próximo mês = Último dia do mês atual
  const lastDay = new Date(y, m + 1, 0).getDate();

  return new Date(Date.UTC(y, m, lastDay, 23 + BRT_OFFSET_HOURS, 59, 59, 999));
}

/**
 * Início do ano Brasil em UTC
 */
function getBrazilStartOfYearInUTC(date: Date): Date {
  const y = date.getFullYear();
  return new Date(Date.UTC(y, 0, 1, BRT_OFFSET_HOURS, 0, 0, 0));
}

/**
 * Fim do ano Brasil em UTC
 */
function getBrazilEndOfYearInUTC(date: Date): Date {
  const y = date.getFullYear();
  return new Date(Date.UTC(y, 11, 31, 23 + BRT_OFFSET_HOURS, 59, 59, 999));
}

/**
 * Calcula o range de datas baseado na opção selecionada.
 * Agora respeitando o dia Brasileiro convertido para UTC.
 */
function getCalculatedDateRange(
  rangeOptionId: string,
  referenceDate: Date, // Data "Hoje" do navegador do usuário
  customRangeInput?: { from?: Date; to?: Date }
): { from: Date; to: Date } {
  let fromDate: Date;
  let toDate: Date;

  // Referência é sempre o "agora" local
  const today = new Date(referenceDate);
  const yesterday = subtractDays(today, 1);

  switch (rangeOptionId) {
    case "today":
      fromDate = getBrazilStartOfDayInUTC(today);
      toDate = getBrazilEndOfDayInUTC(today);
      break;
    case "yesterday":
      fromDate = getBrazilStartOfDayInUTC(yesterday);
      toDate = getBrazilEndOfDayInUTC(yesterday);
      break;
    case "last_7_days":
      // Últimos 7 dias INCLUINDO hoje? Ou 7 dias passados?
      // Padrão analytics costuma ser: (Hoje - 6 dias) até (Hoje)
      fromDate = getBrazilStartOfDayInUTC(subtractDays(today, 6));
      toDate = getBrazilEndOfDayInUTC(today);
      break;
    case "last_30_days":
      fromDate = getBrazilStartOfDayInUTC(subtractDays(today, 29));
      toDate = getBrazilEndOfDayInUTC(today);
      break;
    case "this_month":
      fromDate = getBrazilStartOfMonthInUTC(today);
      toDate = getBrazilEndOfMonthInUTC(today);
      break;
    case "this_year":
      fromDate = getBrazilStartOfYearInUTC(today);
      toDate = getBrazilEndOfYearInUTC(today);
      break;
    case "custom":
      if (customRangeInput?.from) {
        // No custom, assumimos que o DatePicker retorna meia-noite local
        fromDate = getBrazilStartOfDayInUTC(customRangeInput.from);
        toDate = customRangeInput.to
          ? getBrazilEndOfDayInUTC(customRangeInput.to)
          : getBrazilEndOfDayInUTC(customRangeInput.from);
      } else {
        fromDate = getBrazilStartOfDayInUTC(today);
        toDate = getBrazilEndOfDayInUTC(today);
      }
      break;
    default:
      fromDate = getBrazilStartOfDayInUTC(subtractDays(today, 6));
      toDate = getBrazilEndOfDayInUTC(today);
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
