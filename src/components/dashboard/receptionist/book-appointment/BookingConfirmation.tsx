"use client";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { RootState } from "@/store";
import {
  clearBookingData,
  setPaymentInProgress,
  setPaymentError,
  setAppointmentId,
} from "@/store/slices/bookingSlice";
import { useRazorpay } from "@/hooks/useRazorpay";
import { PaymentData, PaymentResult } from "@/types/razorpayPayment.types";
import { toast } from "sonner";
import {
  createNewAppointment,
  updateAppointmentReferral,
} from "@/services/receptionist.api";
import { CreateNewAppointmentPayload } from "@/types/receptionist.types";
import { clearAllReceptionistData } from "@/store/slices/receptionistSlice";

const BookingConfirmation: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const {
    selectedSlot,
    referralData,
    paymentInProgress,
    paymentError,
    subServices,
  } = useSelector((state: RootState) => state.booking);
  const {
    initiatePayment,
    isLoading: razorpayLoading,
    error: razorpayError,
  } = useRazorpay();

  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Redirect if no booking data
  useEffect(() => {
    if (!selectedSlot || !referralData) {
      router.push("/dashboard/receptionist");
    }
  }, [selectedSlot, referralData, router]);

  // If no data, show loading or redirect
  if (!selectedSlot || !referralData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  const startDateTime = formatDateTime(selectedSlot.start);
  const endDateTime = formatDateTime(selectedSlot.end);

  // Calculate consultation fee (you can adjust this logic based on your requirements)
  const consultationFee = 500; // Default fee in rupees

  const handlePayment = async () => {
    try {
      dispatch(setPaymentInProgress(true));

      const paymentData: PaymentData = {
        amount: consultationFee,
        patient_name: referralData.referral.patient.user.name,
        patient_email: referralData.referral.patient.user.email,
        patient_phone: referralData.referral.patient.user.phone,
        // appointment_id: selectedSlot.slot_id,
      };

      const result: PaymentResult = await initiatePayment(paymentData);
      console.log("Payment Result:", result);

      if (result.success) {
        //   const orderRequestIds = paymentDetails.pending_orders!.map((o) => o.id);

        //   const invoiceData = await submitInvoiceGenerate({
        //     order_request_ids: orderRequestIds,
        //   });
        // setPaymentSuccess(true);
        // toast.success("Payment successful! Appointment booked.");
        // // You can add additional booking confirmation logic here
        // setTimeout(() => {
        //   dispatch(clearBookingData());
        //   router.push("/dashboard/receptionist");
        // }, 3000);

        // try {
        //   const response = await updateAppointmentReferral(
        //     {
        //       payment_id: result.payment_id || "",
        //       status: "booked",
        //     },
        //     referralData.referral.id
        //   );
        const payload: CreateNewAppointmentPayload = {
          step_count: 1,
          patient_id: referralData?.referral.patient.id || "",
          status: "pending",
          description: "",
          participants: [
            {
              actor_reference: referralData?.referral.patient.id || "",
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
          specialty_id: referralData?.referral?.service_specialty?.id || "",
          service_category: [
            {
              coding: [
                {
                  system:
                    "http://terminology.hl7.org/CodeSystem/service-category",
                  code: "",
                  display:
                    referralData?.referral?.service_specialty?.display || "",
                },
              ],
              text: referralData?.referral?.service_specialty?.display || "",
            },
          ],
        };
        handleCreateNewAppointment(payload);
        // } catch (error) {
        //   toast.error("Failed to update appointment referral.");
        // }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Payment failed";
      dispatch(setPaymentError(errorMessage));
      toast.error(errorMessage);
    } finally {
      dispatch(setPaymentInProgress(false));
    }
  };

  const handleCreateNewAppointment = async (
    payload: CreateNewAppointmentPayload
  ) => {
    try {
      const response = await createNewAppointment(payload);
      dispatch(setAppointmentId(response?.appointment_id));
      // dispatch(setIsRegisterActionTrigger(""));
      handleConfirmBooking(payload, response?.appointment_id);
      return;
    } catch {
      toast.error("Error creating appointment");
      return;
    }
  };

  const handleConfirmBooking = async (
    payload: CreateNewAppointmentPayload,
    apntId: string
  ) => {
    const updatedPayload: CreateNewAppointmentPayload = {
      ...payload,
      id: apntId || "",
      status: "checked_in",
      step_count: 3,
      sub_service_ids: subServices[0]?.id ? [subServices[0]?.id] : [],
      slot_id: selectedSlot?.slot_id || null,
      slot_info: {
        // start: bookingDetails?.startTime,
        // end: bookingDetails?.endTime,
        id: selectedSlot?.slot_id || null,
        overbooked: true,
      },
    };
    try {
      await createNewAppointment(updatedPayload);
      toast.success("Appointment confirmed and checked in.");
      dispatch(clearAllReceptionistData());
      router.push("/dashboard/receptionist");
      //   updateAppointmentWithPayment(apntId);
      //   dispatch(setConfirmBookingModal(true));
      //   try {
      //     const response = await updateAppointmentReferral(
      //       {
      //         booked_appointment_id: apntId,
      //       },
      //       referralData.referral.id
      //     );
      //   } catch (error) {
      //     toast.error("Failed to update appointment referral.");
      //   }
    } catch {
      toast.error("Error confirming appointment");
      return;
    } finally {
    }
  };

  const handleBackToSlots = () => {
    router.back();
  };

  const handleCancelBooking = () => {
    dispatch(clearBookingData());
    router.push("/dashboard/receptionist");
  };

  //   if (paymentSuccess) {
  //     return (
  //       <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
  //         <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
  //           <div className="mb-6">
  //             <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
  //             <h1 className="text-2xl font-bold text-gray-900 mb-2">
  //               Booking Confirmed!
  //             </h1>
  //             <p className="text-gray-600">
  //               Your appointment has been successfully booked and payment
  //               confirmed.
  //             </p>
  //           </div>

  //           <div className="space-y-3 text-sm text-gray-600 mb-6">
  //             <div className="flex justify-between">
  //               <span>Patient:</span>
  //               <span className="font-medium">
  //                 {referralData.referral.patient.user.name}
  //               </span>
  //             </div>
  //             <div className="flex justify-between">
  //               <span>Date:</span>
  //               <span className="font-medium">{startDateTime.date}</span>
  //             </div>
  //             <div className="flex justify-between">
  //               <span>Time:</span>
  //               <span className="font-medium">
  //                 {startDateTime.time} - {endDateTime.time}
  //               </span>
  //             </div>
  //             <div className="flex justify-between">
  //               <span>Amount Paid:</span>
  //               <span className="font-medium">₹{consultationFee}</span>
  //             </div>
  //           </div>

  //           <button
  //             onClick={() => router.push("/dashboard/receptionist")}
  //             className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
  //           >
  //             Back to Dashboard
  //           </button>
  //         </div>
  //       </div>
  //     );
  //   }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handleBackToSlots}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Confirm Booking
            </h1>
          </div>
          <p className="text-gray-600">
            Please review the appointment details and proceed with payment to
            confirm your booking.
          </p>
        </div>

        {/* Patient & Appointment Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Patient Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Patient Information
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">
                  {referralData.referral.patient.user.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Patient ID:</span>
                <span className="font-medium">
                  {referralData.referral.patient.patient_display_id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">
                  {referralData.referral.patient.user.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium">
                  {referralData.referral.patient.user.phone}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gender:</span>
                <span className="font-medium capitalize">
                  {referralData.referral.patient.gender}
                </span>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Appointment Details
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{startDateTime.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">
                  {startDateTime.time} - {endDateTime.time}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Doctor:</span>
                <span className="font-medium">
                  {referralData.referral.practitioner.name.text}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Specialty:</span>
                <span className="font-medium">
                  {referralData.referral.service_specialty.specialty_label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reason:</span>
                <span className="font-medium">
                  {referralData.referral.reason}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Consultation Fee:</span>
                <span className="font-medium">₹{consultationFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taxes & Fees:</span>
                <span className="font-medium">₹0</span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Amount:</span>
                <span className="text-blue-600">₹{consultationFee}</span>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {(paymentError || razorpayError) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">
                    Payment Error
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    {paymentError || razorpayError}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Button */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="space-y-4">
              <button
                onClick={handlePayment}
                disabled={paymentInProgress || razorpayLoading}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {paymentInProgress || razorpayLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    Pay ₹{consultationFee} & Confirm Booking
                  </>
                )}
              </button>

              <button
                onClick={handleCancelBooking}
                disabled={paymentInProgress || razorpayLoading}
                className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel Booking
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-500 text-center">
              <p>Secure payment powered by Razorpay</p>
              <p>Your payment information is encrypted and secure</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
