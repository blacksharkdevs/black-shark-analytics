import { SidebarContext } from "@/contexts/SidebarContextDefinition";
import { useContext } from "react";

// Hook para consumir o contexto
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};
