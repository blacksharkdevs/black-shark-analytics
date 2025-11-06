import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/useSidebar";
import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/common/ui/collapsible";
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/common/ui/sidebar";

interface GroupItem {
  href: string;
  label: string;
  icon: React.ElementType;
}
interface CollapsibleGroupProps {
  title: string;
  Icon: React.ElementType;
  basePath: string;
  items: GroupItem[];
}

export function SidebarCollapsibleGroup({
  title,
  Icon,
  basePath,
  items,
}: CollapsibleGroupProps) {
  const location = useLocation();
  const { isSidebarOpen } = useSidebar();
  const isBasePathActive = location.pathname.startsWith(basePath);

  // 🔑 Estado local para o Collapsible: Aberto se a rota principal estiver ativa.
  const [isOpen, setIsOpen] = useState(isBasePathActive);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            isActive={isBasePathActive}
            tooltip={{
              children: title,
              side: "right",
              className: "bg-blackshark-card text-blackshark-primary",
            }}
            className="justify-start h-10 text-sm font-medium"
            size="default"
          >
            <Icon className="h-[18px] w-[18px] text-current" />
            <span
              className={cn(
                "ml-2 flex-1 text-left",
                !isSidebarOpen && "hidden"
              )}
            >
              {title}
            </span>
            <ChevronRight
              className={cn(
                "h-4 w-4 transform transition-transform duration-200 data-[state=open]:rotate-90",
                !isSidebarOpen && "hidden"
              )}
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
      </SidebarMenuItem>
      <CollapsibleContent>
        <SidebarMenuSub>
          {items.map((item) => (
            <SidebarMenuSubItem key={item.href}>
              <Link to={item.href}>
                <SidebarMenuSubButton
                  isActive={location.pathname.startsWith(item.href)}
                >
                  <span>
                    <item.icon className="h-[18px] w-[18px] text-current" />
                    <span className="ml-2">{item.label}</span>
                  </span>
                </SidebarMenuSubButton>
              </Link>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}
