"use client";

import DashboardCards from "@/components/common/DashboardCards";
import { AppWindow, Calendar1, HistoryIcon, User } from "lucide-react";

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
    href: "/dashboard/doctor/account",
    description: "View and update your personal and professional details.",
  },
  {
    cardName: "Consultation History",
    icon: <HistoryIcon />,
    href: "/dashboard/doctor/account",
    description: "Review your past consultations and visit summaries.",
  },
  {
    cardName: "Calendar",
    icon: <Calendar1 />,
    href: "/dashboard/doctor/calender",
    description: "Manage your availability and upcoming appointments.",
  },
];

const DoctorDashboard = () => {
  return (
    <div className="px-24">
      <div className="border-b-2 mx-9 py-5">
        <h1 className="text-4xl font-bold">Dashboard</h1>
      </div>
      <div className="grid grid-cols-3 gap-4 p-8">
        {DashboardCardsForDoctors.map((details, index) => (
          <DashboardCards
            header={details.cardName}
            subText={details.description}
            icon={details.icon}
            link={details.href}
            key={index}
          />
        ))}
      </div>
    </div>
  );
};

export default DoctorDashboard;
