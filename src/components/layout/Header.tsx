import { useLocation } from "react-router-dom";
import { Sun, Moon, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/hooks/useSidebar";
import { useThemeToggle } from "@/hooks/useThemeToggle";

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
  const { toggleTheme } = useThemeToggle();

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
    <header className="sticky top-0 z-40 h-16 border-b-[1px] bg-background/95 backdrop-blur border-b-gray-500/30">
      <div className="container flex items-center justify-between h-16 px-4 max-w-screen-2xl md:px-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden text-foreground hover:bg-accent/10"
          >
            <SharkSwim />
          </Button>

          <h1 className="text-2xl font-bold tracking-tight font-headline text-foreground">
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

          {/* Botão Toggle Theme */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-10 h-10 rounded-full text-foreground hover:dark:bg-blue-700"
          >
            <Sun className="w-5 h-5 transition-all scale-100 rotate-0 dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute w-5 h-5 transition-all scale-0 rotate-90 dark:rotate-0 dark:scale-100" />
          </Button>

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
                    <AvatarFallback className="bg-accent/20 text-foreground">
                      {user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-64 border rounded-none bg-card border-border"
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
