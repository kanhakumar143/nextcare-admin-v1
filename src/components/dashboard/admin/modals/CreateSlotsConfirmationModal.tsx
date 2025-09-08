"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Save, Calendar, Clock } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { toast } from "sonner";
import { createScheduleSlotsWithTemplate } from "@/services/availabilityTemplate.api";
import { SlotSubmissionData } from "@/types/scheduleSlots.types";

interface CreateSlotsConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: (saveAsTemplate: boolean) => void;
  totalSlots: number;
  isOpenedViaTemplate?: boolean;
}

export default function CreateSlotsConfirmationModal({
  isOpen,
  onClose,
  onProceed,
  totalSlots,
  isOpenedViaTemplate,
}: CreateSlotsConfirmationModalProps) {
  const [saveAsTemplate, setSaveAsTemplate] = useState(!isOpenedViaTemplate);
  const { submissionData, doctors, selectedPractitionerId } = useAppSelector(
    (state) => state.scheduleSlots
  );

  const selectedDoctor = doctors.find(
    (doctor) => doctor.id === selectedPractitionerId
  );

  const handleProceed = async () => {
    // Add save_as_template to the submission data
    const finalData: SlotSubmissionData = {
      ...submissionData,
      is_active: submissionData?.is_active ?? true,
      remark: submissionData?.remark ?? "",
      name: submissionData?.name ?? null,
      start_date: submissionData?.start_date ?? null,
      end_date: submissionData?.end_date ?? null,
      start_time: submissionData?.start_time ?? null,
      end_time: submissionData?.end_time ?? null,
      duration: submissionData?.duration ?? null,
      working_days: submissionData?.working_days ?? [],
      practitioner_id: submissionData?.practitioner_id ?? null,
      specialty_id: submissionData?.specialty_id ?? null,
      recurring: submissionData?.recurring ?? null,
      holidays: submissionData?.holidays ?? null,
      leaves: submissionData?.leaves ?? null,
      breaks: submissionData?.breaks ?? [],
      use_template: isOpenedViaTemplate ? false : saveAsTemplate,
    };

    console.log("Final submission data with template flag:", finalData);

    try {
      const response = await createScheduleSlotsWithTemplate(finalData);
      onProceed(saveAsTemplate);
      toast.success("Schedule slots created successfully.");
    } catch (error) {
      console.error("Error creating schedule slots:", error);
      toast.error("Failed to create schedule slots.");
    }

    // console.log("Final submission data:", finalData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Confirm Slot Creation
          </DialogTitle>
          <DialogDescription>
            You are about to create {totalSlots} appointment slots
            {selectedDoctor && ` for Dr. ${selectedDoctor.name}`}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-600" />
              <span className="font-medium">Slot Details:</span>
            </div>
            {submissionData && (
              <div className="text-sm space-y-1 ml-6">
                <div>
                  Period: {submissionData.start_date} to{" "}
                  {submissionData.end_date}
                </div>
                <div>
                  Time: {submissionData.start_time} - {submissionData.end_time}
                </div>
                <div>Duration: {submissionData.duration} minutes per slot</div>
                <div>
                  Working Days: {submissionData.working_days?.join(", ")}
                </div>
                {submissionData.breaks && submissionData.breaks.length > 0 && (
                  <div>
                    Breaks:{" "}
                    {submissionData.breaks
                      .map((b) => `${b.start}-${b.end} (${b.purpose})`)
                      .join(", ")}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Template Option - Hidden when opened via template */}
          {!isOpenedViaTemplate && (
            <div className="border rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="save-template"
                  checked={saveAsTemplate}
                  onCheckedChange={(checked) =>
                    setSaveAsTemplate(checked === true)
                  }
                  className="mt-1"
                />
                <div className="space-y-1">
                  <label
                    htmlFor="save-template"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Save as template for future use
                  </label>
                  <p className="text-xs text-gray-600">
                    Save this configuration as a template to quickly create
                    similar slots
                    {selectedDoctor && ` for Dr. ${selectedDoctor.name}`} in the
                    future.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Template Usage Info - Show when opened via template */}
          {isOpenedViaTemplate && (
            <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
              <div className="flex items-center gap-2 text-blue-800">
                <Save className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Using Template Configuration
                </span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                Slots will be created using the selected template configuration.
                This will not be saved as a new template.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleProceed}
            className="bg-black text-white hover:bg-gray-800 flex items-center gap-2"
          >
            Proceed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
