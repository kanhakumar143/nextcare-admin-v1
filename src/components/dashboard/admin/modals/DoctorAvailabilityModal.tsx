"use client";

import React, { useState, useEffect } from "react";
import { Calendar, CalendarDays, Clock, X, Save } from "lucide-react";
import moment from "moment";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";
import SaveTemplateModal from "./SaveTemplateModal";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { setFormData } from "@/store/slices/availabilityTemplateSlice";

interface DoctorAvailabilityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctorId: string;
  doctorName: string;
}

interface TimeSlot {
  start: string;
  end: string;
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

export default function DoctorAvailabilityModal({
  open,
  onOpenChange,
  doctorId,
  doctorName,
}: DoctorAvailabilityModalProps) {
  // Date range settings
  const [dateRangeType, setDateRangeType] = useState<"months" | "custom">(
    "months"
  );
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
  const [customInterval, setCustomInterval] = useState(30);

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
  const [customSlotCount, setCustomSlotCount] = useState<number | null>(null);
  const [hasUserEditedSlots, setHasUserEditedSlots] = useState(false);

  // Unavailable dates
  const [clinicUnavailableDates, setClinicUnavailableDates] = useState<Date[]>(
    []
  );
  const [doctorLeaveDates, setDoctorLeaveDates] = useState<Date[]>([]);

  // Template modal state
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  // Calculated values
  const actualInterval =
    intervalType === "preset" ? selectedInterval : customInterval;
  const actualEndDate =
    dateRangeType === "months"
      ? moment(startDate).add(monthsCount, "months").toDate()
      : endDate;

  // Helper functions for date input
  const formatDateForInput = (date: Date): string => {
    return moment(date).format("YYYY-MM-DD");
  };

  const handleStartDateChange = (value: string) => {
    const newDate = new Date(value);
    setStartDate(newDate);
    // If end date is before new start date, update it
    if (endDate <= newDate) {
      setEndDate(moment(newDate).add(1, "month").toDate());
    }
  };

  const handleEndDateChange = (value: string) => {
    setEndDate(new Date(value));
  };

  const addUnavailableDateFromInput = (
    value: string,
    type: "clinic" | "doctor"
  ) => {
    if (!value) return;
    const date = new Date(value);
    addUnavailableDate(date, type);
  };

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

      // Calculate total days (excluding weekends and unavailable dates)
      const timeDiff = actualEndDate.getTime() - startDate.getTime();
      const totalDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

      // Calculate working days based on selected days (instead of default 5/7)
      const workingDaysCount = workingDays.length;
      const workingDaysRatio = workingDaysCount / 7; // Ratio of working days per week
      const estimatedWorkingDays = Math.floor(totalDays * workingDaysRatio);

      // Subtract unavailable dates
      const unavailableDays =
        clinicUnavailableDates.length + doctorLeaveDates.length;
      const availableDays = Math.max(0, estimatedWorkingDays - unavailableDays);

      const total = Math.max(0, slotsPerDay * availableDays);
      setTotalSlots(total);

      // Only set customSlotCount automatically if user hasn't manually edited it
      if (!hasUserEditedSlots) {
        setCustomSlotCount(total);
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

    if (workingDays.length === 0) {
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

    // Prepare data for submission
    const availabilityData = {
      doctorId,
      dateRange: {
        start: startDate,
        end: actualEndDate,
      },
      timeSlot,
      interval: actualInterval,
      recurring,
      totalSlots: customSlotCount || totalSlots,
      unavailableDates: {
        clinic: clinicUnavailableDates,
        doctor: doctorLeaveDates,
      },
    };

    console.log("Availability Data:", availabilityData);

    // Here you would typically call an API to save the availability
    toast.success(
      `Successfully created ${
        customSlotCount || totalSlots
      } availability slots for Dr. ${doctorName}!`
    );
    onOpenChange(false);
  };

  const resetForm = () => {
    setDateRangeType("months");
    setMonthsCount(3);
    setStartDate(new Date());
    setEndDate(moment().add(3, "months").toDate());
    setTimeSlot({ start: "09:00", end: "17:00" });
    setIntervalType("preset");
    setSelectedInterval(30);
    setCustomInterval(30);
    setRecurring("weekly");
    setWorkingDays(["mon", "tue", "wed", "thu", "fri"]);
    setCustomSlotCount(null);
    setHasUserEditedSlots(false); // Reset the edit flag
    setClinicUnavailableDates([]);
    setDoctorLeaveDates([]);
  };

  const getCurrentTemplateData = () => {
    return {
      dateRangeType,
      monthsCount,
      startDate,
      endDate: actualEndDate,
      timeSlot,
      intervalType,
      selectedInterval,
      customInterval,
      recurring,
      workingDays,
      totalSlots,
      customSlotCount,
      clinicUnavailableDates,
      doctorLeaveDates,
    };
  };

  const handleSaveAsTemplate = () => {
    const currentData = getCurrentTemplateData();
    dispatch(setFormData(currentData));
    setShowSaveTemplateModal(true);
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
              <Calendar className="w-6 h-6" />
              Set Availability for Dr. {doctorName}
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveAsTemplate}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Add as Template
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Date Range Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Date Range</h3>

              <div className="flex space-x-2">
                <Button
                  variant={dateRangeType === "months" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDateRangeType("months")}
                  className="flex-1"
                >
                  Months from today
                </Button>
                <Button
                  variant={dateRangeType === "custom" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDateRangeType("custom")}
                  className="flex-1"
                >
                  Custom date range
                </Button>
              </div>

              {dateRangeType === "months" ? (
                <div className="flex items-center space-x-3 pl-6">
                  <Label htmlFor="monthsCount" className="text-sm">
                    Months:
                  </Label>
                  <Select
                    value={monthsCount.toString()}
                    onValueChange={(value) => setMonthsCount(parseInt(value))}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 12].map((month) => (
                        <SelectItem key={month} value={month.toString()}>
                          {month} {month === 1 ? "month" : "months"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-xs text-muted-foreground">
                    Until{" "}
                    {moment(startDate)
                      .add(monthsCount, "months")
                      .format("MMM DD, YYYY")}
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 pl-6">
                  <div className="space-y-2">
                    <Label className="text-sm">Start Date</Label>
                    <Input
                      type="date"
                      value={formatDateForInput(startDate)}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      min={formatDateForInput(new Date())}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">End Date</Label>
                    <Input
                      type="date"
                      value={formatDateForInput(endDate)}
                      onChange={(e) => handleEndDateChange(e.target.value)}
                      min={formatDateForInput(startDate)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Working Hours Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">
                Working Hours
              </h3>
              <p className="text-sm text-muted-foreground">
                Set the daily working hours. All appointment slots will be
                created within this time range.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Start Time</Label>
                  <Input
                    type="time"
                    value={timeSlot.start}
                    onChange={(e) => updateTimeSlot("start", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">End Time</Label>
                  <Input
                    type="time"
                    value={timeSlot.end}
                    onChange={(e) => updateTimeSlot("end", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Interval Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">
                Appointment Intervals
              </h3>

              <div className="flex space-x-2">
                <Button
                  variant={intervalType === "preset" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIntervalType("preset")}
                  className="flex-1"
                >
                  Preset intervals
                </Button>
                <Button
                  variant={intervalType === "custom" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIntervalType("custom")}
                  className="flex-1"
                >
                  Custom interval
                </Button>
              </div>

              {intervalType === "preset" ? (
                <div className="flex items-center space-x-3 pl-6">
                  <Label className="text-sm">Interval:</Label>
                  <Select
                    value={selectedInterval.toString()}
                    onValueChange={(value) =>
                      setSelectedInterval(parseInt(value))
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="flex items-center space-x-3 pl-6">
                  <Label className="text-sm">Custom (minutes):</Label>
                  <Input
                    type="number"
                    min="5"
                    max="480"
                    value={customInterval}
                    onChange={(e) =>
                      setCustomInterval(parseInt(e.target.value) || 30)
                    }
                    className="w-24"
                  />
                </div>
              )}
            </div>

            {/* Recurring Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">
                Recurring Pattern
              </h3>
              <p className="text-sm text-muted-foreground">
                Set how frequently the availability slots should repeat.
              </p>

              <div className="flex items-center space-x-3 pl-6">
                <Label className="text-sm">Repeat:</Label>
                <Select
                  value={recurring}
                  onValueChange={(value: RecurringType) => setRecurring(value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Working Days Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">
                Working Days
              </h3>
              <p className="text-sm text-muted-foreground">
                Select the days of the week when you will be available.
              </p>

              <div className="grid grid-cols-2 gap-3 pl-6">
                {daysOfWeek.map((day) => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={day.value}
                      checked={workingDays.includes(day.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setWorkingDays([...workingDays, day.value]);
                        } else {
                          setWorkingDays(
                            workingDays.filter((d) => d !== day.value)
                          );
                        }
                      }}
                    />
                    <Label htmlFor={day.value} className="text-sm">
                      {day.label}
                    </Label>
                  </div>
                ))}
              </div>

              {workingDays.length === 0 && (
                <p className="text-xs text-red-500 pl-6">
                  Please select at least one working day.
                </p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Slot Configuration Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">
                Configuration Summary
              </h3>

              <div className="space-y-3 border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Date Range:
                  </span>
                  <span className="text-sm font-medium">
                    {moment(startDate).format("MMM DD")} -{" "}
                    {moment(actualEndDate).format("MMM DD, YYYY")}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Working Hours:
                  </span>
                  <span className="text-sm font-medium">
                    {timeSlot.start} - {timeSlot.end}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Interval:
                  </span>
                  <span className="text-sm font-medium">
                    {actualInterval} minutes
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Recurring:
                  </span>
                  <span className="text-sm font-medium capitalize">
                    {recurring}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Working Days:
                  </span>
                  <span className="text-sm font-medium">
                    {workingDays.length > 0
                      ? workingDays
                          .map(
                            (day) => day.charAt(0).toUpperCase() + day.slice(1)
                          )
                          .join(", ")
                      : "None selected"}
                  </span>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Calculated Slots:
                    </span>
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      {totalSlots}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">
                  Override slot count (optional):
                </Label>
                <Input
                  type="number"
                  min="1"
                  max={totalSlots}
                  value={customSlotCount || ""}
                  onChange={(e) => {
                    setHasUserEditedSlots(true); // Mark as user-edited
                    const value = parseInt(e.target.value);
                    if (!e.target.value) {
                      setCustomSlotCount(null);
                    } else if (value <= totalSlots && value > 0) {
                      setCustomSlotCount(value);
                    } else if (value > totalSlots) {
                      // If user tries to enter more than calculated slots, set to max
                      setCustomSlotCount(totalSlots);
                      toast.error(`Maximum slots allowed: ${totalSlots}`);
                    }
                  }}
                  placeholder={totalSlots.toString()}
                  className="w-32"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum: {totalSlots} slots (auto-calculated value)
                </p>
              </div>
            </div>

            {/* Unavailable Dates Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">
                Unavailable Dates
              </h3>

              <div className="space-y-6">
                {/* Clinic Unavailable Dates */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Clinic Holidays
                    </Label>
                    <Input
                      type="date"
                      min={formatDateForInput(startDate)}
                      max={formatDateForInput(actualEndDate)}
                      placeholder="Select date"
                      className="w-40"
                      onChange={(e) => {
                        if (e.target.value) {
                          addUnavailableDateFromInput(e.target.value, "clinic");
                          e.target.value = "";
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-2 max-h-32 overflow-y-auto border rounded-lg p-2">
                    {clinicUnavailableDates.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        No clinic holidays added
                      </p>
                    ) : (
                      clinicUnavailableDates.map((date, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm">
                            {moment(date).format("YYYY-MM-DD")}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeUnavailableDate(date, "clinic")
                            }
                            className="h-6 w-6 p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Doctor Leave Dates */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Doctor Leave Dates
                    </Label>
                    <Input
                      type="date"
                      min={formatDateForInput(startDate)}
                      max={formatDateForInput(actualEndDate)}
                      placeholder="Select date"
                      className="w-40"
                      onChange={(e) => {
                        if (e.target.value) {
                          addUnavailableDateFromInput(e.target.value, "doctor");
                          e.target.value = "";
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-2 max-h-32 overflow-y-auto border rounded-lg p-2">
                    {doctorLeaveDates.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        No leave dates added
                      </p>
                    ) : (
                      doctorLeaveDates.map((date, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm">
                            {moment(date).format("YYYY-MM-DD")}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeUnavailableDate(date, "doctor")
                            }
                            className="h-6 w-6 p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 px-6 pb-6 border-t pt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-black text-white hover:bg-gray-800"
          >
            Create Availability Slots
          </Button>
        </div>

        {/* Save Template Modal */}
        <SaveTemplateModal
          open={showSaveTemplateModal}
          onOpenChange={setShowSaveTemplateModal}
        />
      </DialogContent>
    </Dialog>
  );
}
