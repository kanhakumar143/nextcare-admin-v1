import ScanPatientQr from "@/components/dashboard/receptionist/ScanPatientQr";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scan QR Code",
  description: "Staff QR Code Scanner",
};

export default function Blogs() {
  return (
    <div>
      <ScanPatientQr />
    </div>
  );
}
