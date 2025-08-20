
import LabTechnicianScanQr from "@/components/dashboard/lab-technician/LabTechnicianScan";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scan QR Code",
  description: "Lab Technician QR Code Scanner",
};

export default function LabTechnicianScan() {
  return <LabTechnicianScanQr />;
}
