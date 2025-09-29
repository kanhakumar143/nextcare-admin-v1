"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { ChevronDown, PanelLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";
import clsx from "clsx";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";

type Route = {
  href?: string;
  name: string;
  icon: React.ElementType;
  children?: {
    href: string;
    name: string;
    icon?: React.ElementType;
  }[];
};

type SidebarNavigationProps = {
  routes: Route[];
  label?: string;
};

export function AppSidebar({
  routes,
  label = "Admin Panel",
}: SidebarNavigationProps) {
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();

  const isActive = (path: string) => pathname === path;
  const collapsed = state === "collapsed";

  return (
    <Sidebar
      className={clsx(
        "pt-[4.5rem] border-r border-border transition-all duration-200"
      )}
      collapsible="icon"
    >
      <SidebarHeader className="flex items-center justify-between px-4 py-2"></SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <div className="flex justify-between items-center">
            {!collapsed && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
            <button
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={toggleSidebar}
              className="p-2 rounded hover:bg-gray-200 focus:outline-none"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {routes.map(({ href, name, icon: Icon, children }) => {
                if (children?.length) {
                  return (
                    <Collapsible key={name} defaultOpen={false}>
                      <SidebarMenuItem>
                        <CollapsibleTrigger
                          className={clsx(
                            "w-full flex items-center gap-2 px-2 py-1 text-black rounded cursor-pointer group data-[state=open]/collapsible:bg-muted",
                            collapsed && "justify-center"
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          {!collapsed && <span>{name}</span>}
                          {!collapsed && (
                            <ChevronDown className="ml-auto size-5" />
                          )}
                        </CollapsibleTrigger>
                      </SidebarMenuItem>

                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {children.map((child, idx) => {
                            const ChildIcon = child.icon;
                            return (
                              <SidebarMenuSubItem key={idx}>
                                <Link
                                  href={child.href}
                                  className={clsx(
                                    collapsed
                                      ? "flex items-center justify-center py-2"
                                      : "flex items-center text-sm pl-8 py-1.5 rounded-md transition",
                                    isActive(child.href)
                                      ? "bg-gray-300 font-semibold"
                                      : "hover:bg-gray-200"
                                  )}
                                >
                                  {ChildIcon && (
                                    <ChildIcon className="w-4 h-4 mr-2" />
                                  )}
                                  {!collapsed && <span>{child.name}</span>}
                                </Link>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                }

                return (
                  <SidebarMenuItem key={name}>
                    <SidebarMenuButton asChild>
                      {href ? (
                        <Link
                          href={href}
                          className={clsx(
                            collapsed
                              ? "flex items-center justify-center py-2"
                              : "flex items-center gap-2 px-2 py-1 rounded",
                            isActive(href)
                              ? "bg-gray-300 text-black font-semibold"
                              : "hover:bg-gray-200"
                          )}
                        >
                          <Icon size={20} />
                          {!collapsed && <span>{name}</span>}
                        </Link>
                      ) : (
                        !collapsed && <span>{name}</span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
