/* eslint-disable @typescript-eslint/no-explicit-any */

const CONFIG_LOCAL_STORAGE_KEY = "blackshark_dashboard_config";

export interface DashboardConfig {
  dateRangeId?: string;
  dateColumnId?: string;
  language?: string;
}

/**
 * Carrega a configuração do dashboard do Local Storage.
 * Retorna um objeto vazio se não houver dados ou se estiver rodando no lado do servidor.
 */
export function loadConfigFromStorage(): DashboardConfig {
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
 * Salva a configuração atualizada no Local Storage.
 * @param config A porção da configuração a ser salva.
 */
export function saveConfigToStorage(config: DashboardConfig): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    // Carrega o estado atual, mescla com o novo e salva
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
