"use client";
import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateSubService, fetchSubServicesByServiceId, closeEditModal } from "@/store/slices/subServicesSlice";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { SubService } from "@/types/subServices.type";

interface EditSubServiceModalProps {
  selectedServiceId: string;
}

export default function EditSubServiceModal({ selectedServiceId }: EditSubServiceModalProps) {
  const dispatch = useAppDispatch();
  const { editing: subServiceToEdit, loading } = useAppSelector((state) => state.subService);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [nameError, setNameError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");

  useEffect(() => {
    if (subServiceToEdit) {
      setName(subServiceToEdit.name);
      setDescription(subServiceToEdit.description);
      setIsActive(subServiceToEdit.active);
      setNameError("");
      setDescriptionError("");
    }
  }, [subServiceToEdit]);

  const validateName = (val: string) => {
    if (!val.trim()) return "Name is required";
    if (val.trim().length < 2) return "Name must be at least 2 characters";
    if (val.trim().length > 100) return "Name must be less than 100 characters";
    return "";
  };

  const validateDescription = (val: string) => {
    if (!val.trim()) return "Description is required";
    return "";
  };

  const handleUpdate = async () => {
    if (!subServiceToEdit) return;

    const nameErr = validateName(name);
    const descErr = validateDescription(description);

    setNameError(nameErr);
    setDescriptionError(descErr);

    if (nameErr || descErr) return;

    try {
      // ✅ Payload includes the id as required by your API
      const payload = {
        id: subServiceToEdit.id,
        name: name.trim(),
        description: description.trim(),
        active: isActive,
      };

      const resultAction = await dispatch(updateSubService({ id: subServiceToEdit.id, data: payload }));

      if (updateSubService.fulfilled.match(resultAction)) {
        toast.success("Sub-service updated successfully!");
        dispatch(fetchSubServicesByServiceId(selectedServiceId));
      } else {
        toast.error(resultAction.payload as string);
      }
    } catch {
      toast.error("Failed to update sub-service.");
    } finally {
      handleClose();
    }
  };

  const handleClose = () => {
    dispatch(closeEditModal());
    setName("");
    setDescription("");
    setIsActive(false);
    setNameError("");
    setDescriptionError("");
  };

  if (!subServiceToEdit) return null;

  return (
    <Dialog open={!!subServiceToEdit} onOpenChange={handleClose}>
      <DialogContent className="max-w-md py-4" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Edit Sub-Service</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Update the sub-service details below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="subservice-name">Sub-Service Name</Label>
            <Input
              id="subservice-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError(validateName(e.target.value));
              }}
              placeholder="Enter sub-service name"
              className={nameError ? "border-red-500" : ""}
              disabled={loading}
            />
            {nameError && <p className="text-sm text-red-500">{nameError}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="subservice-description">Description</Label>
            <Input
              id="subservice-description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setDescriptionError(validateDescription(e.target.value));
              }}
              placeholder="Enter description"
              className={descriptionError ? "border-red-500" : ""}
              disabled={loading}
            />
            {descriptionError && <p className="text-sm text-red-500">{descriptionError}</p>}
          </div>

          {/* Active switch */}
          <div className="flex items-center gap-12">
            <span className="text-sm font-medium">Active Status</span>
            <div className="flex items-center gap-3">
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
                className={isActive ? "bg-green-500" : "bg-red-500"}
              />
              <span className={`text-sm font-medium ${isActive ? "text-green-600" : "text-red-600"}`}>
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={loading || !!nameError || !!descriptionError}
            className="bg-black text-white"
          >
            {loading ? "Updating..." : "Update Sub-Service"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
