import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { SidebarMenuButton } from "@/components/common/ui/sidebar";
import { useSidebar } from "@/hooks/useSidebar";
import { motion } from "framer-motion"; // Importar motion

interface SidebarLinkItemProps {
  item: {
    href: string;
    label: string;
    icon: React.ElementType;
  };
  isActive: (href: string) => boolean;
}

export function SidebarLinkItem({ item, isActive }: SidebarLinkItemProps) {
  const { isSidebarOpen } = useSidebar();
  const Icon = item.icon;

  return (
    <li className="relative">
      <Link to={item.href}>
        <SidebarMenuButton isActive={isActive(item.href)} tooltip={item.label}>
          <Icon className="h-[22px] w-[22px] shrink-0 data-[active=true]:text-white text-foreground" />
          {isSidebarOpen && (
            <motion.span
              initial={false}
              animate={{
                opacity: isSidebarOpen ? 1 : 0,
                width: isSidebarOpen ? "auto" : 0,
              }}
              transition={{ duration: 0.2 }}
              className={cn("ml-2 whitespace-nowrap overflow-hidden")}
            >
              {item.label}
            </motion.span>
          )}
        </SidebarMenuButton>
      </Link>
    </li>
  );
}
