import React from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { useAuth } from "@/hooks/useAuth";
import { DashboardSkeleton } from "@/components/layout/DashboardSkeleton";
import { useSidebar } from "@/hooks/useSidebar";
import { DashboardConfigProvider } from "@/contexts/DashboardConfigContext";

const SIDEBAR_WIDTH = "280px";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen } = useSidebar();

  return (
    <div className="flex min-h-screen">
      <AppSidebar width={SIDEBAR_WIDTH} />
      <div
        className="relative flex flex-col flex-1 transition-all duration-300"
        style={{ marginLeft: isSidebarOpen ? SIDEBAR_WIDTH : "0px" }}
      >
        <Header />

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return <DashboardSkeleton />;
  }

  return (
    <DashboardConfigProvider>
      <SidebarProvider>
        <DashboardLayoutContent>
          <Outlet />
        </DashboardLayoutContent>
      </SidebarProvider>
    </DashboardConfigProvider>
  );
}
