import NurseDashboard from "@/components/dashboard/nurse/NurseDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Receptionist Dashboard",
  description:
    "Manage appointments, patients, and reception tasks in the admin dashboard.",
};

export default function ReceptionistPage() {
  return <NurseDashboard />;
}
