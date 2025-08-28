import ShowPlanPricingDetails from "@/components/dashboard/receptionist/ShowPlanPricingDetails";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Medication Reminder",
  description: "Staff Set Medication Reminder For Patients",
};

export default function RemindersPage() {
  return (
    <div>
      <ShowPlanPricingDetails />
    </div>
  );
}
