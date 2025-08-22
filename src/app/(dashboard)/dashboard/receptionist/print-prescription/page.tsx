import PrintScannedPatientQr from "@/components/dashboard/receptionist/PrintScannedPatientQr";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scan QR Code",
  description: "Staff QR Code Scanner",
};

export default function Blogs() {
  return (
    <div>
      <PrintScannedPatientQr />
    </div>
  );
}
