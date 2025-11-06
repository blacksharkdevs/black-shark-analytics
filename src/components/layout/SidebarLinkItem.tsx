import React from "react";
import { Link } from "react-router-dom";
import { useSidebar } from "@/hooks/useSidebar";
import { cn } from "@/lib/utils";
import {
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/common/ui/sidebar";

interface MenuItemProps {
  item: { href: string; label: string; icon: React.ElementType };
  isActive: (href: string) => boolean;
}

export function SidebarLinkItem({ item, isActive }: MenuItemProps) {
  const { isSidebarOpen } = useSidebar();

  return (
    <SidebarMenuItem>
      <Link to={item.href}>
        <SidebarMenuButton
          isActive={isActive(item.href)}
          tooltip={{
            children: item.label,
            side: "right",
            className: "bg-blackshark-card text-blackshark-primary",
          }}
          className="justify-start h-10 text-sm font-medium"
          size="default"
        >
          <span>
            <item.icon className="h-[18px] w-[18px] text-current" />
            <span className={cn("ml-2", !isSidebarOpen && "hidden")}>
              {item.label}
            </span>
          </span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  );
}
