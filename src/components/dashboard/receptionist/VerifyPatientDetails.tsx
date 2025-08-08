"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  setImageModalVisible,
  setVerifiedPatientModal,
} from "@/store/slices/receptionistSlice";
import moment from "moment";
import { ImagePlay } from "lucide-react";
import DocumentViewModal from "./modals/DocumentViewModal";
import ConfirmVerifyPatientModal from "./modals/ConfirmVerifyPatientModal";

const VerifyPatientDetails = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { patientDetails } = useSelector(
    (state: RootState) => state.receptionistData
  );

  return (
    <div className="flex flex-col items-center justify-start p-6 gap-6 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold text-center text-primary">
        Verify Patient Details
      </h1>

      {patientDetails && (
        <>
          <Card className="w-full max-w-md mx-auto rounded-xl shadow py-4 mb-20">
            <CardContent className="space-y-4">
              {/* Header */}
              <div className="text-left">
                <h2 className="text-lg font-bold text-gray-900">
                  Patient Information Summary
                </h2>
                <p className="text-sm text-muted-foreground">
                  Please verify the patient's identity before proceeding.
                </p>
              </div>

              {/* Patient Info */}
              <div className="space-y-3 text-sm text-gray-800 border border-gray-100 rounded-lg p-3 bg-gray-50">
                <div className="flex justify-between">
                  <span className="font-medium">Full Name:</span>
                  <span className="text-primary font-semibold">
                    {patientDetails.patient.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Phone Number:</span>
                  <span className="text-primary font-semibold">
                    {patientDetails.patient.phone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Date of Birth:</span>
                  <span className="text-primary font-semibold">
                    {moment(
                      patientDetails.patient.patient_profile.birth_date
                    ).format("Do MMMM YYYY")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Gender:</span>
                  <span className="text-primary font-semibold capitalize">
                    {patientDetails.patient.patient_profile.gender}
                  </span>
                </div>
              </div>

              {/* Documents Section */}
              <div className="flex justify-between items-center mt-4">
                <div>
                  <h2 className="text-md font-semibold text-gray-800">
                    Supported Documents
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Click to view uploaded ID proof before confirming.
                  </p>
                </div>
                {patientDetails?.patient.patient_profile.gov_url_path !==
                null ? (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => dispatch(setImageModalVisible(true))}
                  >
                    <ImagePlay />
                  </Button>
                ) : (
                  "No document uploaded"
                )}
              </div>

              {/* Instructions */}
              <div className="bg-orange-50 border border-orange-200 p-3 rounded-md text-sm text-orange-800 space-y-1">
                <p>
                  <strong>Note:</strong> Ensure the patient's details match
                  their document.
                </p>
                <ul className="list-disc list-inside">
                  <li>Check name spelling and date of birth.</li>
                  <li>Phone number should match registration.</li>
                  <li>Verify gender and photo (if visible).</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center items-center gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    router.back();
                  }}
                >
                  Deny Access
                </Button>
                <Button
                  variant="default"
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white"
                  onClick={() => dispatch(setVerifiedPatientModal(true))}
                >
                  Confirm Identity
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
      <ConfirmVerifyPatientModal />
      <DocumentViewModal
        imageUrl={patientDetails?.patient.patient_profile.gov_url_path || ""}
      />
    </div>
  );
};

export default VerifyPatientDetails;
