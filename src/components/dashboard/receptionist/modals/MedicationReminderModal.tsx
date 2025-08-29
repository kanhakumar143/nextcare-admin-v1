"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Clock } from "lucide-react";
import { useState, useEffect } from "react";
import moment from "moment";
import { Medication } from "@/types/doctor.types";
import { useAuthInfo } from "@/hooks/useAuthInfo";
import { toast } from "sonner";
import {
  reminderForMedication,
  editMedicationReminders,
} from "@/services/receptionist.api";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { clearEditingMedicationReminder } from "@/store/slices/receptionistSlice";

interface MedicationReminderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medication: Medication | null;
  patientId: string;
}

export default function MedicationReminderModal({
  open,
  onOpenChange,
  medication,
  patientId,
}: MedicationReminderModalProps) {
  const { role, userId } = useAuthInfo();
  const dispatch = useDispatch();
  const { editingMedicationReminder } = useSelector(
    (state: RootState) => state.receptionistData
  );

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [frequencyPerDay, setFrequencyPerDay] = useState<string>("");
  const [reminderTime, setReminderTime] = useState<string>("");

  const isEditMode = !!editingMedicationReminder;

  // Pre-fill form data when editing
  useEffect(() => {
    if (isEditMode && editingMedicationReminder) {
      setStartDate(editingMedicationReminder.start_date || "");
      setEndDate(editingMedicationReminder.end_date || "");
      setFrequencyPerDay(
        editingMedicationReminder.frequency_per_day?.toString() || ""
      );

      // Convert reminder_time from HH:mm:ss format to HH:mm format for the Select component
      const reminderTimeValue = editingMedicationReminder.reminder_time;
      if (reminderTimeValue) {
        // If the time includes seconds, remove them
        const timeWithoutSeconds = reminderTimeValue.includes(":")
          ? reminderTimeValue.substring(0, 5) // Get HH:mm part only
          : reminderTimeValue;
        setReminderTime(timeWithoutSeconds);
      } else {
        setReminderTime("");
      }
    } else {
      // Clear form when creating new reminder
      setStartDate("");
      setEndDate("");
      setFrequencyPerDay("");
      setReminderTime("");
    }
  }, [isEditMode, editingMedicationReminder, open]);

  const handleModalClose = () => {
    // Reset form and clear editing state
    setStartDate("");
    setEndDate("");
    setFrequencyPerDay("");
    setReminderTime("");
    dispatch(clearEditingMedicationReminder());
    onOpenChange(false);
  };

  const handleSaveReminder = async () => {
    // Convert reminder time to include seconds if needed (API might expect HH:mm:ss format)
    const reminderTimeWithSeconds =
      reminderTime.includes(":") && reminderTime.split(":").length === 2
        ? `${reminderTime}:00`
        : reminderTime;

    if (isEditMode && editingMedicationReminder) {
      // Update existing reminder
      const updatePayload = {
        id: editingMedicationReminder.id,
        reminder_time: reminderTimeWithSeconds,
        start_date: startDate,
        end_date: endDate,
        frequency_per_day: parseInt(frequencyPerDay) || 1,
      };

      console.log("Updating Medication Reminder:", updatePayload);
      try {
        await editMedicationReminders(updatePayload);
        toast.success("Medication reminder updated successfully.");
      } catch {
        toast.error("Something went wrong while updating the reminder.");
      }
    } else {
      // Create new reminder
      const payload = {
        patient_id: patientId,
        medication_request_id: medication?.medication_request_id || "",
        medication_id: medication?.id || "",
        reminder_time: reminderTimeWithSeconds,
        start_date: startDate,
        end_date: endDate,
        frequency_per_day: 1,
        created_by_id: userId || "",
        creator_role: role || "receptionist",
      };

      console.log("Creating Medication Reminder:", payload);
      try {
        await reminderForMedication(payload);
        toast.success("Medication reminder set successfully.");
      } catch {
        toast.error("Something went wrong while saving the reminder.");
      }
    }

    // Reset form and close modal
    handleModalClose();
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        const displayTime = moment().hour(hour).minute(minute).format("h:mm A");
        times.push({ value: timeString, display: displayTime });
      }
    }
    return times;
  };

  // Add debugging to see the actual reminder time value
  useEffect(() => {
    if (isEditMode && editingMedicationReminder) {
      console.log("Editing Medication Reminder:", editingMedicationReminder);
      console.log(
        "Original reminder_time:",
        editingMedicationReminder.reminder_time
      );
      console.log("Processed reminder_time:", reminderTime);
    }
  }, [isEditMode, editingMedicationReminder, reminderTime]);

  const frequencyOptions = [
    { value: "1", label: "Once a day" },
    { value: "2", label: "Twice a day" },
    { value: "3", label: "Three times a day" },
    { value: "4", label: "Four times a day" },
    { value: "6", label: "Six times a day" },
  ];

  return (
    <Dialog open={open} onOpenChange={handleModalClose}>
      <DialogContent className="sm:max-w-lg rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">
            {isEditMode
              ? "Edit Medication Reminder"
              : "Set Medication Reminder"}
          </DialogTitle>
          {medication && (
            <div className="text-sm text-gray-600 mt-2">
              <span className="font-medium">{medication.name}</span> -{" "}
              {medication.strength}
            </div>
          )}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="start-date" className="text-sm font-medium">
              Start Date
            </Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={moment().format("YYYY-MM-DD")}
              className="w-full"
            />
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label htmlFor="end-date" className="text-sm font-medium">
              End Date
            </Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || moment().format("YYYY-MM-DD")}
              className="w-full"
            />
          </div>

          {/* Frequency per Day */}
          {/* <div className="space-y-2">
            <Label htmlFor="frequency" className="text-sm font-medium">
              Frequency per Day
            </Label>
            <Select value={frequencyPerDay} onValueChange={setFrequencyPerDay}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select frequency per day" />
              </SelectTrigger>
              <SelectContent>
                {frequencyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}

          {/* Reminder Time */}
          <div className="space-y-2">
            <Label htmlFor="reminder-time" className="text-sm font-medium">
              Reminder Time
            </Label>
            <Select value={reminderTime} onValueChange={setReminderTime}>
              <SelectTrigger className="w-full">
                <Clock className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select reminder time" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {generateTimeOptions().map((time) => (
                  <SelectItem key={time.value} value={time.value}>
                    {time.display}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleModalClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveReminder}
            disabled={!startDate || !endDate || !reminderTime}
          >
            {isEditMode ? "Update Reminder" : "Set Reminder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
