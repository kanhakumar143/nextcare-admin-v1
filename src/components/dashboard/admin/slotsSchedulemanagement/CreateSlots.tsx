"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  X,
  Save,
  ArrowLeft,
  ChevronDown,
  Edit,
  Plus,
  Trash2,
} from "lucide-react";
import moment from "moment";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setSelectedPractitionerId,
  setSubmissionData,
} from "@/store/slices/scheduleSlotsSlice";
import CreateSlotsConfirmationModal from "../modals/CreateSlotsConfirmationModal";
import DeleteTemplateConfirmationModal from "../modals/DeleteTemplateConfirmationModal";
import {
  deleteTemplate,
  getAllTemplatesByPractitioner,
  updateTemplate,
} from "@/services/availabilityTemplate.api";

interface TimeSlot {
  start: string;
  end: string;
}

interface Break {
  start: string;
  end: string;
  purpose: string;
}

interface PreviousTemplate {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  duration: number;
  recurring: string;
  holidays: string[];
  leaves: string[];
  working_days: string[];
  breaks?: Break[];
  practitioner_id: string;
  specialty_id: string;
  created_at: string;
  updated_at: string;
  schedules: any[];
}

type RecurringType = "daily" | "weekly" | "monthly";

const daysOfWeek = [
  { value: "mon", label: "Monday" },
  { value: "tue", label: "Tuesday" },
  { value: "wed", label: "Wednesday" },
  { value: "thu", label: "Thursday" },
  { value: "fri", label: "Friday" },
  { value: "sat", label: "Saturday" },
  { value: "sun", label: "Sunday" },
];

const breakPurposes = [
  { value: "Lunch", label: "Lunch" },
  { value: "Round", label: "Round" },
  { value: "Power Nap", label: "Power Nap" },
  { value: "Fresh Up", label: "Fresh Up" },
  { value: "Other", label: "Other" },
];

