import DoctorPortal from "@/components/dashboard/doctor/DoctorPortal";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Doctor Dashboard",
  description:
    "Manage appointments, patients, and reception tasks in the admin dashboard.",
};

export default function DoctorPortalPage() {
  return <DoctorPortal />;
}
