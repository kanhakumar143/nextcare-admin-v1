'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  UserCircle,
  Stethoscope,
  Layers,
  ChevronDown,
  ChevronUp,
  BriefcaseMedical,
  Users,
  FileText,
  ShieldQuestion,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import clsx from "clsx";

export function AppSidebar() {
  const pathname = usePathname();
  const [openServices, setOpenServices] = useState(false);

  // Auto-expand dropdown if inside /admin/services/*
  // useEffect(() => {
  //   if (
  //     pathname.startsWith("/admin/services") ||
  //     pathname.startsWith("/admin/symptoms") ||
  //     pathname.startsWith("/admin/questionary")
  //   ) {
  //     setOpenServices(true);
  //   }
  // }, [pathname]);

  const isActive = (path: string) => pathname === path;

  return (
    <Sidebar className="w-50 min-h-full mt-5 px-1 py-18">
      <SidebarContent>
        <SidebarGroup>
          {/* <SidebarGroupLabel>Admin Panel</SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Dashboard */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    href="/dashboard/admin"
                    className={clsx(
                      "flex items-center gap-2",
                      isActive("/dashboard/admin") && "font-semibold  px-2 bg-gray-300 text-primary "
                    )}
                  >
                    <LayoutDashboard size={16} />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Doctor Management */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    href="/admin/doctors"
                    className={clsx(
                      "flex items-center gap-2",
                      isActive("/admin/profile") && "font-semibold  px-2 py-1 rounded"
                    )}
                  >
                    <UserCircle size={16} />
                    <span>Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    href="/admin/doctors"
                    className={clsx(
                      "flex items-center gap-2",
                      isActive("/admin/doctor") && "font-semibold  px-2 py-1 rounded"
                    )}
                  >
                    <Stethoscope size={16} />
                    <span>Doctor Management</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>



              {/* Nurse */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    href="/admin/nurse"
                    className={clsx(
                      "flex items-center gap-2",
                      isActive("/admin/nurse") && "font-semibold  px-2 py-1 rounded"
                    )}
                  >
                    <BriefcaseMedical size={16} />
                    <span>Nurse Management</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    href="/admin/nurse"
                    className={clsx(
                      "flex items-center gap-2",
                      isActive("/admin/nurse") && "font-semibold  px-2 py-1 rounded"
                    )}
                  >
                    <Users size={16} />
                    <span>Staff Management</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Services Dropdown */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setOpenServices(!openServices)}
                  className="flex w-full items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Layers size={16} />
                    <span>Services</span>
                  </div>
                  {openServices ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </SidebarMenuButton>
              </SidebarMenuItem>

              {openServices && (
                <div className="ml-4 space-y-1">
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link
                        href="/admin/services"
                        className={clsx(
                          "text-sm",
                          isActive("/admin/services") && "font-semibold  px-2 py-1 rounded"
                        )}
                      >
                        <span>Services</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link
                        href="/admin/symptoms"
                        className={clsx(
                          "text-sm",
                          isActive("/admin/symptoms") && "font-semibold  px-2 py-1 rounded"
                        )}
                      >
                        <span>Symptoms</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link
                        href="/admin/questionary"
                        className={clsx(
                          "text-sm",
                          isActive("/admin/questionary") && "font-semibold  px-2 py-1 rounded"
                        )}
                      >
                        <span>Questionary</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
