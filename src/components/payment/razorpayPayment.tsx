"use client";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RazorpayPaymentProps } from "@/types/razorpayPayment.types";
import { useRazorpay } from "@/hooks/useRazorpay";

const RazorpayPayment = ({
  amount,
  patientData,
  appointmentId,
  onSuccess,
  onError,
  disabled = false,
  className = "",
}: RazorpayPaymentProps) => {
  const { initiatePayment, isLoading } = useRazorpay();
  const handlePayment = async () => {
    try {
      const paymentData = {
        amount: parseFloat(amount.toString()),
        patient_name: patientData.name,
        patient_email: patientData.email,
        patient_phone: patientData.phone,
        appointment_id: appointmentId,
      };

      const result = await initiatePayment(paymentData);

      onSuccess?.(result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Payment failed";
      const errorObj = error instanceof Error ? error : new Error(errorMessage);
      onError?.(errorObj);
    }
  };

  return (
    <div className={`razorpay-payment-wrapper ${className}`}>
      <Button
        onClick={handlePayment}
        disabled={isLoading || disabled}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Continue with payment ₹{amount}
          </>
        )}
      </Button>
    </div>
  );
};

export default RazorpayPayment;
