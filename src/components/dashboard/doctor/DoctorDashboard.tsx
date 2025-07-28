"use client";

import DashboardCards from "@/components/common/DashboardCards";
import { AppWindow, Calendar1, HistoryIcon, User } from "lucide-react";
import PatientQueueTable from "./PatientQueueTable";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import patientsData from "../../../mock/mockData.json";
import DoctorCalendar from "./DoctorCalender";

const DashboardCardsForDoctors = [
  {
    cardName: "Portal",
    icon: <AppWindow />,
    href: "/dashboard/doctor/portal",
    description: "Quick access to your active appointments and patient queue.",
  },
  {
    cardName: "Profile",
    icon: <User />,
    href: "/dashboard/doctor/profile",
    description: "View and update your personal and professional details.",
  },
  {
    cardName: "Consultation History",
    icon: <HistoryIcon />,
    href: "/dashboard/doctor/history",
    description: "Review your past consultations and visit summaries.",
  },
  {
    cardName: "Calendar",
    icon: <Calendar1 />,
    href: "/dashboard/doctor/calender",
    description: "Manage your availability and upcoming appointments.",
  },
];

interface Patient {
  id: string;
  name: string;
  slotStart: string;
  slotEnd: string;
  concern: string;
  date: string;
  status: string;
  phone: string;
  age: number;
  bloodGroup: string;
}

const DoctorDashboard = () => {
  const router = useRouter();
  const today = format(new Date(), "yyyy-MM-dd");

  // const todayPatients = patientsData.patients.filter(
  //   (patient) => patient.date === today
  // );
  // const handlePatientInfo = (patient: Patient) => {
  //   router.push(`/dashboard/doctor/consultation/${patient.name}`);
  // };
  return (
    <div className="px-24">
      <div className="border-b-2 mx-9 py-5">
        <h1 className="text-4xl font-bold">Dashboard</h1>
      </div>
      <div className="mx-10">
        <DoctorCalendar patients={patientsData.patients} />
      </div>
    </div>
  );
};

export default DoctorDashboard;
