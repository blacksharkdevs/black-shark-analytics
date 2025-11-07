import { useContext } from "react";
import { DashboardDataContext } from "@/contexts/DashboardDataContextDefinition";

export function useDashboardData() {
  const context = useContext(DashboardDataContext);
  if (context === undefined) {
    throw new Error(
      "useDashboardData must be used within a DashboardDataProvider"
    );
  }
  return context;
}
