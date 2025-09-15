"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { clearPaymentDetails } from "@/store/slices/receptionistSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircleIcon, ArrowLeft, Clock, CreditCard } from "lucide-react";
import BackButton from "@/components/common/BackButton";
import RazorpayPayment from "@/components/payment/razorpayPayment";
import { updateBulkStatusPaymentRequest } from "@/services/razorpay.api";
import { toast } from "sonner";
import { submitInvoiceGenerate } from "@/services/invoice.api";

const PaymentDetailsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  const { patientDetails, paymentDetails } = useSelector(
    (state: RootState) => state.receptionistData
  );

  // Redirect if no payment details or no pending orders
  useEffect(() => {
    if (
      !paymentDetails ||
      !paymentDetails.pending_orders ||
      paymentDetails.pending_orders.length === 0
    ) {
      router.push("/dashboard/receptionist/check-in");
    }
  }, [paymentDetails, router]);

  const UpdateBulkStatusPaymentRequest = async () => {
    try {
      if (!paymentDetails) {
        return toast.error("No payment details found");
      }
      const payload = paymentDetails.pending_orders.map((order) => {
        return { id: order.id, status: "completed" };
      });
      console.log("Updating payment status", payload);
      setLoading(true);
      await updateBulkStatusPaymentRequest(payload);
      router.push("/dashboard/receptionist/check-in");
      const orderRequestIds = paymentDetails.pending_orders!.map((o) => o.id);

      const invoiceData = await submitInvoiceGenerate({
        order_request_ids: orderRequestIds,
      });
      toast.success("Payment completed successfully!");
    } catch (error) {
      console.error("Error updating payment requests:", error);
      toast.error("Failed to update payment requests");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (result: any) => {
    UpdateBulkStatusPaymentRequest();
    // Clear payment details from Redux
    dispatch(clearPaymentDetails());
    // Redirect back to scan page after successful payment with success parameter
    // setTimeout(() => {
    //   router.push("/dashboard/receptionist/check-in?payment_success=true");
    // }, 1500);
  };

  const handlePaymentError = (error: any) => {
    console.error("Payment failed:", error);
    toast.error("Payment failed. Please try again.");
  };

  if (!paymentDetails || !patientDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm mx-auto">
          <AlertCircleIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
            No payment details found
          </p>
          <Button
            onClick={() => router.push("/dashboard/receptionist/check-in")}
            className="w-full"
          >
            Go to Check-In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 sm:p-4 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          {/* <BackButton /> */}
          <div className="text-center mt-3 sm:mt-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
              Complete Payment
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Please complete the payment for pending services
            </p>
          </div>
        </div>

        {/* Patient Information Card */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between sm:block">
                  <span className="font-medium text-gray-600">
                    Patient Name:
                  </span>
                  <span className="font-semibold text-gray-900 sm:hidden">
                    {patientDetails.patient.name}
                  </span>
                </div>
                <div className="flex justify-between sm:block">
                  <span className="font-medium text-gray-600">Phone:</span>
                  <span className="font-semibold text-gray-900 sm:hidden">
                    {patientDetails.patient.phone}
                  </span>
                </div>
                <div className="flex justify-between sm:block">
                  <span className="font-medium text-gray-600">
                    Appointment ID:
                  </span>
                  <span className="font-semibold text-gray-900 sm:hidden">
                    {patientDetails.appointment.appointment_display_id}
                  </span>
                </div>
              </div>
              <div className="space-y-2 hidden sm:block">
                <div className="font-semibold text-gray-900">
                  {patientDetails.patient.name}
                </div>
                <div className="font-semibold text-gray-900">
                  {patientDetails.patient.phone}
                </div>
                <div className="font-semibold text-gray-900">
                  {patientDetails.appointment.appointment_display_id}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Summary Card */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Total Amount */}
            <div className="flex justify-between items-center mb-3 sm:mb-4 p-3 bg-blue-50 rounded-lg">
              <span className="font-medium text-gray-700 text-sm sm:text-base">
                Total Amount:
              </span>
              <span className="text-lg sm:text-xl font-bold text-blue-600">
                {paymentDetails.currency} {paymentDetails.total_amount}
              </span>
            </div>

            {/* Pending Services */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">
                Pending Services
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {paymentDetails.pending_orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 border rounded-lg bg-white gap-2 sm:gap-0"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm sm:text-base">
                        {order.sub_service.name}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        {order.sub_service.description}
                      </div>
                    </div>
                    <div className="flex justify-between sm:flex-col sm:text-right items-center sm:items-end">
                      <div className="font-semibold text-green-600 text-sm sm:text-base">
                        {order.currency} {order.amount}
                      </div>
                      <Badge
                        variant="outline"
                        className="mt-0 sm:mt-1 bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Note */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3 sm:mt-4">
              <p className="text-xs sm:text-sm text-green-700 text-center">
                ₹25 already paid during appointment booking
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Action Card */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-center mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                Proceed with Payment
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Complete your payment to proceed with the appointment
              </p>
            </div>

            <div className="w-full">
              <RazorpayPayment
                amount={Math.max(0, Number(paymentDetails.total_amount) - 25)}
                patientData={{
                  name: patientDetails.patient.name || "Patient",
                  email: patientDetails.patient.phone || "",
                  phone: patientDetails.patient.phone || "",
                }}
                appointmentId={patientDetails.appointment.id}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </div>

            <div className="mt-3 sm:mt-4 text-center">
              <p className="text-xs text-gray-500">
                Secure payment powered by Razorpay
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to Scan Button */}
        <div className="mt-4 sm:mt-6 text-center pb-4 sm:pb-0">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/receptionist/check-in")}
            className="w-full max-w-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Check-In
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsPage;
