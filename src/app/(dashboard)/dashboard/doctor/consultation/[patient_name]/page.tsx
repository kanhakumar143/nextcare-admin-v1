import PatientConsultation from "@/components/dashboard/doctor/PatientConsultation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Consultation Page",
  description:
    "Manage appointments, patients, and reception tasks in the admin dashboard.",
};

interface PatientConsultPageProps {
  params: { patient_name: string };
}

export default function PatientConsultPage({
  params,
}: PatientConsultPageProps) {
  const { patient_name } = params;
  return <PatientConsultation patientName={patient_name} />;
}
