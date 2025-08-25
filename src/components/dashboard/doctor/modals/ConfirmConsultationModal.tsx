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
  setConfirmConsultationModal,
  setEprescriptionDetails,
} from "@/store/slices/doctorSlice";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import {
  getEprescriptionDetails,
  submitVisitSummary,
  updateAppointmentStatus,
  updateVisitSummary,
} from "@/services/doctor.api";
import { VisitSummaryPayload } from "@/types/doctor.types";
import { useAuthInfo } from "@/hooks/useAuthInfo";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function ConfirmConsultationModal() {
  const { patient_name } = useParams();
  const { practitionerId } = useAuthInfo();
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const {
    confirmConsultationModalVisible,
    singlePatientDetails,
    visitNote,
    labTests,
    medicines,
    isEditingConsultation,
    consultationMode,
  } = useSelector((state: RootState) => state.doctor);
  const [loading, setLoading] = useState<boolean>(false);

  const handleConfirm = () => {
    handleAddVisitSummary();
    handleCancel();
  };
  const handleCancel = () => {
    dispatch(setConfirmConsultationModal(false));
  };

  const handleAddVisitSummary = async () => {
    const payload: VisitSummaryPayload = {
      practitioner_id: practitionerId || "",
      appointment_id: singlePatientDetails?.id,
      patient_id: singlePatientDetails?.patient_id,
      medication_request: {
        id: medicines[0]?.medication_request_id,
        intent: "order",
        status: "active",
        note: `Prescribed for ${
          singlePatientDetails?.service_category[0]?.text ||
          "general consultation"
        }`,
      },
      medication: medicines,
      visit_note: {
        id: visitNote.id,
        summary: visitNote.summary,
        follow_up: visitNote.visit_care_plan.plan_type,
        chief_complaint: visitNote.chief_complaint,
        provisional_diagnosis: visitNote.provisional_diagnosis,
        critical: visitNote.critical,
        consultation_mode: visitNote.visit_care_plan.plan_type,
        followup_date: visitNote.visit_care_plan.followup_date || null,
        criticality_remark: visitNote.criticality_remark,
      },
      // visit_care_plan: {
      //   id: visitNote.visit_care_plan.id,
      //   plan_type: visitNote.visit_care_plan.plan_type,
      //   goal: visitNote.visit_care_plan.goal,
      //   detail: visitNote.visit_care_plan.detail,
      // },
      // visit_assessment: {
      //   id: visitNote.visit_assessment.id,
      //   description: visitNote.visit_assessment.description,
      //   severity: visitNote.visit_assessment.severity,
      // },
      lab_test_order: labTests.map((test, ind) => ({
        id: test.id,
        test_code: `1234${ind}`,
        note: test.notes,
        test_display: test.test_display,
        intent: test.intent,
        priority: test.priority,
        status: "active",
      })),
    };

    console.log("PayloadData", payload);
    console.log("Redux Data", visitNote, labTests, medicines);
    if (isEditingConsultation) {
      try {
        await updateVisitSummary(payload);
      } catch (error) {
        setLoading(false);
        toast.error("Failed to update visit summary. Please try again.");
      }
    } else {
      try {
        await submitVisitSummary(payload);
        getPrescriptionDetails();
      } catch (error) {
        setLoading(false);
        toast.error("Failed to submit visit summary. Please try again.");
      }
    }
  };

  const handleCompleteReview = async () => {
    try {
      await updateAppointmentStatus({
        id: singlePatientDetails?.id || "",
        status: "completed",
      });
      toast.success("Successfully Uploaded Reports");
      getPrescriptionDetails();
    } catch (error) {
      toast.error("Failed to upload reports. Please try again.");
    }
  };

  const getPrescriptionDetails = async () => {
    try {
      const response = await getEprescriptionDetails(singlePatientDetails?.id);
      toast.success(
        isEditingConsultation
          ? "Consultation updated successfully"
          : "Consultation completed"
      );
      router.push(
        `/dashboard/doctor/consultation/${patient_name}/prescription-review`
      );
      dispatch(setEprescriptionDetails(response));
    } catch (error) {
      console.error("Error fetching prescription details:", error);
    }
  };

  return (
    <Dialog open={confirmConsultationModalVisible} onOpenChange={handleCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditingConsultation
              ? "Update Consultation"
              : "Finalize Consultation"}
          </DialogTitle>
          <DialogDescription>
            {isEditingConsultation
              ? "You're about to update this consultation. All changes will be saved and the consultation will be updated."
              : "You're about to finalize this consultation. Once confirmed, all notes and prescriptions will be saved and cannot be edited further."}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:justify-end pt-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="default" onClick={handleConfirm}>
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : isEditingConsultation ? (
              "Update & Continue to Prescription Review"
            ) : (
              "Continue to Prescription Review"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
