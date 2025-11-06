import { useContext } from "react";
import { DashboardConfigContext } from "@/contexts/DashboardConfigContextDefiniton";

export const useDashboardConfig = () => {
  const context = useContext(DashboardConfigContext);
  if (context === undefined) {
    throw new Error(
      "useDashboardConfig must be used within a DashboardConfigProvider"
    );
  }
  return context;
};
