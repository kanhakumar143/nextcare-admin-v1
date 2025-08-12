"use client";

import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchSymptomsByTenantId,
  updateSymptomName,
  setSymptomToEdit,
  setEditModalOpen,
} from "@/store/slices/symptomsSlice";
import { useAuthInfo } from "@/hooks/useAuthInfo";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function SymptomFormModal() {
  const { orgId } = useAuthInfo();
  const dispatch = useAppDispatch();
  const { editModalOpen, symptomToEdit, loading } = useAppSelector(
    (state) => state.symptom
  );

  const [symptomName, setSymptomName] = useState("");
  const [nameError, setNameError] = useState("");
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (symptomToEdit) {
      setSymptomName(symptomToEdit.display);
      setActive(symptomToEdit.is_active);
      setNameError("");
    }
  }, [symptomToEdit]);

  const validateName = (name: string) => {
    if (!name.trim()) return "Symptom name is required";
    if (name.trim().length < 2)
      return "Symptom name must be at least 2 characters";
    if (name.trim().length > 100)
      return "Symptom name must be less than 100 characters";
    return "";
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSymptomName(value);
    setNameError(validateName(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomToEdit?.id) return;

    const validationError = validateName(symptomName);
    if (validationError) {
      setNameError(validationError);
      return;
    }

    try {
      const updatedSymptom = {
        ...symptomToEdit,
        display: symptomName.trim(),
        is_active: active, // take from local state
        code: symptomName.trim().substring(0, 4).toUpperCase(),
        description: `${symptomName.trim()} description`,
      };

      const resultAction = await dispatch(
        updateSymptomName({ symptom: updatedSymptom, id: symptomToEdit.id })
      );

      if (updateSymptomName.fulfilled.match(resultAction)) {
        toast.success("Symptom updated successfully!");
        if (orgId) dispatch(fetchSymptomsByTenantId(orgId));
      } else {
        toast.error(resultAction.payload as string);
      }
    } catch {
      toast.error("Failed to update symptom.");
    } finally {
      handleClose();
    }
  };

  const handleClose = () => {
    dispatch(setEditModalOpen(false));
    dispatch(setSymptomToEdit(null));
    setSymptomName("");
    setNameError("");
    setActive(false);
  };

  return (
    <Dialog
      open={editModalOpen}
      onOpenChange={(val) => {
        if (!val) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-md py-4">
        <DialogHeader>
          <DialogTitle>
            {symptomToEdit ? "Edit Symptom" : "Add New Symptom"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Symptom Name</Label>
            <Input
              value={symptomName}
              onChange={handleNameChange}
              placeholder="Enter symptom name"
              className={nameError ? "border-red-500" : ""}
              disabled={loading}
            />
            {nameError && (
              <p className="text-sm text-red-600 mt-1">{nameError}</p>
            )}
          </div>

          {symptomToEdit && (
            <div className="flex items-center gap-12">
              <span className="text-sm font-medium">Active Status</span>
              <div className="flex items-center gap-3">
                <Switch
                  checked={active}
                  onCheckedChange={setActive} // local state only
                  className={active ? "bg-green-500" : "bg-red-500"}
                />
                <span
                  className={`text-sm font-medium ${
                    active ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !!nameError || !symptomName.trim()}
            className="w-full"
          >
            {loading
              ? symptomToEdit
                ? "Updating..."
                : "Saving..."
              : symptomToEdit
              ? "Update Symptom"
              : "Save Symptom"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
