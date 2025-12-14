import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Users,
  LayoutDashboard,
  CircleDollarSign,
  List,
  Settings,
  Menu,
  LogOut,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/common/ui/sheet";
import { Button } from "@/components/common/ui/button";
import { Separator } from "@/components/common/ui/separator";
import { DateRangePicker } from "@/components/domain/DateRangePicker";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { SharkSwim } from "@/components/common/SharkSwin";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardConfig } from "@/contexts/DashboardConfigContext";
import { cn } from "@/lib/utils";

export function MobileMenu() {
  const { t } = useTranslation();
  const location = useLocation();
  const pathname = location.pathname;
  const { logout, user } = useAuth();
  const [open, setOpen] = useState(false);

  const {
    selectedDateRangeOptionId,
    currentDateRange,
    updateDateRangeOption,
    updateCustomDateRange,
  } = useDashboardConfig();

  const menuItems = [
    {
      href: "/dashboard",
      label: t("navigation.dashboard"),
      icon: LayoutDashboard,
      isRoot: true,
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-foreground hover:bg-accent/10"
        >
          <Menu className="w-6 h-6" />
          <span className="sr-only">{t("navigation.menu")}</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[280px] p-0 bg-[rgba(15,23,42,0.95)] backdrop-blur-xl border-r border-gray-400/10"
      >
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="flex items-center justify-center gap-2">
            <SharkSwim width={60} color="auto" className="text-foreground" />
            <span className="text-lg font-black text-foreground">
              Black Shark
              <br />
              Analytics
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-[calc(100%-80px)] px-4">
          {/* Date Range Picker */}
          <div className="mb-4 space-y-2">
            <p className="px-2 text-xs font-semibold text-muted-foreground">
              {t("filters.dateRange")}
            </p>
            <DateRangePicker
              currentGlobalRange={currentDateRange}
              selectedGlobalRangeOptionId={selectedDateRangeOptionId}
              onGlobalRangeOptionChange={updateDateRangeOption}
              onGlobalCustomDateApply={updateCustomDateRange}
            />
          </div>

          <Separator className="my-4 bg-accent/20" />

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1 max-h-[140px] overflow-y-scroll">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                    "text-sm font-medium",
                    active
                      ? "bg-[rgba(6,182,212,0.15)] backdrop-blur-[10px] border border-[rgba(6,182,212,0.3)] text-foreground shadow-[0_0_20px_rgba(6,182,212,0.4),0_0_40px_rgba(6,182,212,0.2),inset_0_0_20px_rgba(6,182,212,0.15)]"
                      : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <Separator className="my-4 bg-accent/20" />

          {/* Bottom Section */}
          <div className="pb-4 space-y-3">
            {/* Language Selector */}
            <div className="flex items-center justify-between px-2">
              <p className="text-xs font-semibold text-muted-foreground">
                {t("header.language")}
              </p>
              <LanguageSelector />
            </div>

            {/* User Info */}
            {user && (
              <div className="px-2 py-2 rounded-lg bg-accent/5">
                <p className="text-xs font-medium text-foreground">
                  {user.email}
                </p>
                <p className="text-[10px] text-blue-400">
                  {t("header.administratorAccess")}
                </p>
              </div>
            )}

            {/* Logout Button */}
            <Button
              variant="ghost"
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="justify-start w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t("navigation.logout")}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
