export const OFFER_TYPE_OPTIONS = [
  { id: "FRONTEND", name: "Frontend" },
  { id: "UPSELL", name: "Upsell" },
  { id: "DOWNSELL", name: "Downsell" },
  { id: "ORDER_BUMP", name: "Order Bump" },
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
  db_column: "createdAt";
}

export const DATE_CONFIG_OPTIONS: DateConfigOption[] = [
  { id: "default_date", name: "Default Date", db_column: "createdAt" },
];
