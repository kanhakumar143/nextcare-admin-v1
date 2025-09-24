"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  ChevronDown,
  User,
  Stethoscope,
  Calendar,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ExtendedDoctorData } from "@/types/admin.types";
import { Schedule, Slot } from "@/types/scheduleSlots.types";
import { AppointmentBookingPayload } from "@/types/receptionist.types";
import { getPractitionerByRole } from "@/services/admin.api";
import { getAllSchedulesByPractitioner } from "@/services/availabilityTemplate.api";
import { toast } from "sonner";
import moment from "moment";
import BackButton from "@/components/common/BackButton";
import { bookAppointmentWalkInByClinic } from "@/services/receptionist.api";

export default function SelectDoctorAndBookAppointment() {
  const params = useParams();
  const patientId = params?.patient_id as string;

  const [doctors, setDoctors] = useState<ExtendedDoctorData[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Fetch doctors function (similar to DoctorManagement)
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await getPractitionerByRole("doctor");
      const data = (res?.data || []).map((doc: any) => ({
        ...doc,
        name: doc.user?.name || doc.name,
      }));

      // Filter only active doctors
      const activeDoctors = data.filter(
        (doctor: ExtendedDoctorData) => doctor.is_active
      );
      setDoctors(activeDoctors);
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
      toast.error("Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    console.log("URL Params:", params);
    console.log("Extracted Patient ID:", patientId);
  }, [params, patientId]);

  // Fetch schedules for selected doctor
  const fetchSchedules = async (practitionerId: string) => {
    setLoadingSchedules(true);
    try {
      const response = await getAllSchedulesByPractitioner(practitionerId);
      console.log("API Response:", response);

      setSchedules(response);
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
      toast.error("Failed to fetch available slots");
      setSchedules([]);
    } finally {
      setLoadingSchedules(false);
    }
  };

  const handleDoctorSelect = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setSelectedSlotId(""); // Reset selected slot when doctor changes
    setSchedules([]); // Reset schedules
    setSelectedDate(""); // Reset selected date when doctor changes

    // Find the selected doctor and console log the practitioner_id
    const selectedDoctor = doctors.find((doctor) => doctor.id === doctorId);
    if (selectedDoctor) {
      console.log(
        "Selected Doctor Practitioner ID:",
        selectedDoctor.practitioner_display_id
      );
      console.log("Selected Doctor Full Data:", selectedDoctor);

      // Fetch schedules for the selected doctor
      fetchSchedules(doctorId);
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedSlotId(""); // Reset selected slot when date changes
  };

  const handleSlotSelect = (slotId: string) => {
    setSelectedSlotId(slotId === selectedSlotId ? "" : slotId); // Toggle selection
  };

  // Book Appointment function
  const handleBookAppointment = async () => {
    // Find the selected slot for additional info
    const selectedSlot = schedules
      .flatMap((schedule) => schedule.slots)
      .find((slot) => slot.id === selectedSlotId);

    if (!selectedSlot || !selectedDoctor || !selectedDate) {
      toast.error("Missing required information for booking");
      return;
    }

    // Create the appointment booking payload
    const appointmentBookingData: AppointmentBookingPayload = {
      step_count: 3,
      patient_id: patientId || "",
      status: "booked",
      description: `${selectedDate}, ${selectedSlot.start} - ${selectedSlot.end}`,
      participants: [
        {
          actor_reference: selectedDoctor.practitioner_display_id || "",
          status: "accepted",
        },
      ],
      class_concept: {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/encounter-class",
            code: "outpatient",
            display: "Outpatient",
          },
        ],
        text: "Outpatient",
      },
      slot_id: selectedSlotId,
      specialty_id: selectedDoctor.service_specialty_id || "",
      service_category: [
        {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/service-category",
              code: "",
              display:
                selectedDoctor.service_specialty?.display || "General Checkup",
            },
          ],
          text: selectedDoctor.service_specialty?.display || "General Practice",
        },
      ],
      sub_service_ids: ["14efe907-fd93-4092-8e74-b2875825f2d4"], // Example: General Consultation keep this dynamic later
      trigger_type: "on_booking",
    };

    try {
      await bookAppointmentWalkInByClinic(appointmentBookingData);
      toast.success("Appointment booking has been done successfully!");
    } catch {
      toast.error("Failed to book appointment. Please try again.");
    }
  };

  const selectedDoctor = doctors.find(
    (doctor) => doctor.id === selectedDoctorId
  );

  // Group schedules by date
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

  // Get available dates for dropdown
  const getAvailableDates = () => {
    const groupedSchedules = groupSchedulesByDate();
    const dates = Object.keys(groupedSchedules).sort();

    return dates.map((date) => ({
      value: date,
      label: `${formatDayName(date)} - ${formatDate(date)}`,
      schedulesCount: groupedSchedules[date].reduce(
        (count, schedule) => count + schedule.slots.length,
        0
      ),
      availableSlotsCount: groupedSchedules[date].reduce(
        (count, schedule) =>
          count + schedule.slots.filter((slot) => !slot.overbooked).length,
        0
      ),
    }));
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

  const groupedSchedules = groupSchedulesByDate();
  const availableDates = getAvailableDates();
  const selectedDateSchedules = selectedDate
    ? groupedSchedules[selectedDate] || []
    : [];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <BackButton />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Select Doctor & Book Appointment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Doctor Selection Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="doctor-select" className="text-sm font-medium">
              Select Doctor
            </Label>
            <Select
              value={selectedDoctorId}
              onValueChange={handleDoctorSelect}
              disabled={loading}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    loading ? "Loading doctors..." : "Choose a doctor"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    <div className="flex flex-col w-full">
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">{doctor.name}</span>
                        <Badge variant="secondary" className="ml-2">
                          {doctor.service_specialty?.display ||
                            "General Practice"}
                        </Badge>
                      </div>
                    </div>
                  </SelectItem>
                ))}
                {doctors.length === 0 && !loading && (
                  <SelectItem value="no-doctors" disabled>
                    No active doctors available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Date Selection Dropdown - Only show when doctor is selected and schedules are loaded */}
          {selectedDoctorId && schedules.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="date-select" className="text-sm font-medium">
                Select Available Date
              </Label>
              <Select
                value={selectedDate}
                onValueChange={handleDateSelect}
                disabled={loadingSchedules}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose an available date" />
                </SelectTrigger>
                <SelectContent>
                  {availableDates.map((dateOption) => (
                    <SelectItem key={dateOption.value} value={dateOption.value}>
                      <div className="flex flex-col w-full">
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">
                            {dateOption.label}
                          </span>
                          <div className="flex gap-2 ml-2">
                            <Badge variant="outline" className="text-xs">
                              {dateOption.availableSlotsCount} available
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {dateOption.schedulesCount} total
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                  {availableDates.length === 0 && (
                    <SelectItem value="no-dates" disabled>
                      No available dates found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Slots Section */}
      {selectedDoctorId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Available Slots for {selectedDoctor?.name}
                {selectedDate && (
                  <span className="text-sm font-normal text-muted-foreground">
                    • {formatDayName(selectedDate)}
                  </span>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                {schedules.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {availableDates.length} date(s) available
                  </Badge>
                )}
                {selectedSlotId && (
                  <Badge variant="outline" className="w-fit">
                    <CheckCircle2 className="w-4 h-4 mr-1" />1 slot selected
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingSchedules ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">
                  Loading available slots...
                </div>
              </div>
            ) : schedules.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No available slots found for this doctor
                  </p>
                </div>
              </div>
            ) : !selectedDate ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Please select a date to view available slots
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {availableDates.length} date(s) available
                  </p>
                </div>
              </div>
            ) : selectedDateSchedules.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No slots found for selected date
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-semibold">
                      {formatDayName(selectedDate)} - {formatDate(selectedDate)}
                    </h3>
                    <Badge variant="outline" className="ml-2">
                      {selectedDateSchedules.reduce(
                        (count, schedule) =>
                          count +
                          schedule.slots.filter((slot) => !slot.overbooked)
                            .length,
                        0
                      )}{" "}
                      available slots
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedDateSchedules.map((schedule) =>
                      schedule.slots.map((slot) => (
                        <div
                          key={slot.id}
                          className={`border rounded-md p-3 cursor-pointer transition-all duration-200 ${
                            slot.overbooked
                              ? "bg-red-50 border-red-200 cursor-not-allowed opacity-60"
                              : selectedSlotId === slot.id
                              ? "bg-blue-50 border-blue-300 shadow-md"
                              : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                          }`}
                          onClick={() =>
                            !slot.overbooked && handleSlotSelect(slot.id)
                          }
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={selectedSlotId === slot.id}
                                disabled={slot.overbooked}
                                className={slot.overbooked ? "opacity-50" : ""}
                              />
                              <div className="flex items-center gap-1 text-sm">
                                <Clock className="w-3 h-3" />
                                <span className="font-medium">
                                  {formatTime(slot.start)} -{" "}
                                  {formatTime(slot.end)}
                                </span>
                              </div>
                            </div>

                            <Badge
                              variant={
                                slot.overbooked ? "destructive" : "secondary"
                              }
                              className="text-xs"
                            >
                              {slot.overbooked ? "Booked" : "Available"}
                            </Badge>
                          </div>

                          {slot.comment && (
                            <p className="text-xs text-muted-foreground mt-2 truncate">
                              {slot.comment}
                            </p>
                          )}

                          {slot.overbooked &&
                            slot.appointments?.[0]?.patient?.user?.name && (
                              <p className="text-xs text-red-600 mt-1">
                                Patient:{" "}
                                {slot.appointments[0].patient.user.name}
                              </p>
                            )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <div className="flex w-full justify-end gap-4 items-center px-6">
            <Button
              disabled={!selectedDoctorId || !selectedDate || !selectedSlotId}
              onClick={handleBookAppointment}
              className=""
            >
              Book Appointment
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
