"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  closeConfirmModal,
  toggleSymptomStatus,
  fetchSymptomsByTenantId,
} from "@/store/slices/symptomsSlice";
import { useAuthInfo } from "@/hooks/useAuthInfo";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ConfirmToggleModal() {
  const { orgId } = useAuthInfo();
  const dispatch = useAppDispatch();
  const { confirmModal, loading } = useAppSelector((state) => state.symptom);
  const { isOpen, symptom } = confirmModal;

  const handleToggleStatus = async () => {
    if (!symptom) return;

    try {
      const updatedSymptom = {
        ...symptom,
        is_active: !symptom.is_active,
      };

      const resultAction = await dispatch(
        toggleSymptomStatus({ symptom: updatedSymptom, id: symptom.id! })
      );

      if (toggleSymptomStatus.fulfilled.match(resultAction)) {
        toast.success("Status updated successfully!");
        if (orgId) {
          dispatch(fetchSymptomsByTenantId(orgId));
        }
      } else {
        toast.error(resultAction.payload as string);
      }
    } catch (error) {
      toast.error("Failed to update status.");
    }
  };

  const handleClose = () => {
    dispatch(closeConfirmModal());
  };

  if (!symptom) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {symptom.is_active ? "Deactivate" : "Activate"} Symptom?
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to{" "}
            <span
              className={
                symptom.is_active
                  ? "text-red-600 font-medium"
                  : "text-green-600 font-medium"
              }
            >
              {symptom.is_active ? "deactivate" : "activate"}
            </span>{" "}
            the symptom{" "}
            <span className="text-foreground font-semibold">
              {symptom.display}
            </span>
            ?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={symptom.is_active ? "destructive" : "default"}
            onClick={handleToggleStatus}
            disabled={loading}
            className={
              symptom.is_active
                ? "bg-red-500 text-white hover:bg-red-700 hover:text-white"
                : "bg-green-500 text-white hover:bg-green-700 hover:text-white"
            }
          >
            {loading
              ? "Processing..."
              : symptom.is_active
              ? "Deactivate"
              : "Activate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
