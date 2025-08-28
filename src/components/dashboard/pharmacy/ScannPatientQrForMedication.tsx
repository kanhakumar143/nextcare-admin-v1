"use client";

import React, { useEffect } from "react";
import {
  clearError,
  setDownloadReportsData,
  setMedicationDetailsForReminder,
  setQrToken,
} from "@/store/slices/receptionistSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { AlertCircleIcon } from "lucide-react";
import QrScannerBox from "@/components/common/QrScannerBox";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { fetchDecodeQrDetailsForReports } from "@/services/receptionist.api";
import ScannedPatientMedication from "./ScannedPatientMedication";

const ScannedPatientQrForMedication: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { medicationDetailsForReminder } = useSelector(
    (state: RootState) => state.receptionistData
  );

  const handleScanSuccess = async (token: string) => {
    dispatch(clearError());
    try {
      const data = await fetchDecodeQrDetailsForReports({ accessToken: token });
      dispatch(setQrToken(token));
      console.log("Fetched report data:", data.data);
      dispatch(setMedicationDetailsForReminder(data.data));
    } catch (error) {
      console.error("Error fetching QR details:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start p-6 gap-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-primary">
          Scan QR Code to Share Medication Details
        </h1>
      </div>

      {/* {!medicationDetailsForReminder && ( */}
      <div className="w-full max-w-md">
        <QrScannerBox
          onScanSuccess={(token) => handleScanSuccess(token)}
          buttonLabel="Start QR Scan"
        />
      </div>
      {/* )} */}
      {/* 
      {scanQrMessage && (
        <Alert
          variant="destructive"
          className="max-w-2xl border border-red-200"
        >
          <AlertCircleIcon />
          <AlertTitle>{scanQrMessage}</AlertTitle>
        </Alert>
      )} */}

      {medicationDetailsForReminder && (
        <div className="w-full max-w-6xl space-y-6">
          <ScannedPatientMedication />
        </div>
      )}
    </div>
  );
};

export default ScannedPatientQrForMedication;
