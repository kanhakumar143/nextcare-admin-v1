import ReceptionPortal from "@/components/dashboard/receptionist/ReceptionistPortal";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Receptionist Dashboard",
  description:
    "Manage appointments, patients, and reception tasks in the admin dashboard.",
};

export default function ReceptionistPage() {
  return <ReceptionPortal />;
}
