import React from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  toggleSpecialtyStatus,
  fetchSpecialtiesByServiceId,
  setConfirmModalOpen,
  setSpecialtyToToggle,
} from "@/store/slices/specialtySlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ConfirmToggleSpecialtyModalProps {
  selectedServiceId: string;
}

export default function ConfirmToggleSpecialtyModal({
  selectedServiceId,
}: ConfirmToggleSpecialtyModalProps) {
  const dispatch = useAppDispatch();
  const { confirmModalOpen, specialtyToToggle, loading } = useAppSelector(
    (state) => state.specialty
  );

  const handleToggleStatus = async () => {
    if (!specialtyToToggle) return;

    try {
      const updatedSpecialty = {
        ...specialtyToToggle,
        is_active: !specialtyToToggle.is_active,
      };

      const resultAction = await dispatch(
        toggleSpecialtyStatus({
          specialty: updatedSpecialty,
          id: specialtyToToggle.id,
        })
      );

      if (toggleSpecialtyStatus.fulfilled.match(resultAction)) {
        toast.success("Status updated successfully!");
        // Refresh the specialty list
        dispatch(fetchSpecialtiesByServiceId(selectedServiceId));
      } else {
        toast.error(resultAction.payload as string);
      }
    } catch (error) {
      toast.error("Failed to update status.");
    } finally {
      handleCloseModal();
    }
  };

  const handleCloseModal = () => {
    dispatch(setConfirmModalOpen(false));
    dispatch(setSpecialtyToToggle(null));
  };

  if (!specialtyToToggle) return null;

  return (
    <Dialog open={confirmModalOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>
            {specialtyToToggle.is_active ? "Deactivate" : "Activate"} Specialty?
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Are you sure you want to{" "}
            <span
              className={
                specialtyToToggle.is_active
                  ? "text-red-600 font-medium"
                  : "text-green-600 font-medium"
              }
            >
              {specialtyToToggle.is_active ? "deactivate" : "activate"}
            </span>{" "}
            the specialty{" "}
            <span className="text-foreground font-semibold">
              {specialtyToToggle.specialty_label}
            </span>
            ?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCloseModal}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant={specialtyToToggle.is_active ? "destructive" : "default"}
            onClick={handleToggleStatus}
            disabled={loading}
            className={
              specialtyToToggle.is_active
                ? "bg-red-500 text-white hover:bg-red-700 hover:text-white"
                : "bg-green-500 text-white hover:bg-green-700 hover:text-white"
            }
          >
            {loading
              ? "Processing..."
              : specialtyToToggle.is_active
              ? "Deactivate"
              : "Activate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
