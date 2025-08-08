"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { CircleAlert, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  setDecodedDetails,
  setVerifiedPatientModal,
} from "@/store/slices/receptionistSlice";
import { UserPatientProfileResponse } from "@/types/receptionist.types";
import {
  fetchDecodeQrDetails,
  UpdatePatientAccountStatus,
} from "@/services/receptionist.api";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthInfo } from "@/hooks/useAuthInfo";

export default function ConfirmVerifyPatientModal() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { userId } = useAuthInfo();
  const [loading, setLoading] = useState<boolean>(false);
  const { patientVerifiedModalVisible, patientDetails, storedAccessToken } =
    useSelector((state: RootState) => state.receptionistData);

  const handleVerifyPatient = async () => {
    const payload: UserPatientProfileResponse = {
      user_id: patientDetails?.patient.user_id || "",
      patient_profile: {
        verifications: [
          {
            id:
              patientDetails?.patient.patient_profile.verifications[0].id || 0,
            verification_status: "verified",
            method:
              patientDetails?.patient.patient_profile.verifications[0].method ||
              "",
          },
        ],
      },
    };
    setLoading(true);
    try {
      const response = await UpdatePatientAccountStatus(payload);
      if (response) {
        handleQrDetailsData(storedAccessToken);
      }
    } catch {
      toast.error("Something went wrong !");
    } finally {
      setLoading(false);
    }
  };

  const handleQrDetailsData = async (token: string | null) => {
    try {
      const response = await fetchDecodeQrDetails({
        accessToken: token,
        staff_id: userId,
      });

      dispatch(setDecodedDetails(response.data));
      router.push("/dashboard/receptionist/check-in");
    } catch {
      toast.error("Couldn’t fetch details!");
    }
  };

  return (
    <Dialog
      open={patientVerifiedModalVisible}
      onOpenChange={() => dispatch(setVerifiedPatientModal(false))}
    >
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader className="text-center">
          <div className="flex flex-col items-center space-y-3">
            <CircleAlert className="w-12 h-12 text-yellow-400 animate-bounce" />
            <DialogTitle className="text-2xl font-semibold text-gray-800">
              Confirm Patient Verification
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-sm text-center">
              Verifying a patient will grant them access to system features like
              appointment bookings, medical record access, and more.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="mt-4 bg-yellow-50 p-3 rounded-md border border-yellow-200 text-sm text-yellow-700 space-y-1">
          <p>
            <strong>Note:</strong> Verification is irreversible. Ensure
            patient's identity is confirmed. Double-check if documents are
            uploaded and valid.
          </p>
        </div>

        <DialogFooter className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => dispatch(setVerifiedPatientModal(false))}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleVerifyPatient}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
              </>
            ) : (
              "Yes, Verify Patient"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
