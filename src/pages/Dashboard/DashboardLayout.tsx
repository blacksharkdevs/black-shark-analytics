import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardSkeleton } from "@/components/layout/DashboardSkeleton";
import { useSidebar } from "@/hooks/useSidebar";
import { DashboardConfigProvider } from "@/contexts/DashboardConfigContext";
import { TooltipProvider } from "@/components/common/ui/tooltip";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import {
  DashboardDataProvider,
  useDashboardData,
} from "@/contexts/DashboardDataContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const SIDEBAR_WIDTH = "280px";

function DashboardLayoutContent() {
  const { isSidebarOpen } = useSidebar();
  const { isLoadingData } = useDashboardData();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const currentSidebarWidth = isSidebarOpen ? SIDEBAR_WIDTH : "72px";

  return (
    <div className="flex w-full min-h-screen">
      <AppSidebar width={SIDEBAR_WIDTH} />
      <div
        className="relative flex flex-col flex-1 transition-all duration-300"
        style={{
          marginLeft: isDesktop ? currentSidebarWidth : "0",
          width: isDesktop ? `calc(100% - ${currentSidebarWidth})` : "100%",
        }}
      >
        <Header />
        <main className="flex-1 overflow-y-auto">
          {isLoadingData ? (
            <LoadingScreen backgroundTransparent={true} />
          ) : (
            <Outlet />
          )}
        </main>
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
    <TooltipProvider delayDuration={300}>
      <DashboardConfigProvider>
        <DashboardDataProvider>
          <SidebarProvider>
            <DashboardLayoutContent />
          </SidebarProvider>
        </DashboardDataProvider>
      </DashboardConfigProvider>
    </TooltipProvider>
  );
}
