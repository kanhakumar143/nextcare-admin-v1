"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  clearError,
  fetchQrDetailsAsync,
  setQrToken,
} from "@/store/slices/receptionistSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { AlertCircleIcon, AlertTriangle, CheckCircle } from "lucide-react";
import QrScannerBox from "@/components/common/QrScannerBox";
import { useAuthInfo } from "@/hooks/useAuthInfo";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import ConfirmCheckedInModal from "./modals/ConfirmCheckInModal";
import ScannedPatientDetails from "./ScanedPatientDetails";

const ScanPatientQr: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  // const searchParams = useSearchParams();
  const { userId } = useAuthInfo();
  const { patientDetails, scanQrMessage, paymentDetails, referallId } =
    useSelector((state: RootState) => state.receptionistData);

  // Check for payment success parameter
  // useEffect(() => {
  //   const paymentSuccess = searchParams.get("payment_success");
  //   if (paymentSuccess === "true") {
  //     toast.success(
  //       "Payment completed successfully! You can now proceed with check-in."
  //     );
  //   }
  // }, [searchParams]);

  // Check for pending payments and redirect if necessary
  useEffect(() => {
    if (
      patientDetails &&
      paymentDetails &&
      paymentDetails.pending_orders &&
      paymentDetails.pending_orders.length > 0
    ) {
      // Redirect to payment page if there are pending orders
      router.push("/dashboard/receptionist/payment-details");
    } else if (referallId) {
      router.push(`/dashboard/receptionist/referral-id/${referallId}`);
    }
  }, [patientDetails, paymentDetails, router]);

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
    // router.push("/dashboard/receptionist/pending-payments");
  };

  return (
    <div className="flex flex-col items-center justify-start p-6 gap-6">
      <h1 className="text-2xl font-bold text-primary text-center">
        Patient QR Code Check-In
      </h1>

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
        <div className="w-full max-w-md">
          {/* Only show patient details if no pending payments */}
          {!paymentDetails?.pending_orders ||
          paymentDetails.pending_orders.length === 0 ||
          !referallId ? (
            <>
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
            </>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Redirecting to payment page...
              </p>
            </div>
          )}
        </div>
      )}

      <ConfirmCheckedInModal />
    </div>
  );
};

export default ScanPatientQr;
