"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  clearError,
  fetchQrDetailsAsync,
  setDecodedDetails,
  setQrToken,
} from "@/store/slices/receptionistSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { AlertCircleIcon, AlertTriangle } from "lucide-react";
import QrScannerBox from "@/components/common/QrScannerBox";
import ScannedPatientDetails from "./ScanedPatientDetails";
import ConfirmCheckedInModal from "./modals/ConfirmCheckInModal";
import { useAuthInfo } from "@/hooks/useAuthInfo";
import { Alert, AlertTitle } from "@/components/ui/alert";
// import { fetchDecodeQrDetails } from "@/services/receptionist.api";

const ScanPatientQr: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userId } = useAuthInfo();
  // const [invalidCode, setInvalidCode] = useState<string | null>(null);
  const { patientDetails, scanQrMessage } = useSelector(
    (state: RootState) => state.receptionistData
  );

  console.log("scanQrMessage Details:", scanQrMessage);

  // const handleQrDetailsData = async (token: string) => {
  //   try {
  //     setInvalidCode(null);

  //     const response = await fetchDecodeQrDetails({
  //       accessToken: token,
  //       staff_id: userId,
  //     });
  //     if (!response.success) {
  //       setInvalidCode(response.message);
  //       dispatch(setQrToken(token));
  //     } else {
  //       dispatch(setDecodedDetails(response.data));
  //     }
  //   } catch {
  //     toast.error("Couldn’t fetch details!");
  //   }
  // };

  return (
    <div className="flex flex-col items-center justify-start p-6 gap-6 ">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-primary">
          Patient QR Code Check-In
        </h1>
      </div>

      {!patientDetails && (
        <div className="w-full max-w-md">
          <QrScannerBox
            onScanSuccess={(token) => {
              dispatch(clearError());
              dispatch(
                fetchQrDetailsAsync({
                  accessToken: token,
                  staff_id: userId || "",
                })
              );
            }}
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
        <div className="w-full max-w-md">
          <ScannedPatientDetails />
          {patientDetails.patient.patient_profile.verifications[0]
            .verification_status !== "verified" && (
            <div className="mt-2 flex items-center justify-center">
              <div className="flex items-start gap-3 rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-yellow-800 w-full max-w-md">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <p className="text-sm">
                  Please verify the patient's identity before confirming the
                  check-in.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmCheckedInModal />
    </div>
  );
};

export default ScanPatientQr;
