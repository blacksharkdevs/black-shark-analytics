import React, { useState, useCallback, type ReactNode } from "react";
import { SidebarContext } from "./SidebarContextDefinition";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const isMobile = !isDesktop;

  const [isSidebarOpen, setIsSidebarOpen] = useState(isDesktop);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  return (
    <SidebarContext.Provider
      value={{ isSidebarOpen, toggleSidebar, closeSidebar, isMobile }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
