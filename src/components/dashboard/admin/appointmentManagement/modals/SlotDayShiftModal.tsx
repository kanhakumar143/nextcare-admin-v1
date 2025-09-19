"use client";

import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { shiftAppointmentSlotsBydays } from "@/services/appointmentManagement.api";
import moment from "moment";

interface SlotDayShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftData: {
    schedules: any[]; // Array of schedules for the selected date
    shiftDays: number;
    date: string;
    doctorName?: string;
  } | null;
  onRefreshData: () => Promise<void>;
}

export default function SlotDayShiftModal({
  isOpen,
  onClose,
  shiftData,
  onRefreshData,
}: SlotDayShiftModalProps) {
  const formatDate = (dateString: string) => {
    return moment(dateString).format("MMM DD, YYYY");
  };

  const calculateNewDate = (dateString: string, days: number) => {
    return moment(dateString).add(days, "days").format("MMM DD, YYYY");
  };

  const handleConfirmShift = async () => {
    if (!shiftData || !shiftData.schedules.length) return;

    try {
      // Call the API for each schedule in the date
      const promises = shiftData.schedules.map((schedule) =>
        shiftAppointmentSlotsBydays({
          schedule_id: schedule.id,
          shift_value: shiftData.shiftDays,
        })
      );

      await Promise.all(promises);

      toast.success(
        `Slots shifted by ${shiftData.shiftDays} day(s) successfully for ${shiftData.schedules.length} schedule(s)`
      );
      onClose();

      // Refresh the appointment data
      await onRefreshData();
    } catch (error) {
      console.error("Error shifting slots by days:", error);
      toast.error("Failed to shift slots by days. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Slot Day Shift</DialogTitle>
          <DialogDescription>
            This action will shift all appointments from{" "}
            <span className="font-medium">
              {shiftData?.date && formatDate(shiftData.date)}
            </span>
            {shiftData?.doctorName && (
              <>
                {" "}
                for{" "}
                <span className="font-medium">Dr. {shiftData.doctorName}</span>
              </>
            )}{" "}
            by{" "}
            <span className="font-medium text-blue-600">
              {shiftData?.shiftDays} day(s)
            </span>
            {shiftData?.date && shiftData?.shiftDays && (
              <>
                {" "}
                to{" "}
                <span className="font-medium text-green-600">
                  {calculateNewDate(shiftData.date, shiftData.shiftDays)}
                </span>
              </>
            )}
            {shiftData?.schedules && shiftData.schedules.length > 1 && (
              <>
                {" "}
                across{" "}
                <span className="font-medium text-orange-600">
                  {shiftData.schedules.length} schedules
                </span>
              </>
            )}
            .
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="flex-1 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Warning:</strong> This will reschedule all appointments
              to a different date. Patients may need to be notified of the date
              changes and should confirm their availability.
            </p>
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirmShift}>Confirm Shift</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
