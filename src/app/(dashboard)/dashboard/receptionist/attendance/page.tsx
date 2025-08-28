import LogAttendance from "@/components/dashboard/receptionist/LogAttendance";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log Attendance",
  description: "Staff Attendance Logging",
};

export default function Blogs() {
  return (
    <div>
      <LogAttendance />
    </div>
  );
}
