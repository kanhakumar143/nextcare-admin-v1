import DoctorProfile from "@/components/dashboard/doctor/DoctorProfile";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Doctor Profile",
  description:
    "Manage appointments, patients, and reception tasks in the admin dashboard.",
};

export default function DoctorPortalPage() {
  return <DoctorProfile />;
}
