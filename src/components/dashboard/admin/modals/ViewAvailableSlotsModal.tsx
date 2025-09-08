"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock } from "lucide-react";
import { getAllSchedules } from "@/services/availabilityTemplate.api";
import { toast } from "sonner";

interface Slot {
  id: string;
  schedule_id: string;
  status: string;
  start: string;
  end: string;
  overbooked: boolean;
  comment: string;
  created_at: string;
  updated_at: string;
}

interface Schedule {
  planning_start: string;
  planning_end: string;
  comment: string;
  practitioner_id: string | null;
  specialty_id: string | null;
  id: string;
  created_at: string;
  updated_at: string;
  slots: Slot[];
  flag: string | null;
}

interface ViewAvailableSlotsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctorId: string;
  doctorName: string;
}

export default function ViewAvailableSlotsModal({
  open,
  onOpenChange,
  doctorId,
  doctorName,
}: ViewAvailableSlotsModalProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await getAllSchedules();
      console.log("API Response:", response); // Debug log

      // Handle the response - it might be an array directly or have a data property
      const schedulesData = Array.isArray(response)
        ? response
        : response.data || response.results || [];

      // Get only the last 5 schedules and reverse them to show most recent first
      const lastFiveSchedules = schedulesData.slice(-5).reverse();
      setSchedules(lastFiveSchedules);
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
      toast.error("Failed to load available slots");

      // Set dummy data for testing purposes
      const dummySchedules: Schedule[] = [
        {
          planning_start: "2025-09-06T09:00:00",
          planning_end: "2025-09-06T17:00:00",
          comment: "Schedule for September 6, 2025",
          practitioner_id: null,
          specialty_id: null,
          id: "dummy-1",
          created_at: "2025-09-06T00:00:00Z",
          updated_at: "2025-09-06T00:00:00Z",
          slots: [
            {
              id: "slot-1",
              schedule_id: "dummy-1",
              status: "free",
              start: "2025-09-06T09:00:00",
              end: "2025-09-06T09:30:00",
              overbooked: false,
              comment: "Morning slot 1",
              created_at: "2025-09-06T00:00:00Z",
              updated_at: "2025-09-06T00:00:00Z",
            },
            {
              id: "slot-2",
              schedule_id: "dummy-1",
              status: "free",
              start: "2025-09-06T09:30:00",
              end: "2025-09-06T10:00:00",
              overbooked: true,
              comment: "Morning slot 2 - Overbooked",
              created_at: "2025-09-06T00:00:00Z",
              updated_at: "2025-09-06T00:00:00Z",
            },
            {
              id: "slot-3",
              schedule_id: "dummy-1",
              status: "free",
              start: "2025-09-06T10:00:00",
              end: "2025-09-06T10:30:00",
              overbooked: false,
              comment: "Morning slot 3",
              created_at: "2025-09-06T00:00:00Z",
              updated_at: "2025-09-06T00:00:00Z",
            },
          ],
          flag: null,
        },
      ];
      setSchedules(dummySchedules);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchSchedules();
    }
  }, [open]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const calculateTotalHours = (start: string, end: string) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diffInMs = endTime.getTime() - startTime.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    return diffInHours.toFixed(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Available Slots - {doctorName}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading schedules...</div>
            </div>
          ) : schedules.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">
                No schedules available
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="border rounded-lg p-4 bg-card"
                >
                  {/* Schedule Header */}
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        {formatDate(schedule.planning_start)}
                      </h3>
                      <Badge variant="outline">
                        {calculateTotalHours(
                          schedule.planning_start,
                          schedule.planning_end
                        )}{" "}
                        hours
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>
                        {formatTime(schedule.planning_start)} -{" "}
                        {formatTime(schedule.planning_end)}
                      </span>
                    </div>
                    {schedule.comment && (
                      <p className="text-sm text-muted-foreground">
                        {schedule.comment}
                      </p>
                    )}
                  </div>

                  {/* Slots Grid */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">
                        Available Time Slots
                      </h4>
                      <div className="flex gap-2 text-xs">
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                          {
                            schedule.slots.filter((slot) => !slot.overbooked)
                              .length
                          }{" "}
                          Available
                        </span>
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded">
                          {
                            schedule.slots.filter((slot) => slot.overbooked)
                              .length
                          }{" "}
                          Overbooked
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {schedule.slots
                        .sort(
                          (a, b) =>
                            new Date(a.start).getTime() -
                            new Date(b.start).getTime()
                        )
                        .map((slot) => (
                          <div
                            key={slot.id}
                            className={`p-3 rounded-lg border text-center text-sm transition-all duration-200 cursor-pointer ${
                              slot.overbooked
                                ? "bg-gray-100 text-gray-500 border-gray-300 opacity-60 cursor-not-allowed"
                                : slot.status === "free"
                                ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:shadow-sm"
                                : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:shadow-sm"
                            }`}
                          >
                            <div className="font-semibold">
                              {formatTime(slot.start)}
                            </div>
                            <div className="text-xs opacity-80">
                              to {formatTime(slot.end)}
                            </div>
                            <div className="mt-1">
                              {slot.overbooked ? (
                                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                                  Overbooked
                                </span>
                              ) : (
                                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                                  Available
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                    {schedule.slots.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        No slots available for this date
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
