"use client";

import React, { useState, useEffect } from "react";
import {
  getAiSuggestedSlots,
  getRecentSuggestedSlots,
} from "@/services/receptionist.api";
import {
  Loader2,
  AlertCircle,
  Lightbulb,
  Calendar,
  Clock,
  ToggleLeft,
  ToggleRight,
  ArrowLeft,
} from "lucide-react";
import { AvailableSlot, ReferralData } from "@/types/receptionist.types";
import RegularSlots from "./RegularSlots";
import { useRouter, useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { clearAllReceptionistData } from "@/store/slices/receptionistSlice";
import { setBookingData, setSubServices } from "@/store/slices/bookingSlice";
import { RootState } from "@/store";

const BookAppointment: React.FC = () => {
  const router = useRouter();
  const { referallId } = useParams();
  const referralId = (referallId as string) || "";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReferralData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAiMode, setIsAiMode] = useState(true); // Default to AI mode
  const dispatch = useDispatch();
  const { selectedSlot, referralData: storedReferralData } = useSelector(
    (state: RootState) => state.booking
  );

  useEffect(() => {
    const fetchAiSuggestedSlots = async () => {
      try {
        setLoading(true);
        const response = await getAiSuggestedSlots(referralId);
        setData(response);
      } catch (err: any) {
        setError(err.message || "Failed to fetch AI suggested slots");
      } finally {
        setLoading(false);
      }
    };

    if (referralId && isAiMode) {
      fetchAiSuggestedSlots();
    } else if (referralId && !isAiMode) {
      // For regular mode, we'll let the RegularSlots component handle its own loading
      setLoading(false);
      setData(null);
      setError(null);
    }
  }, [referralId, isAiMode]);

  const handleBookSlot = (slot: AvailableSlot) => {
    if (data) {
      // Store the selected slot and referral data in Redux
      dispatch(setBookingData({ slot, referralData: data }));
      dispatch(setSubServices(data.sub_services || []));

      // Navigate to the booking confirmation page
      router.push("/dashboard/receptionist/book-appointment/confirm");
    }
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

  const getScoreColor = (score: number) => {
    if (score >= 1.2) return "text-green-600 bg-green-50";
    if (score >= 1.1) return "text-black bg-gray-50";
    return "text-orange-600 bg-orange-50";
  };

  const handleToggleMode = () => {
    setIsAiMode(!isAiMode);
  };

  const handleBackToQrScanner = () => {
    // Clear all receptionist data from Redux
    dispatch(clearAllReceptionistData());
    // Navigate back to the receptionist dashboard (QR scanner page)
    router.push("/dashboard/receptionist");
  };

  // Show loading only for AI mode
  if (loading && isAiMode) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Show error only for AI mode
  if (error && isAiMode) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  // For regular mode, render the RegularSlots component
  if (!isAiMode) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={handleBackToQrScanner}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-800 transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to QR Scanner
        </button>

        {/* Toggle Switch */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Appointment Mode
              </h3>
              <p className="text-sm text-gray-600">
                {isAiMode
                  ? "AI-powered smart recommendations"
                  : "Regular schedule-based slots"}
              </p>
            </div>
            <button
              onClick={handleToggleMode}
              className="flex items-center space-x-1 bg-gray-100 rounded-full p-1 transition-colors duration-200 hover:bg-gray-200 w-full sm:w-auto justify-center sm:justify-start"
            >
              <span
                className={`px-3 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  isAiMode ? "bg-purple-600 text-white" : "text-gray-600"
                }`}
              >
                AI Mode
              </span>
              <span
                className={`px-3 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  !isAiMode ? "bg-black text-white" : "text-gray-600"
                }`}
              >
                Regular
              </span>
            </button>
          </div>
        </div>

        <RegularSlots />
      </div>
    );
  }

  // Show no data message for AI mode
  if (!data) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={handleBackToQrScanner}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-800 transition-colors duration-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to QR Scanner
      </button>

      {/* Toggle Switch */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Appointment Mode
            </h3>
            <p className="text-sm text-gray-600">
              {isAiMode
                ? "AI-powered smart recommendations"
                : "Regular schedule-based slots"}
            </p>
          </div>
          <button
            onClick={handleToggleMode}
            className="flex items-center space-x-1 bg-gray-100 rounded-full p-1 transition-colors duration-200 hover:bg-gray-200 w-full sm:w-auto justify-center sm:justify-start"
          >
            <span
              className={`px-3 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                isAiMode ? "bg-purple-600 text-white" : "text-gray-600"
              }`}
            >
              AI Mode
            </span>
            <span
              className={`px-3 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                !isAiMode ? "bg-black text-white" : "text-gray-600"
              }`}
            >
              Regular
            </span>
          </button>
        </div>
      </div>

      {/* Patient & Referral Info */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 sm:p-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              {data.referral?.patient?.user.name}
            </h2>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Patient ID:</span>{" "}
                {data.referral?.patient?.patient_display_id}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Specialty:</span>{" "}
                {data.referral?.service_specialty?.specialty_label}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Referral Reason:</span>{" "}
                {data.referral?.reason}
              </p>
            </div>
          </div>
          <div className="lg:text-right">
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Doctor:</span>{" "}
                {data.referral?.practitioner?.name?.text}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Status:</span>{" "}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {data.referral?.status}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 sm:p-6 border border-purple-200">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 mb-4">
          <div className="flex-shrink-0 mx-auto sm:mx-0">
            <Lightbulb className="h-8 w-8 text-purple-600" />
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold text-purple-900">
              🤖 AI-Powered Appointment Recommendations
            </h3>
            <p className="text-sm text-purple-700 mt-1">
              Our AI has analyzed doctor availability, wait times, and
              cancellation patterns to suggest the best appointment slots.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs">
          <div className="bg-white p-3 rounded-md border border-purple-100">
            <h4 className="font-medium text-purple-800 mb-1">
              Rule-Based Score
            </h4>
            <p className="text-purple-600">{data.scoring_basis?.rule_based}</p>
          </div>
          <div className="bg-white p-3 rounded-md border border-purple-100">
            <h4 className="font-medium text-purple-800 mb-1">ML Prediction</h4>
            <p className="text-purple-600">
              {data.scoring_basis?.ml_prediction}
            </p>
          </div>
          <div className="bg-white p-3 rounded-md border border-purple-100 sm:col-span-2 lg:col-span-1">
            <h4 className="font-medium text-purple-800 mb-1">Final Score</h4>
            <p className="text-purple-600">{data.scoring_basis?.final_score}</p>
          </div>
        </div>
      </div>

      {/* Available Slots */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 justify-center sm:justify-start">
          <Calendar className="h-5 w-5" />
          Recommended Appointment Slots ({data.available_slots?.length} options)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {data.available_slots?.map((slot, index) => {
            const startDateTime = formatDateTime(slot.start);
            const endDateTime = formatDateTime(slot.end);
            const isTopRecommendation = index < 3;

            return (
              <div
                key={slot.slot_id}
                className={`relative bg-white rounded-lg border-2 p-3 sm:p-4 transition-all duration-200 hover:shadow-lg flex flex-col h-full ${
                  isTopRecommendation
                    ? "border-green-200 bg-green-50/50"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                {isTopRecommendation && (
                  <div className="absolute -top-2 -right-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                      ⭐ Top Pick
                    </span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                  <div className="text-center sm:text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {startDateTime.date}
                    </p>
                    <p className="text-base sm:text-lg font-semibold text-black">
                      {startDateTime.time} - {endDateTime.time}
                    </p>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-medium mx-auto sm:mx-0 ${getScoreColor(
                      slot.final_score
                    )}`}
                  >
                    Score: {slot.final_score.toFixed(2)}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Wait Time:</span>
                    <span className="font-medium">
                      ~{slot.predicted_wait_time} min
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Cancellation Risk:</span>
                    <span className="font-medium">
                      {(slot.cancellation_risk * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Why recommended:</p>
                  <div className="flex flex-wrap gap-1 justify-center sm:justify-start">
                    {slot.reason.map((reason, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-auto">
                  <button
                    onClick={() => handleBookSlot(slot)}
                    className={`w-full py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                      isTopRecommendation
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-black hover:bg-gray-800 text-white"
                    }`}
                  >
                    {isTopRecommendation ? "Book Now" : "Book Appointment"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {data.available_slots?.length === 0 && (
        <div className="text-center py-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
            <Clock className="h-6 w-6 text-gray-600" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No slots available
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            No appointment slots were found for this referral.
          </p>
        </div>
      )}
    </div>
  );
};

export default BookAppointment;
