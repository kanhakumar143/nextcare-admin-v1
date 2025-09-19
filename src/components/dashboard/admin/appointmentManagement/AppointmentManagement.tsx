"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toast } from "sonner";
import moment from "moment";

// DND Kit imports
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
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

// Redux actions
import {
  fetchDoctors,
  fetchSchedulesByPractitioner,
  setSelectedPractitionerId,
  setAllPractitioner,
  clearError,
  transferSlotLocal,
} from "@/store/slices/scheduleSlotsSlice";

// API functions
import { getPractitionerByRole } from "@/services/admin.api";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// Icons
import {
  Calendar,
  CalendarDays,
  Clock,
  User,
  Users,
  ArrowRightLeft,
} from "lucide-react";

// Types
import { Schedule, Slot } from "@/types/scheduleSlots.types";

// Component imports
import { SlotTile } from "./SlotTile";
import SlotTransferModal from "./modals/SlotTransferModal";
import SlotShiftModal from "./modals/SlotShiftModal";
import SlotDayShiftModal from "./modals/SlotDayShiftModal";
import TimeShiftPopover from "./TimeShiftPopover";
import SearchPatient from "./SearchPatient";
import {
  ActiveSlotState,
  PractitionerData,
} from "@/types/appointmentManagement.types";

export default function AppointmentManagement() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // User type filter state
  const [selectedUserType, setSelectedUserType] = useState<
    "doctor" | "lab_technician"
  >("doctor");
  const [localPractitioners, setLocalPractitioners] = useState<
    PractitionerData[]
  >([]);

  // Multi-doctor view state
  const [isMultiDoctorView, setIsMultiDoctorView] = useState(false);
  const [selectedDoctorsForComparison, setSelectedDoctorsForComparison] =
    useState<string[]>([]);
  const [multiDoctorSchedules, setMultiDoctorSchedules] = useState<{
    [doctorId: string]: Schedule[];
  }>({});

  // View mode state
  const [viewMode, setViewMode] = useState<"single" | "multi" | "patient">(
    "single"
  );

  // Drag and drop state
  const [activeSlot, setActiveSlot] = useState<ActiveSlotState | null>(null);

  // Modal state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferData, setTransferData] = useState<{
    sourceSlot: Slot;
    targetSlot: Slot;
    sourceSchedule: Schedule;
    targetSchedule: Schedule;
    sourceDoctorName?: string;
    targetDoctorName?: string;
    appointmentId?: string;
    targetSlotId: string;
  } | null>(null);

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

  // DND Kit sensors with touch and keyboard support
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

  // Redux state
  const {
    schedules,
    doctors,
    selectedPractitionerId,
    isLoadingSchedules,
    error,
    doctorsError,
  } = useAppSelector((state) => state.scheduleSlots);

  // Fetch schedules for multiple doctors in comparison view
  const fetchMultiDoctorSchedules = async (doctorIds: string[]) => {
    const schedulesMap: { [doctorId: string]: Schedule[] } = {};

    for (const doctorId of doctorIds) {
      try {
        const result = await dispatch(fetchSchedulesByPractitioner(doctorId));
        if (
          result.type === "scheduleSlots/fetchSchedulesByPractitioner/fulfilled"
        ) {
          schedulesMap[doctorId] = result.payload;
        } else {
          schedulesMap[doctorId] = [];
        }
      } catch (error) {
        console.error(
          `Failed to fetch schedules for doctor ${doctorId}:`,
          error
        );
        schedulesMap[doctorId] = [];
      }
    }

    setMultiDoctorSchedules(schedulesMap);
  };

  useEffect(() => {
    // Fetch doctors on component mount
    dispatch(fetchDoctors());
  }, [dispatch]);

  // Fetch practitioners by role when user type changes
  const fetchPractitionersByRole = async (
    role: "doctor" | "lab_technician"
  ) => {
    try {
      const response = await getPractitionerByRole(role);
      const data = (response?.data || response || []).map(
        (practitioner: any) => ({
          ...practitioner,
          name: practitioner.user?.name ?? "",
        })
      ) as PractitionerData[];
      setLocalPractitioners(data);

      // Auto-select first practitioner when data is loaded
      if (data.length > 0) {
        dispatch(setSelectedPractitionerId(data[0].id));
        // Transform data to match ExtendedDoctorData structure for doctors
        const doctorData = data.map((practitioner) => ({
          ...practitioner,
          name: practitioner.name,
        })) as any[];
        dispatch(setAllPractitioner(doctorData));
      } else {
        dispatch(setSelectedPractitionerId(""));
      }
    } catch (error) {
      console.error("Failed to fetch practitioners:", error);
      setLocalPractitioners([]);
      toast.error(
        `Failed to fetch ${role === "doctor" ? "doctors" : "lab technicians"}.`
      );
    }
  };

  useEffect(() => {
    // Fetch practitioners when user type changes
    fetchPractitionersByRole(selectedUserType);
  }, [selectedUserType]);

  useEffect(() => {
    // Auto-select first doctor when doctors are loaded
    if (
      selectedUserType === "doctor" &&
      doctors.length > 0 &&
      !selectedPractitionerId
    ) {
      dispatch(setSelectedPractitionerId(doctors[0].id));
    }
  }, [doctors, selectedPractitionerId, dispatch, selectedUserType]);

  useEffect(() => {
    // Fetch schedules when practitioner is selected
    if (selectedPractitionerId) {
      dispatch(fetchSchedulesByPractitioner(selectedPractitionerId));
    }
  }, [selectedPractitionerId, dispatch]);

  useEffect(() => {
    // Fetch schedules for multiple doctors when in comparison view
    if (viewMode === "multi" && selectedDoctorsForComparison.length > 0) {
      fetchMultiDoctorSchedules(selectedDoctorsForComparison);
    }
  }, [viewMode, selectedDoctorsForComparison]);

  useEffect(() => {
    if (error) {
      toast.warning("No schedules found for the selected practitioner.");
      dispatch(clearError());
    }
    if (doctorsError) {
      toast.error("Failed to fetch practitioners.");
      dispatch(clearError());
    }
  }, [error, doctorsError, dispatch]);

  const handlePractitionerSelect = (value: string) => {
    dispatch(setSelectedPractitionerId(value));
  };

  const handleUserTypeChange = (userType: "doctor" | "lab_technician") => {
    setSelectedUserType(userType);
    // Clear current selection when switching user types
    dispatch(setSelectedPractitionerId(""));
    // Reset view mode to single when switching user types
    setViewMode("single");
    setIsMultiDoctorView(false);
    setSelectedDoctorsForComparison([]);
    setMultiDoctorSchedules({});
  };

  const handleMultiDoctorToggle = () => {
    const newMultiState = !isMultiDoctorView;
    setIsMultiDoctorView(newMultiState);
    setViewMode(newMultiState ? "multi" : "single");

    if (!newMultiState) {
      // When disabling multi-doctor view, clear the comparison data
      setSelectedDoctorsForComparison([]);
      setMultiDoctorSchedules({});
    } else {
      // When enabling multi-doctor view, select first 2 doctors by default
      const availableDoctors = getCurrentPractitioners();
      const defaultSelection = availableDoctors
        .slice(0, Math.min(2, availableDoctors.length))
        .map((d) => d.id);
      setSelectedDoctorsForComparison(defaultSelection);
    }
  };

  const handleViewModeChange = (mode: "single" | "multi" | "patient") => {
    setViewMode(mode);

    if (mode === "multi") {
      setIsMultiDoctorView(true);
      // When enabling multi-doctor view, select first 2 doctors by default
      const availableDoctors = getCurrentPractitioners();
      const defaultSelection = availableDoctors
        .slice(0, Math.min(2, availableDoctors.length))
        .map((d) => d.id);
      setSelectedDoctorsForComparison(defaultSelection);
    } else {
      setIsMultiDoctorView(false);
      setSelectedDoctorsForComparison([]);
      setMultiDoctorSchedules({});
    }
  };

  const handleDoctorSelectionForComparison = (
    doctorId: string,
    isSelected: boolean
  ) => {
    if (isSelected) {
      setSelectedDoctorsForComparison((prev) => [...prev, doctorId]);
    } else {
      setSelectedDoctorsForComparison((prev) =>
        prev.filter((id) => id !== doctorId)
      );
    }
  };

  // Get current practitioners list based on selected user type
  const getCurrentPractitioners = (): PractitionerData[] => {
    if (selectedUserType === "doctor") {
      return doctors.map((doctor) => ({
        id: doctor.id,
        name: doctor.name,
        practitioner_display_id: doctor.practitioner_display_id,
        user: doctor.user,
      }));
    } else {
      return localPractitioners;
    }
  };

  // Group schedules by date for calendar view
  const groupSchedulesByDate = () => {
    const groupedSchedules: { [date: string]: Schedule[] } = {};

    schedules.forEach((schedule) => {
      const date = moment(schedule.planning_start).format("YYYY-MM-DD");
      if (!groupedSchedules[date]) {
        groupedSchedules[date] = [];
      }
      groupedSchedules[date].push(schedule);
    });

    return groupedSchedules;
  };

  // Group schedules by date for multi-doctor view
  const groupMultiDoctorSchedulesByDate = () => {
    const groupedByDoctorAndDate: {
      [doctorId: string]: {
        doctorName: string;
        schedulesByDate: { [date: string]: Schedule[] };
      };
    } = {};

    selectedDoctorsForComparison.forEach((doctorId) => {
      const doctorSchedules = multiDoctorSchedules[doctorId] || [];
      const doctorName =
        getCurrentPractitioners().find((d) => d.id === doctorId)?.name ||
        `Doctor ${doctorId}`;

      const schedulesByDate: { [date: string]: Schedule[] } = {};
      doctorSchedules.forEach((schedule) => {
        const date = moment(schedule.planning_start).format("YYYY-MM-DD");
        if (!schedulesByDate[date]) {
          schedulesByDate[date] = [];
        }
        schedulesByDate[date].push(schedule);
      });

      groupedByDoctorAndDate[doctorId] = {
        doctorName,
        schedulesByDate,
      };
    });

    return groupedByDoctorAndDate;
  };

  // Get statistics
  const getTotalOverbookedSlots = () => {
    return schedules.reduce((total, schedule) => {
      return total + schedule.slots.filter((slot) => slot.overbooked).length;
    }, 0);
  };

  const getTotalAvailableSlots = () => {
    return schedules.reduce((total, schedule) => {
      return total + schedule.slots.filter((slot) => !slot.overbooked).length;
    }, 0);
  };

  const formatTime = (dateString: string) => {
    return moment(dateString).format("HH:mm");
  };

  const formatDate = (dateString: string) => {
    return moment(dateString).format("MMM DD, YYYY");
  };

  const formatDayName = (dateString: string) => {
    return moment(dateString).format("dddd");
  };

  // DND Kit event handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const idParts = active.id.toString().split(":");

    let scheduleId, slotId, doctorId;

    if (isMultiDoctorView) {
      // Format: doctorId:scheduleId:slotId
      [doctorId, scheduleId, slotId] = idParts;
    } else {
      // Format: scheduleId:slotId
      [scheduleId, slotId] = idParts;
    }

    let schedule, slot;

    if (isMultiDoctorView && doctorId) {
      const doctorSchedules = multiDoctorSchedules[doctorId] || [];
      schedule = doctorSchedules.find((s) => s.id === scheduleId);
    } else {
      schedule = schedules.find((s) => s.id === scheduleId);
    }

    slot = schedule?.slots.find((s) => s.id === slotId);

    if (slot && slot.overbooked) {
      setActiveSlot({
        slot,
        scheduleId: scheduleId!,
        doctorId: isMultiDoctorView ? doctorId : undefined,
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

    let sourceScheduleId, sourceSlotId, sourceDoctorId;
    let targetScheduleId, targetSlotId, targetDoctorId;

    if (isMultiDoctorView) {
      // Format: doctorId:scheduleId:slotId
      [sourceDoctorId, sourceScheduleId, sourceSlotId] = activeIdParts;
      [targetDoctorId, targetScheduleId, targetSlotId] = overIdParts;
    } else {
      // Format: scheduleId:slotId
      [sourceScheduleId, sourceSlotId] = activeIdParts;
      [targetScheduleId, targetSlotId] = overIdParts;
    }

    // Same slot - no transfer needed
    if (
      sourceScheduleId === targetScheduleId &&
      sourceSlotId === targetSlotId &&
      sourceDoctorId === targetDoctorId
    ) {
      setActiveSlot(null);
      return;
    }

    // Find source and target slots
    let sourceSchedule, sourceSlot, targetSchedule, targetSlot;

    if (isMultiDoctorView) {
      const sourceDoctorSchedules = multiDoctorSchedules[sourceDoctorId!] || [];
      const targetDoctorSchedules = multiDoctorSchedules[targetDoctorId!] || [];
      sourceSchedule = sourceDoctorSchedules.find(
        (s) => s.id === sourceScheduleId
      );
      targetSchedule = targetDoctorSchedules.find(
        (s) => s.id === targetScheduleId
      );
    } else {
      sourceSchedule = schedules.find((s) => s.id === sourceScheduleId);
      targetSchedule = schedules.find((s) => s.id === targetScheduleId);
    }

    sourceSlot = sourceSchedule?.slots.find((s) => s.id === sourceSlotId);
    targetSlot = targetSchedule?.slots.find((s) => s.id === targetSlotId);

    if (!targetSlot || targetSlot.overbooked) {
      toast.error("Cannot drop on an occupied slot");
      setActiveSlot(null);
      return;
    }

    // Ensure we have valid source data
    if (!sourceSlot || !sourceSchedule || !targetSchedule) {
      toast.error("Invalid slot data");
      setActiveSlot(null);
      return;
    }

    // Extract appointment ID from source slot
    // Priority: 1. appointments array, 2. comment pattern matching, 3. slot ID as fallback
    let appointmentId = sourceSlot.id; // fallback to slot ID

    // First try to get from appointments array
    if (sourceSlot.appointments && sourceSlot.appointments.length > 0) {
      appointmentId = sourceSlot.appointments[0].id;
    } else if (sourceSlot.comment) {
      // Look for patterns like "ID: 123", "Appointment ID: 123", "App: 123", etc.
      const idMatches = sourceSlot.comment.match(
        /(appointment\s*id|app\s*id|id):\s*([a-zA-Z0-9-_]+)/i
      );
      if (idMatches && idMatches[2]) {
        appointmentId = idMatches[2];
      } else {
        // Look for UUID pattern in comment
        const uuidMatch = sourceSlot.comment.match(
          /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i
        );
        if (uuidMatch) {
          appointmentId = uuidMatch[1];
        }
      }
    }

    // Console log debugging information
    console.log("Target Slot ID:", targetSlotId);
    console.log("Source Slot Appointments:", sourceSlot?.appointments);
    console.log("Extracted Appointment ID:", appointmentId);

    // Get doctor names for display
    const sourceDoctorName = sourceDoctorId
      ? getCurrentPractitioners().find((d) => d.id === sourceDoctorId)?.name
      : undefined;
    const targetDoctorName = targetDoctorId
      ? getCurrentPractitioners().find((d) => d.id === targetDoctorId)?.name
      : undefined;

    // Prepare transfer data for modal
    setTransferData({
      sourceSlot,
      targetSlot,
      sourceSchedule,
      targetSchedule,
      sourceDoctorName,
      targetDoctorName,
      appointmentId,
      targetSlotId: targetSlotId!,
    });

    // Show the confirmation modal
    setIsTransferModalOpen(true);

    // Reset drag state
    setActiveSlot(null);
  };

  // Handle modal confirmation
  const handleTransferConfirm = () => {
    if (!transferData) return;

    const { sourceSlot, targetSlot, sourceSchedule, targetSchedule } =
      transferData;

    // Dispatch the transfer action
    dispatch(
      transferSlotLocal({
        sourceScheduleId: sourceSchedule.id,
        sourceSlotId: sourceSlot.id,
        targetScheduleId: targetSchedule.id,
        targetSlotId: targetSlot.id,
      })
    );
  };

  // Handle modal close
  const handleTransferModalClose = () => {
    setIsTransferModalOpen(false);
    setTransferData(null);
  };

  // Refresh appointment data after successful transfer
  const handleRefreshAppointmentData = async () => {
    try {
      console.log("Refreshing appointment data...");

      // If in multi-doctor view, refresh schedules for all selected doctors
      if (viewMode === "multi" && selectedDoctorsForComparison.length > 0) {
        console.log("Refreshing multi-doctor schedules...");
        await fetchMultiDoctorSchedules(selectedDoctorsForComparison);
      }

      // If in single-doctor view and a practitioner is selected, refresh their schedules
      if (viewMode === "single" && selectedPractitionerId) {
        console.log("Refreshing single practitioner schedules...");
        dispatch(fetchSchedulesByPractitioner(selectedPractitionerId));
      }

      // Always refresh the practitioners list to ensure we have the latest data (except in patient view)
      if (viewMode !== "patient") {
        console.log("Refreshing practitioners list...");
        if (selectedUserType === "doctor") {
          dispatch(fetchDoctors());
        } else {
          await fetchPractitionersByRole(selectedUserType);
        }
      }

      console.log("Appointment data refresh completed successfully");
    } catch (error) {
      console.error("Error refreshing appointment data:", error);
      toast.error(
        "Failed to refresh appointment data. Please reload the page."
      );
    }
  };

  // Shift slots handlers
  const handleTimeSelection = (
    dateSchedules: Schedule[],
    date: string,
    delayMinutes: number,
    doctorName?: string
  ) => {
    // Close all popovers first
    setShiftPopoverOpen({});

    if (!dateSchedules.length) {
      toast.error("No schedules found for this date");
      return;
    }

    // Set the shift data and open modal immediately
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
    shiftDays: number,
    doctorName?: string
  ) => {
    // Close all popovers first
    setShiftPopoverOpen({});

    if (!dateSchedules.length) {
      toast.error("No schedules found for this date");
      return;
    }

    // Set the day shift data and open modal immediately
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

  return (
    <div className="w-full overflow-hidden">
      <div className="container mx-auto p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Appointment Management</h1>
            <p className="text-muted-foreground">
              Manage patient appointments and slot transfers
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowRightLeft className="w-4 h-4" />
            Drag overbooked slots to empty slots
          </div>
        </div>

        {/* Practitioner Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Select Practitioner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* User Type Selection and View Mode in one line */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-sm font-medium">User Type:</label>
                  <Select
                    value={selectedUserType}
                    onValueChange={handleUserTypeChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select user type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="lab_technician">
                        Lab Technician
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Multi-Doctor View Toggle */}

                {/* Single Doctor Selection moved to same row */}
                {viewMode === "single" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Select{" "}
                      {selectedUserType === "doctor"
                        ? "Doctor"
                        : "Lab Technician"}
                      :
                    </label>
                    <Select
                      value={selectedPractitionerId || ""}
                      onValueChange={handlePractitionerSelect}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={`Select a ${
                            selectedUserType === "doctor"
                              ? "doctor"
                              : "lab technician"
                          }...`}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {getCurrentPractitioners().map((practitioner) => (
                          <SelectItem
                            key={practitioner.id}
                            value={practitioner.id}
                          >
                            <div className="flex gap-3 items-center">
                              <span className="font-medium">
                                {practitioner.name}
                              </span>
                              {practitioner.practitioner_display_id && (
                                <span className="text-xs text-muted-foreground">
                                  ID: {practitioner.practitioner_display_id}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">View Mode:</label>
                  <Select
                    value={viewMode}
                    onValueChange={(value: "single" | "multi" | "patient") =>
                      handleViewModeChange(value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select view mode..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>
                            Single{" "}
                            {selectedUserType === "doctor"
                              ? "Doctor"
                              : "Lab Tech"}
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="multi">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>Compare Multiple</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="patient">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>Single Patient</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Multi-Doctor Selection */}
              {viewMode === "multi" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Select{" "}
                    {selectedUserType === "doctor"
                      ? "Doctors"
                      : "Lab Technicians"}{" "}
                    to Compare:
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 border rounded-lg p-4">
                    {getCurrentPractitioners().map((practitioner) => (
                      <div
                        key={practitioner.id}
                        className="flex items-center space-x-3"
                      >
                        <Checkbox
                          id={`doctor-${practitioner.id}`}
                          checked={selectedDoctorsForComparison.includes(
                            practitioner.id
                          )}
                          onCheckedChange={(checked) =>
                            handleDoctorSelectionForComparison(
                              practitioner.id,
                              checked === true
                            )
                          }
                          className="h-5 w-5"
                        />
                        <label
                          htmlFor={`doctor-${practitioner.id}`}
                          className="text-sm font-medium cursor-pointer select-none"
                        >
                          {practitioner.name}
                        </label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select 2-4{" "}
                    {selectedUserType === "doctor"
                      ? "doctors"
                      : "lab technicians"}{" "}
                    for comparison
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Calendar View */}
        <Card className="max-w-[78vw] flex flex-col">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center gap-2">
              {viewMode === "patient" ? (
                <>
                  <User className="w-5 h-5" />
                  Patient Search & Details
                </>
              ) : (
                <>
                  <CalendarDays className="w-5 h-5" />
                  Appointment Calendar
                  {viewMode === "single" && selectedPractitionerId && (
                    <span className="font-normal text-base text-muted-foreground">
                      -{" "}
                      {
                        getCurrentPractitioners().find(
                          (p) => p.id === selectedPractitionerId
                        )?.name
                      }
                    </span>
                  )}
                  {viewMode === "multi" && (
                    <span className="font-normal text-base text-muted-foreground">
                      - Multi-
                      {selectedUserType === "doctor"
                        ? "Doctor"
                        : "Lab Tech"}{" "}
                      Comparison
                    </span>
                  )}
                </>
              )}
            </CardTitle>
            <div className="space-y-1">
              {viewMode === "patient" ? (
                <p className="text-sm text-muted-foreground">
                  Search for patients and view their appointment history and
                  details.
                </p>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    {viewMode === "multi"
                      ? selectedDoctorsForComparison.length === 2
                        ? "Split-screen view showing two doctors side by side. Drag red (occupied) cards across doctors to transfer appointments between them."
                        : "Multi-doctor view. Drag red (occupied) cards across doctors to transfer appointments between them."
                      : "Each column represents a day. Drag red (occupied) cards to green (available) cards to transfer appointments."}
                    {((viewMode === "single" &&
                      Object.keys(groupSchedulesByDate()).length > 3) ||
                      (viewMode === "multi" &&
                        selectedDoctorsForComparison.length > 2)) &&
                      " Scroll to view all."}
                  </p>
                  {((viewMode === "multi" &&
                    Object.values(multiDoctorSchedules).some((schedules) =>
                      schedules.some((s) =>
                        s.slots.some((slot) => slot.overbooked)
                      )
                    )) ||
                    (viewMode === "single" &&
                      schedules.length > 0 &&
                      getTotalOverbookedSlots() > 0)) && (
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1 text-red-600">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Draggable - Occupied appointments
                      </span>
                      <span className="flex items-center gap-1 text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Drop targets - Available slots
                      </span>
                      {viewMode === "multi" && (
                        <span className="flex items-center gap-1 text-blue-600">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Cross-doctor transfers enabled
                        </span>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0 relative">
            {/* Scroll hint overlay for multiple days */}

            {viewMode === "patient" ? (
              // Patient Search View
              <div className="p-6">
                <SearchPatient />
              </div>
            ) : viewMode === "multi" ? (
              // Multi-Doctor View
              selectedDoctorsForComparison.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Please select{" "}
                      {selectedUserType === "doctor"
                        ? "doctors"
                        : "lab technicians"}{" "}
                      to compare
                    </p>
                  </div>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <div className="w-full">
                    {/* Split Screen Layout for 2 doctors, Grid for more */}
                    <div
                      className={`p-6 ${
                        selectedDoctorsForComparison.length === 2
                          ? "grid grid-cols-2 gap-6"
                          : "space-y-6"
                      }`}
                    >
                      {Object.entries(groupMultiDoctorSchedulesByDate()).map(
                        ([doctorId, doctorData]) => (
                          <div
                            key={doctorId}
                            className="border rounded-lg p-4 bg-white shadow-sm"
                          >
                            {/* Doctor Header */}
                            <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  Dr. {doctorData.doctorName}
                                </h3>
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-red-600 font-medium">
                                  Occupied:{" "}
                                  {Object.values(
                                    doctorData.schedulesByDate
                                  ).reduce(
                                    (total, daySchedules) =>
                                      total +
                                      daySchedules.reduce(
                                        (dayTotal, schedule) =>
                                          dayTotal +
                                          schedule.slots.filter(
                                            (s) => s.overbooked
                                          ).length,
                                        0
                                      ),
                                    0
                                  )}
                                </span>
                                <span className="text-green-600 font-medium">
                                  Available:{" "}
                                  {Object.values(
                                    doctorData.schedulesByDate
                                  ).reduce(
                                    (total, daySchedules) =>
                                      total +
                                      daySchedules.reduce(
                                        (dayTotal, schedule) =>
                                          dayTotal +
                                          schedule.slots.filter(
                                            (s) => !s.overbooked
                                          ).length,
                                        0
                                      ),
                                    0
                                  )}
                                </span>
                              </div>
                            </div>

                            {/* Doctor's Schedule Days */}
                            <div>
                              {/* Horizontal scrolling container for days */}
                              <div className="w-full">
                                <div className="w-full overflow-x-auto">
                                  <div
                                    className="flex gap-4 py-2"
                                    style={{
                                      width: `${
                                        Object.keys(doctorData.schedulesByDate)
                                          .length * 280
                                      }px`,
                                      minWidth: "100%",
                                    }}
                                  >
                                    {Object.entries(
                                      doctorData.schedulesByDate
                                    ).map(([date, dateSchedules]) => (
                                      <div
                                        key={`${doctorId}-${date}`}
                                        className="w-[260px]"
                                      >
                                        <div className="bg-gray-50 rounded-lg p-3 border">
                                          {/* Day Header */}
                                          <div className="mb-3 pb-2 border-b border-gray-200">
                                            <div className="flex items-center justify-between">
                                              <div>
                                                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                                  <Calendar className="w-4 h-4" />
                                                  {formatDayName(date)}
                                                </h4>
                                                <p className="text-sm text-gray-600">
                                                  {formatDate(date)}
                                                </p>
                                              </div>

                                              {/* Options Button */}
                                              {dateSchedules.length > 0 && (
                                                <TimeShiftPopover
                                                  isOpen={
                                                    shiftPopoverOpen[
                                                      `multi-${doctorId}-${date}`
                                                    ] || false
                                                  }
                                                  onOpenChange={(open) => {
                                                    setShiftPopoverOpen(
                                                      (prev) => ({
                                                        ...prev,
                                                        [`multi-${doctorId}-${date}`]:
                                                          open,
                                                      })
                                                    );
                                                  }}
                                                  onTimeSelect={(
                                                    delayMinutes
                                                  ) => {
                                                    if (
                                                      dateSchedules.length > 0
                                                    ) {
                                                      handleTimeSelection(
                                                        dateSchedules,
                                                        date,
                                                        delayMinutes,
                                                        doctorData.doctorName
                                                      );
                                                    }
                                                  }}
                                                  onDaySelect={(shiftDays) => {
                                                    if (
                                                      dateSchedules.length > 0
                                                    ) {
                                                      handleDaySelection(
                                                        dateSchedules,
                                                        date,
                                                        shiftDays,
                                                        doctorData.doctorName
                                                      );
                                                    }
                                                  }}
                                                />
                                              )}
                                            </div>
                                          </div>

                                          {/* Slots for this day */}
                                          <div className="space-y-2 pb-4">
                                            {dateSchedules.map((schedule) =>
                                              schedule.slots.map((slot) => (
                                                <SlotTile
                                                  key={`${doctorId}-${schedule.id}-${slot.id}`}
                                                  slot={slot}
                                                  scheduleId={schedule.id}
                                                  doctorId={doctorId}
                                                />
                                              ))
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Drag Overlay for Multi-Doctor View */}
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
                              Cross-doctor transfer...
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span className="text-xs">🏥</span>
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
              )
            ) : // Single Doctor View (existing logic)
            viewMode === "single" && !selectedPractitionerId ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Please select a{" "}
                    {selectedUserType === "doctor"
                      ? "doctor"
                      : "lab technician"}{" "}
                    to view appointments
                  </p>
                </div>
              </div>
            ) : isLoadingSchedules ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">
                  Loading appointments...
                </div>
              </div>
            ) : schedules.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No appointments found for the selected practitioner
                  </p>
                </div>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                {/* Kanban Board Layout with horizontal scrolling */}
                <div className="w-full">
                  <div className="w-full overflow-x-auto">
                    <div
                      className="flex gap-4 px-6 py-4"
                      style={{
                        width: `${
                          Object.keys(groupSchedulesByDate()).length * 300
                        }px`,
                        minWidth: "100%",
                      }}
                    >
                      {Object.entries(groupSchedulesByDate()).map(
                        ([date, dateSchedules]) => (
                          <div
                            key={date}
                            className="w-[240px] sm:w-[260px] md:w-[280px] lg:w-[300px] xl:w-[320px] flex-shrink-0"
                          >
                            {/* Day Column Header */}
                            <div className="mb-3">
                              <div className="p-3 flex justify-between items-start">
                                <div>
                                  <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-900">
                                    <Calendar className="w-5 h-5" />
                                    {formatDayName(date)}
                                  </h3>
                                  <p className="text-sm text-blue-700 mb-3 font-medium">
                                    {formatDate(date)}
                                  </p>
                                </div>

                                <div className="flex items-start gap-2">
                                  {/* Day Summary */}
                                  <div className="flex items-center flex-col justify-between text-xs bg-white rounded p-2">
                                    <span className="flex items-center gap-1 text-red-600 font-medium">
                                      <Users className="w-3 h-3" />
                                      {dateSchedules.reduce(
                                        (total, schedule) =>
                                          total +
                                          schedule.slots.filter(
                                            (s) => s.overbooked
                                          ).length,
                                        0
                                      )}{" "}
                                      occupied
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
                                      )}{" "}
                                      available
                                    </span>
                                  </div>

                                  {/* Options Button */}
                                  {dateSchedules.length > 0 && (
                                    <TimeShiftPopover
                                      isOpen={
                                        shiftPopoverOpen[`single-${date}`] ||
                                        false
                                      }
                                      onOpenChange={(open) => {
                                        setShiftPopoverOpen((prev) => ({
                                          ...prev,
                                          [`single-${date}`]: open,
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
                              <div className="space-y-3 pb-4">
                                {dateSchedules.map((schedule) => (
                                  <div key={schedule.id} className="space-y-2">
                                    {/* Schedule Time Header */}
                                    {/* <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 p-3 rounded-lg text-xs font-medium flex items-center gap-2 shadow-sm">
                                      <Clock className="w-3 h-3 text-gray-600" />
                                      <span className="text-gray-800">
                                        {formatTime(schedule.planning_start)} -{" "}
                                        {formatTime(schedule.planning_end)}
                                      </span>
                                      {schedule.comment && (
                                        <span className="text-gray-600 ml-2">
                                          • {schedule.comment}
                                        </span>
                                      )}
                                    </div> */}

                                    {/* Slots for this schedule */}
                                    <div className="space-y-2">
                                      {schedule.slots.map((slot) => (
                                        <SlotTile
                                          key={slot.id}
                                          slot={slot}
                                          scheduleId={schedule.id}
                                        />
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

                      {/* Empty state when no schedules */}
                      {Object.keys(groupSchedulesByDate()).length === 0 && (
                        <div className="flex items-center justify-center w-full py-12">
                          <div className="text-center">
                            <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                              No appointments found for the selected
                              practitioner
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Drag Overlay for better visual feedback */}
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
                            🔴 Moving...
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span className="text-xs">📤</span>
                        </div>
                      </div>
                      {activeSlot.slot.comment && (
                        <p className="text-xs mt-1 opacity-75 truncate border-t pt-1">
                          💬 {activeSlot.slot.comment}
                        </p>
                      )}
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Slot Transfer Confirmation Modal */}
      <SlotTransferModal
        isOpen={isTransferModalOpen}
        onClose={handleTransferModalClose}
        transferData={transferData}
        onConfirm={handleTransferConfirm}
        onRefreshData={handleRefreshAppointmentData}
      />

      {/* Slot Shift Confirmation Modal */}
      <SlotShiftModal
        isOpen={shiftModalOpen}
        onClose={handleCancelShift}
        shiftData={selectedShiftData}
        onRefreshData={handleRefreshAppointmentData}
      />

      {/* Slot Day Shift Confirmation Modal */}
      <SlotDayShiftModal
        isOpen={dayShiftModalOpen}
        onClose={handleCancelDayShift}
        shiftData={selectedDayShiftData}
        onRefreshData={handleRefreshAppointmentData}
      />
    </div>
  );
}
