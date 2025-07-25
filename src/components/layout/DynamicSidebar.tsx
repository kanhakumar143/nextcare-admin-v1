"use client";

import { AppSidebar } from "./Sidebar";
import { useAuthInfo } from "@/hooks/useAuthInfo";
import { getRoutesByRole, getSidebarLabel } from "@/config/navigation";

const DynamicSidebar = () => {
  const { role } = useAuthInfo();
  const routes = getRoutesByRole(role);
  const sidebarLabel = getSidebarLabel(role);

  // Don't render sidebar if no routes or user is not authenticated
  if (!routes.length || !role) {
    return null;
  }

  return <AppSidebar routes={routes} label={sidebarLabel} />;
};

export default DynamicSidebar;
