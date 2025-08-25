import AttendanceForPractitioner from "@/components/dashboard/receptionist/AttendanceForPractitioner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log Attendance",
  description: "Staff Attendance Logging",
};

export default function Blogs() {
  return (
    <div>
      <AttendanceForPractitioner />
    </div>
  );
}
