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
import { setConfirmConsultationModal } from "@/store/slices/doctorSlice";
import { useRouter, useSearchParams } from "next/navigation";

import { useState, Suspense } from "react";
import { Loader2 } from "lucide-react";

function ConfirmConsultationModalStaticContent() {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const {
    confirmConsultationModalVisible,
    singlePatientDetails,
    visitNote,
    labTests,
    medicines,
  } = useSelector((state: RootState) => state.doctor);
  const [loading, setLoading] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const storyId = searchParams.get("storyId") || "story-001";

  const handleConfirm = () => {
    handleCancel();
    router.push(
      `/dashboard/doctor/patient-stories/verify-prescription?storyId=${storyId}`
    );
  };
  const handleCancel = () => {
    dispatch(setConfirmConsultationModal(false));
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

// Loading component for Suspense fallback
function ModalLoading() {
  return null; // Modal loading state can be empty since the parent handles loading
}

// Main export with Suspense boundary
export default function ConfirmConsultationModalStatic() {
  return (
    <Suspense fallback={<ModalLoading />}>
      <ConfirmConsultationModalStaticContent />
    </Suspense>
  );
}
