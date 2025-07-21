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
import { RootState } from "@/store";
import { setConfirmConsultationModal } from "@/store/slices/doctorSlice";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ConfirmConsultationModal({}: {}) {
  const { confirmConsultationModalVisible } = useSelector(
    (state: RootState) => state.doctor
  );
  const dispatch = useDispatch();
  const router = useRouter();
  const handleConfirm = () => {
    toast.success("Consultation completed");
    router.push("/dashboard/doctor/portal");
    dispatch(setConfirmConsultationModal(false));
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
            Confirm & Finish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
