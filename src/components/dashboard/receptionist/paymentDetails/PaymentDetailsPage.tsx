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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircleIcon,
  ArrowLeft,
  Clock,
  CreditCard,
  Star,
  Coins,
} from "lucide-react";
import RazorpayPayment from "@/components/payment/razorpayPayment";
import { updateBulkStatusPaymentRequest } from "@/services/razorpay.api";
import { toast } from "sonner";
import { submitInvoiceGenerate } from "@/services/invoice.api";
import { consumeSubscriptionAllowance } from "@/services/subscription.api";
import {
  redeemRewardPoints,
  updateRedeemedRewardPoints,
} from "@/services/receptionist.api";
import SubscriptionSection from "./SubscriptionSection";
import RewardPointsSection from "./RewardPointsSection";

const PaymentDetailsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [featureId, setFeatureId] = useState<string | null>(null);
  const [appliedRewardPoints, setAppliedRewardPoints] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>("subscription");
  const [useRewardPoints, setUseRewardPoints] = useState<boolean>(false);

  const { patientDetails, paymentDetails, subscriptionDetails, health_points } =
    useSelector((state: RootState) => state.receptionistData);

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
      // Set default tab based on available options
      if (subscriptionDetails.allowances.length > 0) {
        setActiveTab("subscription");
      } else if (health_points && health_points.points_balance > 0) {
        setActiveTab("rewards");
      }
    } else if (health_points && health_points.points_balance > 0) {
      // Only reward points available
      setActiveTab("rewards");
    }
  }, [paymentDetails, router, subscriptionDetails, health_points]);

  const handleApplyCoupon = (allowanceId: string, featureId: string) => {
    setAppliedCoupon(allowanceId);
    setFeatureId(featureId);
    // Clear reward points if coupon is applied
    setAppliedRewardPoints(0);
    setUseRewardPoints(false);
    // Switch to subscription tab when coupon is applied
    setActiveTab("subscription");
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  const handleApplyRewardPoints = (points: number) => {
    setAppliedRewardPoints(points);
    // Clear coupon if reward points are applied
    setAppliedCoupon(null);
    // Switch to reward points tab when points are applied
    setActiveTab("rewards");
  };

  const handleRemoveRewardPoints = () => {
    setAppliedRewardPoints(0);
  };

  const handleRewardPointsCheckboxChange = (checked: boolean) => {
    setUseRewardPoints(checked);
  };

  // Calculate payable amount considering applied coupon or reward points
  const calculatePayableAmount = () => {
    const totalAmount = Number(paymentDetails?.total_amount || 0);
    const hasSubscriptionCoupons =
      subscriptionDetails &&
      subscriptionDetails.allowances &&
      subscriptionDetails.allowances.length > 0;

    // Only deduct advance payment if no subscription coupons are available
    const advancePayment = hasSubscriptionCoupons ? 0 : 25;

    if (appliedCoupon) {
      // If coupon is applied, the user pays nothing (covered by subscription)
      return 0;
    }

    if (appliedRewardPoints > 0) {
      // If reward points are applied, deduct them from the payable amount (1 point = 1 INR)
      const baseAmount = Math.max(0, totalAmount - advancePayment);
      return Math.max(0, baseAmount - appliedRewardPoints);
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

      if (appliedCoupon && featureId) {
        handleConsumeSubscriptionAllowance(featureId);
      }
    } catch (error) {
      toast.error(`Failed to update payment status.`);
      setLoading(false);
    }
  };

  const handleProceedWithRewardPoints = async () => {
    try {
      setLoading(true);
      console.log("Using reward points for payment:", appliedRewardPoints);
      const payload = {
        patient_id: patientDetails?.patient?.patient_profile?.id || "",
        points: appliedRewardPoints,
        status: "pending",
        meta_data: {
          note: `Used ${appliedRewardPoints} points for payment`,
        },
      };
      const response = await redeemRewardPoints(payload);
      const payload2 = {
        points: appliedRewardPoints,
        status: "completed",
      };
      await updateRedeemedRewardPoints(payload2, response?.id);
      const payload1 = paymentDetails?.pending_orders.map((order) => {
        return { id: order.id, status: "completed" };
      });
      await updateBulkStatusPaymentRequest(payload1);
      await handleInvoiceGenerate();
      toast.success(`${appliedRewardPoints} reward points used for payment!`);
      router.push("/dashboard/receptionist/patientcheckin");
    } catch (error) {
      toast.error(`Failed to update payment status.`);
    } finally {
      setLoading(false);
    }
  };

  const handleConsumeSubscriptionAllowance = async (featureId: string) => {
    try {
      await consumeSubscriptionAllowance(featureId);
      toast.success("Subscription allowances applied successfully!");
      await handleInvoiceGenerate();
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
      setLoading(true);

      await updateBulkStatusPaymentRequest(payload);
      await handleInvoiceGenerate();

      toast.success("Payment completed successfully!");
      router.push("/dashboard/receptionist/patientcheckin");
    } catch (error) {
      console.error("Error updating payment requests:", error);
      toast.error("Failed to update payment requests");
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceGenerate = async () => {
    const orderRequestIds = paymentDetails?.pending_orders!.map((o) => o.id);

    await submitInvoiceGenerate({
      order_request_ids: orderRequestIds || [],
    });
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

        {/* Payment Options Card with Tabs */}
        {((subscriptionDetails &&
          subscriptionDetails.allowances &&
          subscriptionDetails.allowances.length > 0) ||
          (health_points && health_points.points_balance > 0)) && (
          <Card className="mb-4 sm:mb-6">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Star className="w-4 h-4 sm:w-5 sm:h-5" />
                Payment Options
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="subscription"
                    disabled={
                      !subscriptionDetails ||
                      !subscriptionDetails.allowances ||
                      subscriptionDetails.allowances.length === 0
                    }
                    className="flex items-center gap-2"
                  >
                    <Star className="w-4 h-4" />
                    <span className="hidden sm:inline">Subscription</span>
                    <span className="sm:hidden">Coupon</span>
                    {appliedCoupon && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="rewards"
                    disabled={
                      !health_points || health_points.points_balance <= 0
                    }
                    className="flex items-center gap-2"
                  >
                    <Coins className="w-4 h-4" />
                    <span className="hidden sm:inline">Reward Points</span>
                    <span className="sm:hidden">Points</span>
                    {appliedRewardPoints > 0 && (
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    )}
                  </TabsTrigger>
                </TabsList>

                {/* Subscription Allowances Tab */}
                <TabsContent value="subscription" className="mt-4">
                  <SubscriptionSection
                    subscriptionDetails={subscriptionDetails}
                    appliedCoupon={appliedCoupon}
                    appliedRewardPoints={appliedRewardPoints}
                    onApplyCoupon={handleApplyCoupon}
                    onRemoveCoupon={handleRemoveCoupon}
                  />
                </TabsContent>

                {/* Reward Points Tab */}
                <TabsContent value="rewards" className="mt-4">
                  <RewardPointsSection
                    healthPoints={health_points}
                    paymentDetails={paymentDetails}
                    subscriptionDetails={subscriptionDetails}
                    appliedCoupon={appliedCoupon}
                    appliedRewardPoints={appliedRewardPoints}
                    useRewardPoints={useRewardPoints}
                    onApplyRewardPoints={handleApplyRewardPoints}
                    onRemoveRewardPoints={handleRemoveRewardPoints}
                    onRewardPointsCheckboxChange={
                      handleRewardPointsCheckboxChange
                    }
                  />
                </TabsContent>
              </Tabs>
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
                {!(
                  subscriptionDetails &&
                  subscriptionDetails.allowances &&
                  subscriptionDetails.allowances.length > 0
                ) && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-green-700 text-sm sm:text-base">
                      Advance Payment (Already Paid):
                    </span>
                    <span className="font-semibold text-green-600 text-sm sm:text-base">
                      - ₹25
                    </span>
                  </div>
                )}
                {appliedCoupon && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-green-700 text-sm sm:text-base">
                      Subscription Coupon Applied:
                    </span>
                    <span className="font-semibold text-green-600 text-sm sm:text-base">
                      - {paymentDetails.currency}{" "}
                      {Math.max(0, Number(paymentDetails.total_amount))}
                    </span>
                  </div>
                )}
                {appliedRewardPoints > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-amber-700 text-sm sm:text-base">
                      Reward Points Applied:
                    </span>
                    <span className="font-semibold text-amber-600 text-sm sm:text-base">
                      - {appliedRewardPoints} Points
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
                      appliedCoupon || appliedRewardPoints > 0
                        ? "text-green-600"
                        : "text-blue-600"
                    }`}
                  >
                    {paymentDetails.currency} {calculatePayableAmount()}
                  </span>
                </div>
              </div>
            </div>

            <div>
              {appliedCoupon ? (
                // Show confirmation when coupon is applied
                <div className="">
                  <div className="mb-4">
                    {/* <h3 className="text-base sm:text-lg font-semibold text-green-700 mb-2">
                      Subscription Coupon Applied!
                    </h3> */}
                    <p className="text-xs sm:text-sm text-gray-600">
                      Your consultation is covered by your subscription. No
                      payment required.
                    </p>
                    <p className="text-xs text-gray-500">
                      Consultation covered by subscription plan
                    </p>
                  </div>

                  <Button
                    onClick={handleProceedWithoutPayment}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white w-full"
                  >
                    {loading ? "Processing..." : "Proceed"}
                  </Button>

                  {/* <div className="mt-3 text-center"></div> */}
                </div>
              ) : appliedRewardPoints > 0 && calculatePayableAmount() === 0 ? (
                // Show confirmation when reward points cover full amount
                <div className="">
                  <div className="mb-4">
                    {/* <h3 className="text-base sm:text-lg font-semibold text-amber-700 mb-2">
                      Reward Points Applied!
                    </h3> */}
                    <p className="text-xs sm:text-sm text-gray-600">
                      Your consultation is fully covered by reward points. No
                      payment required.
                    </p>
                    <p className="text-xs text-gray-500">
                      Consultation covered by {appliedRewardPoints} reward
                      points
                    </p>
                  </div>

                  <Button
                    onClick={handleProceedWithRewardPoints}
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary-dark text-white"
                  >
                    {loading ? "Processing..." : "Proceed"}
                  </Button>

                  {/* <div className="mt-3 text-center"></div> */}
                </div>
              ) : (
                // Show payment options when no coupon is applied or partial payment needed
                <div className="flex flex-col items-center justify-between">
                  <div className=" mb-3 sm:mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                      {appliedRewardPoints > 0 && calculatePayableAmount() > 0
                        ? "Complete Remaining Payment"
                        : "Proceed with Payment"}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {appliedRewardPoints > 0 && calculatePayableAmount() > 0
                        ? `${appliedRewardPoints} reward points applied. Pay remaining ₹${calculatePayableAmount()}`
                        : "Complete your payment to proceed with the appointment"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Secure payment powered by Razorpay
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

                  {/* <div className="mt-3 sm:mt-4 text-center">
                    
                  </div> */}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Action Card */}
        {/* <div className="mb-4 sm:mb-6">
          <div className="pt-4 sm:pt-6">
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
            ) : appliedRewardPoints > 0 && calculatePayableAmount() === 0 ? (
              // Show confirmation when reward points cover full amount
              <div className="text-center">
                <div className="mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-amber-700 mb-2">
                    Reward Points Applied!
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Your consultation is fully covered by reward points. No
                    payment required.
                  </p>
                </div>

                <Button
                  onClick={handleProceedWithRewardPoints}
                  disabled={loading}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {loading ? "Processing..." : "Proceed"}
                </Button>

                <div className="mt-3 text-center">
                  <p className="text-xs text-gray-500">
                    Consultation covered by {appliedRewardPoints} reward points
                  </p>
                </div>
              </div>
            ) : (
              // Show payment options when no coupon is applied or partial payment needed
              <div>
                <div className="text-center mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                    {appliedRewardPoints > 0 && calculatePayableAmount() > 0
                      ? "Complete Remaining Payment"
                      : "Proceed with Payment"}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {appliedRewardPoints > 0 && calculatePayableAmount() > 0
                      ? `${appliedRewardPoints} reward points applied. Pay remaining ₹${calculatePayableAmount()}`
                      : "Complete your payment to proceed with the appointment"}
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
          </div>
        </div> */}

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
