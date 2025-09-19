"use client";

import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchSchedulesByPractitioner,
  transferSlotLocal,
} from "@/store/slices/scheduleSlotsSlice";
import { Calendar, Clock, Users, ArrowRightLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SlotTile } from "./SlotTile";
import TimeShiftPopover from "./TimeShiftPopover";
import SlotTransferModal from "./modals/SlotTransferModal";
import SlotShiftModal from "./modals/SlotShiftModal";
import SlotDayShiftModal from "./modals/SlotDayShiftModal";
import moment from "moment";
import { toast } from "sonner";

// DND Kit imports
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

// Types
import { Schedule, Slot } from "@/types/scheduleSlots.types";
import { ActiveSlotState } from "@/types/appointmentManagement.types";

interface DoctorScheduleViewProps {
  doctorId: string;
  doctorName: string;
  selectedAppointmentId?: string; // Highlight a specific appointment
  onAppointmentTransfer?: (appointmentId: string, newSlotId: string) => void;
  className?: string;
  compactMode?: boolean; // For split screen, show more compact layout
  externalDndContext?: boolean; // When true, don't create own DndContext
}

interface TransferData {
  sourceSlot: Slot;
  targetSlot: Slot;
  sourceSchedule: Schedule;
  targetSchedule: Schedule;
  appointmentId?: string;
  targetSlotId: string;
}

