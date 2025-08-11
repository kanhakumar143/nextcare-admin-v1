import {
  LayoutDashboard,
  UserCircle,
  Stethoscope,
  Layers,
  BriefcaseMedical,
  Users,
  AppWindow,
  Calendar1,
  HistoryIcon,
  User,
  QrCode,
  ClipboardList,
  FileText,
  FileQuestionMark,
  MapPinPlus,
  Ribbon,
} from "lucide-react";

export type Route = {
  href?: string;
  name: string;
  icon: React.ElementType;
  children?: {
    href: string;
    name: string;
    icon?: React.ElementType;
  }[];
};

// Admin Navigation Routes
export const adminRoutes: Route[] = [
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
    icon: MapPinPlus,
  },
  {
    href: "/dashboard/admin/doctor-management",
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
      {
        href: "/dashboard/admin/services",
        name: "Services",
        icon: LayoutDashboard,
      },
      {
        href: "/dashboard/admin/services/specialty",
        name: "Specialty",
        icon: BriefcaseMedical,
      },
      {
        href: "/dashboard/admin/services/symptoms",
        name: "Symptoms",
        icon: Ribbon,
      },
      {
        href: "/dashboard/admin/services/pre-questionary-sets",
        name: "Pre-Questionary Set",
        icon: FileQuestionMark,
      },
    ],
  },
];

// Doctor Navigation Routes
export const doctorRoutes: Route[] = [
  {
    href: "/dashboard/doctor",
    name: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/doctor/portal",
    name: "Portal",
    icon: AppWindow,
  },
  {
    href: "/dashboard/doctor/profile",
    name: "Profile",
    icon: User,
  },
  {
    href: "/dashboard/doctor/history",
    name: "Consultation History",
    icon: HistoryIcon,
  },
  {
    href: "/dashboard/doctor/calender",
    name: "Calendar",
    icon: Calendar1,
  },
  {
    href: "/dashboard/doctor/patient-stories",
    name: "Patient Stories",
    icon: ClipboardList,
  },
];

// Nurse Navigation Routes
export const nurseRoutes: Route[] = [
  {
    href: "/dashboard/nurse",
    name: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/nurse/check-in",
    name: "Scan QR Code",
    icon: QrCode,
  },
];

// Receptionist Navigation Routes
export const receptionistRoutes: Route[] = [
  {
    href: "/dashboard/receptionist",
    name: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/receptionist/check-in",
    name: "Scan QR Code",
    icon: QrCode,
  },
];

// Function to get routes based on user role
export const getRoutesByRole = (role: string | null): Route[] => {
  switch (role?.toLowerCase()) {
    case "admin":
      return adminRoutes;
    case "doctor":
      return doctorRoutes;
    case "nurse":
      return nurseRoutes;
    case "receptionist":
      return receptionistRoutes;
    default:
      return [];
  }
};

// Function to get sidebar label based on user role
export const getSidebarLabel = (role: string | null): string => {
  switch (role?.toLowerCase()) {
    case "admin":
      return "Admin Panel";
    case "doctor":
      return "Doctor Panel";
    case "nurse":
      return "Nurse Panel";
    case "receptionist":
      return "Receptionist Panel";
    default:
      return "Dashboard";
  }
};
