import { useState, useEffect, useCallback, type ReactNode } from "react";
import { DATE_CONFIG_OPTIONS } from "@/lib/config"; // Assumindo que você moverá/criará isso
import { getCalculatedDateRange } from "@/lib/data"; // Assumindo que você moverá/criará isso
import { DashboardConfigContext } from "./DashboardConfigContextDefiniton";

interface DateRange {
  from: Date;
  to: Date;
}

const CONFIG_LOCAL_STORAGE_KEY = "blackshark_dashboard_config";
const DEFAULT_DATE_COLUMN_ID = "transaction_date";
const DEFAULT_DATE_RANGE_ID = "last_7_days";

// --- Provider ---

export const DashboardConfigProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isLoading, setIsLoading] = useState(true);

  // 1. ESTADO: COLUNA DE DATA (DB Column)
  const [selectedDateConfig, setSelectedDateConfig] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(CONFIG_LOCAL_STORAGE_KEY);
      const config = stored ? JSON.parse(stored) : {};
      return config.dateColumnId || DEFAULT_DATE_COLUMN_ID;
    }
    return DEFAULT_DATE_COLUMN_ID;
  });

  // 2. ESTADO: OPÇÃO DE PERÍODO (Preset: last_7_days, custom, etc.)
  const [selectedDateRangeOptionId, setSelectedDateRangeOptionId] =
    useState<string>(() => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(CONFIG_LOCAL_STORAGE_KEY);
        const config = stored ? JSON.parse(stored) : {};
        return config.dateRangeId || DEFAULT_DATE_RANGE_ID;
      }
      return DEFAULT_DATE_RANGE_ID;
    });

  // 3. ESTADO: PERÍODO (Datas de/para)
  const [currentDateRange, setCurrentDateRange] = useState<DateRange>(() =>
    getCalculatedDateRange(DEFAULT_DATE_RANGE_ID, new Date())
  );

  // --- Funções de Persistência ---
  const saveConfigToLocalStorage = useCallback(
    (newConfig: { dateRangeId?: string; dateColumnId?: string }) => {
      const currentStored =
        typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem(CONFIG_LOCAL_STORAGE_KEY) || "{}")
          : {};

      const updatedConfig = {
        ...currentStored,
        dateRangeId:
          newConfig.dateRangeId ||
          currentStored.dateRangeId ||
          selectedDateRangeOptionId,
        dateColumnId:
          newConfig.dateColumnId ||
          currentStored.dateColumnId ||
          selectedDateConfig,
      };

      if (typeof window !== "undefined") {
        localStorage.setItem(
          CONFIG_LOCAL_STORAGE_KEY,
          JSON.stringify(updatedConfig)
        );
      }
    },
    [selectedDateRangeOptionId, selectedDateConfig]
  );

  // --- Lógica de Inicialização (useEffect) ---
  useEffect(() => {
    setIsLoading(true);
    const stored =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem(CONFIG_LOCAL_STORAGE_KEY) || "{}")
        : {};

    const initialDateRangeId = stored.dateRangeId || DEFAULT_DATE_RANGE_ID;

    // Atualiza o range na inicialização
    setCurrentDateRange(getCalculatedDateRange(initialDateRangeId, new Date()));

    // Atualiza os estados (o selectedDateConfig já foi setado no useState, mas garantimos)
    if (stored.dateRangeId) setSelectedDateRangeOptionId(stored.dateRangeId);
    if (stored.dateColumnId) setSelectedDateConfig(stored.dateColumnId);

    setIsLoading(false);
  }, []);

  // --- 1. Lógica do DateConfig ---
  const setDateConfig = useCallback(
    (optionId: string) => {
      const newConfig = DATE_CONFIG_OPTIONS.find((opt) => opt.id === optionId);
      if (newConfig) {
        setSelectedDateConfig(newConfig.id);
        saveConfigToLocalStorage({ dateColumnId: newConfig.id });
      }
    },
    [saveConfigToLocalStorage]
  );

  const getCurrentDateDbColumn = useCallback(():
    | "transaction_date"
    | "calc_charged_day" => {
    const currentConfig = DATE_CONFIG_OPTIONS.find(
      (opt) => opt.id === selectedDateConfig
    );
    return (
      (currentConfig?.db_column as "transaction_date" | "calc_charged_day") ||
      "transaction_date"
    );
  }, [selectedDateConfig]);

  // --- 2. Lógica do DateRange ---
  const updateDateRangeOption = useCallback(
    (optionId: string) => {
      setIsLoading(true);
      setSelectedDateRangeOptionId(optionId);
      saveConfigToLocalStorage({ dateRangeId: optionId });
      if (optionId !== "custom") {
        setCurrentDateRange(getCalculatedDateRange(optionId, new Date()));
      }
      setIsLoading(false);
    },
    [saveConfigToLocalStorage]
  );

  const updateCustomDateRange = useCallback(
    (newRange: DateRange) => {
      setIsLoading(true);
      setSelectedDateRangeOptionId("custom");
      saveConfigToLocalStorage({ dateRangeId: "custom" });
      setCurrentDateRange(
        getCalculatedDateRange("custom", new Date(), newRange)
      );
      setIsLoading(false);
    },
    [saveConfigToLocalStorage]
  );

  // --- Renderização ---
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
      }}
    >
      {children}
    </DashboardConfigContext.Provider>
  );
};
