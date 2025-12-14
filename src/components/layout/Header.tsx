import { useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/hooks/useSidebar";

import { Button } from "@/components/common/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/common/ui/avatar";
import { Skeleton } from "@/components/common/ui/skeleton";
import { DateRangePicker } from "@/components/domain/DateRangePicker";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/common/ui/dropdown-menu";

import { SharkSwim } from "../common/SharkSwin";
import { useDashboardConfig } from "@/contexts/DashboardConfigContext";

export function Header() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const { toggleSidebar } = useSidebar();

  const {
    selectedDateRangeOptionId,
    currentDateRange,
    updateDateRangeOption,
    updateCustomDateRange,
    isLoading: isDateRangeLoading,
  } = useDashboardConfig();

  let headerTitle = t("navigation.dashboard");
  const pathname = location.pathname;
  if (pathname.includes("/dashboard/reports")) {
    headerTitle = t("navigation.reports");
  } else if (pathname.includes("/dashboard/configurations")) {
    headerTitle = t("navigation.configurations");
  } else if (
    pathname.includes("/dashboard/affiliates") ||
    pathname.includes("/dashboard/customers")
  ) {
    headerTitle = t("navigation.affiliates");
  } else if (
    pathname.includes("/dashboard/vendas") ||
    pathname.includes("/dashboard/reembolsos") ||
    pathname.includes("/dashboard/transactions")
  ) {
    headerTitle = t("navigation.sales");
  } else if (pathname === "/dashboard" || pathname === "/dashboard/") {
    headerTitle = t("navigation.dashboard");
  }

  return (
    <header className="sticky top-0 z-40 h-16 backdrop-blur-xl bg-black/40">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto max-w-screen-2xl md:px-8 ">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden text-foreground hover:bg-accent/10"
          >
            <SharkSwim />
          </Button>

          <h1 className="text-3xl font-bold tracking-tight font-headline text-foreground">
            {headerTitle}
          </h1>
        </div>

        {/* --- Filtros e Configurações --- */}
        <div className="flex items-center gap-2">
          {isDateRangeLoading ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-[180px] bg-accent/20" />
              <Skeleton className="h-10 w-[260px] bg-accent/20" />
            </div>
          ) : (
            <DateRangePicker
              currentGlobalRange={currentDateRange}
              selectedGlobalRangeOptionId={selectedDateRangeOptionId}
              onGlobalRangeOptionChange={updateDateRangeOption}
              onGlobalCustomDateApply={updateCustomDateRange}
            />
          )}

          {/* Seletor de Idioma */}
          <LanguageSelector />

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative w-10 h-10 rounded-full"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={`https://placehold.co/100x100.png?text=${user.email
                        ?.charAt(0)
                        .toUpperCase()}`}
                      alt={user.email}
                    />
                    <AvatarFallback className="">
                      {user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-64 shark-card"
                align="end"
                forceMount
              >
                {/* User Info */}
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1 text-foreground">
                    <p className="text-sm font-medium leading-none">
                      {user.email || "Usuário"}
                    </p>
                    <p className="text-xs leading-none text-blue-400">
                      {t("header.administratorAccess")}
                    </p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-accent/50" />

                {/* Logout */}
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>{t("navigation.logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
