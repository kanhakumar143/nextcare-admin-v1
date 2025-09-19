"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { shiftAppointmentSlots } from "@/services/appointmentManagement.api";
import { useAuthInfo } from "@/hooks/useAuthInfo";
import moment from "moment";

interface SlotShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftData: {
    schedules: any[]; // Array of schedules for the selected date
    delayMinutes: number;
    date: string;
    doctorName?: string;
  } | null;
  onRefreshData: () => Promise<void>;
}

export default function SlotShiftModal({
  isOpen,
  onClose,
  shiftData,
  onRefreshData,
}: SlotShiftModalProps) {
  const [reason, setReason] = useState("Requested by admin");
  const { practitionerId } = useAuthInfo();

  const handleClose = () => {
    setReason("Requested by admin"); // Reset reason when closing
    onClose();
  };
  const formatDate = (dateString: string) => {
    return moment(dateString).format("MMM DD, YYYY");
  };

  const handleConfirmShift = async () => {
    if (!shiftData || !shiftData.schedules.length) return;

    if (!reason.trim()) {
      toast.error("Please provide a reason for shifting slots");
      return;
    }

    if (!practitionerId) {
      toast.error("Practitioner ID not found. Please log in again.");
      return;
    }

    try {
      // Call the API for each schedule in the date
      // const promises = shiftData.schedules.map((schedule) =>
      await shiftAppointmentSlots({
        schedule_id: shiftData.schedules[0].id,
        delay_minutes: shiftData.delayMinutes,
        reason: reason.trim(),
        changed_by: practitionerId,
      });
      // );

      // await Promise.all(promises);

      toast.success(
        `Slots shifted by ${shiftData.delayMinutes} minutes successfully for ${shiftData.schedules.length} schedule(s)`
      );
      onClose();
      setReason("Requested by admin"); // Reset reason on success

      // Refresh the appointment data
      await onRefreshData();
    } catch (error) {
      console.error("Error shifting slots:", error);
      toast.error("Failed to shift slots. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Slot Time Shift</DialogTitle>
          <DialogDescription>
            This action will shift all slot times for{" "}
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
              {shiftData?.delayMinutes} minutes
            </span>
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

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="flex-1 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Warning:</strong> This will update all appointment
                times for this day. Patients may need to be notified of the time
                changes.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for shifting slots</Label>
            <Input
              id="reason"
              type="text"
              placeholder="Enter reason for shifting appointment times..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirmShift}>Confirm Shift</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
