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
import { Calendar, Clock, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Schedule } from "@/types/scheduleSlots.types";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { deleteBulkSchedules } from "@/services/schedule.api";

interface DeleteScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedules: Schedule[];
  onDeleteSchedules: (scheduleIds: string[]) => void;
  onDeleteSchedulesByDateRange: (startDate: string, endDate: string) => void;
}

export default function DeleteScheduleModal({
  isOpen,
  onClose,
  schedules,
  onDeleteSchedules,
  onDeleteSchedulesByDateRange,
}: DeleteScheduleModalProps) {
  const [deleteMode, setDeleteMode] = useState<
    "single" | "multiple" | "dateRange"
  >("single");
  const [selectedScheduleIds, setSelectedScheduleIds] = useState<string[]>([]);
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClose = () => {
    setSelectedScheduleIds([]);
    setFromDate(undefined);
    setToDate(undefined);
    setIsDeleting(false);
    onClose();
  };

  const handleDeleteConfirm = async () => {
    console.log("Delete confirmed", selectedScheduleIds);
    setIsDeleting(true);
    try {
      await deleteBulkSchedules(selectedScheduleIds);
      toast.success("Schedules deleted successfully.");
      handleClose();
    } catch (error) {
      toast.error("Failed to delete schedules.");
    } finally {
      setIsDeleting(false);
    }
    // if (deleteMode === "dateRange") {
    //   if (!fromDate || !toDate) {
    //     toast.error("Please select both from and to dates");
    //     return;
    //   }
    //   onDeleteSchedulesByDateRange(
    //     fromDate.toISOString(),
    //     toDate.toISOString()
    //   );
    //   toast.success(
    //     `Deleted schedules from ${format(fromDate, "MMM dd, yyyy")} to ${format(
    //       toDate,
    //       "MMM dd, yyyy"
    //     )}`
    //   );
    // } else {
    //   if (selectedScheduleIds.length === 0) {
    //     toast.error("Please select at least one schedule to delete");
    //     return;
    //   }
    //   onDeleteSchedules(selectedScheduleIds);
    //   toast.success(`Deleted ${selectedScheduleIds.length} schedule(s)`);
    // }
    // handleClose();
  };

  const toggleScheduleSelection = (scheduleId: string) => {
    setSelectedScheduleIds((prev) =>
      prev.includes(scheduleId)
        ? prev.filter((id) => id !== scheduleId)
        : [...prev, scheduleId]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getSchedulesInDateRange = () => {
    if (!fromDate || !toDate) return [];

    return schedules.filter((schedule) => {
      const scheduleDate = new Date(schedule.planning_start);
      return scheduleDate >= fromDate && scheduleDate <= toDate;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            Delete Schedules
          </DialogTitle>
          <DialogDescription>
            Select schedules to delete. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Range Selection */}
          {/* {deleteMode === "dateRange" && (
            <div className="space-y-4 p-4 border rounded-lg bg-red-50">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Delete by Date Range
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From Date:</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {fromDate
                          ? format(fromDate, "MMM dd, yyyy")
                          : "Select start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={fromDate}
                        onSelect={setFromDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>To Date:</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {toDate
                          ? format(toDate, "MMM dd, yyyy")
                          : "Select end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={toDate}
                        onSelect={setToDate}
                        initialFocus
                        disabled={(date) =>
                          fromDate ? date < fromDate : false
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {fromDate && toDate && (
                <div className="text-sm text-red-600">
                  <strong>Warning:</strong> This will delete{" "}
                  {getSchedulesInDateRange().length} schedule(s) between{" "}
                  {format(fromDate, "MMM dd, yyyy")} and{" "}
                  {format(toDate, "MMM dd, yyyy")}.
                </div>
              )}
            </div>
          )} */}

          {/* Schedule Selection */}
          {deleteMode !== "dateRange" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Select Schedules to Delete:</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedScheduleIds(schedules.map((s) => s.id))
                    }
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedScheduleIds([])}
                  >
                    Clear All
                  </Button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedScheduleIds.includes(schedule.id)
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => toggleScheduleSelection(schedule.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedScheduleIds.includes(schedule.id)}
                          onChange={() => toggleScheduleSelection(schedule.id)}
                          className="rounded"
                        />
                        <div>
                          <div className="font-medium">
                            {formatDate(schedule.planning_start)}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(schedule.planning_start)} -{" "}
                            {formatTime(schedule.planning_end)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {schedule.slots.length} slots
                        </Badge>
                        <Badge
                          variant={
                            schedule.slots.some((s) => s.overbooked)
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {schedule.slots.filter((s) => !s.overbooked).length}{" "}
                          available
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedScheduleIds.length > 0 && (
                <div className="text-sm text-red-600 p-3 bg-red-50 rounded-lg">
                  <strong>Warning:</strong> You are about to delete{" "}
                  {selectedScheduleIds.length} schedule(s) with a total of{" "}
                  {schedules
                    .filter((s) => selectedScheduleIds.includes(s.id))
                    .reduce((acc, s) => acc + s.slots.length, 0)}{" "}
                  slots.
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteConfirm}
            disabled={
              isDeleting ||
              (deleteMode === "dateRange"
                ? !fromDate || !toDate
                : selectedScheduleIds.length === 0)
            }
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            {isDeleting
              ? "Deleting..."
              : `Delete ${
                  deleteMode === "dateRange" && fromDate && toDate
                    ? `${getSchedulesInDateRange().length} Schedule(s)`
                    : `${selectedScheduleIds.length} Schedule(s)`
                }`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
