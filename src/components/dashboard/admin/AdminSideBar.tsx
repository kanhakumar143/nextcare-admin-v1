"use client";
import { AppSidebar } from "@/components/layout/Sidebar";
import {
  LayoutDashboard,
  UserCircle,
  Stethoscope,
  Layers,
  BriefcaseMedical,
  Users,
  LocationEdit,
  FileQuestionMark
} from "lucide-react";

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
const AdminSideBar = () => {
  const routes: Route[] = [
    {
      href: "/dashboard/admin",
      name: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/admin/profile",
      name: "Profile",
      icon: UserCircle,
    },
    {
      href: "/dashboard/admin/location-management",
      name: "Location Management",
      icon: LocationEdit,
    },
    {
      href: "/admin/doctors",
      name: "Doctor Management",
      icon: Stethoscope,
    },
    {
      href: "/admin/nurse",
      name: "Nurse Management",
      icon: BriefcaseMedical,
    },
    {
      href: "/admin/staff",
      name: "Staff Management",
      icon: Users,
    },
    {
      name: "Services",
      icon: Layers,
      children: [
        { href: "/dashboard/admin/services", name: "Services", icon: LayoutDashboard },
        { href: "/admin/symptoms", name: "Symptoms", icon: Stethoscope },
        { href: "/admin/questionary", name: "Questionary",icon: FileQuestionMark },
      ],
    },
  ];
  return (
    <>
      <AppSidebar routes={routes} />
    </>
  );
};

export default AdminSideBar;
