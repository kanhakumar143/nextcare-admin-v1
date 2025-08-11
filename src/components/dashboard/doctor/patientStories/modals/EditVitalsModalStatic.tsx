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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Loader } from "lucide-react";

interface EditVitalsModalStaticProps {
  isOpen: boolean;
  onClose: () => void;
  currentVitals: any[];
  onSave: (vitals: any[]) => void;
}

export default function EditVitalsModalStatic({
  isOpen,
  onClose,
  currentVitals,
  onSave,
}: EditVitalsModalStaticProps) {
  const [saving, setSaving] = useState(false);
  const [vitals, setVitals] = useState(currentVitals);

  const handleClose = () => {
    setVitals(currentVitals); // Reset to original values
    onClose();
  };

  const handleSave = async () => {
    setSaving(true);

    // Simulate API call delay
    setTimeout(() => {
      onSave(vitals);
      setSaving(false);
      alert("Demo: Vitals updated successfully!");
      onClose();
    }, 1000);
  };

  const isVitalAbnormal = (
    vital: any,
    value: {
      value?: string | number;
      systolic?: string | number;
      diastolic?: string | number;
    }
  ): boolean => {
    if (
      vital.vital_definition?.name.toLowerCase().includes("blood pressure") ||
      vital.vital_definition?.code === "BP"
    ) {
      if (value.systolic !== undefined && value.diastolic !== undefined) {
        const systolic = Number(value.systolic);
        const diastolic = Number(value.diastolic);
        return (
          systolic < 90 || systolic > 140 || diastolic < 60 || diastolic > 90
        );
      }
      return false;
    }

    if (value.value !== undefined) {
      const numValue = Number(value.value);
      const normalMin = vital.vital_definition?.normal_min || 0;
      const normalMax = vital.vital_definition?.normal_max || 1000;
      return numValue < normalMin || numValue > normalMax;
    }

    return false;
  };

  const getColor = (isAbnormal: boolean) => {
    if (isAbnormal) return "bg-red-50 border-red-200";
    return "bg-white border-gray-200";
  };

  const handleVitalChange = (index: number, field: string, value: string) => {
    setVitals((prev) =>
      prev.map((vital, i) => {
        if (i === index) {
          const updatedVital = { ...vital };
          if (field === "value") {
            updatedVital.value = { ...updatedVital.value, value };
          } else if (field === "systolic") {
            updatedVital.value = { ...updatedVital.value, systolic: value };
          } else if (field === "diastolic") {
            updatedVital.value = { ...updatedVital.value, diastolic: value };
          }

          // Update abnormal status
          updatedVital.is_abnormal = isVitalAbnormal(
            updatedVital,
            updatedVital.value
          );

          return updatedVital;
        }
        return vital;
      })
    );
  };

  const renderVitalInput = (vital: any, index: number) => {
    const isBloodPressure = vital.vital_definition?.code === "BP";
    const unit = vital.vital_definition?.unit || "";
    const isAbnormal = vital.is_abnormal;

    if (isBloodPressure) {
      return (
        <div
          className={`space-y-1 p-4 border rounded-lg ${
            isAbnormal ? "bg-red-50 border-red-200" : "bg-white border-gray-200"
          }`}
        >
          <Label className="text-sm font-medium flex items-center gap-2">
            {isAbnormal && (
              <span className={`w-2 h-2 rounded-full bg-red-500`}></span>
            )}
            {vital.vital_definition?.name}
            {isAbnormal && (
              <span className="text-xs text-red-600 font-medium">
                (Abnormal)
              </span>
            )}
          </Label>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Systolic</Label>
              <Input
                type="number"
                placeholder="120"
                value={vital.value?.systolic || ""}
                onChange={(e) =>
                  handleVitalChange(index, "systolic", e.target.value)
                }
                className="mt-1"
              />
            </div>
            <span className="text-lg font-bold text-muted-foreground mt-6">
              /
            </span>
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Diastolic</Label>
              <Input
                type="number"
                placeholder="80"
                value={vital.value?.diastolic || ""}
                onChange={(e) =>
                  handleVitalChange(index, "diastolic", e.target.value)
                }
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{unit}</p>
            <p className="text-xs text-muted-foreground">
              Normal: 90-140/60-90 {unit}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`space-y-3 p-4 border rounded-lg ${getColor(isAbnormal)}`}
      >
        <Label className="text-sm font-medium flex items-center gap-2">
          {isAbnormal && (
            <span className={`w-2 h-2 rounded-full bg-red-500`}></span>
          )}
          {vital.vital_definition?.name}
          {isAbnormal && (
            <span className="text-xs text-red-600 font-medium">(Abnormal)</span>
          )}
        </Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder={`Enter ${vital.vital_definition?.name.toLowerCase()}`}
            value={vital.value?.value || ""}
            onChange={(e) => handleVitalChange(index, "value", e.target.value)}
            className="flex-1"
          />
          {unit && (
            <span className="text-sm text-muted-foreground px-2">{unit}</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Normal range: {vital.vital_definition?.normal_min || 0}-
          {vital.vital_definition?.normal_max || 100} {unit}
        </p>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Edit Patient Vitals (Demo)
          </DialogTitle>
          <DialogDescription>
            Update the patient's vital signs. This is a demonstration with
            static data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {vitals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {vitals.map((vital, index) => (
                <div key={vital.id || index} className="space-y-3">
                  {renderVitalInput(vital, index)}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No vitals data available to edit.</p>
              <p className="text-sm mt-2">
                Vitals will be populated when you click the edit button from the
                consultation screen.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || vitals.length === 0}>
            {saving ? <Loader className="animate-spin" /> : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
