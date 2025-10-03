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
import { usePathname, useRouter } from "next/navigation";
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
  const router = useRouter();
  const { state, toggleSidebar } = useSidebar();

  const isActive = (path: string) => pathname === path;
  const collapsed = state === "collapsed";

  const handleNavigate = (href: string) => {
    if (href) router.push(href);
  };

  return (
    <Sidebar
      className={clsx(
        "pt-[4.5rem] border-r border-border bg-white shadow-sm transition-all duration-300 min-h-screen"
      )}
      collapsible="icon"
    >
      <SidebarHeader
        className={`${
          collapsed ? "px-2" : "px-6"
        } py-3 mt-4 border-b border-border`}
      >
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="text-gray-700 font-bold text-md tracking-wide">
              {label}
            </div>
          )}
          <button
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={toggleSidebar}
            className="p-2 rounded"
          >
            <PanelLeft className="w-4 h-4 text-primary" />
          </button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {routes.map(({ href, name, icon: Icon, children }) => {
                if (children?.length) {
                  return (
                    <Collapsible key={name} defaultOpen={false}>
                      <SidebarMenuItem>
                        <CollapsibleTrigger
                          className={clsx(
                            "w-full flex items-center gap-2 px-3 py-2 text-primary rounded-lg cursor-pointer group transition-colors duration-200 data-[state=open]/collapsible:bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-primary",
                            collapsed && "justify-center"
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          {!collapsed && (
                            <span className="font-medium">{name}</span>
                          )}
                          {!collapsed && (
                            <ChevronDown className="ml-auto size-5 transition-transform group-data-[state=open]/collapsible:rotate-180 text-primary" />
                          )}
                        </CollapsibleTrigger>
                      </SidebarMenuItem>

                      <CollapsibleContent>
                        <SidebarMenuSub className="pl-2 border-l border-primary-200">
                          {children.map((child, idx) => {
                            const ChildIcon = child.icon;
                            return (
                              <SidebarMenuSubItem key={idx}>
                                <button
                                  type="button"
                                  onClick={() => handleNavigate(child.href)}
                                  className={clsx(
                                    collapsed
                                      ? "flex items-center justify-center py-3 w-full"
                                      : "flex items-center text-base pl-8 py-3 rounded-xl transition-colors duration-200 w-full",
                                    isActive(child.href)
                                      ? "bg-primary text-white font-semibold shadow"
                                      : "hover:bg-primary-100 hover:text-primary"
                                  )}
                                  tabIndex={0}
                                  onMouseEnter={(e) => {
                                    if (isActive(child.href)) {
                                      e.currentTarget.style.background =
                                        "rgba(59,130,246,0.5)";
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (isActive(child.href)) {
                                      e.currentTarget.style.background = "";
                                    }
                                  }}
                                >
                                  {ChildIcon && (
                                    <ChildIcon
                                      className={clsx(
                                        "w-4 h-4 mr-2",
                                        isActive(child.href)
                                          ? "text-white"
                                          : "text-primary"
                                      )}
                                    />
                                  )}
                                  {!collapsed && <span>{child.name}</span>}
                                </button>
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
                        <button
                          type="button"
                          onClick={() => handleNavigate(href!)}
                          // style={
                          //   isActive(href)
                          //     ? {
                          //         transition: "background 0.2s",
                          //       }
                          //     : {}
                          // }
                          className={clsx(
                            collapsed
                              ? "flex items-center justify-center py-6 w-full hover:cursor-pointer"
                              : "flex items-center gap-4 px-5 py-6 rounded-sm font-semibold text-base transition-colors duration-200 w-full hover:cursor-pointer",
                            isActive(href)
                              ? "bg-primary hover:bg-gray-500 text-white font-semibold shadow hover:cursor-pointer"
                              : "hover:bg-gray-500 hover:text-primary hover:cursor-pointer"
                          )}
                          tabIndex={0}
                          // onMouseEnter={(e) => {
                          //   if (isActive(href)) {
                          //     e.currentTarget.style.background =
                          //       "rgba(59,130,246,0.5)";
                          //   }
                          // }}
                          // onMouseLeave={(e) => {
                          //   if (isActive(href)) {
                          //     e.currentTarget.style.background = "";
                          //   }
                          // }}
                        >
                          <Icon
                            size={20}
                            className={clsx(
                              isActive(href) ? "text-white" : "text-primary"
                            )}
                          />
                          {!collapsed && <span>{name}</span>}
                        </button>
                      ) : (
                        !collapsed && (
                          <span className="font-medium text-primary">
                            {name}
                          </span>
                        )
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
