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
import { useState } from "react";
import moment from "moment";
import { Medication } from "@/types/doctor.types";
import { useAuthInfo } from "@/hooks/useAuthInfo";
import { toast } from "sonner";
import { reminderForMedication } from "@/services/receptionist.api";

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
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [frequencyPerDay, setFrequencyPerDay] = useState<string>("");
  const [reminderTime, setReminderTime] = useState<string>("");

  const handleSaveReminder = async () => {
    const payload = {
      patient_id: patientId,
      medication_request_id: medication?.medication_request_id || "",
      medication_id: medication?.id || "",
      reminder_time: reminderTime,
      start_date: startDate,
      end_date: endDate,
      frequency_per_day: frequencyPerDay,
      created_by_id: userId || "",
      creator_role: role || "receptionist",
    };

    console.log("Medication Reminder Data:", payload);
    try {
      await reminderForMedication(payload);
      toast.success("Medication reminder set successfully.");
    } catch {
      toast.error("Something went wrong while saving the reminder.");
    }
    // Here you can dispatch to Redux store or call API
    // Reset form
    setStartDate("");
    setEndDate("");
    setFrequencyPerDay("");
    setReminderTime("");
    onOpenChange(false);
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

  const frequencyOptions = [
    { value: "1", label: "Once a day" },
    { value: "2", label: "Twice a day" },
    { value: "3", label: "Three times a day" },
    { value: "4", label: "Four times a day" },
    { value: "6", label: "Six times a day" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">
            Set Medication Reminder
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
          <div className="space-y-2">
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
          </div>

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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveReminder}
            disabled={
              !startDate || !endDate || !frequencyPerDay || !reminderTime
            }
          >
            Set Reminder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
