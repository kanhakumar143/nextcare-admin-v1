import VerifyPatientDetails from "@/components/dashboard/receptionist/VerifyPatientDetails";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Patient Details",
  description: "Staff will verify the patient details",
};

export default function Blogs() {
  return (
    <>
      <VerifyPatientDetails />
    </>
  );
}
