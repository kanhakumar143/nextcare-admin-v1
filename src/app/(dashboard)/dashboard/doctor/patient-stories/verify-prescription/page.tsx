import EprescriptionPageStatic from "@/components/dashboard/doctor/patientStories/EprescriptionPageStatic";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Patient stories for doctor",
  description:
    "Manage appointments, patients, and reception tasks in the admin dashboard. Demo version",
};

export default function DoctorDashboardPage() {
  return <EprescriptionPageStatic />;
}
