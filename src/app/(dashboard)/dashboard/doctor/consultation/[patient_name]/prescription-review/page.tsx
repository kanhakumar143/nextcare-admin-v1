import EprescriptionPage from "@/components/dashboard/doctor/EprescriptionPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Consultation E-Prescription",
  description:
    "Manage appointments, patients, and reception tasks in the admin dashboard.",
};

export default function PatientConsultPage() {
  return <EprescriptionPage />;
}
