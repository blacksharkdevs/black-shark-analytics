import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Globe, CalendarCog, LogOut } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useSidebar } from "@/hooks/useSidebar"; // Importado de /hooks/useSidebar
import { useDashboardConfig } from "@/hooks/useDashboardConfig"; // 🚨 NOVO HOOK UNIFICADO

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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/common/ui/dropdown-menu";

// Importa as CONSTANTES diretamente (sem hooks desnecessários)
import { DATE_CONFIG_OPTIONS, TIMEZONE_OPTIONS } from "@/lib/config";

// Timezone padrão (Hardcoded, pois removemos o provedor de estado)
const DEFAULT_TIMEZONE =
  TIMEZONE_OPTIONS.find((tz) => !tz.disabled) || TIMEZONE_OPTIONS[0];

export function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { toggleSidebar } = useSidebar();

  // 🔑 Puxamos TUDO do novo hook consolidado (menos o Timezone)
  const {
    selectedDateConfig,
    setDateConfig,
    selectedDateRangeOptionId,
    currentDateRange,
    updateDateRangeOption,
    updateCustomDateRange,
    isLoading: isDateRangeLoading,
  } = useDashboardConfig();

  // 🚨 Simulação de Timezone: Se o Provider foi removido, o estado fica simples
  const [selectedTimezone, setSelectedTimezone] = useState(DEFAULT_TIMEZONE);
  const setTimezone = (timezoneValue: string) => {
    const newTz = TIMEZONE_OPTIONS.find(
      (tz) => tz.value === timezoneValue && !tz.disabled
    );
    if (newTz) setSelectedTimezone(newTz);
  };

  const availableTimezones = TIMEZONE_OPTIONS; // Usa a constante diretamente

  // --- LÓGICA DE TÍTULO BASEADA NA ROTA ---
  let headerTitle = "Dashboard";
  const pathname = location.pathname;

  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    headerTitle = "Dashboard";
  } else if (pathname.startsWith("/dashboard/transactions")) {
    headerTitle = "Transações";
  } else if (pathname.startsWith("/dashboard/affiliates")) {
    const parts = pathname.split("/");
    headerTitle =
      parts.length > 3 && parts[2] === "affiliates" && parts[3]
        ? "Histórico de Afiliado"
        : "Afiliados";
  } else if (pathname.startsWith("/dashboard/customers")) {
    headerTitle = "Histórico de Clientes";
  } else if (pathname.startsWith("/dashboard/vendas")) {
    headerTitle = "Vendas";
  } else if (pathname.startsWith("/dashboard/reembolsos")) {
    headerTitle = "Reembolsos";
  }
  // --- FIM LÓGICA DE TÍTULO ---

  return (
    <header className="sticky top-0 z-40 w-full h-16 border-b border-blackshark-accent bg-blackshark-card/90 backdrop-blur">
      <div className="container flex items-center justify-between h-16 px-4 max-w-screen-2xl md:px-8">
        <div className="flex items-center gap-4">
          {/* Botão Hamburger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden text-blackshark-primary hover:bg-blackshark-accent/10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </Button>

          <h1 className="text-2xl font-bold tracking-tight font-headline text-blackshark-primary">
            {headerTitle}
          </h1>
        </div>

        {/* --- Filtros e Configurações --- */}
        <div className="flex items-center gap-2">
          {isDateRangeLoading ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-[180px] bg-blackshark-accent/20" />
              <Skeleton className="h-10 w-[260px] bg-blackshark-accent/20" />
            </div>
          ) : (
            <DateRangePicker
              currentGlobalRange={currentDateRange}
              selectedGlobalRangeOptionId={selectedDateRangeOptionId}
              onGlobalRangeOptionChange={updateDateRangeOption}
              onGlobalCustomDateApply={updateCustomDateRange}
            />
          )}

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative w-10 h-10 transition-colors border rounded-none border-blackshark-accent hover:border-blackshark-primary"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={`https://placehold.co/100x100.png?text=${user.username
                        .charAt(0)
                        .toUpperCase()}`}
                      alt={user.username}
                    />
                    <AvatarFallback className="bg-blackshark-accent/20 text-blackshark-primary">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-64 border rounded-none bg-blackshark-card border-blackshark-accent"
                align="end"
                forceMount
              >
                {/* User Info */}
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1 text-blackshark-primary">
                    <p className="text-sm font-medium leading-none">
                      {user.username}
                    </p>
                    <p className="text-xs leading-none text-blackshark-accent">
                      Administrator Access
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-blackshark-accent/50" />

                {/* Date Config */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="text-blackshark-primary hover:bg-blackshark-accent/10">
                    <CalendarCog className="w-4 h-4 mr-2" />
                    <span>
                      Colunas de Data:{" "}
                      {
                        DATE_CONFIG_OPTIONS.find(
                          (opt) => opt.id === selectedDateConfig
                        )?.name
                      }
                    </span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="border rounded-none bg-blackshark-card border-blackshark-accent">
                      <DropdownMenuRadioGroup
                        value={selectedDateConfig}
                        onValueChange={setDateConfig}
                      >
                        {DATE_CONFIG_OPTIONS.map((dc) => (
                          <DropdownMenuRadioItem
                            key={dc.id}
                            value={dc.id}
                            className="text-blackshark-primary hover:bg-blackshark-accent/10"
                          >
                            {dc.name}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>

                {/* Timezone Config */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="text-blackshark-primary hover:bg-blackshark-accent/10">
                    <Globe className="w-4 h-4 mr-2" />
                    <span>Timezone: {selectedTimezone.label}</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="border rounded-none bg-blackshark-card border-blackshark-accent">
                      <DropdownMenuRadioGroup
                        value={selectedTimezone.value}
                        onValueChange={setTimezone}
                      >
                        {availableTimezones.map((tz) => (
                          <DropdownMenuRadioItem
                            key={tz.value}
                            value={tz.value}
                            className="text-blackshark-primary hover:bg-blackshark-accent/10"
                            disabled={tz.disabled}
                          >
                            {tz.label}
                            {tz.offsetLabel && ` (${tz.offsetLabel})`}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuSeparator className="bg-blackshark-accent/50" />

                {/* Logout */}
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-blackshark-destructive focus:bg-blackshark-destructive/10 focus:text-blackshark-destructive"
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
