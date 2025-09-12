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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Calendar,
  Clock,
  User,
  Plus,
  CalendarDays,
  X,
  Trash2,
  EllipsisVertical,
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
  deleteMultipleSchedulesLocal,
  deleteSchedulesByDateRangeLocal,
  deleteSlotLocal,
  deleteSlotsByTimeRangeLocal,
  setAllPractitioner,
} from "@/store/slices/scheduleSlotsSlice";
import { format } from "date-fns";
import moment from "moment";
import DeleteScheduleModal from "../modals/DeleteScheduleModal";
import DeleteSlotsModal from "../modals/DeleteSlotsModal";
import ConfirmDeleteModal from "../modals/ConfirmDeleteModal";
import { Schedule } from "@/types/scheduleSlots.types";
import { deleteSingleSchedule } from "@/services/schedule.api";
import { getPractitionerByRole } from "@/services/admin.api";

// Type for practitioners (doctor or lab technician)
interface PractitionerData {
  id: string;
  name: string;
  practitioner_display_id?: string;
  user?: {
    name: string;
  };
}

export default function SlotManagement() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Date filter state
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [dateFilterOption, setDateFilterOption] = useState<string>("all");

  // User type filter state
  const [selectedUserType, setSelectedUserType] = useState<
    "doctor" | "lab_technician"
  >("doctor");
  const [localPractitioners, setLocalPractitioners] = useState<
    PractitionerData[]
  >([]);

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
    error,
    doctorsError,
  } = useAppSelector((state) => state.scheduleSlots);

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
        // Only set all practitioners in Redux if they are doctors
        // if (role === "doctor") {
        // Transform data to match ExtendedDoctorData structure for doctors
        const doctorData = data.map((practitioner) => ({
          ...practitioner,
          name: practitioner.name,
          // Add any other required fields that ExtendedDoctorData expects
        })) as any[];
        dispatch(setAllPractitioner(doctorData));
        // }
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
    // Auto-select first doctor when doctors are loaded (only for initial load when user type is doctor)
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
  }, [selectedPractitionerId, dispatch, isDeleteScheduleModalOpen]);

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
    console.log(value);
    console.log("Selected Practitioner ID:", value);
    dispatch(setSelectedPractitionerId(value));
  };

  const handleUserTypeChange = (userType: "doctor" | "lab_technician") => {
    setSelectedUserType(userType);
    // Clear current selection when switching user types
    dispatch(setSelectedPractitionerId(""));
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
    const scheduleDate = moment(schedule.planning_start).startOf("day");

    // Handle single date filters (today, tomorrow, specific date)
    if (selectedDate) {
      const filterDate = moment(selectedDate).startOf("day");
      return scheduleDate.isSame(filterDate, "day");
    }

    // Handle date range filters
    if (dateRange.from || dateRange.to || fromDate || toDate) {
      const startDate = dateRange.from || fromDate;
      const endDate = dateRange.to || toDate;

      if (startDate && endDate) {
        const fromMoment = moment(startDate).startOf("day");
        const toMoment = moment(endDate).endOf("day");
        return scheduleDate.isBetween(fromMoment, toMoment, "day", "[]");
      } else if (startDate) {
        const fromMoment = moment(startDate).startOf("day");
        return scheduleDate.isSameOrAfter(fromMoment, "day");
      } else if (endDate) {
        const toMoment = moment(endDate).endOf("day");
        return scheduleDate.isSameOrBefore(toMoment, "day");
      }
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

    // Clear all previous selections
    setSelectedDate(undefined);
    setDateRange({});
    setFromDate(undefined);
    setToDate(undefined);

    const today = moment().toDate();
    const tomorrow = moment().add(1, "day").toDate();

    switch (value) {
      case "today":
        setSelectedDate(today);
        break;
      case "tomorrow":
        setSelectedDate(tomorrow);
        break;
      case "this-month":
        const startOfMonth = moment().startOf("month").toDate();
        const endOfMonth = moment().endOf("month").toDate();
        setDateRange({ from: startOfMonth, to: endOfMonth });
        break;
      case "next-month":
        const startOfNextMonth = moment()
          .add(1, "month")
          .startOf("month")
          .toDate();
        const endOfNextMonth = moment().add(1, "month").endOf("month").toDate();
        setDateRange({ from: startOfNextMonth, to: endOfNextMonth });
        break;
      case "next-2-months":
        const startOfNext = moment().add(1, "month").startOf("month").toDate();
        const endOfNext2Months = moment()
          .add(2, "month")
          .endOf("month")
          .toDate();
        setDateRange({ from: startOfNext, to: endOfNext2Months });
        break;
      case "all":
        // All filters cleared above
        break;
      // For "custom-single", "custom-range" we don't set dates - user will set them manually
    }
  };

  const getFilterDisplayText = () => {
    switch (dateFilterOption) {
      case "today":
        return `Today (${moment().format("MMM DD, YYYY")})`;
      case "tomorrow":
        return `Tomorrow (${moment().add(1, "day").format("MMM DD, YYYY")})`;
      case "this-month":
        return "This Month";
      case "next-month":
        return "Next Month";
      case "next-2-months":
        return "Next 2 Months";
      case "custom-single":
        if (selectedDate) {
          return moment(selectedDate).format("MMM DD, YYYY");
        }
        return "Select Single Date";
      case "custom-range":
        if (dateRange.from && dateRange.to) {
          return `${moment(dateRange.from).format("MMM DD, YYYY")} to ${moment(
            dateRange.to
          ).format("MMM DD, YYYY")}`;
        } else if (dateRange.from) {
          return `From ${moment(dateRange.from).format("MMM DD, YYYY")}`;
        } else if (dateRange.to) {
          return `Until ${moment(dateRange.to).format("MMM DD, YYYY")}`;
        }
        return "Custom Date Range";
      default:
        return "All Dates";
    }
  };

  // Delete handlers
  const handleDeleteSchedules = (scheduleIds: string[]) => {
    dispatch(deleteMultipleSchedulesLocal(scheduleIds));
  };

  const deleteSingleScheduleApi = async (scheduleId: string) => {
    try {
      const response = await deleteSingleSchedule(scheduleId);
      toast.success("Schedule deleted successfully.");
      dispatch(fetchSchedulesByPractitioner(selectedPractitionerId || ""));
    } catch {
      toast.error("Failed to delete schedule.");
    }
  };

  const handleDeleteSingleSchedule = (schedule: Schedule) => {
    console.log("Deleting schedule:", schedule);
    showConfirmation(
      "Delete Schedule",
      `Are you sure you want to delete the schedule for ${formatDate(
        schedule.planning_start
      )}? This will permanently remove all ${
        schedule.slots.length
      } slots for this date.`,
      () => {
        deleteSingleScheduleApi(schedule.id);
      }
    );
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
              Select Practitioner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* User Type Selection */}
              <div className="space-y-2">
                <label
                  htmlFor="user-type-select"
                  className="text-sm font-medium"
                >
                  Select User Type:
                </label>
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

              {/* Practitioner Selection */}
              <div className="space-y-2">
                <label
                  htmlFor="practitioner-select"
                  className="text-sm font-medium"
                >
                  Choose a{" "}
                  {selectedUserType === "doctor" ? "doctor" : "lab technician"}{" "}
                  to view their available slots:
                </label>
                <Select
                  value={
                    selectedPractitionerId ||
                    getCurrentPractitioners()[0]?.id ||
                    ""
                  }
                  onValueChange={handleDoctorSelect}
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
                      <SelectItem key={practitioner.id} value={practitioner.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {practitioner.name}
                          </span>
                          {/* <span className="text-xs text-muted-foreground">
                            (ID: {practitioner.practitioner_display_id})
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
                  {getCurrentPractitioners().find(
                    (practitioner) => practitioner.id === selectedPractitionerId
                  )?.name ||
                    `Selected ${
                      selectedUserType === "doctor"
                        ? "Doctor"
                        : "Lab Technician"
                    }`}
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
                      <SelectValue placeholder="Select date filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Dates</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="tomorrow">Tomorrow</SelectItem>
                      <SelectItem value="this-month">This Month</SelectItem>
                      <SelectItem value="next-month">Next Month</SelectItem>
                      <SelectItem value="next-2-months">
                        Next 2 Months
                      </SelectItem>
                      <SelectItem value="custom-single">
                        Custom Single Date
                      </SelectItem>
                      <SelectItem value="custom-range">
                        Custom Date Range
                      </SelectItem>
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

              {/* Custom Single Date Picker */}
              {dateFilterOption === "custom-single" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Date:</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {selectedDate
                          ? moment(selectedDate).format("MMM DD, YYYY")
                          : "Select a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {/* Custom Date Range Picker */}
              {dateFilterOption === "custom-range" && (
                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    Select Date Range:
                  </label>

                  {/* Date Range Picker */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {dateRange.from
                          ? dateRange.to
                            ? `${moment(dateRange.from).format(
                                "MMM DD, YYYY"
                              )} - ${moment(dateRange.to).format(
                                "MMM DD, YYYY"
                              )}`
                            : moment(dateRange.from).format("MMM DD, YYYY")
                          : "Pick a date range"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="range"
                        selected={{
                          from: dateRange.from ?? undefined,
                          to: dateRange.to ?? undefined,
                        }}
                        onSelect={(range) =>
                          setDateRange({
                            from: range?.from ?? undefined,
                            to: range?.to ?? undefined,
                          })
                        }
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>

                  {/* Alternative: Separate From/To Pickers */}
                  <div className="text-xs text-muted-foreground text-center">
                    or select individually:
                  </div>

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
                            {dateRange.from
                              ? moment(dateRange.from).format("MMM DD")
                              : "Start"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={dateRange.from}
                            onSelect={(date) =>
                              setDateRange((prev) => ({ ...prev, from: date }))
                            }
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
                            {dateRange.to
                              ? moment(dateRange.to).format("MMM DD")
                              : "End"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={dateRange.to}
                            onSelect={(date) =>
                              setDateRange((prev) => ({ ...prev, to: date }))
                            }
                            disabled={(date) =>
                              dateRange.from
                                ? moment(date).isBefore(moment(dateRange.from))
                                : false
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
                <div className="p-2 bg-muted/30 rounded-md">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Active Filter:</span>{" "}
                    <span className="font-medium text-foreground">
                      {getFilterDisplayText()}
                    </span>
                  </div>
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
                {
                  getCurrentPractitioners().find(
                    (practitioner) => practitioner.id === selectedPractitionerId
                  )?.name
                }
              </span>
            ) : (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                {getCurrentPractitioners()[0]?.name ||
                  `No ${
                    selectedUserType === "doctor" ? "doctor" : "lab technician"
                  } selected`}
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
                    Please select a{" "}
                    {selectedUserType === "doctor"
                      ? "doctor"
                      : "lab technician"}{" "}
                    to view their available schedules
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
                      ? `No schedules available for selected ${
                          selectedUserType === "doctor"
                            ? "doctor"
                            : "lab technician"
                        }`
                      : "No schedules found for the selected date range"}
                  </p>
                </div>
              </div>
            ) : (
              <Accordion type="multiple" className="w-full">
                {filteredSchedules.map((schedule) => (
                  <AccordionItem
                    key={schedule.id}
                    value={schedule.id}
                    className="border rounded-lg mb-4 bg-card"
                  >
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <div className="flex items-center justify-between w-full mr-4">
                        <div className="flex flex-col items-start space-y-1">
                          <h3 className="text-lg font-semibold text-left">
                            {formatDate(schedule.planning_start)}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>
                              {formatTime(schedule.planning_start)} -{" "}
                              {formatTime(schedule.planning_end)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {calculateTotalHours(
                              schedule.planning_start,
                              schedule.planning_end
                            )}{" "}
                            hours
                          </Badge>
                          <div className="flex gap-2 text-xs">
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                              {
                                schedule.slots.filter(
                                  (slot) => !slot.overbooked
                                ).length
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
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <EllipsisVertical />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-56 p-2" align="end">
                              <div className="space-y-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleOpenDeleteSlotsModal(schedule)
                                  }
                                  className="w-full justify-start  hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3 h-3 mr-2 text-red-600" />
                                  Delete Slots
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteSingleSchedule(schedule)
                                  }
                                  className="w-full justify-start  hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3 h-3 mr-2 text-red-600" />
                                  Delete Schedule
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
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
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
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
