import { Link, useLocation } from "react-router-dom";
import {
  Users,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  List,
  Settings,
  TrendingUp,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
} from "@/components/common/ui/sidebar";
import { cn } from "@/lib/utils";
import { SidebarLinkItem } from "./SidebarLinkItem";

import { SharkSwim } from "../common/SharkSwin";
import { useSidebar } from "@/hooks/useSidebar";
import { Button } from "../common/ui/button";
import { motion } from "framer-motion";
import { useThemeToggle } from "@/hooks/useThemeToggle";

export function AppSidebar({ width }: { width: string }) {
  const { t } = useTranslation();
  const location = useLocation();
  const pathname = location.pathname;
  const { isSidebarOpen, isMobile, toggleSidebar } = useSidebar();
  const { theme } = useThemeToggle();

  const menuItems = [
    {
      href: "/dashboard",
      label: t("navigation.dashboard"),
      icon: LayoutDashboard,
      isRoot: true,
    },
    {
      href: "/dashboard/performance",
      label: t("navigation.performance"),
      icon: TrendingUp,
    },
    {
      href: "/dashboard/affiliates",
      label: t("navigation.affiliates"),
      icon: Users,
    },
    {
      href: "/dashboard/transactions",
      label: t("navigation.transactions"),
      icon: CircleDollarSign,
    },
    {
      href: "/dashboard/reports",
      label: t("navigation.reports"),
      icon: List,
    },
    {
      href: "/dashboard/configurations",
      label: t("navigation.configurations"),
      icon: Settings,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/dashboard/";
    }
    if (
      href === "/dashboard/affiliates" &&
      (pathname.startsWith("/dashboard/affiliates") ||
        pathname.startsWith("/dashboard/customers"))
    )
      return true;

    return pathname.startsWith(href);
  };

  return (
    <motion.div
      initial={false}
      animate={{
        width: isSidebarOpen && !isMobile ? width : "72px",
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "fixed top-0 left-0 h-full border-r border-gray-400/10 transition-transform duration-300 z-50 flex flex-col bg-black/30 backdrop-blur-xl",
        // Esconde completamente no mobile
        "hidden md:flex"
      )}
    >
      <SidebarHeader className="p-3 py-10">
        <Link
          to="/dashboard"
          className={cn("flex items-center gap-2 justify-center")}
        >
          <SharkSwim
            key={theme}
            width={isSidebarOpen ? 80 : 40}
            color="auto"
            className="text-foreground"
          />
          {isSidebarOpen && (
            <motion.h1
              initial={false}
              animate={{
                opacity: isSidebarOpen ? 1 : 0,
                width: isSidebarOpen ? "auto" : 0,
              }}
              transition={{ duration: 0.2 }}
              className={cn(
                "text-xl text-center font-black text-foreground whitespace-nowrap overflow-hidden",
                !isSidebarOpen && "hidden md:flex"
              )}
            >
              Black Shark <br /> Analytics
            </motion.h1>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="flex flex-col flex-1 px-3 py-4">
        <SidebarMenu className="flex-1 gap-2">
          {menuItems.map((item) => (
            <SidebarLinkItem key={item.href} item={item} isActive={isActive} />
          ))}
        </SidebarMenu>

        {!isMobile && (
          <div className="flex justify-center py-4 mt-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center p-0",
                "text-foreground hover:bg-blue-500 border border-border"
              )}
              aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {isSidebarOpen ? (
                <ChevronLeft className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </Button>
          </div>
        )}
      </SidebarContent>
    </motion.div>
  );
}
