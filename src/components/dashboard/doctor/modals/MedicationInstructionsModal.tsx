"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateMedicine } from "@/store/slices/doctorSlice";
import { Medication } from "@/types/doctor.types";

interface MedicationInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: Medication;
  medicineIndex: number;
}

export default function MedicationInstructionsModal({
  isOpen,
  onClose,
  medicine,
  medicineIndex,
}: MedicationInstructionsModalProps) {
  const dispatch = useDispatch();

  const [dosageInstructions, setDosageInstructions] = useState(
    medicine.dosage_instruction || ""
  );
  const [notes, setNotes] = useState(medicine.note?.info || "");

  const handleSave = () => {
    // Update dosage instructions
    if (dosageInstructions !== (medicine.dosage_instruction || "")) {
      dispatch(
        updateMedicine({
          index: medicineIndex,
          key: "dosage_instruction",
          value: dosageInstructions,
        })
      );
    }

    // Update notes - handle it as a simple field for now
    if (notes !== (medicine.note?.info || "")) {
      dispatch(
        updateMedicine({
          index: medicineIndex,
          key: "note.info",
          value: notes,
        })
      );
    }

    onClose();
  };

  const handleClose = () => {
    // Reset to original values when closing without saving
    setDosageInstructions(medicine.dosage_instruction || "");
    setNotes(medicine.note?.info || "");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Additional Instructions for {medicine.name || "Medicine"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="dosage-instructions">How to Consume</Label>
            <Textarea
              id="dosage-instructions"
              placeholder="Enter detailed consumption instructions..."
              value={dosageInstructions}
              onChange={(e) => setDosageInstructions(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Remarks</Label>
            <Textarea
              id="notes"
              placeholder="Enter any additional remarks or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Instructions</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
