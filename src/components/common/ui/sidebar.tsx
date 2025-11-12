import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/common/ui/separator";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/common/ui/tooltip";

import { useSidebar } from "@/hooks/useSidebar";

// --- Componentes Base da Sidebar ---

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    collapsible?: "offcanvas" | "icon" | "full";
  }
>(({ collapsible = "icon", className, children, ...props }, ref) => {
  const { isSidebarOpen } = useSidebar();

  return (
    <div
      ref={ref}
      className={cn(
        // 🚨 CORES: Usamos text-foreground
        "group/sidebar fixed inset-y-0 z-30 flex h-screen flex-col text-foreground transition-[width] duration-200 ease-in-out",
        isSidebarOpen ? "w-full" : "w-[72px]",
        className
      )}
      data-collapsible={collapsible}
      data-state={isSidebarOpen ? "expanded" : "collapsed"}
      {...props}
    >
      {children}
    </div>
  );
});
Sidebar.displayName = "Sidebar";

// --- Sub-Componentes UI ---

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="header"
    className={cn("flex flex-col px-3 py-4", className)}
    {...props}
  />
));
SidebarHeader.displayName = "SidebarHeader";

const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => (
  <Separator
    ref={ref}
    data-sidebar="separator"
    // 🚨 CORES: Usamos bg-accent/50
    className={cn("my-3 dark:bg-gray-300/50 bg-black/70", className)}
    {...props}
  />
));
SidebarSeparator.displayName = "SidebarSeparator";

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="content"
    className={cn(
      "flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden group-data-[collapsible=icon]:overflow-hidden",
      className
    )}
    {...props}
  />
));
SidebarContent.displayName = "SidebarContent";

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={cn("flex w-full min-w-0 flex-col", className)}
    {...props}
  />
));
SidebarMenu.displayName = "SidebarMenu";

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar="menu-item"
    className={cn("group/menu-item relative list-none", className)}
    {...props}
  />
));
SidebarMenuItem.displayName = "SidebarMenuItem";

// --- Sidebar Menu Button ---

const sidebarMenuButtonVariants = cva(
  // 🚨 CORES/ESTILOS DINÂMICOS
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-none p-2 text-left outline-none ring-accent transition-colors ease-in-out focus-visible:ring-2 active:text-primary disabled:pointer-events-none disabled:opacity-50 text-foreground hover:bg-accent/20 hover:text-foreground data-[active=true]:bg-blue-700/40 data-[active=true]:dark:bg-blue-100/40 data-[active=true]:text-foreground data-[active=true]:font-medium group-data-[collapsible=icon]:!p-2 group-data-[collapsible=icon]:justify-center [&>svg]:pointer-events-none [&>svg]:shrink-0 [&_span]:pointer-events-none",
  {
    variants: {
      variant: { default: "" },
      size: {
        default: "h-10 text-sm font-medium [&>svg]:h-[18px] [&>svg]:w-[18px]",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean;
    isActive?: boolean;
    tooltip?: string | React.ComponentProps<typeof TooltipContent>;
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(
  (
    {
      asChild = false,
      isActive = false,
      variant = "default",
      size = "default",
      tooltip,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const { isMobile, isSidebarOpen } = useSidebar();

    const tooltipProps =
      typeof tooltip === "string" ? { children: tooltip } : tooltip;

    const buttonContent = (
      <Comp
        ref={ref}
        data-sidebar="menu-button"
        data-size={size}
        data-active={isActive}
        className={cn(
          sidebarMenuButtonVariants({ variant, size, className }),
          !isSidebarOpen ? "justify-center" : "justify-start",
          "flex items-center"
        )}
        {...props}
      >
        {children}
      </Comp>
    );

    if (!tooltip) return buttonContent;

    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
          <TooltipContent
            side="right"
            align="center"
            hidden={isSidebarOpen || isMobile}
            {...tooltipProps}
            // 🚨 CORES DINÂMICAS: bg-card, text-foreground, border-border
            className={cn(
              "bg-card text-foreground border border-border",
              tooltipProps?.className
            )}
          />
        </Tooltip>
      </TooltipProvider>
    );
  }
);
SidebarMenuButton.displayName = "SidebarMenuButton";

// --- Sub Menu Componentes ---

const SidebarMenuSub = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu-sub"
    className={cn(
      // 🚨 CORES: Usamos border-accent/50
      "ml-[calc(18px+0.5rem)] flex min-w-0 flex-col gap-1 border-l border-accent/50 pl-3 py-1",
      "group-data-[collapsible=icon]:hidden",
      className
    )}
    {...props}
  />
));
SidebarMenuSub.displayName = "SidebarMenuSub";

const SidebarMenuSubItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>((props, ref) => <li ref={ref} {...props} />);
SidebarMenuSubItem.displayName = "SidebarMenuSubItem";

const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<"a"> & {
    asChild?: boolean;
    isActive?: boolean;
  }
>(({ asChild = false, isActive, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      ref={ref}
      data-sidebar="menu-sub-button"
      data-active={isActive}
      className={cn(
        // 🚨 CORES DINÂMICAS: text-accent, hover:bg-accent/20, text-foreground
        "flex h-auto min-w-0 items-center gap-2 overflow-hidden rounded-none px-2 py-1.5 text-accent outline-none ring-accent hover:bg-accent/20 hover:text-foreground focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
        "data-[active=true]:bg-accent/40 data-[active=true]:text-foreground data-[active=true]:font-medium",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  );
});
SidebarMenuSubButton.displayName = "SidebarMenuSubButton";

const Collapsible = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }
>(({ ...props }, ref) => <div ref={ref} {...props} />);
Collapsible.displayName = "Collapsible";

const CollapsibleTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>((props, ref) => <button ref={ref} {...props} />);
CollapsibleTrigger.displayName = "CollapsibleTrigger";

const CollapsibleContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => <div ref={ref} {...props} />);
CollapsibleContent.displayName = "CollapsibleContent";

// --- Exportações Finais ---

export {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarSeparator,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
};
