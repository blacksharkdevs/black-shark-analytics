import { ItemsReportContext } from "@/contexts/ReportsContextDefinition";
import { useContext } from "react";

export function useReports(): ItemsReportContext {
  const context = useContext(ItemsReportContext);

  if (!context) {
    throw new Error("useReports must be used within an ItemsReportProvider");
  }

  return context;
}
