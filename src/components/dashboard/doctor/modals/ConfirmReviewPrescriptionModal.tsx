"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
  fetchAssignedAppointments,
  setConfirmConsultationModal,
  setConfirmReviewPrescriptionModal,
} from "@/store/slices/doctorSlice";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  updateAppointmentStatus,
  updateEprescriptionStatus,
} from "@/services/doctor.api";
import { useAuthInfo } from "@/hooks/useAuthInfo";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function ConfirmReviewPrescriptionModal({
  medicationRequestId,
}: {
  medicationRequestId: string;
}) {
  const { ConfirmReviewPrescriptionModalVisible, singlePatientDetails } =
    useSelector((state: RootState) => state.doctor);
  const [loading, setLoading] = useState<boolean>(false);
  const { practitionerId } = useAuthInfo();
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const handleConfirm = () => {
    handleVerifyEprescription();
    setLoading(true);
    handleCancel();
  };
  const handleCancel = () => {
    dispatch(setConfirmReviewPrescriptionModal(false));
  };

  const handleVerifyEprescription = async () => {
    const payload = {
      id: medicationRequestId,
      status: "completed",
      note: "Patient has completed the medication review.",
      practitioner_id: practitionerId,
    };
    console.log("Visit Summary Payload:", payload);
    try {
      const response = await updateEprescriptionStatus(payload);
      handleUpdateApptStatus();
    } catch (error) {
      setLoading(false);
      console.error("Error submitting visit summary:", error);
      toast.error("Failed to submit visit summary. Please try again.");
    }
  };

  const handleUpdateApptStatus = async () => {
    try {
      const response = await updateAppointmentStatus({
        id: singlePatientDetails?.id || "",
        status: "fulfilled",
      });
      toast.success("Consultation completed");
      router.push("/dashboard/doctor/portal");
      dispatch(setConfirmConsultationModal(false));
      dispatch(fetchAssignedAppointments(practitionerId));
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast.error("Failed to update appointment status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={ConfirmReviewPrescriptionModalVisible}
      onOpenChange={handleCancel}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Finalize Prescription Review</DialogTitle>
          <DialogDescription>
            You're about to finalize this prescription. Once confirmed, all
            notes and prescriptions will be saved and shared with patient.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:justify-end pt-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="default" onClick={handleConfirm}>
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Confirm & Finish"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
