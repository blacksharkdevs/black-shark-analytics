import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Sun, Moon, Globe, CalendarCog, LogOut } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useSidebar } from "@/hooks/useSidebar";
import { useDashboardConfig } from "@/hooks/useDashboardConfig";
import { useThemeToggle } from "@/hooks/useThemeToggle";

import { Button } from "@/components/common/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/common/ui/avatar";
import { Skeleton } from "@/components/common/ui/skeleton";
import { DateRangePicker } from "@/components/domain/DateRangePicker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/common/ui/dropdown-menu"; // 🚨 Sub-components removidos dos imports

import { DATE_CONFIG_OPTIONS, TIMEZONE_OPTIONS } from "@/lib/config";
import { SharkSwim } from "../common/SharkSwin";

const DEFAULT_TIMEZONE =
  TIMEZONE_OPTIONS.find((tz) => !tz.disabled) || TIMEZONE_OPTIONS[0];

export function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { toggleSidebar } = useSidebar();
  const { toggleTheme } = useThemeToggle();

  const {
    selectedDateConfig,
    setDateConfig,
    selectedDateRangeOptionId,
    currentDateRange,
    updateDateRangeOption,
    updateCustomDateRange,
    isLoading: isDateRangeLoading,
  } = useDashboardConfig();

  // Simulação de Timezone (mantida para a UI)
  const [selectedTimezone, setSelectedTimezone] = useState(DEFAULT_TIMEZONE);
  const setTimezone = (timezoneValue: string) => {
    const newTz = TIMEZONE_OPTIONS.find(
      (tz) => tz.value === timezoneValue && !tz.disabled
    );
    if (newTz) setSelectedTimezone(newTz);
  };

  const availableTimezones = TIMEZONE_OPTIONS;

  let headerTitle = "Dashboard";
  const pathname = location.pathname;
  if (pathname.includes("/dashboard/reports")) {
    headerTitle = "Reports";
  } else if (pathname.includes("/dashboard/configurations")) {
    headerTitle = "Configurations";
  } else if (
    pathname.includes("/dashboard/affiliates") ||
    pathname.includes("/dashboard/customers")
  ) {
    headerTitle = "Affiliates";
  } else if (
    pathname.includes("/dashboard/vendas") ||
    pathname.includes("/dashboard/reembolsos") ||
    pathname.includes("/dashboard/transactions")
  ) {
    headerTitle = "Sales";
  } else if (pathname === "/dashboard" || pathname === "/dashboard/") {
    headerTitle = "Dashboard";
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
            className="w-10 h-10 rounded-full text-foreground"
          >
            <Sun className="w-5 h-5 transition-all scale-100 rotate-0 dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute w-5 h-5 transition-all scale-0 rotate-90 dark:rotate-0 dark:scale-100" />
          </Button>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative w-10 h-10 rounded-full"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={`https://placehold.co/100x100.png?text=${user.username
                        .charAt(0)
                        .toUpperCase()}`}
                      alt={user.username}
                    />
                    <AvatarFallback className="bg-accent/20 text-foreground">
                      {user.username.charAt(0).toUpperCase()}
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
                      {user.username}
                    </p>
                    <p className="text-xs leading-none text-blue-400">
                      Administrator Access
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-accent/50" />

                {/* 🚨 COLUNAS DE DATA (ITEM DIRETO) */}
                <DropdownMenuLabel className="px-2 pt-2 pb-1 text-xs font-semibold text-muted-foreground">
                  COLUNAS DE DATA
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={selectedDateConfig}
                  onValueChange={setDateConfig}
                >
                  {DATE_CONFIG_OPTIONS.map((dc) => (
                    <DropdownMenuRadioItem
                      key={dc.id}
                      value={dc.id}
                      className="text-foreground hover:bg-accent/10"
                    >
                      <CalendarCog className="w-4 h-4 mr-2" />
                      {dc.name}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>

                <DropdownMenuSeparator className="bg-accent/50" />

                {/* 🚨 TIMEZONE (ITEM DIRETO) */}
                <DropdownMenuLabel className="px-2 pt-2 pb-1 text-xs font-semibold text-muted-foreground">
                  FUSO HORÁRIO
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={selectedTimezone.value}
                  onValueChange={setTimezone}
                >
                  {availableTimezones.map((tz) => (
                    <DropdownMenuRadioItem
                      key={tz.value}
                      value={tz.value}
                      className="text-foreground hover:bg-accent/10"
                      disabled={tz.disabled}
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      {tz.label}
                      {tz.offsetLabel && ` (${tz.offsetLabel})`}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>

                <DropdownMenuSeparator className="bg-accent/50" />

                {/* Logout */}
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
