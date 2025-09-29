"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { AlertTriangle } from "lucide-react";
import ScannedPatientDetails from "@/components/dashboard/receptionist/ScanedPatientDetails";
import ConfirmCheckedInModal from "@/components/dashboard/receptionist/modals/ConfirmCheckInModal";

const PatientCheckInPage: React.FC = () => {
  const { patientDetails } = useSelector(
    (state: RootState) => state.receptionistData
  );

  if (!patientDetails) {
    return (
      <div className="flex flex-col items-center justify-center p-6 gap-6">
        <h1 className="text-2xl font-bold text-primary text-center">
          Patient Check-In
        </h1>
        <p className="text-gray-600">No patient details found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start p-6 gap-6">
      <h1 className="text-2xl font-bold text-center">Patient Check-In</h1>

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
    </div>
  );
};

export default PatientCheckInPage;
