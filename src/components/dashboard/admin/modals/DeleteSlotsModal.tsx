"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Clock, Trash2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Schedule, Slot } from "@/types/scheduleSlots.types";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { deleteBulkSlots } from "@/services/schedule.api";

interface DeleteSlotsModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: Schedule | null;
  onDeleteSlots: (scheduleId: string, slotIds: string[]) => void;
  onDeleteSlotsByTimeRange: (
    scheduleId: string,
    startTime: string,
    endTime: string
  ) => void;
}

export default function DeleteSlotsModal({
  isOpen,
  onClose,
  schedule,
  onDeleteSlots,
  onDeleteSlotsByTimeRange,
}: DeleteSlotsModalProps) {
  const [deleteMode, setDeleteMode] = useState<
    "single" | "multiple" | "timeRange"
  >("single");
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");

  const handleClose = () => {
    setDeleteMode("single");
    setSelectedSlotIds([]);
    setStartTime("");
    setEndTime("");
    onClose();
  };

  const handleDeleteConfirm = async () => {
    if (!schedule) return;
    console.log(selectedSlotIds);
    try {
      await deleteBulkSlots(selectedSlotIds);
      toast.success(`Deleted ${selectedSlotIds.length} slot(s)`);
    } catch (error) {
      toast.error("Failed to delete slots");
    } finally {
      handleClose();
    }
    // if (deleteMode === "timeRange") {
    //   if (!startTime || !endTime) {
    //     toast.error("Please select both start and end times");
    //     return;
    //   }

    //   // Create full datetime strings for comparison
    //   const scheduleDate = new Date(schedule.planning_start)
    //     .toISOString()
    //     .split("T")[0];
    //   const startDateTime = `${scheduleDate}T${startTime}:00`;
    //   const endDateTime = `${scheduleDate}T${endTime}:00`;

    //   onDeleteSlotsByTimeRange(schedule.id, startDateTime, endDateTime);
    //   toast.success(`Deleted slots between ${startTime} and ${endTime}`);
    // } else {
    //   if (selectedSlotIds.length === 0) {
    //     toast.error("Please select at least one slot to delete");
    //     return;
    //   }
    //   onDeleteSlots(schedule.id, selectedSlotIds);
    //   toast.success(`Deleted ${selectedSlotIds.length} slot(s)`);
    // }
    // handleClose();
  };

  const toggleSlotSelection = (slotId: string) => {
    setSelectedSlotIds((prev) =>
      prev.includes(slotId)
        ? prev.filter((id) => id !== slotId)
        : [...prev, slotId]
    );
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatTimeInput = (dateString: string) => {
    return new Date(dateString).toTimeString().slice(0, 5);
  };

  const getSlotsInTimeRange = () => {
    if (!schedule || !startTime || !endTime) return [];

    const scheduleDate = new Date(schedule.planning_start)
      .toISOString()
      .split("T")[0];
    const startDateTime = new Date(`${scheduleDate}T${startTime}:00`);
    const endDateTime = new Date(`${scheduleDate}T${endTime}:00`);

    return schedule.slots.filter((slot) => {
      const slotStart = new Date(slot.start);
      return slotStart >= startDateTime && slotStart <= endDateTime;
    });
  };

  if (!schedule) return null;

  const sortedSlots = [...schedule.slots].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            Delete Slots -{" "}
            {format(new Date(schedule.planning_start), "MMM dd, yyyy")}
          </DialogTitle>
          <DialogDescription>
            Select slots to delete from this schedule. This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Delete Mode Selection */}
          {/* <div className="space-y-2">
            <Label>Delete Mode:</Label>
            <Select value={deleteMode} onValueChange={(value: "single" | "multiple" | "timeRange") => setDeleteMode(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single Slot</SelectItem>
                <SelectItem value="multiple">Multiple Slots</SelectItem>
                <SelectItem value="timeRange">Time Range</SelectItem>
              </SelectContent>
            </Select>
          </div> */}

          {/* Time Range Selection */}
          {deleteMode === "timeRange" && (
            <div className="space-y-4 p-4 border rounded-lg bg-red-50">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Delete by Time Range
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time:</Label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>End Time:</Label>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {startTime && endTime && (
                <div className="text-sm text-red-600">
                  <strong>Warning:</strong> This will delete{" "}
                  {getSlotsInTimeRange().length} slot(s) between {startTime} and{" "}
                  {endTime}.
                </div>
              )}
            </div>
          )}

          {/* Slot Selection */}
          {deleteMode !== "timeRange" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Select Slots to Delete:</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedSlotIds(sortedSlots.map((s) => s.id))
                    }
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedSlotIds([])}
                  >
                    Clear All
                  </Button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {sortedSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedSlotIds.includes(slot.id)
                          ? "border-red-300 bg-red-50"
                          : slot.overbooked
                          ? "border-gray-300 bg-gray-50"
                          : "border-green-200 bg-green-50 hover:border-green-300"
                      }`}
                      onClick={() => toggleSlotSelection(slot.id)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={selectedSlotIds.includes(slot.id)}
                          onChange={() => toggleSlotSelection(slot.id)}
                          className="rounded"
                        />
                        <Clock className="w-3 h-3" />
                      </div>

                      <div className="text-sm font-medium">
                        {formatTime(slot.start)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        to {formatTime(slot.end)}
                      </div>

                      <div className="mt-2">
                        <Badge
                          variant={
                            slot.overbooked ? "destructive" : "secondary"
                          }
                          className="text-xs"
                        >
                          {slot.overbooked ? "Overbooked" : "Available"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedSlotIds.length > 0 && (
                <div className="text-sm text-red-600 p-3 bg-red-50 rounded-lg">
                  <strong>Warning:</strong> You are about to delete{" "}
                  {selectedSlotIds.length} slot(s).
                </div>
              )}
            </div>
          )}

          {/* Schedule Info */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              <div className="font-medium mb-1">Schedule Information:</div>
              <div>
                Date:{" "}
                {format(
                  new Date(schedule.planning_start),
                  "EEEE, MMMM dd, yyyy"
                )}
              </div>
              <div>
                Time: {formatTime(schedule.planning_start)} -{" "}
                {formatTime(schedule.planning_end)}
              </div>
              <div>Total Slots: {schedule.slots.length}</div>
              <div>
                Available: {schedule.slots.filter((s) => !s.overbooked).length}
              </div>
              <div>
                Overbooked: {schedule.slots.filter((s) => s.overbooked).length}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteConfirm}
            disabled={
              deleteMode === "timeRange"
                ? !startTime || !endTime
                : selectedSlotIds.length === 0
            }
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete{" "}
            {deleteMode === "timeRange" && startTime && endTime
              ? `${getSlotsInTimeRange().length} Slot(s)`
              : `${selectedSlotIds.length} Slot(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
