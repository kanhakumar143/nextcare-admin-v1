"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import RazorpayPayment from "@/components/payment/razorpayPayment";
import { updateBulkStatusPaymentRequest } from "@/services/razorpay.api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const PendingPayments = () => {
  const router = useRouter();
  const { patientDetails, paymentDetails, appoinmentDetails } = useSelector(
    (state: RootState) => state.receptionistData
  );
  const [loading, setLoading] = useState(false);

  const handlePaymentSuccess = async () => {
    try {
      setLoading(true);

      if (paymentDetails && (paymentDetails.pending_orders?.length ?? 0) > 0) {
        const payload = paymentDetails.pending_orders!.map((o) => ({
          id: o.id,
          status: "completed",
        }));
        await updateBulkStatusPaymentRequest(payload);
      }

      toast.success("Payment successful");
    } catch {
      toast.error("Payment update failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (appoinmentDetails?.status === "checked_in") {
      router.push("/dashboard/receptionist");
    } else if (appoinmentDetails?.status === "booked") {
      router.push("/dashboard/receptionist/scanned-patient-details");
    } else {
      toast.error("Invalid appointment status");
    }
  };

  if (!patientDetails || !paymentDetails) {
    return <div className="text-center text-gray-600">No payment data found.</div>;
  }

  const pendingOrders = paymentDetails.pending_orders ?? [];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="text-left mt-4">
            <h2 className="text-md font-semibold text-gray-800">
              Payment <span>Details</span>
            </h2>
          </div>

          {/* Payment summary */}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="space-y-1">
              <div className="font-medium">Total Amount:</div>
              <div className="font-medium">Total Orders:</div>
            </div>
            <div className="space-y-1">
              <div className="text-primary font-bold">
                {paymentDetails.currency} {paymentDetails.total_amount}
              </div>
              <div className="text-primary font-bold">{paymentDetails.order_count}</div>
            </div>
          </div>

          {/* Pending Services Table (always show) */}
          <div className="mt-4">
            <div className="text-left mb-2">
              <h3 className="text-sm font-semibold text-gray-800">Pending Services</h3>
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
                  {pendingOrders.length > 0 ? (
                    pendingOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-2 py-2 text-gray-800">
                          <div className="font-medium">{order.sub_service.name}</div>
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
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-2 py-4 text-center text-gray-500 italic"
                      >
                        No Pending Services
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action buttons */}
          {pendingOrders.length > 0 ? (
            <RazorpayPayment
              amount={paymentDetails.total_amount}
              patientData={{
                name: patientDetails?.patient?.name || "Patient",
                phone: patientDetails?.patient?.phone || "",
                email: patientDetails?.patient?.phone || "",
              }}
              appointmentId={appoinmentDetails?.id}
              onSuccess={handlePaymentSuccess}
              onError={() => toast.error("Payment Failed")}
            />
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-700 text-center">
                      ₹25 already paid during appointment booking
                    </p>
                
            <button
              onClick={handleNext}
              disabled={loading}
              className="w-full bg-primary text-white py-2 rounded-lg font-medium"
            >
              Next
            </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingPayments;
