import { Link, useLocation } from "react-router-dom";
import {
  ListOrdered,
  Users,
  Settings,
  Package,
  Link as LinkIcon,
  AreaChart,
  List,
  BarChartHorizontal,
  PackageCheck,
} from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarSeparator,
} from "@/components/common/ui/sidebar";
import { cn } from "@/lib/utils";
import { SidebarLinkItem } from "./SidebarLinkItem";
import { SidebarCollapsibleGroup } from "./SidebarCollapsibleGroup";
import { SharkSwim } from "../common/SharkSwin";
import { useSidebar } from "@/hooks/useSidebar";

const menuItems = [
  { href: "/dashboard/vendas", label: "Vendas", icon: ListOrdered },
  { href: "/dashboard/reembolsos", label: "Reembolsos", icon: PackageCheck },
  { href: "/dashboard/affiliates", label: "Afiliados", icon: Users },
];

const reportsMenuItems = [
  { href: "/dashboard/reports/items", label: "Relatório de Itens", icon: List },
  {
    href: "/dashboard/reports/daily-units",
    label: "Relatório de Unidades Diárias",
    icon: BarChartHorizontal,
  },
  {
    href: "/dashboard/reports/main-product-inspector",
    label: "Inspetor de Produtos",
    icon: AreaChart,
  },
];

const configMenuItems = [
  {
    href: "/dashboard/configurations/sku-mapping",
    label: "Mapeamento SKU",
    icon: LinkIcon,
  },
  {
    href: "/dashboard/configurations/main-products",
    label: "Produtos Principais",
    icon: Package,
  },
];

export function AppSidebar({ width }: { width: string }) {
  const location = useLocation();
  const pathname = location.pathname;
  const { isSidebarOpen } = useSidebar();

  // Função de Ativação (Simplificada)
  const isActive = (href: string) => {
    // Para rota principal, verifica se está na rota ou sub-rota principal.
    if (href === "/dashboard/vendas")
      return (
        pathname === "/dashboard" ||
        pathname === "/dashboard/" ||
        pathname === "/dashboard/vendas"
      );
    // Lógica para rotas aninhadas e transações/clientes
    if (
      href === "/dashboard/affiliates" &&
      (pathname.startsWith("/dashboard/affiliates") ||
        pathname.startsWith("/dashboard/customers")) // Agrupando customers em affiliates para fins de menu
    )
      return true;

    return pathname.startsWith(href);
  };

  return (
    <Sidebar
      // Note: O componente Sidebar precisa de lógica interna para lidar com o isSidebarOpen
      collapsible={isSidebarOpen ? "full" : "icon"}
      className={cn(
        "fixed top-0 left-0 h-full border-r border-blackshark-accent bg-blackshark-card transition-transform duration-300 z-50",
        !isSidebarOpen && "transform -translate-x-full md:translate-x-0"
      )}
      style={{ width: width }}
    >
      <SidebarHeader className="p-3">
        <Link
          to="/dashboard/vendas"
          className={cn(
            "flex items-center gap-2",
            isSidebarOpen ? "justify-start" : "justify-center"
          )}
        >
          <SharkSwim width={isSidebarOpen ? 32 : 24} />
          <h1
            className={cn(
              "text-xl font-black text-blackshark-primary",
              !isSidebarOpen && "hidden"
            )}
          >
            BlackShark
          </h1>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarMenu className="gap-2">
          {/* 1. LINKS PRINCIPAIS (Vendas, Reembolsos, Afiliados) */}
          {menuItems.map((item) => (
            <SidebarLinkItem key={item.href} item={item} isActive={isActive} />
          ))}

          {/* 2. GRUPO RELATÓRIOS (Colapsável) */}
          <SidebarCollapsibleGroup
            title="Relatórios"
            Icon={AreaChart}
            basePath="/dashboard/reports"
            items={reportsMenuItems}
          />

          <SidebarSeparator className="bg-blackshark-accent/50" />

          {/* 3. GRUPO CONFIGURAÇÕES (Colapsável) */}
          <SidebarCollapsibleGroup
            title="Configurações"
            Icon={Settings}
            basePath="/dashboard/configurations"
            items={configMenuItems}
          />
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
