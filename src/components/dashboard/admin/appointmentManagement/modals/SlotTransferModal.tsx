"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Calendar,
  Clock,
  User,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import moment from "moment";
import { updateAppointmentBySlots } from "@/services/appointmentManagement.api";
import { toast } from "sonner";

interface SlotTransferData {
  sourceSlot: {
    id: string;
    start: string;
    end: string;
    comment?: string;
    overbooked: boolean;
  };
  targetSlot: {
    id: string;
    start: string;
    end: string;
    comment?: string;
    overbooked: boolean;
  };
  sourceSchedule: {
    id: string;
    planning_start: string;
  };
  targetSchedule: {
    id: string;
    planning_start: string;
  };
  sourceDoctorName?: string;
  targetDoctorName?: string;
  appointmentId?: string; // Will be extracted from slot comment or provided separately
  targetSlotId: string; // The target slot ID for the API call
}

interface SlotTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  transferData: SlotTransferData | null;
  onConfirm: () => void;
  onRefreshData?: () => void; // Function to refresh appointment data
}

export default function SlotTransferModal({
  isOpen,
  onClose,
  transferData,
  onConfirm,
  onRefreshData,
}: SlotTransferModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!transferData) return null;

  const {
    sourceSlot,
    targetSlot,
    sourceSchedule,
    targetSchedule,
    sourceDoctorName,
    targetDoctorName,
    appointmentId,
    targetSlotId,
  } = transferData;

  const formatTime = (dateString: string) => {
    return moment(dateString).format("HH:mm");
  };

  const formatDate = (dateString: string) => {
    return moment(dateString).format("MMM DD, YYYY");
  };

  const formatDayName = (dateString: string) => {
    return moment(dateString).format("dddd");
  };

  const isCrossDoctorTransfer =
    sourceDoctorName &&
    targetDoctorName &&
    sourceDoctorName !== targetDoctorName;
  const isSameDay = moment(sourceSchedule.planning_start).isSame(
    moment(targetSchedule.planning_start),
    "day"
  );

  const handleConfirm = async () => {
    setIsLoading(true);

    console.log("Modal Transfer Data:", {
      appointmentId,
      targetSlotId,
      sourceSlotId: sourceSlot.id,
      hasAppointmentId: !!appointmentId,
      hasTargetSlotId: !!targetSlotId,
    });

    try {
      // If we have appointment ID, call the API
      if (appointmentId && targetSlotId) {
        console.log("Calling API with:", {
          appointment_id: appointmentId,
          new_slot_id: targetSlotId,
        });

        await updateAppointmentBySlots({
          appointment_id: appointmentId,
          new_slot_id: targetSlotId,
        });

        console.log("API call successful");

        // Small delay to ensure server data is updated
        await new Promise((resolve) => setTimeout(resolve, 500));
      } else {
        console.warn("Missing required data for API call:", {
          appointmentId,
          targetSlotId,
        });
      }

      // Call the parent's onConfirm to handle local state updates
      onConfirm();

      // Call the refresh data function to reload appointment data
      if (onRefreshData) {
        console.log("Refreshing appointment data...");
        await onRefreshData();
      }

      // Show success message
      let message = "";
      if (isCrossDoctorTransfer) {
        message = `Appointment transferred from Dr. ${sourceDoctorName} (${formatDate(
          sourceSchedule.planning_start
        )} ${formatTime(
          sourceSlot.start
        )}) to Dr. ${targetDoctorName} (${formatDate(
          targetSchedule.planning_start
        )} ${formatTime(targetSlot.start)})`;
      } else {
        message = isSameDay
          ? `Appointment moved from ${formatTime(
              sourceSlot.start
            )} to ${formatTime(targetSlot.start)} on ${formatDate(
              sourceSchedule.planning_start
            )}`
          : `Appointment transferred from ${formatDate(
              sourceSchedule.planning_start
            )} (${formatTime(sourceSlot.start)}) to ${formatDate(
              targetSchedule.planning_start
            )} (${formatTime(targetSlot.start)})`;
      }

      toast.success(message);
      onClose();
    } catch (error) {
      console.error("Failed to transfer appointment:", error);
      toast.error("Failed to transfer appointment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5" />
            Confirm Appointment Transfer
          </DialogTitle>
          <DialogDescription>
            {isCrossDoctorTransfer
              ? "You are about to transfer an appointment between different doctors. Please review the details below."
              : "You are about to transfer an appointment to a different time slot. Please review the details below."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Transfer Type Alert */}
          {/* <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-amber-700 font-medium">
              {isCrossDoctorTransfer
                ? "Cross-Doctor Transfer"
                : "Time Slot Transfer"}
            </span>
          </div> */}

          {/* Transfer Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Source Slot */}
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-red-800">From</h3>
                  <Badge variant="destructive" className="text-xs">
                    Current
                  </Badge>
                </div>

                {sourceDoctorName && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-red-600" />
                    <span className="font-medium">Dr. {sourceDoctorName}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-red-600" />
                  <div>
                    <div className="font-medium">
                      {formatDayName(sourceSchedule.planning_start)}
                    </div>
                    <div className="text-red-700">
                      {formatDate(sourceSchedule.planning_start)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-red-600" />
                  <span className="font-medium">
                    {formatTime(sourceSlot.start)} -{" "}
                    {formatTime(sourceSlot.end)}
                  </span>
                </div>

                {sourceSlot.comment && (
                  <div className="text-xs text-red-700 bg-red-100 p-2 rounded">
                    <strong>Note:</strong> {sourceSlot.comment}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Target Slot */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-green-800">To</h3>
                  <Badge
                    variant="outline"
                    className="text-xs border-green-600 text-green-700"
                  >
                    Available
                  </Badge>
                </div>

                {targetDoctorName && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Dr. {targetDoctorName}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <div>
                    <div className="font-medium">
                      {formatDayName(targetSchedule.planning_start)}
                    </div>
                    <div className="text-green-700">
                      {formatDate(targetSchedule.planning_start)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="font-medium">
                    {formatTime(targetSlot.start)} -{" "}
                    {formatTime(targetSlot.end)}
                  </span>
                </div>

                {targetSlot.comment && (
                  <div className="text-xs text-green-700 bg-green-100 p-2 rounded">
                    <strong>Note:</strong> {targetSlot.comment}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div className="rounded-lg p-4">
            <h4 className="font-medium mb-2">Transfer Summary</h4>
            <div className="text-sm space-y-1">
              {isCrossDoctorTransfer && (
                <p>
                  • Patient will be transferred from Dr. {sourceDoctorName} to
                  Dr. {targetDoctorName}
                </p>
              )}
              <p>
                • Date: {formatDate(sourceSchedule.planning_start)} →{" "}
                {formatDate(targetSchedule.planning_start)}
              </p>
              <p>
                • Time: {formatTime(sourceSlot.start)} →{" "}
                {formatTime(targetSlot.start)}
              </p>
              {appointmentId && <p>• Appointment ID: {appointmentId}</p>}
              {targetSlotId && <p>• Target Slot ID: {targetSlotId}</p>}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading} className="">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Transferring...
              </>
            ) : (
              "Confirm Transfer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