export default function CreateSlots() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { schedules, doctors, selectedPractitionerId, isLoadingSchedules } =
    useAppSelector((state) => state.scheduleSlots);
  // Date range settings
  const [dateRangeType, setDateRangeType] = useState<
    "months" | "custom" | "today" | "tomorrow" | "week"
  >("months");
  const [monthsCount, setMonthsCount] = useState(3);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(
    moment().add(3, "months").toDate()
  );

  // Time settings
  const [timeSlot, setTimeSlot] = useState<TimeSlot>({
    start: "09:00",
    end: "17:00",
  });

  // Interval settings
  const [intervalType, setIntervalType] = useState<"preset" | "custom">(
    "preset"
  );
  const [selectedInterval, setSelectedInterval] = useState(30);
  const [customInterval, setCustomInterval] = useState(1);

  // Recurring settings
  const [recurring, setRecurring] = useState<RecurringType>("weekly");

  // Working days settings
  const [workingDays, setWorkingDays] = useState<string[]>([
    "mon",
    "tue",
    "wed",
    "thu",
    "fri",
  ]);

  // Slot calculation
  const [totalSlots, setTotalSlots] = useState(0);
  const [viewPreviousTemplates, setViewPreviousTemplates] = useState(false);
  const [previousTemplates, setPreviousTemplates] = useState<
    PreviousTemplate[]
  >([]);
  const [showForm, setShowForm] = useState(true);
  const [editingTemplate, setEditingTemplate] =
    useState<PreviousTemplate | null>(null);
  const [customSlotCount, setCustomSlotCount] = useState<number | null>(null);
  const [hasUserEditedSlots, setHasUserEditedSlots] = useState(false);

  // Unavailable dates
  const [clinicUnavailableDates, setClinicUnavailableDates] = useState<Date[]>(
    []
  );
  const [doctorLeaveDates, setDoctorLeaveDates] = useState<Date[]>([]);

  // Breaks state
  const [breaks, setBreaks] = useState<Break[]>([]);
  const [newBreak, setNewBreak] = useState<Break>({
    start: "12:00",
    end: "12:30",
    purpose: "Lunch",
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenedViaTemplate, setIsModalOpenedViaTemplate] =
    useState(false);

  // Delete template modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] =
    useState<PreviousTemplate | null>(null);

  // Track if we're in editing template mode
  const [isEditingTemplateMode, setIsEditingTemplateMode] = useState(false);

  // Calculated values
  const actualInterval =
    intervalType === "preset" ? selectedInterval : customInterval;
  const actualEndDate = (() => {
    switch (dateRangeType) {
      case "months":
        return moment(startDate).add(monthsCount, "months").toDate();
      case "today":
        return moment(startDate).endOf("day").toDate();
      case "tomorrow":
        return moment(startDate).endOf("day").toDate();
      case "week":
        return moment(startDate).add(1, "week").toDate();
      case "custom":
      default:
        return endDate;
    }
  })();

  // Check if start and end date are the same
  const isSingleDay =
    startDate &&
    actualEndDate &&
    moment(startDate).format("YYYY-MM-DD") ===
      moment(actualEndDate).format("YYYY-MM-DD");

  // Helper functions for date input
  const formatDateForInput = (date: Date): string => {
    return moment(date).format("YYYY-MM-DD");
  };

  useEffect(() => {
    if (selectedPractitionerId) {
      getExistingTemplatesForDoctor();
    }
  }, [selectedPractitionerId]);

  // Auto-set all working days when single day is selected
  useEffect(() => {
    if (isSingleDay) {
      const allDays = daysOfWeek.map((day) => day.value);
      setWorkingDays(allDays);
    } else {
      // Reset to default working days when switching back to multi-day
      const defaultWorkingDays = ["mon", "tue", "wed", "thu", "fri"];
      if (workingDays.length === 7) {
        // Only reset if all days were selected (likely from single day mode)
        setWorkingDays(defaultWorkingDays);
      }
    }
  }, [isSingleDay]);

  // Calculate total slots
  useEffect(() => {
    const calculateSlots = () => {
      const [startHour, startMin] = timeSlot.start.split(":").map(Number);
      const [endHour, endMin] = timeSlot.end.split(":").map(Number);

      const startTotalMin = startHour * 60 + startMin;
      const endTotalMin = endHour * 60 + endMin;

      let totalMinutes = 0;
      if (endTotalMin > startTotalMin) {
        totalMinutes = endTotalMin - startTotalMin;
      }

      const slotsPerDay = Math.floor(totalMinutes / actualInterval);

      if (isSingleDay) {
        // For single day, calculate slots directly for that specific day
        const selectedDate = moment(startDate);

        // Check if the selected date is in unavailable dates
        const isUnavailable =
          clinicUnavailableDates.some(
            (date) =>
              moment(date).format("YYYY-MM-DD") ===
              selectedDate.format("YYYY-MM-DD")
          ) ||
          doctorLeaveDates.some(
            (date) =>
              moment(date).format("YYYY-MM-DD") ===
              selectedDate.format("YYYY-MM-DD")
          );

        const total = isUnavailable ? 0 : Math.max(0, slotsPerDay);
        setTotalSlots(total);

        // Only set customSlotCount automatically if user hasn't manually edited it
        if (!hasUserEditedSlots) {
          setCustomSlotCount(total);
        }
      } else {
        // Original logic for date ranges
        const timeDiff = actualEndDate.getTime() - startDate.getTime();
        const totalDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        // Calculate working days based on selected days (instead of default 5/7)
        const workingDaysCount = workingDays.length;
        const workingDaysRatio = workingDaysCount / 7; // Ratio of working days per week
        const estimatedWorkingDays = Math.floor(totalDays * workingDaysRatio);

        // Subtract unavailable dates
        const unavailableDays =
          clinicUnavailableDates.length + doctorLeaveDates.length;
        const availableDays = Math.max(
          0,
          estimatedWorkingDays - unavailableDays
        );

        const total = Math.max(0, slotsPerDay * availableDays);
        setTotalSlots(total);

        // Only set customSlotCount automatically if user hasn't manually edited it
        if (!hasUserEditedSlots) {
          setCustomSlotCount(total);
        }
      }
    };

    calculateSlots();
  }, [
    timeSlot,
    actualInterval,
    startDate,
    actualEndDate,
    workingDays,
    clinicUnavailableDates,
    doctorLeaveDates,
    isSingleDay,
  ]);

  const updateTimeSlot = (field: "start" | "end", value: string) => {
    setTimeSlot((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addUnavailableDate = (date: Date, type: "clinic" | "doctor") => {
    if (type === "clinic") {
      if (
        !clinicUnavailableDates.some(
          (d) => d.toDateString() === date.toDateString()
        )
      ) {
        setClinicUnavailableDates([...clinicUnavailableDates, date]);
      }
    } else {
      if (
        !doctorLeaveDates.some((d) => d.toDateString() === date.toDateString())
      ) {
        setDoctorLeaveDates([...doctorLeaveDates, date]);
      }
    }
  };

  const removeUnavailableDate = (date: Date, type: "clinic" | "doctor") => {
    if (type === "clinic") {
      setClinicUnavailableDates(
        clinicUnavailableDates.filter(
          (d) => d.toDateString() !== date.toDateString()
        )
      );
    } else {
      setDoctorLeaveDates(
        doctorLeaveDates.filter((d) => d.toDateString() !== date.toDateString())
      );
    }
  };

  const addBreak = () => {
    // Validate break times
    const [startHour, startMin] = newBreak.start.split(":").map(Number);
    const [endHour, endMin] = newBreak.end.split(":").map(Number);
    const startTotal = startHour * 60 + startMin;
    const endTotal = endHour * 60 + endMin;

    if (endTotal <= startTotal) {
      toast.error("Break end time must be after start time");
      return;
    }

    // Check if break is within working hours
    const [workStartHour, workStartMin] = timeSlot.start.split(":").map(Number);
    const [workEndHour, workEndMin] = timeSlot.end.split(":").map(Number);
    const workStartTotal = workStartHour * 60 + workStartMin;
    const workEndTotal = workEndHour * 60 + workEndMin;

    if (startTotal < workStartTotal || endTotal > workEndTotal) {
      toast.error("Break must be within working hours");
      return;
    }

    // Check for overlapping breaks
    const hasOverlap = breaks.some((existingBreak) => {
      const [existStartHour, existStartMin] = existingBreak.start
        .split(":")
        .map(Number);
      const [existEndHour, existEndMin] = existingBreak.end
        .split(":")
        .map(Number);
      const existStartTotal = existStartHour * 60 + existStartMin;
      const existEndTotal = existEndHour * 60 + existEndMin;

      return startTotal < existEndTotal && endTotal > existStartTotal;
    });

    if (hasOverlap) {
      toast.error("Break times cannot overlap with existing breaks");
      return;
    }

    setBreaks([...breaks, { ...newBreak }]);
    // Reset form
    setNewBreak({
      start: "12:00",
      end: "12:30",
      purpose: "Lunch",
    });
    toast.success("Break added successfully");
  };

  const removeBreak = (index: number) => {
    setBreaks(breaks.filter((_, i) => i !== index));
    toast.success("Break removed");
  };

  const updateNewBreak = (field: keyof Break, value: string) => {
    setNewBreak((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getExistingTemplatesForDoctor = async () => {
    try {
      const response = await getAllTemplatesByPractitioner(
        selectedPractitionerId || ""
      );
      console.log(response);
      if (response.length > 0) {
        setViewPreviousTemplates(true);
        setPreviousTemplates(response);
        setShowForm(false); // Hide form when templates exist
      } else {
        setViewPreviousTemplates(false);
        setPreviousTemplates([]);
        setShowForm(true); // Show form when no templates
      }
      // toast.success("Fetched existing templates successfully.");
    } catch {
      // toast.error(
      //   "Failed to fetch existing templates for the selected doctor."
      // );
      setViewPreviousTemplates(false);
      setPreviousTemplates([]);
      setShowForm(true); // Show form on error
    }
  };

  const handleUsePreviousTemplate = (template: PreviousTemplate) => {
    console.log("Using previous template configuration:", template);
    // handleEditTemplate(template);
    // Calculate new dates from current date based on template duration (for editing we start from today)
    const { startDate: newStartDate, endDate: newEndDate } =
      calculateNewDatesFromTemplate(template.start_date, template.end_date);

    // Set form values based on the template with new calculated dates
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    setTimeSlot({
      start: template.start_time.substring(0, 5), // Remove seconds
      end: template.end_time.substring(0, 5), // Remove seconds
    });

    // Check if duration matches preset values
    const presetDurations = [15, 30, 45, 60, 90];
    if (presetDurations.includes(template.duration)) {
      setIntervalType("preset");
      setSelectedInterval(template.duration);
    } else {
      setIntervalType("custom");
      setCustomInterval(template.duration);
    }

    setRecurring(template.recurring as RecurringType);
    setWorkingDays(template.working_days);

    // Populate unavailable dates from template (holidays and leaves)
    setClinicUnavailableDates(template.holidays.map((date) => new Date(date)));
    setDoctorLeaveDates(template.leaves.map((date) => new Date(date)));

    // Set breaks if they exist in the template
    if (template.breaks && Array.isArray(template.breaks)) {
      setBreaks(template.breaks);
    } else {
      setBreaks([]);
    }

    // Set date range to custom since we're using specific calculated dates
    setDateRangeType("custom");

    // Set editing state and show form (not in editing mode for use template)
    setEditingTemplate(template);
    setIsEditingTemplateMode(false);
    setShowForm(true);

    const duration = calculateDuration(template.start_date, template.end_date);
    toast.success(
      `Template applied! New slots will be created for ${duration} starting from today.`
    );
  };

  const handleEditTemplate = (template: PreviousTemplate) => {
    console.log("Editing template:", template);

    // Calculate new dates from current date based on template duration (for editing we start from today)
    const { startDate: newStartDate, endDate: newEndDate } =
      calculateNewDatesFromTemplate(template.start_date, template.end_date);

    // Set form values based on the template with new calculated dates
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    setTimeSlot({
      start: template.start_time.substring(0, 5), // Remove seconds
      end: template.end_time.substring(0, 5), // Remove seconds
    });

    // Check if duration matches preset values
    const presetDurations = [15, 30, 45, 60, 90];
    if (presetDurations.includes(template.duration)) {
      setIntervalType("preset");
      setSelectedInterval(template.duration);
    } else {
      setIntervalType("custom");
      setCustomInterval(template.duration);
    }

    setRecurring(template.recurring as RecurringType);
    setWorkingDays(template.working_days);

    // Populate unavailable dates from template (holidays and leaves)
    setClinicUnavailableDates(template.holidays.map((date) => new Date(date)));
    setDoctorLeaveDates(template.leaves.map((date) => new Date(date)));

    // Set breaks if they exist in the template
    if (template.breaks && Array.isArray(template.breaks)) {
      setBreaks(template.breaks);
    } else {
      setBreaks([]);
    }

    // Set date range to custom since we're using specific calculated dates
    setDateRangeType("custom");

    // Set editing state and show form
    setEditingTemplate(template);
    setIsEditingTemplateMode(true);
    setShowForm(true);

    // const duration = calculateDuration(template.start_date, template.end_date);
    // const totalUnavailableDates = template.holidays.length + template.leaves.length;
    // const unavailableInfo = totalUnavailableDates > 0 ? ` (${totalUnavailableDates} blocked dates loaded)` : '';
    // toast.success(
    //   `Template loaded for editing! Dates updated to ${duration} starting from today${unavailableInfo}.`
    // );
  };

  const handleStartFresh = () => {
    // Reset form to default values
    setStartDate(new Date());
    setEndDate(moment().add(3, "months").toDate());
    setTimeSlot({ start: "09:00", end: "17:00" });
    setCustomInterval(1);
    setIntervalType("preset");
    setSelectedInterval(30);
    setRecurring("weekly");
    setWorkingDays(["mon", "tue", "wed", "thu", "fri"]);
    setClinicUnavailableDates([]);
    setDoctorLeaveDates([]);
    setBreaks([]);
    setNewBreak({
      start: "12:00",
      end: "12:30",
      purpose: "Lunch",
    });
    setDateRangeType("months");
    setMonthsCount(3);
    setEditingTemplate(null);
    setIsEditingTemplateMode(false);
    setShowForm(true);

    toast.success("Starting with fresh configuration!");
  };

  const formatDate = (dateString: string) => {
    return moment(dateString).format("MMM DD, YYYY");
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // Remove seconds
  };

  // Calculate duration between two dates and format as months/days
  const calculateDuration = (startDate: string, endDate: string) => {
    const start = moment(startDate);
    const end = moment(endDate);
    const totalDays = end.diff(start, "days");

    // Handle edge cases
    if (totalDays < 0) {
      return "Invalid date range";
    }

    if (totalDays === 0) {
      return "Same day";
    }

    if (totalDays === 1) {
      return "1 day";
    }

    if (totalDays <= 30) {
      return `${totalDays} days`;
    } else {
      const months = Math.floor(totalDays / 30);
      const remainingDays = totalDays % 30;

      if (remainingDays === 0) {
        return `${months} month${months !== 1 ? "s" : ""}`;
      } else {
        return `${months} month${
          months !== 1 ? "s" : ""
        }, ${remainingDays} day${remainingDays !== 1 ? "s" : ""}`;
      }
    }
  };

  // Calculate new dates from current date based on template duration
  const calculateNewDatesFromTemplate = (
    templateStartDate: string,
    templateEndDate: string
  ) => {
    const templateStart = moment(templateStartDate);
    const templateEnd = moment(templateEndDate);
    const duration = templateEnd.diff(templateStart, "days");

    const newStartDate = moment(); // Current date
    const newEndDate = moment().add(duration, "days");

    return {
      startDate: newStartDate.toDate(),
      endDate: newEndDate.toDate(),
      duration: duration,
    };
  };

  const handleSubmit = () => {
    // Validation
    const [startHour, startMin] = timeSlot.start.split(":").map(Number);
    const [endHour, endMin] = timeSlot.end.split(":").map(Number);
    const startTotal = startHour * 60 + startMin;
    const endTotal = endHour * 60 + endMin;

    if (endTotal <= startTotal) {
      toast.error("End time must be after start time");
      return;
    }

    if (actualInterval <= 0 || actualInterval > 480) {
      toast.error("Interval must be between 1 and 480 minutes");
      return;
    }

    if (!isSingleDay && workingDays.length === 0) {
      toast.error("Please select at least one working day");
      return;
    }

    if (customSlotCount && customSlotCount <= 0) {
      toast.error("Number of slots must be greater than 0");
      return;
    }

    if (totalSlots === 0 && (!customSlotCount || customSlotCount === 0)) {
      toast.error(
        "No slots can be created with current settings. Please adjust time slots or intervals."
      );
      return;
    }

    const selectedDoctor = doctors.find(
      (doctor) => doctor.id === selectedPractitionerId
    );
    // Prepare data for submission
    const availabilityData = {
      name:
        "Slots for " +
          moment(startDate).format("YYYY-MM-DD") +
          " to " +
          moment(actualEndDate).format("YYYY-MM-DD") || "",
      start_date: moment(startDate).format("YYYY-MM-DD") || "",
      end_date: moment(actualEndDate).format("YYYY-MM-DD") || "",
      start_time: `${timeSlot.start}:00` || "",
      end_time: `${timeSlot.end}:00` || "",
      duration: actualInterval || 0,
      recurring: recurring || 0,
      holidays: clinicUnavailableDates.map((date) =>
        moment(date).format("YYYY-MM-DD")
      ),
      leaves: doctorLeaveDates.map((date) => moment(date).format("YYYY-MM-DD")),
      breaks: breaks,
      working_days: workingDays || "",
      is_active: true,
      remark: `Generated slot with ${
        customSlotCount || totalSlots
      } appointments`,
      practitioner_id: selectedPractitionerId || "",
      specialty_id: selectedDoctor?.service_specialty_id || "",
      // user_email: selectedDoctor?.telecom[1]?.value || "",
    };

    // Set submission data in Redux
    dispatch(setSubmissionData(availabilityData));

    // Mark that modal is opened via regular form (not template) and open the modal
    setIsModalOpenedViaTemplate(false);
    setIsModalOpen(true);
  };

  const handleDoctorSelect = (value: string) => {
    console.log("Selected Practitioner ID:", value);
    dispatch(setSelectedPractitionerId(value));

    // Reset template states when doctor changes
    setEditingTemplate(null);
    setIsEditingTemplateMode(false);
    setShowForm(true); // Show form initially when doctor changes
    setViewPreviousTemplates(false);
    setPreviousTemplates([]);
  };

  const handleSaveAsTemplate = () => {
    toast.success("Template saved successfully!");
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;

    // Prepare the updated template data
    const updatedTemplateData = {
      id: editingTemplate.id,
      name: editingTemplate.name,
      start_date: moment(startDate).format("YYYY-MM-DD"),
      end_date: moment(actualEndDate).format("YYYY-MM-DD"),
      start_time: `${timeSlot.start}:00`,
      end_time: `${timeSlot.end}:00`,
      duration: actualInterval,
      recurring: recurring,
      workingDays: workingDays,
      holidays: clinicUnavailableDates.map((date) =>
        moment(date).format("YYYY-MM-DD")
      ),
      leaves: doctorLeaveDates.map((date) => moment(date).format("YYYY-MM-DD")),
      is_active: true,
      remark: "UPDATE",
      breaks: breaks,
    };

    console.log("Updated template data:", updatedTemplateData);
    try {
      const response = await updateTemplate(updatedTemplateData);
      toast.success("Template updated successfully!");
      router.back();
    } catch (error) {
      console.error("Error updating template:", error);
      toast.error("Failed to update template.");
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsModalOpenedViaTemplate(false);
  };

  const handleModalProceed = (saveAsTemplate: boolean) => {
    setIsModalOpen(false);

    // Here you would typically call an API to save the availability
    toast.success(
      `Successfully created ${
        customSlotCount || totalSlots
      } availability slots!${saveAsTemplate ? " Template saved." : ""}`
    );

    // Redirect back to slot management page
    router.push("/dashboard/admin/slots-management");
  };

  const handleDeleteTemplate = (template: PreviousTemplate) => {
    setTemplateToDelete(template);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (templateToDelete) {
      console.log("Deleting template with ID:", templateToDelete.id);
      try {
        await deleteTemplate(templateToDelete.id);
        toast.success("Template deleted successfully.");
      } catch (error) {
        console.error("Error deleting template:", error);
        toast.error("Failed to delete template.");
      } finally {
        setIsDeleteModalOpen(false);
        setTemplateToDelete(null);
        // Refresh the templates list
        getExistingTemplatesForDoctor();
      }
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setTemplateToDelete(null);
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-6 bg-white">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/admin/slots-management")}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-black" />
              Create Slots
            </h1>
            <p className="text-sm text-gray-600">
              Set up new appointment availability
            </p>
          </div>
        </div>
        {/* <Button
          variant="outline"
          size="sm"
          onClick={handleSaveAsTemplate}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Template
        </Button> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Main Configuration - Left Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-4">
            <label htmlFor="doctor-select" className="text-sm font-medium">
              Choose a doctor to create slots for:
            </label>
            <Select
              value={selectedPractitionerId || doctors[0]?.id || ""}
              onValueChange={handleDoctorSelect}
            >
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Select a doctor..." />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{doctor.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Previous Templates Section */}
          {viewPreviousTemplates &&
            previousTemplates.length > 0 &&
            !showForm && (
              <>
                <div className="mb-4">
                  <Button
                    onClick={handleStartFresh}
                    variant="outline"
                    className="bg-white hover:bg-gray-50 border-gray-300"
                  >
                    <Plus />
                    New Setup
                  </Button>
                </div>

                <Card className="border-yellow-200 bg-yellow-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-yellow-800">
                      <Calendar className="w-5 h-5" />
                      Previous Slot Configurations Found
                    </CardTitle>
                    <p className="text-sm text-yellow-700">
                      You have previously created slots for this doctor. You can
                      use a template (dates will be calculated from today) or
                      edit one.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {previousTemplates.map((template, index) => (
                        <AccordionItem
                          key={template.id}
                          value={`item-${index}`}
                        >
                          <div className="border rounded-lg p-4 mb-3">
                            <div className="flex items-center justify-between mb-3">
                              <div className="text-left flex-1">
                                <h4 className="font-medium text-gray-900">
                                  {template.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  Duration:{" "}
                                  {calculateDuration(
                                    template.start_date,
                                    template.end_date
                                  )}{" "}
                                  |{formatTime(template.start_time)} -{" "}
                                  {formatTime(template.end_time)} |
                                  {template.duration}min slots
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                  Will create slots from{" "}
                                  {moment().format("MMM DD")} to{" "}
                                  {moment()
                                    .add(
                                      moment(template.end_date).diff(
                                        moment(template.start_date),
                                        "days"
                                      ),
                                      "days"
                                    )
                                    .format("MMM DD, YYYY")}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() =>
                                    handleUsePreviousTemplate(template)
                                  }
                                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                                  size="sm"
                                >
                                  Use Template
                                </Button>
                                <Button
                                  onClick={() => handleDeleteTemplate(template)}
                                  variant="outline"
                                  size="sm"
                                  className="p-2 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            <AccordionTrigger className="hover:no-underline py-0">
                              <span className="text-sm text-gray-600">
                                View Details
                              </span>
                            </AccordionTrigger>
                          </div>

                          <AccordionContent>
                            <div className="space-y-4 pt-2 px-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <strong>Slot Duration:</strong>{" "}
                                  {template.duration} minutes
                                </div>
                                <div>
                                  <strong>Recurring:</strong>{" "}
                                  {template.recurring}
                                </div>
                                <div>
                                  <strong>Working Days:</strong>{" "}
                                  {template.working_days.join(", ")}
                                </div>
                                <div>
                                  <strong>Created:</strong>{" "}
                                  {formatDate(template.created_at)}
                                </div>
                              </div>

                              {/* Template Period Information */}
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="grid grid-cols-1 gap-2 text-sm">
                                  <div>
                                    <strong className="text-blue-800">
                                      Original Period:
                                    </strong>
                                    <span className="ml-2 text-blue-700">
                                      {formatDate(template.start_date)} -{" "}
                                      {formatDate(template.end_date)}
                                    </span>
                                  </div>
                                  <div>
                                    <strong className="text-blue-800">
                                      Template Duration:
                                    </strong>
                                    <span className="ml-2 text-blue-700">
                                      {calculateDuration(
                                        template.start_date,
                                        template.end_date
                                      )}
                                    </span>
                                  </div>
                                  <div className="text-xs text-blue-600 italic">
                                    * Using this template will create slots for
                                    the same duration starting from today
                                  </div>
                                </div>
                              </div>

                              {(template.holidays.length > 0 ||
                                template.leaves.length > 0 ||
                                (template.breaks &&
                                  template.breaks.length > 0)) && (
                                <div className="space-y-2">
                                  {template.holidays.length > 0 && (
                                    <div>
                                      <strong className="text-sm">
                                        Holidays:
                                      </strong>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {template.holidays.map(
                                          (holiday, idx) => (
                                            <Badge
                                              key={idx}
                                              variant="secondary"
                                              className="text-xs"
                                            >
                                              {formatDate(holiday)}
                                            </Badge>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  {template.leaves.length > 0 && (
                                    <div>
                                      <strong className="text-sm">
                                        Leaves:
                                      </strong>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {template.leaves.map((leave, idx) => (
                                          <Badge
                                            key={idx}
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            {formatDate(leave)}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {template.breaks &&
                                    template.breaks.length > 0 && (
                                      <div>
                                        <strong className="text-sm">
                                          Breaks:
                                        </strong>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {template.breaks.map(
                                            (breakItem, idx) => (
                                              <Badge
                                                key={idx}
                                                variant="secondary"
                                                className="text-xs bg-green-100 text-green-800 border-green-300"
                                              >
                                                {formatTime(breakItem.start)} -{" "}
                                                {formatTime(breakItem.end)} (
                                                {breakItem.purpose})
                                              </Badge>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}
                                </div>
                              )}

                              <div className="flex gap-3 pt-3 border-t">
                                <Button
                                  onClick={() => handleEditTemplate(template)}
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center gap-2"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit this template
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </>
            )}

          {/* Form sections - only show when showForm is true */}
          {showForm && (
            <>
              {editingTemplate && (
                <Card
                  className={`${
                    isEditingTemplateMode
                      ? "border-blue-200 bg-blue-50"
                      : "border-green-200 bg-green-50"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <CardTitle
                      className={`text-lg flex items-center gap-2 ${
                        isEditingTemplateMode
                          ? "text-blue-800"
                          : "text-green-800"
                      }`}
                    >
                      <Edit className="w-5 h-5" />
                      {isEditingTemplateMode
                        ? `Editing Template: ${editingTemplate.name}`
                        : `Using Template: ${editingTemplate.name}`}
                    </CardTitle>
                    <p
                      className={`text-sm ${
                        isEditingTemplateMode
                          ? "text-blue-700"
                          : "text-green-700"
                      }`}
                    >
                      {isEditingTemplateMode
                        ? "You are editing an existing template. Make your changes and click 'Save Template' to update it."
                        : "Template has been applied with updated dates. You can modify the settings and create new slots."}
                    </p>
                  </CardHeader>
                </Card>
              )}

              {/* Quick Setup Card */}
              <Card className="border-gray-300 bg-gray-50">
                <CardHeader className="">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-black" />
                    Quick Setup
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Date and Time Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Date Range */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Duration</Label>
                      <Select
                        value={
                          dateRangeType === "months"
                            ? `${dateRangeType}-${monthsCount}`
                            : dateRangeType === "custom"
                            ? "custom-0"
                            : dateRangeType
                        }
                        onValueChange={(value) => {
                          if (value === "today") {
                            setDateRangeType("today");
                            setStartDate(moment().startOf("day").toDate());
                          } else if (value === "tomorrow") {
                            setDateRangeType("tomorrow");
                            setStartDate(
                              moment().add(1, "day").startOf("day").toDate()
                            );
                          } else if (value === "week") {
                            setDateRangeType("week");
                            setStartDate(moment().startOf("day").toDate());
                          } else if (value === "custom-0") {
                            setDateRangeType("custom");
                          } else {
                            const [type, months] = value.split("-");
                            setDateRangeType(type as "months");
                            if (months) setMonthsCount(parseInt(months));
                            setStartDate(moment().startOf("day").toDate());
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="tomorrow">Tomorrow</SelectItem>
                          <SelectItem value="week">Next 1 week</SelectItem>
                          <SelectItem value="months-1">Next 1 month</SelectItem>
                          <SelectItem value="months-2">
                            Next 2 months
                          </SelectItem>
                          <SelectItem value="months-3">
                            Next 3 months
                          </SelectItem>
                          <SelectItem value="months-6">
                            Next 6 months
                          </SelectItem>
                          <SelectItem value="custom-0">Custom dates</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Working Hours */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Working Hours
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={timeSlot.start}
                          onChange={(e) =>
                            updateTimeSlot("start", e.target.value)
                          }
                          className="flex-1"
                        />
                        <span className="text-gray-400">to</span>
                        <Input
                          type="time"
                          value={timeSlot.end}
                          onChange={(e) =>
                            updateTimeSlot("end", e.target.value)
                          }
                          className="flex-1"
                        />
                      </div>
                    </div>

                    {/* Slot Duration */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Slot Duration
                      </Label>
                      <Select
                        value={
                          intervalType === "preset"
                            ? selectedInterval.toString()
                            : "custom"
                        }
                        onValueChange={(value) => {
                          if (value === "custom") {
                            setIntervalType("custom");
                          } else {
                            setSelectedInterval(parseInt(value));
                            setIntervalType("preset");
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 min</SelectItem>
                          <SelectItem value="30">30 min</SelectItem>
                          <SelectItem value="45">45 min</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="90">1.5 hours</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Custom Duration Input */}
                      {intervalType === "custom" && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="1"
                            max="480"
                            value={customInterval}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 1;
                              if (value >= 1 && value <= 480) {
                                setCustomInterval(value);
                              }
                            }}
                            placeholder="Enter minutes"
                            className="flex-1"
                          />
                          <span className="text-sm text-gray-500">minutes</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Custom Date Range */}
                  {dateRangeType === "custom" && (
                    <div className="grid grid-cols-2 gap-4 p-3 bg-white rounded border">
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-600">
                          Start Date
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {startDate
                                ? format(startDate, "MMM dd, yyyy")
                                : "Select start date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={startDate}
                              onSelect={(date) => {
                                if (date) {
                                  setStartDate(date);
                                  // If end date is before new start date, update it
                                  if (endDate <= date) {
                                    setEndDate(
                                      moment(date).add(1, "month").toDate()
                                    );
                                  }
                                }
                              }}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-600">
                          End Date
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {endDate
                                ? format(endDate, "MMM dd, yyyy")
                                : "Select end date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={endDate}
                              onSelect={(date) => {
                                if (date) {
                                  setEndDate(date);
                                }
                              }}
                              disabled={(date) => date < startDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Working Days - Hidden when single day is selected */}
              {!isSingleDay && (
                <Card>
                  <CardHeader className="">
                    <CardTitle className="text-lg">
                      Available Week Days
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-x-2 w-full">
                      {daysOfWeek.map((day) => (
                        <Button
                          key={day.value}
                          variant={
                            workingDays.includes(day.value)
                              ? "default"
                              : "outline"
                          }
                          // size="lg"
                          onClick={() => {
                            if (workingDays.includes(day.value)) {
                              setWorkingDays(
                                workingDays.filter((d) => d !== day.value)
                              );
                            } else {
                              setWorkingDays([...workingDays, day.value]);
                            }
                          }}
                          className={`${
                            workingDays.includes(day.value)
                              ? "bg-black text-white hover:bg-gray-800"
                              : "hover:bg-gray-100 hover:border-gray-400"
                          }`}
                        >
                          {day.label.slice(0, 3)}
                        </Button>
                      ))}
                    </div>
                    {workingDays.length === 0 && (
                      <p className="text-xs text-gray-800 mt-2">
                        Select at least one day
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Single Day Info - Show when single day is selected */}
              {/* {isSingleDay && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader className="">
                    <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
                      <Calendar className="w-5 h-5" />
                      Single Day Selected
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-blue-700">
                      You have selected the same date for start and end ({moment(startDate).format("MMM DD, YYYY")}). 
                      Slots will be created for this specific day regardless of the day of the week.
                    </p>
                  </CardContent>
                </Card>
              )} */}

              {/* Block Dates (Optional) */}
              <Card>
                <CardHeader className="">
                  <CardTitle className="text-lg">
                    Block Dates & Times (Optional)
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Specify holidays, staff leaves, and break times that should
                    be excluded from slot scheduling
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Holidays Section */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Holidays</Label>
                        <span className="text-xs text-gray-500">
                          {clinicUnavailableDates.length} added
                        </span>
                      </div>

                      <div className="flex gap-3">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="flex-1 justify-start text-left font-normal"
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              Select holiday date
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={undefined}
                              onSelect={(date) => {
                                if (date) {
                                  addUnavailableDate(date, "clinic");
                                }
                              }}
                              disabled={(date) => {
                                const dateStr =
                                  moment(date).format("YYYY-MM-DD");
                                const startStr =
                                  moment(startDate).format("YYYY-MM-DD");
                                const endStr =
                                  moment(actualEndDate).format("YYYY-MM-DD");
                                return (
                                  dateStr < startStr ||
                                  dateStr > endStr ||
                                  clinicUnavailableDates.some(
                                    (existingDate) =>
                                      moment(existingDate).format(
                                        "YYYY-MM-DD"
                                      ) === dateStr
                                  )
                                );
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {clinicUnavailableDates.length > 0 && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                          <div className="flex flex-wrap gap-2">
                            {clinicUnavailableDates.map((date, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs cursor-pointer hover:bg-orange-200 border-orange-300 text-orange-700 bg-white"
                                onClick={() =>
                                  removeUnavailableDate(date, "clinic")
                                }
                              >
                                {moment(date).format("MMM DD, YYYY")}
                                <X className="w-3 h-3 ml-2" />
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Staff Leave Section */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">
                          Staff Leave
                        </Label>
                        <span className="text-xs text-gray-500">
                          {doctorLeaveDates.length} added
                        </span>
                      </div>

                      <div className="flex gap-3">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="flex-1 justify-start text-left font-normal"
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              Select leave date
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={undefined}
                              onSelect={(date) => {
                                if (date) {
                                  addUnavailableDate(date, "doctor");
                                }
                              }}
                              disabled={(date) => {
                                const dateStr =
                                  moment(date).format("YYYY-MM-DD");
                                const startStr =
                                  moment(startDate).format("YYYY-MM-DD");
                                const endStr =
                                  moment(actualEndDate).format("YYYY-MM-DD");
                                return (
                                  dateStr < startStr ||
                                  dateStr > endStr ||
                                  doctorLeaveDates.some(
                                    (existingDate) =>
                                      moment(existingDate).format(
                                        "YYYY-MM-DD"
                                      ) === dateStr
                                  )
                                );
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {doctorLeaveDates.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex flex-wrap gap-2">
                            {doctorLeaveDates.map((date, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs cursor-pointer hover:bg-blue-200 border-blue-300 text-blue-700 bg-white"
                                onClick={() =>
                                  removeUnavailableDate(date, "doctor")
                                }
                              >
                                {moment(date).format("MMM DD, YYYY")}
                                <X className="w-3 h-3 ml-2" />
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Breaks Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        Daily Breaks
                      </Label>
                      <span className="text-xs text-gray-500">
                        {breaks.length} break{breaks.length !== 1 ? "s" : ""}{" "}
                        added
                      </span>
                    </div>

                    {/* Add Break Form */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-600">
                            Start Time
                          </Label>
                          <Input
                            type="time"
                            value={newBreak.start}
                            onChange={(e) =>
                              updateNewBreak("start", e.target.value)
                            }
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs text-gray-600">
                            End Time
                          </Label>
                          <Input
                            type="time"
                            value={newBreak.end}
                            onChange={(e) =>
                              updateNewBreak("end", e.target.value)
                            }
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs text-gray-600">
                            Purpose
                          </Label>
                          <Select
                            value={newBreak.purpose}
                            onValueChange={(value) =>
                              updateNewBreak("purpose", value)
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select purpose" />
                            </SelectTrigger>
                            <SelectContent>
                              {breakPurposes.map((purpose) => (
                                <SelectItem
                                  key={purpose.value}
                                  value={purpose.value}
                                >
                                  {purpose.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button
                        onClick={addBreak}
                        size="sm"
                        className="w-full md:w-auto bg-gray-800 hover:bg-gray-900"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Break
                      </Button>
                    </div>

                    {/* Existing Breaks */}
                    {breaks.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="space-y-2">
                          {breaks.map((breakItem, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-white border border-green-300 rounded-md p-2"
                            >
                              <div className="flex items-center gap-3">
                                <div className="text-sm font-medium text-green-800">
                                  {breakItem.start} - {breakItem.end}
                                </div>
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-green-100 text-green-700 border-green-300"
                                >
                                  {breakItem.purpose}
                                </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeBreak(index)}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50 h-6 w-6 p-0"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Summary - Right Column */}
        {showForm && (
          <div className="space-y-4">
            {/* Preview Card */}
            <Card className="w-full border-2 border-gray-300 bg-white">
              <CardHeader>
                <div className="">
                  <CardTitle className="text-xl text-black">
                    Slots Preview
                  </CardTitle>
                </div>
                <p className="text-sm text-gray-600">
                  Review your slot configuration before creating
                </p>
              </CardHeader>
              <CardContent className="space-y-1">
                {/* Schedule Summary */}
                <div className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className=" pb-3 flex gap-2 items-center">
                    <p className="text-sm font-semibold">Total Slots : </p>
                    <p className="font-bold ">
                      {customSlotCount || totalSlots}
                    </p>
                  </div>
                  <h3 className="text-sm font-semibold text-black mb-3">
                    Schedule Details
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                      <span className="text-sm text-gray-600">Period</span>
                      <span className="text-sm font-medium text-black">
                        {moment(startDate).format("MMM DD")} -{" "}
                        {moment(actualEndDate).format("MMM DD")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                      <span className="text-sm text-gray-600">
                        Working Hours
                      </span>
                      <span className="text-sm font-medium text-black">
                        {timeSlot.start} - {timeSlot.end}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                      <span className="text-sm text-gray-600">Duration</span>
                      <span className="text-sm font-medium text-black">
                        {actualInterval} minutes
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 w-full col-span-3">
                      <span className="text-sm text-gray-600">
                        {isSingleDay ? "Selected Date" : "Working Days"}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {isSingleDay ? (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-blue-200 text-blue-800"
                          >
                            {moment(startDate).format("ddd, MMM DD")}
                          </Badge>
                        ) : workingDays.length > 0 ? (
                          workingDays.map((day) => (
                            <Badge
                              key={day}
                              variant="secondary"
                              className="text-xs bg-gray-200 text-black"
                            >
                              {day.toUpperCase()}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm font-medium text-gray-600">
                            None Selected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Restrictions Summary */}
                {(clinicUnavailableDates.length > 0 ||
                  doctorLeaveDates.length > 0 ||
                  breaks.length > 0) && (
                  <div className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200">
                    <h3 className="text-sm font-semibold text-black mb-3">
                      Restrictions
                    </h3>
                    <div className="space-y-2">
                      {clinicUnavailableDates.length > 0 && (
                        <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                          <span className="text-sm text-gray-700">
                            Holidays
                          </span>
                          <Badge className="bg-gray-200 text-black text-xs">
                            {clinicUnavailableDates.length} dates
                          </Badge>
                        </div>
                      )}

                      {doctorLeaveDates.length > 0 && (
                        <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                          <span className="text-sm text-gray-700">
                            Staff Leaves
                          </span>
                          <Badge className="bg-gray-200 text-black text-xs">
                            {doctorLeaveDates.length} dates
                          </Badge>
                        </div>
                      )}

                      {breaks.length > 0 && (
                        <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                          <span className="text-sm text-gray-700">
                            Daily Breaks
                          </span>
                          <Badge className="bg-gray-200 text-black text-xs">
                            {breaks.length} break{breaks.length > 1 ? "s" : ""}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Repeat Pattern */}
                {/* <div className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200">
                  <Label className="text-sm font-semibold text-black mb-3 block">
                    Repeat Pattern
                  </Label>
                  <Select
                    value={recurring}
                    onValueChange={(value: RecurringType) =>
                      setRecurring(value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}

                {/* Action Buttons */}
                <div className="gap-3 pt-4 flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() =>
                      router.push("/dashboard/admin/slots-management")
                    }
                    className=" border-2 border-gray-300 hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </Button>
                  {isEditingTemplateMode ? (
                    <Button onClick={handleSaveTemplate} className="w-full">
                      Save Template
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      className=" bg-black hover:bg-gray-800 text-white font-semibold py-3 text-base shadow-lg"
                      disabled={
                        totalSlots === 0 ||
                        (!isSingleDay && workingDays.length === 0)
                      }
                    >
                      Create {customSlotCount || totalSlots} Slots
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <CreateSlotsConfirmationModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onProceed={handleModalProceed}
        totalSlots={customSlotCount || totalSlots}
        isOpenedViaTemplate={isModalOpenedViaTemplate}
      />

      {/* Delete Template Confirmation Modal */}
      <DeleteTemplateConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        templateName={templateToDelete?.name || ""}
      />
    </div>
  );
}
