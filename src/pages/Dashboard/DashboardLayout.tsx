import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { useAuth } from "@/hooks/useAuth";
import { DashboardSkeleton } from "@/components/layout/DashboardSkeleton";
import { useSidebar } from "@/hooks/useSidebar";
import { DashboardConfigProvider } from "@/contexts/DashboardConfigContext";
import { TooltipProvider } from "@/components/common/ui/tooltip";

const SIDEBAR_WIDTH = "280px";

function DashboardLayoutContent() {
  const { isSidebarOpen } = useSidebar();

  const currentSidebarWidth = isSidebarOpen ? SIDEBAR_WIDTH : "72px";

  return (
    <div className="flex w-full min-h-screen bg-background">
      <AppSidebar width={SIDEBAR_WIDTH} />
      <div
        className="relative flex flex-col flex-1 transition-all duration-300"
        style={{
          marginLeft: currentSidebarWidth,
          width: `calc(100% - ${currentSidebarWidth})`,
        }}
      >
        <Header />
        <main className="flex-1 p-4 overflow-y-auto md:p-8">
          <Outlet />
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
        <SidebarProvider>
          <DashboardLayoutContent />
        </SidebarProvider>
      </DashboardConfigProvider>
    </TooltipProvider>
  );
}
