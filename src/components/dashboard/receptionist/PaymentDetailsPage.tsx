"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
  clearAllReceptionistData,
  clearPaymentDetails,
} from "@/store/slices/receptionistSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircleIcon,
  ArrowLeft,
  Clock,
  CreditCard,
  Star,
} from "lucide-react";
import RazorpayPayment from "@/components/payment/razorpayPayment";
import { updateBulkStatusPaymentRequest } from "@/services/razorpay.api";
import { toast } from "sonner";
import { submitInvoiceGenerate } from "@/services/invoice.api";
import {
  checkSubscriptionAllowance,
  consumeSubscriptionAllowance,
} from "@/services/subscription.api";

const PaymentDetailsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [couponLoading, setCouponLoading] = useState<string | null>(null); // Track which coupon is being applied
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null); // Track applied coupon ID
  const [featureId, setFeatureId] = useState<string | null>(null); // Track feature ID for consumption

  const { patientDetails, paymentDetails, subscriptionDetails } = useSelector(
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
    } else if (
      subscriptionDetails &&
      subscriptionDetails.allowances &&
      subscriptionDetails.allowances.length > 0
    ) {
      // User has subscription allowances (coupons) available
      console.log(
        "User has subscription allowances:",
        subscriptionDetails.allowances
      );
    }
  }, [paymentDetails, router, subscriptionDetails]);

  const handleApplyCoupon = async (
    allowanceId: string,
    subscriptionId: string,
    featureId: string,
    featureName: string
  ) => {
    // Set loading state for this specific coupon
    setCouponLoading(allowanceId);
    setFeatureId(allowanceId);
    try {
      await checkSubscriptionAllowance(subscriptionId, featureId);
      setAppliedCoupon(allowanceId);
      toast.success(`Coupon applied successfully for ${featureName}!`);
    } catch (error) {
      toast.error(`Failed to apply coupon for ${featureName}.`);
    } finally {
      setCouponLoading(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.info("Coupon removed");
  };

  // Calculate payable amount considering applied coupon
  const calculatePayableAmount = () => {
    const totalAmount = Number(paymentDetails?.total_amount || 0);
    const advancePayment = 25;

    if (appliedCoupon) {
      // If coupon is applied, the user pays nothing (covered by subscription)
      return 0;
    }

    return Math.max(0, totalAmount - advancePayment);
  };

  const handleProceedWithoutPayment = async () => {
    try {
      setLoading(true);
      const payload = paymentDetails?.pending_orders.map((order) => {
        return { id: order.id, status: "completed" };
      });
      await updateBulkStatusPaymentRequest(payload);
      handleConsumeSubscriptionAllowance(featureId || "");
    } catch (error) {
      toast.error(`Failed to update payment status.`);
      setLoading(false);
    }
  };

  const handleConsumeSubscriptionAllowance = async (featureId: string) => {
    try {
      await consumeSubscriptionAllowance(featureId);
      toast.success("Subscription allowances applied successfully!");
      router.push("/dashboard/receptionist/patientcheckin");
    } catch (error) {
      toast.error(`Failed to consume subscription allowance.`);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatusPaymentRequest = async () => {
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
      // router.push("/dashboard/receptionist/check-in");
      const orderRequestIds = paymentDetails.pending_orders!.map((o) => o.id);

      await submitInvoiceGenerate({
        order_request_ids: orderRequestIds,
      });
      toast.success("Payment completed successfully!");
      router.push("/dashboard/receptionist/patientcheckin");
    } catch (error) {
      console.error("Error updating payment requests:", error);
      toast.error("Failed to update payment requests");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (result: any) => {
    handleBulkStatusPaymentRequest();
    // Clear payment details from Redux
    dispatch(clearPaymentDetails());
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
    <div className="min-h-screen p-2 sm:p-4">
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

        {/* Subscription Allowances Card */}
        {subscriptionDetails &&
          subscriptionDetails.allowances &&
          subscriptionDetails.allowances.length > 0 && (
            <Card className="mb-4 sm:mb-6">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5" />
                  Available Subscription Coupons
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-3">
                    You have subscription allowances that can be used for this
                    appointment:
                  </p>

                  {subscriptionDetails.allowances.map((allowance) => (
                    <div
                      key={allowance.id}
                      className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 border rounded-lg bg-green-50 border-green-200 gap-3 sm:gap-0"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm sm:text-base">
                          {allowance.feature.name}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 mt-1">
                          {allowance.feature.description}
                        </div>
                        <div className="text-xs sm:text-sm text-green-700 mt-1">
                          Remaining: {allowance.remaining_quantity} /{" "}
                          {allowance.total_quantity}
                        </div>
                      </div>
                      <div className="flex justify-end">
                        {appliedCoupon === allowance.id ? (
                          <Button
                            onClick={handleRemoveCoupon}
                            variant="outline"
                            className="border-green-600 text-green-600 hover:bg-green-50 text-xs sm:text-sm px-3 py-2"
                          >
                            Remove
                          </Button>
                        ) : (
                          <Button
                            onClick={() =>
                              handleApplyCoupon(
                                allowance.id,
                                allowance.subscription_id,
                                allowance.feature_id,
                                allowance.feature.name
                              )
                            }
                            className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm px-3 py-2"
                            disabled={
                              allowance.remaining_quantity <= 0 ||
                              appliedCoupon !== null ||
                              couponLoading !== null
                            }
                          >
                            {couponLoading === allowance.id
                              ? "Applying..."
                              : allowance.remaining_quantity > 0
                              ? "Activate"
                              : "No Uses Left"}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Using a subscription coupon will
                      cover the consultation fee, and you won't need to make any
                      payment for this appointment.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Payment Summary Card */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Pending Services */}
            <div className="space-y-2 mb-3 sm:mb-4">
              <h3 className="font-semibold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">
                Consultation Fee
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

            {/* Payment Calculation */}
            <div className="space-y-2 mb-3 sm:mb-4">
              <div className="border rounded-lg p-3 bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700 text-sm sm:text-base">
                    Total Services Amount:
                  </span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">
                    {paymentDetails.currency} {paymentDetails.total_amount}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-green-700 text-sm sm:text-base">
                    Advance Payment (Already Paid):
                  </span>
                  <span className="font-semibold text-green-600 text-sm sm:text-base">
                    - ₹25
                  </span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-green-700 text-sm sm:text-base">
                      Subscription Coupon Applied:
                    </span>
                    <span className="font-semibold text-green-600 text-sm sm:text-base">
                      - {paymentDetails.currency}{" "}
                      {Math.max(0, Number(paymentDetails.total_amount) - 25)}
                    </span>
                  </div>
                )}
                <hr className="border-gray-300 my-2" />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-800 text-sm sm:text-base">
                    Total Payable Amount:
                  </span>
                  <span
                    className={`text-lg sm:text-xl font-bold ${
                      appliedCoupon ? "text-green-600" : "text-blue-600"
                    }`}
                  >
                    {paymentDetails.currency} {calculatePayableAmount()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Action Card */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="pt-4 sm:pt-6">
            {appliedCoupon ? (
              // Show confirmation when coupon is applied
              <div className="text-center">
                <div className="mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-green-700 mb-2">
                    Subscription Coupon Applied!
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Your consultation is covered by your subscription. No
                    payment required.
                  </p>
                </div>

                <Button
                  onClick={handleProceedWithoutPayment}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {loading ? "Processing..." : "Proceed"}
                </Button>

                <div className="mt-3 text-center">
                  <p className="text-xs text-gray-500">
                    Consultation covered by subscription plan
                  </p>
                </div>
              </div>
            ) : (
              // Show payment options when no coupon is applied
              <div>
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
                    amount={calculatePayableAmount()}
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
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back to Scan Button */}
        <div className="mt-4 sm:mt-6 text-center pb-4 sm:pb-0">
          <Button
            variant="outline"
            onClick={() => {
              router.push("/dashboard/receptionist/check-in");
              dispatch(clearAllReceptionistData());
            }}
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
