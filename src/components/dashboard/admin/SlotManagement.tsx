"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Calendar,
  Clock,
  User,
  Plus,
  CalendarDays,
  X,
  Trash2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchDoctors,
  fetchSchedulesByPractitioner,
  setSelectedPractitionerId,
  clearError,
  deleteScheduleLocal,
  deleteMultipleSchedulesLocal,
  deleteSchedulesByDateRangeLocal,
  deleteSlotLocal,
  deleteMultipleSlotsLocal,
  deleteSlotsByTimeRangeLocal,
} from "@/store/slices/scheduleSlotsSlice";
import { format } from "date-fns";
import DeleteScheduleModal from "./DeleteScheduleModal";
import DeleteSlotsModal from "./DeleteSlotsModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { Schedule } from "@/types/scheduleSlots.types";

export default function SlotManagement() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Date filter state
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [dateFilterOption, setDateFilterOption] = useState<string>("all");

  // Delete modal states
  const [isDeleteScheduleModalOpen, setIsDeleteScheduleModalOpen] =
    useState(false);
  const [isDeleteSlotsModalOpen, setIsDeleteSlotsModalOpen] = useState(false);
  const [selectedScheduleForSlotDeletion, setSelectedScheduleForSlotDeletion] =
    useState<Schedule | null>(null);

  // Confirmation modal states
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [confirmDeleteAction, setConfirmDeleteAction] = useState<
    (() => void) | null
  >(null);
  const [confirmDeleteTitle, setConfirmDeleteTitle] = useState("");
  const [confirmDeleteDescription, setConfirmDeleteDescription] = useState("");

  // Redux state
  const {
    schedules,
    doctors,
    selectedPractitionerId,
    isLoadingSchedules,
    isLoadingDoctors,
    error,
    doctorsError,
  } = useAppSelector((state) => state.scheduleSlots);

  useEffect(() => {
    // Fetch doctors on component mount
    dispatch(fetchDoctors());
  }, [dispatch]);

  useEffect(() => {
    // Auto-select first doctor when doctors are loaded
    if (doctors.length > 0 && !selectedPractitionerId) {
      dispatch(setSelectedPractitionerId(doctors[0].id));
    }
  }, [doctors, selectedPractitionerId, dispatch]);

  useEffect(() => {
    // Fetch schedules when practitioner is selected
    if (selectedPractitionerId) {
      dispatch(fetchSchedulesByPractitioner(selectedPractitionerId));
    }
  }, [selectedPractitionerId, dispatch]);

  useEffect(() => {
    if (error) {
      toast.warning("No schedules found for the selected doctor.");
      dispatch(clearError());
    }
    if (doctorsError) {
      toast.error("Failed to fetch doctors.");
      dispatch(clearError());
    }
  }, [error, doctorsError, dispatch]);

  const handleDoctorSelect = (value: string) => {
    console.log("Selected Practitioner ID:", value);
    dispatch(setSelectedPractitionerId(value));
  };

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

  // Filter schedules based on date range
  const filteredSchedules = schedules.filter((schedule) => {
    const scheduleDate = new Date(schedule.planning_start);
    scheduleDate.setHours(0, 0, 0, 0); // Normalize to start of day for comparison

    if (fromDate && toDate) {
      const fromDateNormalized = new Date(fromDate);
      fromDateNormalized.setHours(0, 0, 0, 0);
      const toDateNormalized = new Date(toDate);
      toDateNormalized.setHours(23, 59, 59, 999);

      return (
        scheduleDate >= fromDateNormalized && scheduleDate <= toDateNormalized
      );
    } else if (fromDate) {
      const fromDateNormalized = new Date(fromDate);
      fromDateNormalized.setHours(0, 0, 0, 0);
      return scheduleDate >= fromDateNormalized;
    } else if (toDate) {
      const toDateNormalized = new Date(toDate);
      toDateNormalized.setHours(23, 59, 59, 999);
      return scheduleDate <= toDateNormalized;
    }
    return true; // No filter applied
  });

  const getTotalAvailableSlots = () => {
    return filteredSchedules.reduce((total, schedule) => {
      return total + schedule.slots.filter((slot) => !slot.overbooked).length;
    }, 0);
  };

  const getTotalOverbookedSlots = () => {
    return filteredSchedules.reduce((total, schedule) => {
      return total + schedule.slots.filter((slot) => slot.overbooked).length;
    }, 0);
  };

  const clearDateFilter = () => {
    setFromDate(undefined);
    setToDate(undefined);
  };

  const handleDateFilterOptionChange = (value: string) => {
    setDateFilterOption(value);

    if (value === "this-month") {
      const today = new Date();
      const firstDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );
      const lastDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
      );
      setFromDate(firstDayOfMonth);
      setToDate(lastDayOfMonth);
    } else if (value === "next-month") {
      const today = new Date();
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      const endOfNextMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 2,
        0
      );
      setFromDate(nextMonth);
      setToDate(endOfNextMonth);
    } else if (value === "next-2-months") {
      const today = new Date();
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      const endOfNext2Months = new Date(
        today.getFullYear(),
        today.getMonth() + 3,
        0
      );
      setFromDate(nextMonth);
      setToDate(endOfNext2Months);
    } else if (value === "all") {
      setFromDate(undefined);
      setToDate(undefined);
    }
    // For "custom", we don't set dates - user will set them manually
  };

  const getFilterDisplayText = () => {
    switch (dateFilterOption) {
      case "this-month":
        return "This Month";
      case "next-month":
        return "Next Month";
      case "next-2-months":
        return "Next 2 Months";
      case "custom":
        if (fromDate && toDate) {
          return `${format(fromDate, "MMM dd, yyyy")} to ${format(
            toDate,
            "MMM dd, yyyy"
          )}`;
        } else if (fromDate) {
          return `From ${format(fromDate, "MMM dd, yyyy")}`;
        } else if (toDate) {
          return `Until ${format(toDate, "MMM dd, yyyy")}`;
        }
        return "Custom Range";
      default:
        return "All Dates";
    }
  };

  // Delete handlers
  const handleDeleteSchedules = (scheduleIds: string[]) => {
    dispatch(deleteMultipleSchedulesLocal(scheduleIds));
  };

  const handleDeleteSchedulesByDateRange = (
    startDate: string,
    endDate: string
  ) => {
    dispatch(deleteSchedulesByDateRangeLocal({ startDate, endDate }));
  };

  const handleDeleteSlots = (scheduleId: string, slotIds: string[]) => {
    slotIds.forEach((slotId) => {
      dispatch(deleteSlotLocal({ scheduleId, slotId }));
    });
  };

  const handleDeleteSlotsByTimeRange = (
    scheduleId: string,
    startTime: string,
    endTime: string
  ) => {
    dispatch(deleteSlotsByTimeRangeLocal({ scheduleId, startTime, endTime }));
  };

  const handleOpenDeleteSlotsModal = (schedule: Schedule) => {
    setSelectedScheduleForSlotDeletion(schedule);
    setIsDeleteSlotsModalOpen(true);
  };

  // Helper function to show confirmation modal
  const showConfirmation = (
    title: string,
    description: string,
    action: () => void
  ) => {
    setConfirmDeleteTitle(title);
    setConfirmDeleteDescription(description);
    setConfirmDeleteAction(() => action);
    setIsConfirmDeleteOpen(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Slot Management</h1>
          <p className="text-muted-foreground">
            Manage and view available appointment slots
          </p>
        </div>

        {/* Delete Actions */}
        <div className="flex flex-col items-end gap-2">
          {filteredSchedules.length > 0 && (
            <div className="text-xs text-muted-foreground text-right">
              {filteredSchedules.length} schedule(s) •{" "}
              {getTotalAvailableSlots() + getTotalOverbookedSlots()} total slots
            </div>
          )}
          <Button
            variant="destructive"
            onClick={() => setIsDeleteScheduleModalOpen(true)}
            disabled={filteredSchedules.length === 0}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Schedules
          </Button>
        </div>
      </div>

      {/* Doctor Selection and Date Filter - Combined Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doctor Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Select Doctor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="doctor-select" className="text-sm font-medium">
                  Choose a doctor to view their available slots:
                </label>
                <Select
                  value={selectedPractitionerId || doctors[0]?.id || ""}
                  onValueChange={handleDoctorSelect}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a doctor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{doctor.name}</span>
                          {/* <span className="text-xs text-muted-foreground">
                            (ID: {doctor.practitioner_display_id})
                          </span> */}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Create Slots Button */}
              {selectedPractitionerId && (
                <Button
                  onClick={() =>
                    router.push(
                      "/dashboard/admin/slots-management/create-slots"
                    )
                  }
                  className="w-full flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Slots for{" "}
                  {doctors.find((doc) => doc.id === selectedPractitionerId)
                    ?.name || "Selected Doctor"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Date Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Date Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Filter Options Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Filter by:</label>
                <div className="flex items-center gap-2">
                  <Select
                    value={dateFilterOption}
                    onValueChange={handleDateFilterOptionChange}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Dates</SelectItem>
                      <SelectItem value="this-month">This Month</SelectItem>
                      <SelectItem value="next-month">Next Month</SelectItem>
                      <SelectItem value="next-2-months">
                        Next 2 Months
                      </SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>

                  {dateFilterOption !== "all" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDateFilterOptionChange("all")}
                      className="flex items-center gap-1 shrink-0"
                    >
                      <X className="h-4 w-4" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* Custom Date Inputs - Only show when custom is selected */}
              {dateFilterOption === "custom" && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">
                        From:
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {fromDate ? format(fromDate, "MMM dd") : "Select"}
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

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">
                        To:
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {toDate ? format(toDate, "MMM dd") : "Select"}
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
                </div>
              )}

              {/* Filter Display Text */}
              {dateFilterOption !== "all" && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Active:</span>{" "}
                  {getFilterDisplayText()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white border rounded-lg p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">
              Total Schedules
            </h3>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {filteredSchedules.length}
          </div>
          <p className="text-sm text-muted-foreground">
            Active scheduling periods
          </p>
        </div>

        <div className="bg-white border rounded-lg p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">
              Available Slots
            </h3>
            <Clock className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-600">
            {getTotalAvailableSlots()}
          </div>
          <p className="text-sm text-muted-foreground">Ready for booking</p>
        </div>

        <div className="bg-white border rounded-lg p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">
              Overbooked Slots
            </h3>
            <User className="h-4 w-4 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-red-600">
            {getTotalOverbookedSlots()}
          </div>
          <p className="text-sm text-muted-foreground">Need attention</p>
        </div>
      </div>

      {/* Schedules Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Available Schedules -
            {selectedPractitionerId ? (
              <span className="font-bold">
                {doctors.find((doc) => doc.id === selectedPractitionerId)?.name}
              </span>
            ) : (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                {doctors[0]?.name || "No doctor selected"}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-auto">
            {!selectedPractitionerId && !schedules ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">
                    Please select a doctor to view their available schedules
                  </p>
                </div>
              </div>
            ) : isLoadingSchedules ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">
                  Loading schedules...
                </div>
              </div>
            ) : filteredSchedules.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">
                    {schedules.length === 0
                      ? "No schedules available for selected doctor"
                      : "No schedules found for the selected date range"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredSchedules.map((schedule) => (
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
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {calculateTotalHours(
                              schedule.planning_start,
                              schedule.planning_end
                            )}{" "}
                            hours
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDeleteSlotsModal(schedule)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete Slots
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              showConfirmation(
                                "Delete Schedule",
                                `Are you sure you want to delete the schedule for ${formatDate(
                                  schedule.planning_start
                                )}? This will permanently remove all ${
                                  schedule.slots.length
                                } slots for this date.`,
                                () => {
                                  dispatch(deleteScheduleLocal(schedule.id));
                                  toast.success(
                                    `Deleted schedule for ${formatDate(
                                      schedule.planning_start
                                    )}`
                                  );
                                }
                              );
                            }}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete Schedule
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>
                          {formatTime(schedule.planning_start)} -{" "}
                          {formatTime(schedule.planning_end)}
                        </span>
                      </div>
                      {/* {schedule.comment && (
                        <p className="text-sm text-muted-foreground">
                          {schedule.comment}
                        </p>
                      )} */}
                    </div>

                    {/* Slots Grid */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-sm">
                            Available Time Slots
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Use "Delete Slots" button above for bulk deletion
                            actions
                          </p>
                        </div>
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
                      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-1.5">
                        {[...schedule.slots]
                          .sort(
                            (a, b) =>
                              new Date(a.start).getTime() -
                              new Date(b.start).getTime()
                          )
                          .map((slot) => (
                            <div
                              key={slot.id}
                              className={`p-2 rounded-md border text-center text-xs transition-all duration-200 ${
                                slot.overbooked
                                  ? "bg-gray-100 text-gray-500 border-gray-300 opacity-60"
                                  : slot.status === "free"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                              }`}
                            >
                              <div className="font-medium text-lg">
                                {formatTime(slot.start)}
                              </div>
                              <div className=" opacity-80 leading-tight">
                                to {formatTime(slot.end)}
                              </div>
                              <div className="mt-3 mb-1">
                                {slot.overbooked ? (
                                  <span className="text-md bg-red-100 text-red-600 px-3 py-1 rounded-full m-2">
                                    Overbooked
                                  </span>
                                ) : (
                                  <span className="text-md bg-green-100 text-green-600 px-3 py-1 rounded-full">
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
        </CardContent>
      </Card>

      {/* Delete Modals */}
      <DeleteScheduleModal
        isOpen={isDeleteScheduleModalOpen}
        onClose={() => setIsDeleteScheduleModalOpen(false)}
        schedules={filteredSchedules}
        onDeleteSchedules={handleDeleteSchedules}
        onDeleteSchedulesByDateRange={handleDeleteSchedulesByDateRange}
      />

      <DeleteSlotsModal
        isOpen={isDeleteSlotsModalOpen}
        onClose={() => {
          setIsDeleteSlotsModalOpen(false);
          setSelectedScheduleForSlotDeletion(null);
        }}
        schedule={selectedScheduleForSlotDeletion}
        onDeleteSlots={handleDeleteSlots}
        onDeleteSlotsByTimeRange={handleDeleteSlotsByTimeRange}
      />

      {/* Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => {
          setIsConfirmDeleteOpen(false);
          setConfirmDeleteAction(null);
        }}
        onConfirm={() => confirmDeleteAction?.()}
        title={confirmDeleteTitle}
        description={confirmDeleteDescription}
      />
    </div>
  );
}
