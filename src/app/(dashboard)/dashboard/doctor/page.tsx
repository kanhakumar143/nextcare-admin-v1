import DoctorDashboard from "@/components/dashboard/doctor/DoctorDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Doctor Dashboard",
  description:
    "Manage appointments, patients, and reception tasks in the admin dashboard.",
};

export default function DoctorDashboardPage() {
  return <DoctorDashboard />;
}
