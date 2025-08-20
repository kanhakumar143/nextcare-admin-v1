import DoctorProfileUpdate from "@/components/dashboard/doctor/DoctorProfileUpdate";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Doctor Profile",
  description:
    "Edit and update doctor profile information including personal details, qualifications, and professional information.",
};

export default function DoctorProfileEditPage() {
  return <DoctorProfileUpdate />;
}
