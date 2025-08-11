import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  updateSpecialtyName,
  fetchSpecialtiesByServiceId,
  setEditModalOpen,
  setSpecialtyToEdit,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface EditSpecialtyModalProps {
  selectedServiceId: string;
}

export default function EditSpecialtyModal({
  selectedServiceId,
}: EditSpecialtyModalProps) {
  const dispatch = useAppDispatch();
  const { editModalOpen, specialtyToEdit, loading } = useAppSelector(
    (state) => state.specialty
  );

  const [specialtyName, setSpecialtyName] = useState("");
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (specialtyToEdit) {
      setSpecialtyName(specialtyToEdit.specialty_label);
      setNameError("");
    }
  }, [specialtyToEdit]);

  const validateName = (name: string) => {
    if (!name.trim()) {
      return "Specialty name is required";
    }
    if (name.trim().length < 2) {
      return "Specialty name must be at least 2 characters";
    }
    if (name.trim().length > 100) {
      return "Specialty name must be less than 100 characters";
    }
    return "";
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSpecialtyName(value);
    setNameError(validateName(value));
  };

  const handleUpdateSpecialty = async () => {
    if (!specialtyToEdit) return;

    const validationError = validateName(specialtyName);
    if (validationError) {
      setNameError(validationError);
      return;
    }

    try {
      const updatedSpecialty = {
        ...specialtyToEdit,
        specialty_label: specialtyName.trim(),
        display: specialtyName.trim(),
        code: specialtyName.trim().substring(0, 4).toUpperCase(),
        description: `${specialtyName.trim()} description`,
      };

      const resultAction = await dispatch(
        updateSpecialtyName({
          specialty: updatedSpecialty,
          id: specialtyToEdit.id,
        })
      );

      if (updateSpecialtyName.fulfilled.match(resultAction)) {
        toast.success("Specialty updated successfully!");
        // Refresh the specialty list
        dispatch(fetchSpecialtiesByServiceId(selectedServiceId));
      } else {
        toast.error(resultAction.payload as string);
      }
    } catch (error) {
      toast.error("Failed to update specialty.");
    } finally {
      handleCloseModal();
    }
  };

  const handleCloseModal = () => {
    dispatch(setEditModalOpen(false));
    dispatch(setSpecialtyToEdit(null));
    setSpecialtyName("");
    setNameError("");
  };

  if (!specialtyToEdit) return null;

  return (
    <Dialog open={editModalOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Edit Specialty</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Update the specialty name below. The changes will be saved
            immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="specialty-name">Specialty Name</Label>
            <Input
              id="specialty-name"
              value={specialtyName}
              onChange={handleNameChange}
              placeholder="Enter specialty name"
              className={nameError ? "border-red-500" : ""}
              disabled={loading}
            />
            {nameError && (
              <p className="text-sm text-red-500 mt-1">{nameError}</p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCloseModal}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateSpecialty}
            disabled={loading || !!nameError || !specialtyName.trim()}
            className="bg-black text-white"
          >
            {loading ? "Updating..." : "Update Specialty"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
