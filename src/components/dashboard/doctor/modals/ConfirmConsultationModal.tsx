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
  setEprescriptionDetails,
} from "@/store/slices/doctorSlice";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  getEprescriptionDetails,
  submitVisitSummary,
  updateAppointmentStatus,
} from "@/services/doctor.api";
import { EPrescription, VisitSummaryPayload } from "@/types/doctor.types";
import { useAuthInfo } from "@/hooks/useAuthInfo";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function ConfirmConsultationModal({}: {}) {
  const {
    confirmConsultationModalVisible,
    singlePatientDetails,
    visitNote,
    labTests,
    medicines,
  } = useSelector((state: RootState) => state.doctor);
  const [loading, setLoading] = useState<boolean>(false);
  const { practitionerId } = useAuthInfo();
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const handleConfirm = () => {
    handleAddVisitSummary();
    handleCancel();
    // setLoading(true);
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
      medication: medicines,
      visit_note: {
        summary: visitNote.summary,
        follow_up: visitNote.follow_up,
      },
      visit_care_plan: {
        plan_type: visitNote.visit_care_plan.plan_type,
        goal: visitNote.visit_care_plan.goal,
        detail: visitNote.visit_care_plan.detail,
      },
      visit_assessment: {
        description: visitNote.visit_assessment.description,
        severity: visitNote.visit_assessment.severity,
      },
    };
    console.log("Visit Summary Payload:", payload);

    try {
      const response = await submitVisitSummary(payload);
      getPrescriptionDetails();
    } catch (error) {
      setLoading(false);
      console.error("Error submitting visit summary:", error);
      toast.error("Failed to submit visit summary. Please try again.");
    }
  };

  const getPrescriptionDetails = async () => {
    try {
      const response = await getEprescriptionDetails(singlePatientDetails?.id);
      console.log("Prescription Details:", response);
      toast.success("Consultation completed");
      router.push(
        `/dashboard/doctor/consultation/${singlePatientDetails?.patient_id}/prescription-review`
      );
      dispatch(setEprescriptionDetails(response.data));
    } catch (error) {
      console.error("Error fetching prescription details:", error);
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
              "Continue to Prescription Review"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
