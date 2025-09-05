// import PatientConsultation from "@/components/dashboard/doctor/PatientConsultation";
import PatientConsultation from "@/components/dashboard/doctor/PatientConsultationRedesigned";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Consultation Page",
  description:
    "Manage appointments, patients, and reception tasks in the admin dashboard.",
};

export default function PatientConsultPage() {
  return <PatientConsultation />;
}
