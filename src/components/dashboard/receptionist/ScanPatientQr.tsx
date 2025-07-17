"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  setDecodedDetails,
  setQrToken,
} from "@/store/slices/receptionistSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { AlertCircleIcon } from "lucide-react";
import QrScannerBox from "@/components/common/QrScannerBox";
import ScannedPatientDetails from "./ScanedPatientDetails";
import ConfirmCheckedInModal from "./modals/ConfirmCheckInModal";
import { useAuthInfo } from "@/hooks/useAuthInfo";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { fetchDecodeQrDetails } from "@/services/receptionist.api";

const ScanPatientQr: React.FC = () => {
  const dispatch = useDispatch();
  const { userId } = useAuthInfo();
  const [invalidCode, setInvalidCode] = useState<string | null>(null);
  const { patientDetails } = useSelector(
    (state: RootState) => state.receptionistData
  );

  const handleQrDetailsData = async (token: string) => {
    try {
      setInvalidCode(null);

      const response = await fetchDecodeQrDetails({
        accessToken: token,
        staff_id: userId,
      });
      if (!response.success) {
        setInvalidCode(response.message);
      } else {
        dispatch(setQrToken(token));
        dispatch(setDecodedDetails(response.data));
      }
    } catch {
      toast.error("Couldn’t fetch details!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-start p-6 gap-6 min-h-screen bg-gray-50">
      {/* Page Heading */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-primary">
          Patient QR Code Check-In
        </h1>
      </div>

      {/* Scanner Component */}
      <div className="w-full max-w-md">
        <QrScannerBox
          onScanSuccess={(token) => handleQrDetailsData(token)}
          buttonLabel="Start QR Scan"
        />
        <p className="text-xs text-muted-foreground text-center mt-2 px-10">
          Ensure you have the patient's valid QR code ready. Avoid reflections
          or low lighting.
        </p>
      </div>

      {/* Error Message */}
      {invalidCode && (
        <Alert variant="destructive" className="max-w-2xl">
          <AlertCircleIcon />
          <AlertTitle>{invalidCode}</AlertTitle>
        </Alert>
      )}

      {/* Scanned Patient Details */}
      {patientDetails && !invalidCode && (
        <div className="w-full max-w-md">
          <ScannedPatientDetails />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Please verify the patient's identity before confirming the check-in.
          </p>
        </div>
      )}

      {/* Confirm Modal for Checked-In */}
      <ConfirmCheckedInModal />

      {/* Footer Hint */}
      <div className="mt-auto text-xs text-gray-400 text-center max-w-md">
        If you face repeated scanning issues, try refreshing the page or consult
        a system admin.
      </div>
    </div>
  );
};

export default ScanPatientQr;
