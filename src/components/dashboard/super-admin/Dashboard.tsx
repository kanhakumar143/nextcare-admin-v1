"use client";

import DashboardCards from "@/components/common/DashboardCards";
import Image from "next/image";

export default function Dashboard() {
  return (
    <div className="p-6">
      <div className="flex   gap-6  justify-center">
        {/* Doctor Verification Card */}
        <DashboardCards
          // icon={<QrCode />}
          icon={
            <Image
              src={"/doctor.png"}
              alt="Doctor Profile"
              width={60}
              height={40}
              className=" "
            />
          }
          header="Verify Doctor"
          subText="Doctor verification process"
          link="/dashboard/super-admin/verify-doctor"
        />
        {/* Nurse Verification Card */}
        <DashboardCards
          icon={
            <Image
              src={"/nurse.png"}
              alt="Doctor Profile"
              width={60}
              height={40}
              className=" "
            />
          }
          header="Verify Nurse"
          subText="Nurse verification process"
          link="/dashboard/super-admin/verify-nurse"
        />
      </div>
    </div>
  );
}
