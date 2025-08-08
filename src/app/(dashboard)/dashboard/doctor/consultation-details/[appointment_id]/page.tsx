import AppointmentHistoryDetails from "@/components/dashboard/doctor/AppointmentHistoryDetails";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Appointment History Details",
  description:
    "Manage appointments, patients, and reception tasks in the admin dashboard.",
};

export default function DoctorPortalPage() {
  return <AppointmentHistoryDetails />;
}
