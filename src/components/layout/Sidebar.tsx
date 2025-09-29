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
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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

  const isActive = (path: string) => pathname === path;

  return (
    <Sidebar className="pt-[4.5rem] border-r border-border">
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {routes.map(({ href, name, icon: Icon, children }) => {
                if (children?.length) {
                  return (
                    <Collapsible key={name} defaultOpen={false}>
                      <SidebarMenuItem>
                        <CollapsibleTrigger className="w-full flex items-center gap-2 px-2 py-1 text-black rounded cursor-pointer group data-[state=open]/collapsible:bg-muted">
                          <Icon className="w-4 h-4 mr-2" />
                          {name}
                          <ChevronDown className="ml-auto size-5" />
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
                                    "flex items-center text-sm pl-8 py-1.5 rounded-md transition",
                                    isActive(child.href)
                                      ? "bg-gray-300 font-semibold"
                                      : "hover:bg-gray-200"
                                  )}
                                >
                                  {ChildIcon && (
                                    <ChildIcon className="w-4 h-4 mr-2" />
                                  )}
                                  <span>{child.name}</span>
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
                            "flex items-center gap-2 px-2 py-1 rounded",
                            isActive(href)
                              ? "bg-gray-300 text-black font-semibold"
                              : "hover:bg-gray-200"
                          )}
                        >
                          <Icon size={16} />
                          <span>{name}</span>
                        </Link>
                      ) : (
                        <span>{name}</span>
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
