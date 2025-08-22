"use client";

import React from "react";
import {
  clearError,
  fetchQrDetailsAsync,
  setQrToken,
} from "@/store/slices/receptionistSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { AlertCircleIcon } from "lucide-react";
import QrScannerBox from "@/components/common/QrScannerBox";
import ScannedPatientLabOrders from "./ScanPatientReportDetails";
import ConfirmCheckedInModal from "./modals/ConfirmCheckInModal";
import { useAuthInfo } from "@/hooks/useAuthInfo";
import { Alert, AlertTitle } from "@/components/ui/alert";

const PrintScannedPatientQr: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userId } = useAuthInfo();
  const { patientDetails, scanQrMessage } = useSelector(
    (state: RootState) => state.receptionistData
  );

  const handleScanSuccess = (token: string) => {
    dispatch(clearError());
    dispatch(
      fetchQrDetailsAsync({
        accessToken: token,
        staff_id: userId || "",
      })
    );
    dispatch(setQrToken(token));
  };

  return (
    <div className="flex flex-col items-center justify-start p-6 gap-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-primary">
          Scan QR Code to Print Patient Details
        </h1>
      </div>

      {!patientDetails && (
        <div className="w-full max-w-md">
          <QrScannerBox
            onScanSuccess={(token) => handleScanSuccess(token)}
            buttonLabel="Start QR Scan"
          />
        </div>
      )}

      {scanQrMessage && (
        <Alert
          variant="destructive"
          className="max-w-2xl border border-red-200"
        >
          <AlertCircleIcon />
          <AlertTitle>{scanQrMessage}</AlertTitle>
        </Alert>
      )}

      {patientDetails && !scanQrMessage && (
        <div className="w-full max-w-4xl space-y-6">
          {/* Lab orders & patient info */}
          <ScannedPatientLabOrders />
        </div>
      )}

      <ConfirmCheckedInModal />
    </div>
  );
};

export default PrintScannedPatientQr;