export default function DoctorScheduleView({
  doctorId,
  doctorName,
  selectedAppointmentId,
  onAppointmentTransfer,
  className = "",
  compactMode = false,
  externalDndContext = false,
}: DoctorScheduleViewProps) {
  const dispatch = useAppDispatch();

  // Local state for this doctor's schedules
  const [doctorSchedules, setDoctorSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSlot, setActiveSlot] = useState<ActiveSlotState | null>(null);

  // Modal state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferData, setTransferData] = useState<TransferData | null>(null);

  // Shift slots state
  const [shiftPopoverOpen, setShiftPopoverOpen] = useState<{
    [key: string]: boolean;
  }>({});
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [selectedShiftData, setSelectedShiftData] = useState<{
    schedules: Schedule[];
    delayMinutes: number;
    date: string;
    doctorName?: string;
  } | null>(null);

  // Day shift state
  const [dayShiftModalOpen, setDayShiftModalOpen] = useState(false);
  const [selectedDayShiftData, setSelectedDayShiftData] = useState<{
    schedules: Schedule[];
    shiftDays: number;
    date: string;
    doctorName?: string;
  } | null>(null);

  // DND Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch schedules for this doctor
  useEffect(() => {
    const fetchDoctorSchedules = async () => {
      if (!doctorId) return;

      setIsLoading(true);
      try {
        const result = await dispatch(fetchSchedulesByPractitioner(doctorId));
        if (
          result.type === "scheduleSlots/fetchSchedulesByPractitioner/fulfilled"
        ) {
          setDoctorSchedules(result.payload);
        } else {
          setDoctorSchedules([]);
        }
      } catch (error) {
        console.error(
          `Failed to fetch schedules for doctor ${doctorId}:`,
          error
        );
        setDoctorSchedules([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctorSchedules();
  }, [doctorId, dispatch]);

  // Group schedules by date
  const groupSchedulesByDate = () => {
    const groupedSchedules: { [date: string]: Schedule[] } = {};

    doctorSchedules.forEach((schedule) => {
      const date = moment(schedule.planning_start).format("YYYY-MM-DD");
      if (!groupedSchedules[date]) {
        groupedSchedules[date] = [];
      }
      groupedSchedules[date].push(schedule);
    });

    return groupedSchedules;
  };

  // Format functions
  const formatTime = (dateString: string) => {
    return moment(dateString).format("HH:mm");
  };

  const formatDate = (dateString: string) => {
    return moment(dateString).format("MMM DD, YYYY");
  };

  const formatDayName = (dateString: string) => {
    return moment(dateString).format("dddd");
  };

  // Get statistics
  const getTotalOverbookedSlots = () => {
    return doctorSchedules.reduce((total, schedule) => {
      return total + schedule.slots.filter((slot) => slot.overbooked).length;
    }, 0);
  };

  const getTotalAvailableSlots = () => {
    return doctorSchedules.reduce((total, schedule) => {
      return total + schedule.slots.filter((slot) => !slot.overbooked).length;
    }, 0);
  };

  // DND handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const idParts = active.id.toString().split(":");
    const [scheduleId, slotId] = idParts;

    const schedule = doctorSchedules.find((s) => s.id === scheduleId);
    const slot = schedule?.slots.find((s) => s.id === slotId);

    if (slot && slot.overbooked) {
      setActiveSlot({
        slot,
        scheduleId: scheduleId!,
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !activeSlot) {
      setActiveSlot(null);
      return;
    }

    const activeIdParts = active.id.toString().split(":");
    const overIdParts = over.id.toString().split(":");

    const [sourceScheduleId, sourceSlotId] = activeIdParts;
    const [targetScheduleId, targetSlotId] = overIdParts;

    // Same slot - no transfer needed
    if (
      sourceScheduleId === targetScheduleId &&
      sourceSlotId === targetSlotId
    ) {
      setActiveSlot(null);
      return;
    }

    // Find source and target slots
    const sourceSchedule = doctorSchedules.find(
      (s) => s.id === sourceScheduleId
    );
    const targetSchedule = doctorSchedules.find(
      (s) => s.id === targetScheduleId
    );
    const sourceSlot = sourceSchedule?.slots.find((s) => s.id === sourceSlotId);
    const targetSlot = targetSchedule?.slots.find((s) => s.id === targetSlotId);

    if (!targetSlot || targetSlot.overbooked) {
      toast.error("Cannot drop on an occupied slot");
      setActiveSlot(null);
      return;
    }

    if (!sourceSlot || !sourceSchedule || !targetSchedule) {
      toast.error("Invalid slot data");
      setActiveSlot(null);
      return;
    }

    // Extract appointment ID
    let appointmentId = sourceSlot.id;
    if (sourceSlot.appointments && sourceSlot.appointments.length > 0) {
      appointmentId = sourceSlot.appointments[0].id;
    } else if (sourceSlot.comment) {
      const idMatches = sourceSlot.comment.match(
        /(appointment\s*id|app\s*id|id):\s*([a-zA-Z0-9-_]+)/i
      );
      if (idMatches && idMatches[2]) {
        appointmentId = idMatches[2];
      } else {
        const uuidMatch = sourceSlot.comment.match(
          /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i
        );
        if (uuidMatch) {
          appointmentId = uuidMatch[1];
        }
      }
    }

    // Prepare transfer data for modal
    setTransferData({
      sourceSlot,
      targetSlot,
      sourceSchedule,
      targetSchedule,
      appointmentId,
      targetSlotId: targetSlotId!,
    });

    setIsTransferModalOpen(true);
    setActiveSlot(null);
  };

  // Handle modal confirmation
  const handleTransferConfirm = () => {
    if (!transferData) return;

    const {
      sourceSlot,
      targetSlot,
      sourceSchedule,
      targetSchedule,
      appointmentId,
    } = transferData;

    // Dispatch the transfer action
    dispatch(
      transferSlotLocal({
        sourceScheduleId: sourceSchedule.id,
        sourceSlotId: sourceSlot.id,
        targetScheduleId: targetSchedule.id,
        targetSlotId: targetSlot.id,
      })
    );

    // Call the callback if provided
    if (onAppointmentTransfer && appointmentId) {
      onAppointmentTransfer(appointmentId, targetSlot.id);
    }
  };

  // Handle modal close
  const handleTransferModalClose = () => {
    setIsTransferModalOpen(false);
    setTransferData(null);
  };

  // Refresh data
  const handleRefreshData = async () => {
    try {
      const result = await dispatch(fetchSchedulesByPractitioner(doctorId));
      if (
        result.type === "scheduleSlots/fetchSchedulesByPractitioner/fulfilled"
      ) {
        setDoctorSchedules(result.payload);
      }
    } catch (error) {
      console.error("Error refreshing doctor schedules:", error);
    }
  };

  // Shift slots handlers
  const handleTimeSelection = (
    dateSchedules: Schedule[],
    date: string,
    delayMinutes: number
  ) => {
    setShiftPopoverOpen({});

    if (!dateSchedules.length) {
      toast.error("No schedules found for this date");
      return;
    }

    setSelectedShiftData({
      schedules: dateSchedules,
      delayMinutes,
      date,
      doctorName,
    });
    setShiftModalOpen(true);
  };

  const handleCancelShift = () => {
    setShiftModalOpen(false);
    setSelectedShiftData(null);
  };

  // Day shift handlers
  const handleDaySelection = (
    dateSchedules: Schedule[],
    date: string,
    shiftDays: number
  ) => {
    setShiftPopoverOpen({});

    if (!dateSchedules.length) {
      toast.error("No schedules found for this date");
      return;
    }

    setSelectedDayShiftData({
      schedules: dateSchedules,
      shiftDays,
      date,
      doctorName,
    });
    setDayShiftModalOpen(true);
  };

  const handleCancelDayShift = () => {
    setDayShiftModalOpen(false);
    setSelectedDayShiftData(null);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-muted-foreground">
          Loading {doctorName}'s schedule...
        </div>
      </div>
    );
  }

  const groupedSchedules = groupSchedulesByDate();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Doctor Header */}
      <Card>
        <CardHeader className={compactMode ? "pb-3" : ""}>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>{doctorName}'s Schedule</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Badge variant="outline" className="bg-red-50">
                <span className="text-red-600 font-medium">
                  Occupied: {getTotalOverbookedSlots()}
                </span>
              </Badge>
              <Badge variant="outline" className="bg-green-50">
                <span className="text-green-600 font-medium">
                  Available: {getTotalAvailableSlots()}
                </span>
              </Badge>
            </div>
          </CardTitle>
          {!compactMode && (
            <p className="text-sm text-muted-foreground">
              Drag occupied slots to available slots to transfer appointments
            </p>
          )}
        </CardHeader>
      </Card>

      {/* Schedule Content */}
      {Object.keys(groupedSchedules).length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No appointments found for {doctorName}
            </p>
          </div>
        </div>
      ) : (
        <>
          {externalDndContext ? (
            // When using external DndContext, just render the schedules
            <div className="w-full overflow-x-auto">
              <div
                className="flex gap-4"
                style={{
                  width: `${
                    Object.keys(groupedSchedules).length *
                    (compactMode ? 260 : 300)
                  }px`,
                  minWidth: "100%",
                }}
              >
                {Object.entries(groupedSchedules).map(
                  ([date, dateSchedules]) => (
                    <div
                      key={date}
                      className={`${
                        compactMode ? "w-[240px]" : "w-[280px]"
                      } flex-shrink-0`}
                    >
                      {/* Day Column Header */}
                      <div className="mb-3">
                        <div className="p-3 flex justify-between items-start">
                          <div>
                            <h3
                              className={`${
                                compactMode ? "text-base" : "text-lg"
                              } font-semibold flex items-center gap-2 text-blue-900`}
                            >
                              <Calendar className="w-4 h-4" />
                              {formatDayName(date)}
                            </h3>
                            <p
                              className={`${
                                compactMode ? "text-xs" : "text-sm"
                              } text-blue-700 mb-2 font-medium`}
                            >
                              {formatDate(date)}
                            </p>
                          </div>

                          <div className="flex items-start gap-2">
                            {/* Day Summary */}
                            <div
                              className={`flex items-center flex-col justify-between ${
                                compactMode ? "text-xs" : "text-xs"
                              } bg-white rounded p-2`}
                            >
                              <span className="flex items-center gap-1 text-red-600 font-medium">
                                <Users className="w-3 h-3" />
                                {dateSchedules.reduce(
                                  (total, schedule) =>
                                    total +
                                    schedule.slots.filter((s) => s.overbooked)
                                      .length,
                                  0
                                )}
                              </span>
                              <span className="flex items-center gap-1 text-green-600 font-medium">
                                <Clock className="w-3 h-3" />
                                {dateSchedules.reduce(
                                  (total, schedule) =>
                                    total +
                                    schedule.slots.filter((s) => !s.overbooked)
                                      .length,
                                  0
                                )}
                              </span>
                            </div>

                            {/* Options Button */}
                            {dateSchedules.length > 0 && !compactMode && (
                              <TimeShiftPopover
                                isOpen={
                                  shiftPopoverOpen[`schedule-${date}`] || false
                                }
                                onOpenChange={(open) => {
                                  setShiftPopoverOpen((prev) => ({
                                    ...prev,
                                    [`schedule-${date}`]: open,
                                  }));
                                }}
                                onTimeSelect={(delayMinutes) => {
                                  if (dateSchedules.length > 0) {
                                    handleTimeSelection(
                                      dateSchedules,
                                      date,
                                      delayMinutes
                                    );
                                  }
                                }}
                                onDaySelect={(shiftDays) => {
                                  if (dateSchedules.length > 0) {
                                    handleDaySelection(
                                      dateSchedules,
                                      date,
                                      shiftDays
                                    );
                                  }
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Slots Column */}
                      <div className="bg-gray-50 rounded-lg border p-3">
                        <div className="space-y-2 pb-4">
                          {dateSchedules.map((schedule) => (
                            <div key={schedule.id} className="space-y-2">
                              {/* Slots for this schedule */}
                              <div className="space-y-2">
                                {schedule.slots.map((slot) => (
                                  <div
                                    key={slot.id}
                                    className={
                                      selectedAppointmentId &&
                                      (slot.appointments?.some(
                                        (apt) =>
                                          apt.id === selectedAppointmentId
                                      ) ||
                                        slot.comment?.includes(
                                          selectedAppointmentId
                                        ))
                                        ? "ring-2 ring-blue-500 rounded-lg"
                                        : ""
                                    }
                                  >
                                    <SlotTile
                                      slot={slot}
                                      scheduleId={schedule.id}
                                      doctorId={doctorId}
                                      scheduleDate={schedule.planning_start}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}

                          {/* Empty state for when no slots */}
                          {dateSchedules.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No appointments</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          ) : (
            // When not using external DndContext, create our own
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="w-full overflow-x-auto">
                <div
                  className="flex gap-4"
                  style={{
                    width: `${
                      Object.keys(groupedSchedules).length *
                      (compactMode ? 260 : 300)
                    }px`,
                    minWidth: "100%",
                  }}
                >
                  {Object.entries(groupedSchedules).map(
                    ([date, dateSchedules]) => (
                      <div
                        key={date}
                        className={`${
                          compactMode ? "w-[240px]" : "w-[280px]"
                        } flex-shrink-0`}
                      >
                        {/* Day Column Header */}
                        <div className="mb-3">
                          <div className="p-3 flex justify-between items-start">
                            <div>
                              <h3
                                className={`${
                                  compactMode ? "text-base" : "text-lg"
                                } font-semibold flex items-center gap-2 text-blue-900`}
                              >
                                <Calendar className="w-4 h-4" />
                                {formatDayName(date)}
                              </h3>
                              <p
                                className={`${
                                  compactMode ? "text-xs" : "text-sm"
                                } text-blue-700 mb-2 font-medium`}
                              >
                                {formatDate(date)}
                              </p>
                            </div>

                            <div className="flex items-start gap-2">
                              {/* Day Summary */}
                              <div
                                className={`flex items-center flex-col justify-between ${
                                  compactMode ? "text-xs" : "text-xs"
                                } bg-white rounded p-2`}
                              >
                                <span className="flex items-center gap-1 text-red-600 font-medium">
                                  <Users className="w-3 h-3" />
                                  {dateSchedules.reduce(
                                    (total, schedule) =>
                                      total +
                                      schedule.slots.filter((s) => s.overbooked)
                                        .length,
                                    0
                                  )}
                                </span>
                                <span className="flex items-center gap-1 text-green-600 font-medium">
                                  <Clock className="w-3 h-3" />
                                  {dateSchedules.reduce(
                                    (total, schedule) =>
                                      total +
                                      schedule.slots.filter(
                                        (s) => !s.overbooked
                                      ).length,
                                    0
                                  )}
                                </span>
                              </div>

                              {/* Options Button */}
                              {dateSchedules.length > 0 && !compactMode && (
                                <TimeShiftPopover
                                  isOpen={
                                    shiftPopoverOpen[`schedule-${date}`] ||
                                    false
                                  }
                                  onOpenChange={(open) => {
                                    setShiftPopoverOpen((prev) => ({
                                      ...prev,
                                      [`schedule-${date}`]: open,
                                    }));
                                  }}
                                  onTimeSelect={(delayMinutes) => {
                                    if (dateSchedules.length > 0) {
                                      handleTimeSelection(
                                        dateSchedules,
                                        date,
                                        delayMinutes
                                      );
                                    }
                                  }}
                                  onDaySelect={(shiftDays) => {
                                    if (dateSchedules.length > 0) {
                                      handleDaySelection(
                                        dateSchedules,
                                        date,
                                        shiftDays
                                      );
                                    }
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Slots Column */}
                        <div className="bg-gray-50 rounded-lg border p-3">
                          <div className="space-y-2 pb-4">
                            {dateSchedules.map((schedule) => (
                              <div key={schedule.id} className="space-y-2">
                                {/* Slots for this schedule */}
                                <div className="space-y-2">
                                  {schedule.slots.map((slot) => (
                                    <div
                                      key={slot.id}
                                      className={
                                        selectedAppointmentId &&
                                        (slot.appointments?.some(
                                          (apt) =>
                                            apt.id === selectedAppointmentId
                                        ) ||
                                          slot.comment?.includes(
                                            selectedAppointmentId
                                          ))
                                          ? "ring-2 ring-blue-500 rounded-lg"
                                          : ""
                                      }
                                    >
                                      <SlotTile
                                        slot={slot}
                                        scheduleId={schedule.id}
                                        doctorId={doctorId}
                                        scheduleDate={schedule.planning_start}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}

                            {/* Empty state for when no slots */}
                            {dateSchedules.length === 0 && (
                              <div className="text-center py-8 text-muted-foreground">
                                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No appointments</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Drag Overlay - only when using internal DndContext */}
              <DragOverlay>
                {activeSlot ? (
                  <div className="p-3 rounded-lg border-2 bg-red-100 border-red-300 text-red-800 shadow-lg min-h-[80px] flex flex-col justify-between rotate-3 scale-105">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">
                          {formatTime(activeSlot.slot.start)} -{" "}
                          {formatTime(activeSlot.slot.end)}
                        </span>
                        <span className="text-xs opacity-75 font-medium">
                          Moving...
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ArrowRightLeft className="w-4 h-4" />
                      </div>
                    </div>
                    {activeSlot.slot.comment && (
                      <p className="text-xs mt-1 opacity-75 truncate border-t pt-1">
                        {activeSlot.slot.comment}
                      </p>
                    )}
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </>
      )}

      {/* Slot Transfer Confirmation Modal */}
      <SlotTransferModal
        isOpen={isTransferModalOpen}
        onClose={handleTransferModalClose}
        transferData={transferData}
        onConfirm={handleTransferConfirm}
        onRefreshData={handleRefreshData}
      />

      {/* Slot Shift Confirmation Modal */}
      <SlotShiftModal
        isOpen={shiftModalOpen}
        onClose={handleCancelShift}
        shiftData={selectedShiftData}
        onRefreshData={handleRefreshData}
      />

      {/* Slot Day Shift Confirmation Modal */}
      <SlotDayShiftModal
        isOpen={dayShiftModalOpen}
        onClose={handleCancelDayShift}
        shiftData={selectedDayShiftData}
        onRefreshData={handleRefreshData}
      />
    </div>
  );
}
