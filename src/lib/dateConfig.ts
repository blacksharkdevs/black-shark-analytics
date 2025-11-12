// Assumindo que você tem uma estrutura de opções de data
export const DATE_CONFIG_OPTIONS = [
  {
    id: "transaction_date",
    name: "Data da Transação",
    db_column: "transaction_date",
  },
  {
    id: "calc_charged_day",
    name: "Dia do Cobrança",
    db_column: "calc_charged_day",
  },
];

/**
 * Retorna o nome da coluna do banco de dados correspondente ao ID de configuração de data.
 * @param selectedDateConfigId O ID da opção de data selecionada (ex: 'transaction_date').
 * @returns O nome da coluna no Supabase.
 */
export function getDateDbColumn(
  selectedDateConfigId: string
): "transaction_date" | "calc_charged_day" {
  const currentConfig = DATE_CONFIG_OPTIONS.find(
    (opt) => opt.id === selectedDateConfigId
  );
  // Garantindo que a coluna seja uma das opções tipadas ou o default
  return (
    (currentConfig?.db_column as "transaction_date" | "calc_charged_day") ||
    "transaction_date"
  );
}
