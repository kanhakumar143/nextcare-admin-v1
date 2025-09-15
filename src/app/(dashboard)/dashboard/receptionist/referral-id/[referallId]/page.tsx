import { Metadata } from "next";
import BookAppointment from "@/components/dashboard/receptionist/book-appointment/bookAppointment";

export const metadata: Metadata = {
  title: "Referral Details",
  description: "View and manage patient referral information.",
};

export default function ReferralPage() {
  return (
    <div className="flex flex-col items-center justify-start p-6 gap-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-primary">
          Patient Referral Details
        </h1>
        <p className="text-gray-600">
          Managing referral information and booking appointments
        </p>
      </div>

      <div className="w-full max-w-6xl">
        <BookAppointment />
      </div>
    </div>
  );
}
