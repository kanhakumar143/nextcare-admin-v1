"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Save } from "lucide-react";
import { toast } from "sonner";
import {
  createSchedule,
  createSlots,
} from "@/services/availabilityTemplate.api";
import { useAuthInfo } from "@/hooks/useAuthInfo";

interface TempNextDaySlotsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctorId: string;
  doctorName: string;
}

interface SlotFormData {
  planning_start: string;
  planning_end: string;
  total_slots: number;
  interval_gap: number;
}

export default function TempNextDaySlotsModal({
  open,
  onOpenChange,
  doctorId,
  doctorName,
}: TempNextDaySlotsModalProps) {
  const [formData, setFormData] = useState<SlotFormData>({
    planning_start: "",
    planning_end: "",
    total_slots: 1,
    interval_gap: 30,
  });

  // Get tomorrow's date in YYYY-MM-DDTHH:MM format for datetime-local input
  const getNextDayDateTime = (time: string = "09:00") => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const day = String(tomorrow.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}T${time}`;
  };

  const { practitionerId } = useAuthInfo();

  // Initialize with tomorrow's default times
  const initializeDefaultTimes = () => {
    setFormData((prev) => ({
      ...prev,
      planning_start: getNextDayDateTime("09:00"),
      planning_end: getNextDayDateTime("17:00"),
    }));
  };

  // Initialize default times when modal opens
  useState(() => {
    if (open) {
      initializeDefaultTimes();
    }
  });

  const handleInputChange = (
    field: keyof SlotFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.planning_start) {
      toast.error("Please select planning start date and time");
      return false;
    }

    if (!formData.planning_end) {
      toast.error("Please select planning end date and time");
      return false;
    }

    const startDate = new Date(formData.planning_start);
    const endDate = new Date(formData.planning_end);

    if (endDate <= startDate) {
      toast.error("Planning end time must be after planning start time");
      return false;
    }

    if (formData.total_slots <= 0) {
      toast.error("Total slots must be greater than 0");
      return false;
    }

    if (formData.interval_gap <= 0) {
      toast.error("Interval gap must be greater than 0 minutes");
      return false;
    }

    return true;
  };

  const handleCreateSchedule = async (payload: any) => {
    try {
      const response = await createSchedule(payload);
      if (response) {
        console.log("Schedule created successfully:", response);
        handleCreateSlots(response.data.schedule_id);
      }
    } catch (error) {
      console.error("Error creating schedule:", error);
    }
  };

  const handleCreateSlots = async (scheduleId: any) => {
    const payload = {
      schedule_id: scheduleId,
      total_slots: formData.total_slots,
      interval_gap: formData.interval_gap,
    };
    try {
      const response = await createSlots(payload);
      if (response) {
        console.log("Slots created successfully:", response);
        toast.success(
          `Successfully created ${formData.total_slots} next-day slots for Dr. ${doctorName}!`
        );
        // Reset form and close modal
        resetForm();
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error creating slots:", error);
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    // Console the data with the required keys
    const payloadForSchedule = {
      //   doctorId,
      //   doctorName,
      comment: "Schedule",
      specialty_id: "15356aa0-6912-490d-b987-1c98854ddd4f",
      practitioner_id: practitionerId,
      planning_start: formData.planning_start,
      planning_end: formData.planning_end,
      //   total_slots: formData.total_slots,
      //   interval_gap: formData.interval_gap,
    };
    handleCreateSchedule(payloadForSchedule);
  };

  const resetForm = () => {
    setFormData({
      planning_start: "",
      planning_end: "",
      total_slots: 1,
      interval_gap: 30,
    });
  };

  const handleModalOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      initializeDefaultTimes();
    } else {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleModalOpenChange}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
              <Calendar className="w-6 h-6" />
              Create Next Day Slots for Dr. {doctorName}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6 p-6">
          {/* Planning Start DateTime */}
          <div className="space-y-2">
            <Label htmlFor="planning_start" className="text-sm font-medium">
              Planning Start (Date & Time)
            </Label>
            <Input
              id="planning_start"
              type="datetime-local"
              value={formData.planning_start}
              onChange={(e) =>
                handleInputChange("planning_start", e.target.value)
              }
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Select the start date and time for the planning period
            </p>
          </div>

          {/* Planning End DateTime */}
          <div className="space-y-2">
            <Label htmlFor="planning_end" className="text-sm font-medium">
              Planning End (Date & Time)
            </Label>
            <Input
              id="planning_end"
              type="datetime-local"
              value={formData.planning_end}
              onChange={(e) =>
                handleInputChange("planning_end", e.target.value)
              }
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Select the end date and time for the planning period
            </p>
          </div>

          {/* Total Slots */}
          <div className="space-y-2">
            <Label htmlFor="total_slots" className="text-sm font-medium">
              Total Slots
            </Label>
            <Input
              id="total_slots"
              type="number"
              min="1"
              max="100"
              value={formData.total_slots}
              onChange={(e) =>
                handleInputChange("total_slots", parseInt(e.target.value) || 1)
              }
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Number of appointment slots to be created
            </p>
          </div>

          {/* Interval Gap */}
          <div className="space-y-2">
            <Label htmlFor="interval_gap" className="text-sm font-medium">
              Interval Gap (Minutes)
            </Label>
            <Input
              id="interval_gap"
              type="number"
              min="5"
              max="480"
              value={formData.interval_gap}
              onChange={(e) =>
                handleInputChange(
                  "interval_gap",
                  parseInt(e.target.value) || 30
                )
              }
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Time duration for each appointment slot in minutes
            </p>
          </div>

          {/* Configuration Summary */}
          <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
            <h4 className="text-sm font-medium">Configuration Summary</h4>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Planning Start:</span>
                <span className="font-medium">
                  {formData.planning_start
                    ? new Date(formData.planning_start).toLocaleString()
                    : "Not set"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Planning End:</span>
                <span className="font-medium">
                  {formData.planning_end
                    ? new Date(formData.planning_end).toLocaleString()
                    : "Not set"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Slots:</span>
                <span className="font-medium">{formData.total_slots}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Interval:</span>
                <span className="font-medium">
                  {formData.interval_gap} minutes
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 px-6 pb-6 border-t pt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-black text-white hover:bg-gray-800"
          >
            <Save className="w-4 h-4 mr-2" />
            Create Slots
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
