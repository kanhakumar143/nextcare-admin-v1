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
} from "@/store/slices/doctorSlice";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  submitVisitSummary,
  updateAppointmentStatus,
} from "@/services/doctor.api";
import { VisitSummaryPayload } from "@/types/doctor.types";
import { useAuthInfo } from "@/hooks/useAuthInfo";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function ConfirmConsultationModal({}: {}) {
  const {
    confirmConsultationModalVisible,
    singlePatientDetails,
    labTests,
    medicines,
  } = useSelector((state: RootState) => state.doctor);
  const [loading, setLoading] = useState<boolean>(false);
  const { practitionerId } = useAuthInfo();
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const handleConfirm = () => {
    handleAddVisitSummary();
    setLoading(true);
  };
  const handleCancel = () => {
    dispatch(setConfirmConsultationModal(false));
  };

  const handleAddVisitSummary = async () => {
    console.log("Adding visit summary for patient:", singlePatientDetails);
    const payload: VisitSummaryPayload = {
      practitioner_id: practitionerId || "",
      appointment_id: singlePatientDetails?.id,
      patient_id: singlePatientDetails?.patient_id,
      medication_request: {
        intent: "order",
        status: "active",
        note: `Prescribed for ${
          singlePatientDetails?.service_category[0]?.text ||
          "general consultation"
        }`,
      },
      medication: {
        name: medicines[0]?.medicineName,
        form: "tablet",
        route: "oral",
        frequency: medicines[0]?.dosage,
        strength: medicines[0]?.composition,
        duration: medicines[0]?.days,
        timing: {
          morning: true,
          afternoon: false,
          evening: false,
          night: true,
        },
        dosage_instruction: medicines[0]?.instructions,
        note: {
          info: "Avoid alcohol while on medication",
        },
      },
    };
    console.log("Visit Summary Payload:", payload);
    try {
      const response = await submitVisitSummary(payload);
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
    <Dialog open={confirmConsultationModalVisible} onOpenChange={handleCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Finalize Consultation</DialogTitle>
          <DialogDescription>
            You're about to finalize this consultation. Once confirmed, all
            notes and prescriptions will be saved and cannot be edited further.
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
