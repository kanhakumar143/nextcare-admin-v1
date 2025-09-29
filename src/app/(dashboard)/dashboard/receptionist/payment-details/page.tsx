import PaymentDetailsPage from "@/components/dashboard/receptionist/paymentDetails/PaymentDetailsPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Details",
  description: "Complete pending payments for appointment services",
};

export default function PaymentDetails() {
  return (
    <div>
      <PaymentDetailsPage />
    </div>
  );
}
