import {
  useState,
  useEffect,
  useCallback,
  type ReactNode,
  useMemo,
} from "react";
import { useTranslation } from "react-i18next";
// O getCalculatedDateRange e a lógica da data range assumo que estão em /lib/data
import { getCalculatedDateRange } from "@/lib/data";
import { DashboardConfigContext } from "./DashboardConfigContextDefiniton";

// Novos imports para persistência e lógica de DB
import {
  loadConfigFromStorage,
  saveConfigToStorage,
  type DashboardConfig,
} from "@/services/configStorage";
import { DATE_CONFIG_OPTIONS, getDateDbColumn } from "@/lib/dateConfig";

interface DateRange {
  from: Date;
  to: Date;
}

// Constantes de Configuração
const DEFAULT_DATE_COLUMN_ID = "transaction_date";
const DEFAULT_DATE_RANGE_ID = "last_7_days";
const DEFAULT_LANGUAGE = "pt-BR";

// --- Provider ---

export const DashboardConfigProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);

  // Carrega a configuração inicial UMA VEZ
  const initialConfig = useMemo(() => loadConfigFromStorage(), []); // 1. ESTADO: COLUNA DE DATA (DB Column)

  const [selectedDateConfig, setSelectedDateConfig] = useState<string>(
    initialConfig.dateColumnId || DEFAULT_DATE_COLUMN_ID
  ); // 2. ESTADO: OPÇÃO DE PERÍODO (Preset: last_7_days, custom, etc.)

  const [selectedDateRangeOptionId, setSelectedDateRangeOptionId] =
    useState<string>(initialConfig.dateRangeId || DEFAULT_DATE_RANGE_ID); // 3. ESTADO: PERÍODO (Datas de/para)

  const [currentDateRange, setCurrentDateRange] = useState<DateRange>(() =>
    getCalculatedDateRange(
      initialConfig.dateRangeId || DEFAULT_DATE_RANGE_ID,
      new Date()
    )
  );

  // 4. ESTADO: IDIOMA
  const [language, setLanguageState] = useState<string>(
    initialConfig.language || DEFAULT_LANGUAGE
  ); // --- Funções de Persistência (Simplificada) --- // Essa função agora só delega a lógica de mesclagem e armazenamento para o Service

  const saveConfig = useCallback(
    (newConfig: DashboardConfig) => {
      saveConfigToStorage(newConfig);
    },
    [] // Sem dependências, pois o serviço gerencia a mesclagem.
  );

  // A Lógica de Inicialização no useEffect é simplificada, pois os useStates já pegaram a config.
  // Usamos o useEffect apenas para garantir que o dateRange seja calculado na montagem.
  useEffect(() => {
    // Recalcula o dateRange usando os IDs carregados para garantir a precisão
    setCurrentDateRange(
      getCalculatedDateRange(selectedDateRangeOptionId, new Date())
    );
    // Inicializa o idioma do i18n com o idioma salvo (apenas uma vez na montagem)
    i18n.changeLanguage(language);
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Executa apenas uma vez na montagem

  // Recalcula o dateRange quando o ID da opção mudar
  useEffect(() => {
    if (selectedDateRangeOptionId !== "custom") {
      setCurrentDateRange(
        getCalculatedDateRange(selectedDateRangeOptionId, new Date())
      );
    }
  }, [selectedDateRangeOptionId]);

  // --- 1. Lógica do DateConfig ---

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

  // ➡️ REFACTOR: Usando a função pura da Lib
  const getCurrentDateDbColumn = useCallback(
    () => getDateDbColumn(selectedDateConfig),
    [selectedDateConfig]
  ); // --- 2. Lógica do DateRange ---

  const updateDateRangeOption = useCallback(
    (optionId: string) => {
      setIsLoading(true);
      setSelectedDateRangeOptionId(optionId);
      saveConfig({ dateRangeId: optionId });
      if (optionId !== "custom") {
        // Recálculo da data: Se o ID mudar, o useEffect acima já vai recalcular o currentDateRange.
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
      saveConfig({ dateRangeId: "custom" }); // O Custom range precisa ser atualizado imediatamente, pois não depende do ID para recálculo
      setCurrentDateRange(
        getCalculatedDateRange("custom", new Date(), newRange)
      );
      setIsLoading(false);
    },
    [saveConfig]
  );

  // --- 3. Lógica do Idioma ---
  const setLanguage = useCallback(
    (lang: string) => {
      setLanguageState(lang);
      i18n.changeLanguage(lang);
      localStorage.setItem("language", lang);
      saveConfig({ language: lang });
    },
    [i18n, saveConfig]
  ); // --- Renderização ---

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
