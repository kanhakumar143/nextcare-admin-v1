import NurseScanQr from "@/components/dashboard/nurse/NurseScanQr";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scan QR Code",
  description: "Nurse QR Code Scanner",
};

export default function NurseScan() {
  return <NurseScanQr />;
}
