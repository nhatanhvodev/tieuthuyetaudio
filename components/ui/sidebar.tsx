"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SidebarContextValue = {
  open: boolean;
  setOpen: (value: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (value: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider.");
  }
  return context;
}

type SidebarProviderProps = React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  className,
  style,
  children,
  ...props
}: SidebarProviderProps) {
  const [openState, setOpenState] = React.useState(defaultOpen);
  const [openMobile, setOpenMobile] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  const open = openProp ?? openState;
  const setOpen = React.useCallback(
    (value: boolean) => {
      if (openProp === undefined) {
        setOpenState(value);
      }
      onOpenChange?.(value);
    },
    [openProp, onOpenChange]
  );

  React.useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile((current) => !current);
      return;
    }
    setOpen(!open);
  }, [isMobile, open, setOpen]);

  return (
    <SidebarContext.Provider value={{ open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar }}>
      <div
        data-sidebar-wrapper
        className={cn("group/sidebar-wrapper flex min-h-screen w-full", className)}
        style={
          {
            "--sidebar-width": "17.5rem",
            "--sidebar-width-icon": "4.25rem",
            ...style
          } as React.CSSProperties
        }
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

type SidebarProps = React.ComponentProps<"aside"> & {
  collapsible?: "offcanvas" | "icon" | "none";
};

function Sidebar({ className, collapsible = "icon", children, ...props }: SidebarProps) {
  const { open, openMobile, setOpenMobile } = useSidebar();
  const collapsed = collapsible === "icon" && !open;

  return (
    <>
      {openMobile ? (
        <div className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[2px] md:hidden" onClick={() => setOpenMobile(false)} />
      ) : null}
      <aside
        data-sidebar="sidebar"
        data-collapsed={collapsed}
        className={cn(
          "group/sidebar border-slate-200 bg-white text-slate-900",
          "border-r md:min-h-screen md:shrink-0 md:flex-col",
          collapsed ? "md:w-[var(--sidebar-width-icon)]" : "md:w-[var(--sidebar-width)]",
          "md:transition-[width] md:duration-200 md:ease-linear",
          openMobile ? "fixed inset-y-0 left-0 z-50 flex w-[var(--sidebar-width)] flex-col shadow-xl md:static md:z-auto md:shadow-none" : "hidden md:flex",
          className
        )}
        {...props}
      >
        {children}
      </aside>
    </>
  );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("border-b border-slate-200 p-3", className)} {...props} />;
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex-1 overflow-y-auto p-3", className)} {...props} />;
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("border-t border-slate-200 p-3", className)} {...props} />;
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("space-y-2", className)} {...props} />;
}

function SidebarGroupLabel({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "px-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 group-data-[collapsed=true]/sidebar:hidden",
        className
      )}
      {...props}
    />
  );
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul className={cn("space-y-1", className)} {...props} />;
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li className={cn(className)} {...props} />;
}

type SidebarMenuButtonProps = React.ComponentProps<"button"> & {
  asChild?: boolean;
  isActive?: boolean;
};

function SidebarMenuButton({ className, asChild = false, isActive, ...props }: SidebarMenuButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-active={isActive}
      className={cn(
        "inline-flex h-10 w-full items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition",
        "border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-900",
        "data-[active=true]:border-indigo-200 data-[active=true]:bg-indigo-50 data-[active=true]:text-indigo-700",
        "group-data-[collapsed=true]/sidebar:justify-center group-data-[collapsed=true]/sidebar:px-0",
        className
      )}
      {...props}
    />
  );
}

function SidebarInset({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("min-w-0 flex-1", className)} {...props} />;
}

function SidebarTrigger({ className, ...props }: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar();
  return (
    <Button type="button" variant="secondary" size="icon" className={cn("h-9 w-9", className)} onClick={toggleSidebar} {...props}>
      <PanelLeft className="size-4" />
      <span className="sr-only">Mở menu</span>
    </Button>
  );
}

export {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  useSidebar
};
