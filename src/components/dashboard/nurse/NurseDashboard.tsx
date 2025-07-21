"use client";

import DashboardCards from "@/components/common/DashboardCards";
import { QrCode } from "lucide-react";

export default function NurseDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-1">Welcome back, !</h2>
        <p className="text-muted-foreground text-sm mb-4">
          Ready to provide excellent patient care today.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-9">
          <DashboardCards
            icon={<QrCode />}
            header="Scan QR Code"
            subText="Scan patient QR codes to access details"
            link="/dashboard/nurse/check-in"
          />
        </div>
      </div>
    </div>
  );
}
