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
import { setConfirmReviewPrescriptionModal } from "@/store/slices/doctorSlice";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function ConfirmReviewPrescriptionModalStatic() {
  const { ConfirmReviewPrescriptionModalVisible, singlePatientDetails } =
    useSelector((state: RootState) => state.doctor);
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const handleConfirm = () => {
    handleCancel();
    toast.success("Prescription review confirmed successfully!");
    router.push("/dashboard/doctor/patient-stories");
  };
  const handleCancel = () => {
    dispatch(setConfirmReviewPrescriptionModal(false));
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
