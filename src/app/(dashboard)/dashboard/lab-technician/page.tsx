import LabTechnicianDashboard from "@/components/dashboard/lab-technician/LabTechnicianDashboard";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lab Technician Dashboard",
  description:
    "Manage lab orders, patients, and upload lab records in the admin dashboard.",
};

export default function LabTechnicianPage() {
  return <LabTechnicianDashboard />;
}
  