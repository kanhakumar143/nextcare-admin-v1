"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addTaxRateThunk, updateTaxRateById, closeEditModal } from "@/store/slices/taxManagementSlice";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { CreateTaxRateDto } from "@/types/taxManagement.type";

interface TaxRateModalProps {
  open: boolean;
  onClose: () => void;
}

export default function TaxRateModal({ open, onClose }: TaxRateModalProps) {
  const dispatch = useAppDispatch();
  const { editing, loading } = useAppSelector((state) => state.taxManagement);

  const [name, setName] = useState("");
  const [rate, setRate] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [nameError, setNameError] = useState("");
  const [rateError, setRateError] = useState("");

  const [suggestions, setSuggestions] = useState<number[]>([]);

  const isEditMode = !!editing;

  useEffect(() => {
    const randomSuggestions = Array.from({ length: 5 }, () => Math.floor(Math.random() * 25) + 1);
    setSuggestions(randomSuggestions);
  }, [open]);

  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setRate(Number(editing.rate));
      setDescription(editing.description || "");
      setIsActive(editing.active);
      setNameError("");
      setRateError("");
    } else {
      setName("");
      setRate("");
      setDescription("");
      setIsActive(true);
      setNameError("");
      setRateError("");
    }
  }, [editing]);

  const validate = (): boolean => {
    let valid = true;
    if (!name.trim()) { setNameError("Name is required"); valid = false; } else setNameError("");
    if (rate === "" || rate < 0) { setRateError("Rate must be a valid number"); valid = false; } else setRateError("");
    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload: CreateTaxRateDto = { name: name.trim(), rate: Number(rate), description: description.trim(), active: isActive };

    try {
      if (isEditMode && editing) {
        const resultAction = await dispatch(updateTaxRateById({ id: editing.id, data: payload }));
        if (updateTaxRateById.fulfilled.match(resultAction)) toast.success("Tax rate updated successfully!");
        else toast.error(resultAction.payload as string);
      } else {
        const resultAction = await dispatch(addTaxRateThunk(payload));
        if (addTaxRateThunk.fulfilled.match(resultAction)) toast.success("Tax rate added successfully!");
        else toast.error(resultAction.payload as string);
      }
      handleClose();
    } catch { toast.error("Something went wrong!"); }
  };

  const handleClose = () => { onClose(); dispatch(closeEditModal()); };
  const handleSuggestionClick = (sug: number) => { setRate(sug); setRateError(""); };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md py-4">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Tax Rate" : "Add Tax Rate"}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {isEditMode ? "Update the tax rate details below." : "Enter details to create a new tax rate."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="tax-name">Name</Label>
            <Input id="tax-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. GST 18%" disabled={loading} className={nameError ? "border-red-500" : ""} />
            {nameError && <p className="text-sm text-red-500">{nameError}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tax-rate">Rate (%)</Label>
            <Input id="tax-rate" type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} placeholder="Enter rate" disabled={loading} className={rateError ? "border-red-500" : ""} />
            {rateError && <p className="text-sm text-red-500">{rateError}</p>}

            <div className="flex flex-wrap gap-2 mt-1">
              {suggestions.map((sug) => (
                <Button key={sug} size="sm" variant="outline" onClick={() => handleSuggestionClick(sug)}>{sug}%</Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tax-description">Description</Label>
            <Input id="tax-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" disabled={loading} />
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={isActive} onCheckedChange={setIsActive} className={isActive ? "bg-green-500" : "bg-red-500"} />
            <span className={`text-sm font-medium ${isActive ? "text-green-600" : "text-red-600"}`}>{isActive ? "Active" : "Inactive"}</span>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-black text-white">{loading ? (isEditMode ? "Updating..." : "Saving...") : isEditMode ? "Update" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
