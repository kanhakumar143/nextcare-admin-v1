"use client";

import React from "react";
import {
  clearError,
  fetchQrDetailsAsync,
  setQrToken,
} from "@/store/slices/receptionistSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import QrScannerBox from "@/components/common/QrScannerBox";
import { useAuthInfo } from "@/hooks/useAuthInfo";
import { useRouter } from "next/navigation";

const ScanPatientQr: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userId } = useAuthInfo();
  const router = useRouter();

  const handleScanSuccess = (token: string) => {
    dispatch(clearError());
    dispatch(
      fetchQrDetailsAsync({
        accessToken: token,
        staff_id: userId || "",
      })
    );
    dispatch(setQrToken(token));

    // Always go to Pending Payments after scan
    router.push("/dashboard/receptionist/pending-payments");
  };

  return (
    <div className="flex flex-col items-center justify-start p-6 gap-6">
      <h1 className="text-2xl font-bold text-primary text-center">
        Patient QR Code Check-In
      </h1>

      <div className="w-full max-w-md">
        <QrScannerBox
          onScanSuccess={handleScanSuccess}
          buttonLabel="Start QR Scan"
        />
      </div>
    </div>
  );
};

export default ScanPatientQr;
