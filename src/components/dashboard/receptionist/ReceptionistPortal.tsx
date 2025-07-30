"use client";

import { Card, CardContent } from "@/components/ui/card";
import { QrCode, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import DashboardCards from "@/components/common/DashboardCards";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function ReceptionPortal() {
  const router = useRouter();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="md:text-3xl text-xl font-bold mb-1 flex items-center gap-2">
              Welcome back !
            </h2>
            <p className="text-muted-foreground text-sm">
              Ready to provide excellent patient care today.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:px-0">
        <DashboardCards
          icon={<QrCode />}
          header="Scan QR Code"
          subText="Scan patient QR codes to access records"
          link="/dashboard/receptionist/check-in"
        />
      </div>
    </div>
  );
}
