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
  AlarmClock,
  BellRing,
  ReceiptText,
  IndianRupee,
  Wallet,
  ScrollText,
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
    href: "/dashboard/admin/notify-patient",
    name: "Notify Patient",
    icon: BellRing,
  },
  {
    href: "/dashboard/admin/slots-management",
    name: "Slots Management",
    icon: Calendar1,
  },

  {
    name: "Users",
    icon: Users,
    children: [
      {
        href: "/dashboard/admin/doctor-management",
        name: "Doctor Management",
        icon: Stethoscope,
      },
      {
        href: "/dashboard/admin/nurse-management",
        name: "Nurse Management",
        icon: BriefcaseMedical,
      },
      {
        href: "/admin/staff",
        name: "Staff Management",
        icon: Users,
      },
      {
        href: "/dashboard/admin/lab-technician-management",
        name: "Lab Management",
        icon: ClipboardList,
      },
    ],
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
        href: "/dashboard/admin/services/sub-services",
        name: "Sub Services",
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
  {
    name: "Pricing & Billing",
    icon: ReceiptText,
    children: [
      {
        href: "/dashboard/admin/pricing-planes/tax-management",
        name: "Tax Management",
        icon: ScrollText,
      },
      {
        href: "/dashboard/admin/pricing-planes",
        name: "Services Pricing",
        icon: ScrollText,
      },
    ],
  },
];

// Super Admin Navigation Routes
export const superAdminRoutes: Route[] = [
  {
    href: "/dashboard/super-admin",
    name: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/super-admin/verify-nurse",
    name: "Nurse Management",
    icon: Ribbon,
  },
  {
    href: "/dashboard/super-admin/verify-doctor",
    name: "Doctor Management",
    icon: Stethoscope,
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
  {
    href: "/dashboard/nurse/set-reminders",
    name: "Medication Reminder",
    icon: AlarmClock,
  },
];

// Lab Technician Navigation Routes
export const labTechnicianRoutes: Route[] = [
  {
    href: "/dashboard/lab-technician",
    name: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/lab-technician/check-in",
    name: "Scan QR Code",
    icon: QrCode,
  },
  // {
  //   href: "/dashboard/lab-technician/upload",
  //   name: "Lab Record Uploads",
  //   icon: ClipboardList,
  // },
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
  {
    href: "/dashboard/receptionist/print-prescription",
    name: "Print Prescription",
    icon: LayoutDashboard,
  },

  {
    href: "/dashboard/receptionist/plan-pricing",
    name: "Pricing Plans",
    icon: FileText,
  },
  {
    href: "/dashboard/receptionist/attendance",
    name: "Attendance",
    icon: LayoutDashboard,
  },
];

// Pharmacist Navigation Routes
export const pharmacistRoutes: Route[] = [
  {
    href: "/dashboard/pharmacy",
    name: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/pharmacy/patient-medication",
    name: "Patient Medicine",
    icon: FileText,
  },
];

// Function to get routes based on user role
export const getRoutesByRole = (role: string | null): Route[] => {
  switch (role?.toLowerCase()) {
    case "admin":
      return adminRoutes;
    case "super_admin":
      return superAdminRoutes;
    case "doctor":
      return doctorRoutes;
    case "nurse":
      return nurseRoutes;
    case "receptionist":
      return receptionistRoutes;
    case "lab_technician":
      return labTechnicianRoutes;
    case "pharmacist":
      return pharmacistRoutes;
    default:
      return [];
  }
};

// Function to get sidebar label based on user role
export const getSidebarLabel = (role: string | null): string => {
  switch (role?.toLowerCase()) {
    case "admin":
      return "Admin Panel";
    case "super_admin":
      return "Super Admin Panel";
    case "doctor":
      return "Doctor Panel";
    case "nurse":
      return "Nurse Panel";
    case "receptionist":
      return "Receptionist Panel";
    case "lab_technician":
      return "Lab Technician Panel";
    case "pharmacist":
      return "Pharmacist Panel";
    default:
      return "Dashboard";
  }
};
