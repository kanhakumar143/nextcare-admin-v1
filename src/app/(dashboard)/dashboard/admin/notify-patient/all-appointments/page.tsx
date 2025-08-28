"use client";

import { Suspense } from "react";
import AllAppointments from "@/components/dashboard/admin/notify-patient/AllAppoinments";

export default function Page() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <AllAppointments />
      </Suspense>
    </div>
  );
}
