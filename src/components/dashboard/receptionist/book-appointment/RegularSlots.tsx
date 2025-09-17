"use client";

import React, { useState, useEffect } from "react";
import { Loader2, AlertCircle, Calendar, Clock } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import { AppDispatch, RootState } from "@/store";
import {
  fetchRegularSlotsAsync,
  setBookingData,
  clearRegularSlotsData,
} from "@/store/slices/bookingSlice";
import {
  SimplifiedRegularSlotsResponse,
  SimpleSlot,
  SimpleSchedule,
  AvailableSlot,
  ReferralData,
} from "@/types/receptionist.types";

const RegularSlots: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { referallId } = useParams();
  const referralId = (referallId as string) || "";

  const { regularSlotsData, regularSlotsLoading, regularSlotsError } =
    useSelector((state: RootState) => state.booking);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSchedule, setSelectedSchedule] =
    useState<SimpleSchedule | null>(null);

  useEffect(() => {
    if (referralId) {
      dispatch(fetchRegularSlotsAsync(referralId));
    }

    // Cleanup when component unmounts
    return () => {
      dispatch(clearRegularSlotsData());
    };
  }, [referralId, dispatch]);

  useEffect(() => {
    // Auto-select first available date when data loads
    if (regularSlotsData?.schedules && regularSlotsData.schedules.length > 0) {
      const firstSchedule = regularSlotsData.schedules[0];
      const firstDate = new Date(firstSchedule.planning_start).toDateString();
      setSelectedDate(firstDate);
      setSelectedSchedule(firstSchedule);
    }
  }, [regularSlotsData]);

  const handleBookSlot = (slot: SimpleSlot) => {
    if (!regularSlotsData || !selectedSchedule) return;

    // Convert SimpleSlot to AvailableSlot format for Redux compatibility
    const availableSlot: AvailableSlot = {
      slot_id: slot.id,
      start: slot.start,
      end: slot.end,
      schedule_id: selectedSchedule.id,
      practitioner_id: selectedSchedule.practitioner_id,
      schedule_panning_start: selectedSchedule.planning_start,
      schedule_planning_end: selectedSchedule.planning_end,
      rule_score: 1.0,
      predicted_wait_time: 15,
      cancellation_risk: 0.1,
      final_score: 1.0,
      reason: ["Regular slot booking"],
    };

    // Convert SimplifiedRegularSlotsResponse to ReferralData format
    const referralData: ReferralData = {
      referral: {
        id: referralId,
        reason: regularSlotsData.reason,
        status: regularSlotsData.status,
        patient: {
          id: regularSlotsData.patient.id,
          patient_display_id: regularSlotsData.patient.patient_display_id,
          gender: regularSlotsData.patient.gender,
          birth_date: regularSlotsData.patient.birth_date,
          user: {
            id: regularSlotsData.patient.user.id,
            name: regularSlotsData.patient.user.name,
            email: regularSlotsData.patient.user.email,
            phone: regularSlotsData.patient.user.phone || "",
          },
        },
        practitioner: {
          practitioner_display_id:
            regularSlotsData.practitioner.practitioner_display_id,
          name: {
            text: regularSlotsData.practitioner.name.text,
            prefix: regularSlotsData.practitioner.name.prefix,
          },
        },
        service_specialty: {
          id: regularSlotsData.service_specialty.id,
          display: regularSlotsData.service_specialty.display,
          specialty_label: regularSlotsData.service_specialty.specialty_label,
          description: regularSlotsData.service_specialty.description,
        },
      },
      available_slots: [availableSlot],
      scoring_basis: {
        rule_based: "Regular booking - schedule based",
        ml_prediction: "N/A",
        final_score: "1.0",
        reasons: "Regular appointment slot selection",
      },
      sub_services: regularSlotsData.sub_services,
    };
    // Store the selected slot and referral data in Redux
    dispatch(setBookingData({ slot: availableSlot, referralData }));

    // Navigate to the booking confirmation page
    router.push("/dashboard/receptionist/book-appointment/confirm");
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "free":
        return "bg-green-100 text-green-800 border-green-200";
      case "booked":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getAvailableDates = () => {
    if (!regularSlotsData?.schedules) return [];

    return regularSlotsData.schedules.map((schedule) => {
      const date = new Date(schedule.planning_start);
      return {
        dateString: date.toDateString(),
        displayDate: date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        schedule: schedule,
        freeSlots: schedule.slots.filter((slot) => slot.status === "free")
          .length,
      };
    });
  };

  if (regularSlotsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (regularSlotsError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{regularSlotsError}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!regularSlotsData) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const availableDates = getAvailableDates();

  return (
    <div className="space-y-6">
      {/* Patient & Referral Info */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 sm:p-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              {regularSlotsData.patient.user.name}
            </h2>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Patient ID:</span>{" "}
                {regularSlotsData.patient.patient_display_id}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Specialty:</span>{" "}
                {regularSlotsData.service_specialty.specialty_label}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Referral Reason:</span>{" "}
                {regularSlotsData.reason}
              </p>
            </div>
          </div>
          <div className="lg:text-right">
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Doctor:</span>{" "}
                {regularSlotsData.practitioner.name.text}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Status:</span>{" "}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {regularSlotsData.status}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Date Selection Calendar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 justify-center sm:justify-start">
          <Calendar className="h-5 w-5" />
          Available Appointment Dates
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {availableDates.map((dateInfo, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedDate(dateInfo.dateString);
                setSelectedSchedule(dateInfo.schedule);
              }}
              className={`p-3 rounded-lg border-2 transition-all duration-200 text-center touch-manipulation ${
                selectedDate === dateInfo.dateString
                  ? "border-black bg-gray-50 text-black"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100"
              }`}
            >
              <div className="text-sm font-medium">{dateInfo.displayDate}</div>
              <div className="text-xs text-gray-500 mt-1">
                {dateInfo.freeSlots} slots available
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Time Slots for Selected Date */}
      {selectedSchedule && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 justify-center sm:justify-start">
            <Clock className="h-5 w-5" />
            Available Time Slots for {selectedDate}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
            {selectedSchedule.slots
              .filter((slot) => slot.status === "free")
              .map((slot, index) => {
                const startDateTime = formatDateTime(slot.start);
                const endDateTime = formatDateTime(slot.end);

                return (
                  <div
                    key={slot.id}
                    className="bg-white rounded-lg border-2 border-gray-200 p-3 transition-all duration-200 hover:shadow-md hover:border-gray-400 touch-manipulation"
                  >
                    <div className="text-center mb-3">
                      <p className="text-sm font-semibold text-black">
                        {startDateTime.time}
                      </p>
                      <p className="text-xs text-gray-500">
                        to {endDateTime.time}
                      </p>
                    </div>

                    <div className="mb-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium w-full justify-center ${getStatusColor(
                          slot.status
                        )}`}
                      >
                        {slot.status.charAt(0).toUpperCase() +
                          slot.status.slice(1)}
                      </span>
                    </div>

                    {slot.overbooked && (
                      <p className="text-xs text-orange-600 text-center mb-2">
                        ⚠️ Overbooked
                      </p>
                    )}

                    <button
                      onClick={() => handleBookSlot(slot)}
                      disabled={slot.status !== "free"}
                      className={`w-full py-2.5 px-3 rounded-md text-xs font-medium transition-colors touch-manipulation ${
                        slot.status === "free"
                          ? "bg-black hover:bg-gray-800 active:bg-gray-900 text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {slot.status === "free" ? "Book Slot" : "Unavailable"}
                    </button>
                  </div>
                );
              })}
          </div>

          {selectedSchedule.slots.filter((slot) => slot.status === "free")
            .length === 0 && (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                <Clock className="h-6 w-6 text-gray-600" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No free slots available
              </h3>
              <p className="mt-1 text-sm text-gray-500 px-4">
                All slots for this date are booked. Please select another date.
              </p>
            </div>
          )}
        </div>
      )}

      {availableDates.length === 0 && (
        <div className="text-center py-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
            <Calendar className="h-6 w-6 text-gray-600" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No schedules available
          </h3>
          <p className="mt-1 text-sm text-gray-500 px-4">
            No appointment schedules were found for this referral.
          </p>
        </div>
      )}
    </div>
  );
};

export default RegularSlots;
