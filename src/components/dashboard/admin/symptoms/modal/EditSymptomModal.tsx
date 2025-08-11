import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  updateSymptomName,
  fetchSymptomsByTenantId,
  setEditModalOpen,
  setSymptomToEdit,
} from "@/store/slices/symptomsSlice";
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
import { useAuthInfo } from "@/hooks/useAuthInfo";

export default function EditSymptomModal() {
  const { orgId } = useAuthInfo();
  const dispatch = useAppDispatch();
  const { editModalOpen, symptomToEdit, loading } = useAppSelector(
    (state) => state.symptom
  );

  const [symptomName, setSymptomName] = useState("");
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (symptomToEdit) {
      setSymptomName(symptomToEdit.display);
      setNameError("");
    }
  }, [symptomToEdit]);

  const validateName = (name: string) => {
    if (!name.trim()) {
      return "Symptom name is required";
    }
    if (name.trim().length < 2) {
      return "Symptom name must be at least 2 characters";
    }
    if (name.trim().length > 100) {
      return "Symptom name must be less than 100 characters";
    }
    return "";
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSymptomName(value);
    setNameError(validateName(value));
  };

  const handleUpdateSymptom = async () => {
    if (!symptomToEdit || !symptomToEdit.id) return;

    const validationError = validateName(symptomName);
    if (validationError) {
      setNameError(validationError);
      return;
    }

    try {
      const updatedSymptom = {
        ...symptomToEdit,
        display: symptomName.trim(),
        code: symptomName.trim().substring(0, 4).toUpperCase(),
        description: `${symptomName.trim()} description`,
      };

      const resultAction = await dispatch(
        updateSymptomName({
          symptom: updatedSymptom,
          id: symptomToEdit.id,
        })
      );

      if (updateSymptomName.fulfilled.match(resultAction)) {
        toast.success("Symptom updated successfully!");
        // Refresh the symptom list
        if (orgId) {
          dispatch(fetchSymptomsByTenantId(orgId));
        }
      } else {
        toast.error(resultAction.payload as string);
      }
    } catch (error) {
      toast.error("Failed to update symptom.");
    } finally {
      handleCloseModal();
    }
  };

  const handleCloseModal = () => {
    dispatch(setEditModalOpen(false));
    dispatch(setSymptomToEdit(null));
    setSymptomName("");
    setNameError("");
  };

  if (!symptomToEdit) return null;

  return (
    <Dialog open={editModalOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Edit Symptom</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Update the symptom name below. The changes will be saved
            immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="symptom-name">Symptom Name</Label>
            <Input
              id="symptom-name"
              value={symptomName}
              onChange={handleNameChange}
              placeholder="Enter symptom name"
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
            onClick={handleUpdateSymptom}
            disabled={loading || !!nameError || !symptomName.trim()}
            className="bg-black text-white"
          >
            {loading ? "Updating..." : "Update Symptom"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
