import { Link, useLocation } from "react-router-dom";
import {
  ListOrdered,
  Users,
  Package,
  Link as LinkIcon,
  AreaChart,
  List,
  BarChartHorizontal,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarSeparator,
} from "@/components/common/ui/sidebar";
import { cn } from "@/lib/utils";
import { SidebarLinkItem } from "./SidebarLinkItem";

import { SharkSwim } from "../common/SharkSwin";
import { useSidebar } from "@/hooks/useSidebar";
import { Button } from "../common/ui/button";
import { motion } from "framer-motion";

const menuItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    isRoot: true,
  },
  { href: "/dashboard/transactions", label: "Transactions", icon: ListOrdered }, // 🚨 ROTA ADICIONADA
  { href: "/dashboard/affiliates", label: "Affiliates", icon: Users },
];

const reportsMenuItems = [
  { href: "/dashboard/reports/items", label: "Items Report", icon: List },
  {
    href: "/dashboard/reports/daily-units",
    label: "Daily Units Report",
    icon: BarChartHorizontal,
  },
  {
    href: "/dashboard/reports/main-product-inspector",
    label: "Product Inspector",
    icon: AreaChart,
  },
];

const configMenuItems = [
  {
    href: "/dashboard/configurations/sku-mapping",
    label: "SKU Mapping",
    icon: LinkIcon,
  },
  {
    href: "/dashboard/configurations/main-products",
    label: "Main Products",
    icon: Package,
  },
];

export function AppSidebar({ width }: { width: string }) {
  const location = useLocation();
  const pathname = location.pathname;
  const { isSidebarOpen, isMobile, toggleSidebar } = useSidebar();

  // 🚨 LÓGICA DE ATIVAÇÃO
  const isActive = (href: string) => {
    if (href === "/dashboard") {
      // Ativa se for o root path exato
      return pathname === "/dashboard" || pathname === "/dashboard/";
    }
    if (
      href === "/dashboard/affiliates" &&
      (pathname.startsWith("/dashboard/affiliates") ||
        pathname.startsWith("/dashboard/customers"))
    )
      return true;

    // Para todos os outros links, usa o startswith
    return pathname.startsWith(href);
  };

  return (
    <motion.div // 🚨 Usamos motion.div para animar a largura da Sidebar
      initial={false}
      animate={{
        width: isSidebarOpen && !isMobile ? width : isMobile ? "280px" : "72px",
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "fixed top-0 left-0 h-full border-r border-gray-400 bg-card transition-transform duration-300 z-50 flex flex-col", // flex flex-col para o layout interno
        {
          "transform -translate-x-full": !isSidebarOpen && isMobile, // Esconde no mobile
          "w-[280px]": isSidebarOpen && isMobile, // Garante largura no mobile aberto
        }
      )}
    >
      <SidebarHeader className="p-3 py-10">
        <Link
          to="/dashboard"
          className={cn("flex items-center gap-2 justify-center")}
        >
          <SharkSwim width={isSidebarOpen ? 80 : 40} />
          {/* Animação do título BlackShark */}
          {isSidebarOpen && (
            <motion.h1
              initial={false}
              animate={{
                opacity: isSidebarOpen ? 1 : 0,
                width: isSidebarOpen ? "auto" : 0,
              }}
              transition={{ duration: 0.2 }}
              className={cn(
                "text-xl font-black text-foreground whitespace-nowrap overflow-hidden",
                !isSidebarOpen && "hidden md:flex" // Esconde no modo ícone, exceto se for mobile
              )}
            >
              BlackShark
            </motion.h1>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="flex flex-col flex-1 px-3 py-4">
        <SidebarMenu className="flex-1 gap-2">
          {menuItems.map((item) => (
            <SidebarLinkItem key={item.href} item={item} isActive={isActive} />
          ))}
          <SidebarSeparator />
          {reportsMenuItems.map((item) => (
            <SidebarLinkItem key={item.href} item={item} isActive={isActive} />
          ))}
          <SidebarSeparator />
          {configMenuItems.map((item) => (
            <SidebarLinkItem key={item.href} item={item} isActive={isActive} />
          ))}
        </SidebarMenu>

        {/* BOTÃO DE TOGGLE DA SIDEBAR (para Desktop no rodapé) */}
        {!isMobile && ( // Renderiza apenas no desktop
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
