export interface Product {
  id: string;
  name: string;
}

export interface ActionType {
  id: string;
  name: string;
}

export const STATIC_PRODUCTS_FALLBACK: Product[] = [
  { id: "all", name: "All Products" },
  { id: "prod_alpha", name: "Product Alpha" },
  { id: "prod_beta", name: "Product Beta" },
];

export const ACTION_TYPES: ActionType[] = [
  { id: "all", name: "All Actions" },
  { id: "all_incomes", name: "All Incomes" },
  { id: "front_sale", name: "Front Sale" },
  { id: "back_sale", name: "Back Sale" },
  { id: "rebill", name: "Rebill" },
  { id: "all_refunds", name: "All Refunds" },
];

export const AFFILIATE_ACTION_TYPES: ActionType[] = [
  { id: "all_incomes", name: "All Incomes (Sales Only)" },
  { id: "front_sale", name: "Front Sale" },
  { id: "back_sale", name: "Back Sale" },
];

export const ITEM_TYPE_OPTIONS = [
  { id: "front", name: "Front" },
  { id: "up1", name: "Up1" },
  { id: "up2", name: "Up2" },
  { id: "up3", name: "Up3" },
  { id: "dw1", name: "Dw1" },
  { id: "dw2", name: "Dw2" },
  { id: "dw3", name: "Dw3" },
];

export const DATE_RANGE_OPTIONS = [
  { id: "today", name: "Today" },
  { id: "yesterday", name: "Yesterday" },
  { id: "last_7_days", name: "Last 7 Days" },
  { id: "last_30_days", name: "Last 30 Days" },
  { id: "this_month", name: "This Month" },
  { id: "this_year", name: "This Year" },
  { id: "custom", name: "Custom Date & Time" },
];

export interface TimezoneOption {
  value: string;
  label: string;
  offsetLabel: string;
  disabled?: boolean;
}

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { value: "UTC", label: "UTC", offsetLabel: "UTC+0" },
  {
    value: "coming_soon",
    label: "Opções em breve",
    offsetLabel: "",
    disabled: true,
  },
];

export interface DateConfigOption {
  id: string;
  name: string;
  db_column: "transaction_date" | "calc_charged_day";
}

export const DATE_CONFIG_OPTIONS: DateConfigOption[] = [
  { id: "default_date", name: "Default Date", db_column: "transaction_date" },
  { id: "platform_date", name: "Platform Date", db_column: "calc_charged_day" },
];
