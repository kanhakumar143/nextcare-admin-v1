"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { LogOutIcon, QrCode } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ReceptionPortal() {
  const router = useRouter();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center border-b-2 border-gray-300 pb-5">
        <h1 className="text-2xl font-semibold">Receptionist Portal</h1>
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground">Welcome,</p>
          <Button variant="outline" size="sm">
            <LogOutIcon className="w-4 h-4 mr-1" /> Logout
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-bold mb-1">Welcome back, !</h2>
        <p className="text-muted-foreground text-sm mb-4">
          Ready to provide excellent patient care today.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-9">
          <Card
            className="hover:shadow-md cursor-pointer"
            onClick={() => router.push("/dashboard/receptionist/check-in")}
          >
            <CardContent className="p-6 flex flex-col justify-center items-center ">
              <QrCode />
              <h3 className="font-semibold mt-2">Scan QR Code</h3>
              <p className="text-sm text-muted-foreground">
                Scan patient QR codes to access records
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
