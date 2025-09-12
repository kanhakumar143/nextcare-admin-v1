"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  setCheckinSuccessModal,
  setDecodedDetails,
  setQrToken,
} from "@/store/slices/receptionistSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { AlertCircleIcon } from "lucide-react";
import moment from "moment";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { checkInPatient } from "@/services/receptionist.api";
import { useAuthInfo } from "@/hooks/useAuthInfo";
import RazorpayPayment from "@/components/payment/razorpayPayment";
import { updateBulkStatusPaymentRequest } from "@/services/razorpay.api";

const ScannedPatientDetails = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { userId } = useAuthInfo();

  const { patientDetails, appoinmentDetails, paymentDetails } = useSelector(
    (state: RootState) => state.receptionistData
  );
  const [loading, setLoading] = useState<boolean>(false);

  const handleConfirmCheckin = async () => {
    const payload = {
      appointment_id: patientDetails?.appointment.id || "",
      user_id: patientDetails?.patient.user_id || "",
      patient_id: patientDetails?.appointment.patient_id || "",
      practitioner_user_id: userId,
    };
    setLoading(true);
    try {
      const response = await checkInPatient(payload);
      dispatch(setCheckinSuccessModal(true));
      dispatch(setQrToken(null));
      dispatch(setDecodedDetails(null));
      console.log(response);
    } catch {
      toast.error("Something went wrong! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (desc: string) => {
    try {
      const [first] = desc.split(", ");
      return moment(first).format("Do MMMM YYYY");
    } catch {
      return desc;
    }
  };

  const UpdateBulkStatusPaymentRequest = async () => {
    try {
      if (!paymentDetails) {
        return toast.error("No payment details found");
      }
      const payload = paymentDetails.pending_orders.map((order) => {
        return { id: order.id, status: "completed" };
      });
      console.log("setLoading", payload);
      setLoading(true);
      await updateBulkStatusPaymentRequest(payload);
    } catch (error) {
      console.error("Error updating payment requests:", error);
      toast.error("Failed to update payment requests");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {["unverified", "under_review"].includes(
        patientDetails?.patient.patient_profile.verifications[0]
          .verification_status || ""
      ) && (
        <div className=" flex justify-center items-center w-full">
          <Alert variant="destructive" className="max-w-2xl mb-3">
            <AlertCircleIcon />
            <AlertTitle>Account Verification Required</AlertTitle>
            <AlertDescription>
              <p>
                You’ve successfully booked an appointment, but your account is
                not yet verified.
              </p>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {patientDetails && (
        <Card className="w-full max-w-md mx-auto rounded-xl shadow py-4 bg-white">
          <CardContent className="space-y-2">
            <div className="text-left">
              <h2 className="text-md font-semibold text-gray-800">
                Patient <span className="">Details</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="space-y-1">
                <div className="font-medium">Full name:</div>
                <div className="font-medium">Phone:</div>
              </div>
              <div className="space-y-1">
                <div className="text-primary font-bold">
                  {patientDetails.patient.name}
                </div>
                <div className="text-primary font-bold">
                  {patientDetails.patient.phone}
                </div>
              </div>
            </div>

            <div className="text-left mt-6">
              <h2 className="text-md font-semibold text-gray-800">
                Booking <span className="">Details</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="space-y-1">
                <div className="font-medium">Service:</div>
                <div className="font-medium">Date of Booking:</div>
                <div className="font-medium">Slot Time:</div>
                <div className="font-medium">Booking Status:</div>
              </div>
              <div className="space-y-1">
                <div className="text-primary font-bold">
                  {patientDetails.appointment.service_category[0].text}
                </div>
                <div className="text-primary font-bold">
                  {formatDate(patientDetails.appointment.slot_info.start)}
                </div>
                <div className="text-primary font-bold">
                  {moment
                    .utc(patientDetails.appointment.slot_info.start)
                    .format("hh:mm a")}{" "}
                  -{" "}
                  {moment
                    .utc(patientDetails.appointment.slot_info.end)
                    .format("hh:mm a")}
                </div>
                <div>
                  <Badge
                    className={`${
                      patientDetails.appointment.status === "booked"
                        ? "bg-sky-700"
                        : patientDetails.appointment.status === "checked_in"
                        ? "bg-green-600"
                        : "bg-primary"
                    }`}
                  >
                    {patientDetails.appointment.status === "checked_in"
                      ? "Checked In"
                      : patientDetails.appointment.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Payment Details Section */}
            {paymentDetails && (
              <>
                <div className="text-left mt-6">
                  <h2 className="text-md font-semibold text-gray-800">
                    Payment <span className="">Details</span>
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                  <div className="space-y-1">
                    <div className="font-medium">Total Amount:</div>
                    <div className="font-medium">Total Orders:</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-primary font-bold">
                      {paymentDetails.currency} {paymentDetails.total_amount}
                    </div>
                    <div className="text-primary font-bold">
                      {paymentDetails.order_count}
                    </div>
                  </div>
                </div>

                {/* Pending Services Table */}
                {paymentDetails.pending_orders &&
                  paymentDetails.pending_orders.length > 0 && (
                    <div className="mt-4">
                      <div className="text-left mb-2">
                        <h3 className="text-sm font-semibold text-gray-800">
                          Pending Services
                        </h3>
                      </div>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-2 py-2 text-left font-medium text-gray-700">
                                Service
                              </th>
                              <th className="px-2 py-2 text-right font-medium text-gray-700">
                                Amount
                              </th>
                              <th className="px-2 py-2 text-center font-medium text-gray-700">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {paymentDetails.pending_orders.map(
                              (order, index) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                  <td className="px-2 py-2 text-gray-800">
                                    <div className="font-medium">
                                      {order.sub_service.name}
                                    </div>
                                    <div className="text-gray-500 text-xs truncate">
                                      {order.sub_service.description}
                                    </div>
                                  </td>
                                  <td className="px-2 py-2 text-right font-medium text-green-600">
                                    {order.currency} {order.amount}
                                  </td>
                                  <td className="px-2 py-2 text-center">
                                    <span
                                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                        order.status === "pending"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : order.status === "completed"
                                          ? "bg-green-100 text-green-800"
                                          : order.status === "cancelled"
                                          ? "bg-red-100 text-red-800"
                                          : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {order.status.charAt(0).toUpperCase() +
                                        order.status.slice(1)}
                                    </span>
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
              </>
            )}

            <div className="flex flex-col gap-2 mt-5">
              {patientDetails.patient.patient_profile.verifications[0]
                .verification_status !== "verified" ? (
                <Button
                  className="w-full border-primary border-2"
                  onClick={() => {
                    router.push("/dashboard/receptionist/verify-patient");
                  }}
                >
                  Verify Patient
                </Button>
              ) : appoinmentDetails?.order_requests?.length === 0 ? (
                <>
                  <Button
                    onClick={handleConfirmCheckin}
                    className="w-full bg-green-500 hover:bg-green-400 text-white font-semibold"
                  >
                    {loading ? "Checking In..." : "Confirm Check-In"}
                  </Button>
                  <p className="text-sm text-gray-500">
                    {patientDetails.time_alert}
                  </p>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-700 text-center">
                      ₹25 already paid during appointment booking
                    </p>
                  </div>

                  <RazorpayPayment
                    amount={
                      paymentDetails
                        ? Math.max(0, Number(paymentDetails.total_amount) - 25)
                        : Math.max(
                            0,
                            Number(
                              appoinmentDetails?.order_requests?.[0].amount || 0
                            ) - 25
                          )
                    }
                    patientData={{
                      name: patientDetails.patient.name || "Patient",
                      email: patientDetails.patient.phone || "",
                      phone: patientDetails.patient.phone || "",
                    }}
                    appointmentId={appoinmentDetails?.id}
                    onSuccess={(result) => {
                      UpdateBulkStatusPaymentRequest();
                      handleConfirmCheckin();
                    }}
                    onError={(error) => {
                      console.error("Payment failed:", error);
                    }}
                  />
                  <p className="text-sm text-gray-500">
                    {patientDetails.time_alert}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScannedPatientDetails;
