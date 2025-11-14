import { useTranslation } from "react-i18next";
import { useMemo } from "react";

export function useTranslatedDateRangeOptions() {
  const { t } = useTranslation();

  return useMemo(
    () => [
      { id: "today", name: t("dateRange.today") },
      { id: "yesterday", name: t("dateRange.yesterday") },
      { id: "last_7_days", name: t("dateRange.last_7_days") },
      { id: "last_30_days", name: t("dateRange.last_30_days") },
      { id: "this_month", name: t("dateRange.this_month") },
      { id: "this_year", name: t("dateRange.this_year") },
      { id: "custom", name: t("dateRange.custom") },
    ],
    [t]
  );
}

export function useTranslatedActionTypes() {
  const { t } = useTranslation();

  return useMemo(
    () => [
      { id: "all", name: t("actionTypes.all") },
      { id: "all_incomes", name: t("actionTypes.all_incomes") },
      { id: "front_sale", name: t("actionTypes.front_sale") },
      { id: "back_sale", name: t("actionTypes.back_sale") },
      { id: "rebill", name: t("actionTypes.rebill") },
      { id: "all_refunds", name: t("actionTypes.all_refunds") },
    ],
    [t]
  );
}

export function useTranslatedAffiliateActionTypes() {
  const { t } = useTranslation();

  return useMemo(
    () => [
      { id: "all_incomes", name: t("actionTypes.all_incomes_sales_only") },
      { id: "front_sale", name: t("actionTypes.front_sale") },
      { id: "back_sale", name: t("actionTypes.back_sale") },
    ],
    [t]
  );
}
