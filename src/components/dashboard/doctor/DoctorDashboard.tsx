"use client";

import DashboardCards from "@/components/common/DashboardCards";
import { AppWindow, Calendar1, HistoryIcon, User } from "lucide-react";
import PatientQueueTable from "./PatientQueueTable";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

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

const patientsData = {
  patients: [
    {
      id: "P001",
      name: "John Smith",
      slotStart: "09:00",
      slotEnd: "09:30",
      concern: "Regular checkup",
      date: "2025-07-21",
      status: "scheduled",
      phone: "+1234567890",
      age: 45,
      bloodGroup: "O+",
    },
    {
      id: "P002",
      name: "Sarah Johnson",
      slotStart: "09:30",
      slotEnd: "10:00",
      concern: "Chest pain",
      date: "2025-07-21",
      status: "scheduled",
      phone: "+1234567891",
      age: 32,
      bloodGroup: "A+",
    },
    {
      id: "P003",
      name: "Michael Brown",
      slotStart: "10:00",
      slotEnd: "10:30",
      concern: "Follow-up consultation",
      date: "2025-07-21",
      status: "scheduled",
      phone: "+1234567892",
      age: 58,
      bloodGroup: "B+",
    },
    {
      id: "P004",
      name: "Emily Davis",
      slotStart: "10:30",
      slotEnd: "11:00",
      concern: "Skin rash",
      date: "2025-07-21",
      status: "scheduled",
      phone: "+1234567893",
      age: 28,
      bloodGroup: "AB+",
    },
    {
      id: "P005",
      name: "Robert Wilson",
      slotStart: "11:00",
      slotEnd: "11:30",
      concern: "Diabetes consultation",
      date: "2025-07-21",
      status: "scheduled",
      phone: "+1234567894",
      age: 62,
      bloodGroup: "O-",
    },
    {
      id: "P006",
      name: "Lisa Anderson",
      slotStart: "14:00",
      slotEnd: "14:30",
      concern: "Headache",
      date: "2025-07-21",
      status: "scheduled",
      phone: "+1234567895",
      age: 35,
      bloodGroup: "A-",
    },
    {
      id: "P007",
      name: "David Taylor",
      slotStart: "14:30",
      slotEnd: "15:00",
      concern: "Blood pressure check",
      date: "2025-07-21",
      status: "scheduled",
      phone: "+1234567896",
      age: 51,
      bloodGroup: "B-",
    },
    {
      id: "P008",
      name: "Jennifer Lee",
      slotStart: "15:00",
      slotEnd: "15:30",
      concern: "Back pain",
      date: "2025-07-21",
      status: "scheduled",
      phone: "+1234567897",
      age: 29,
      bloodGroup: "AB-",
    },
    {
      id: "P005",
      name: "Robert Wilson",
      slotStart: "11:00",
      slotEnd: "11:30",
      concern: "Diabetes consultation",
      date: "2025-07-21",
      status: "scheduled",
      phone: "+1234567894",
      age: 62,
      bloodGroup: "O-",
    },
    {
      id: "P006",
      name: "Lisa Anderson",
      slotStart: "14:00",
      slotEnd: "14:30",
      concern: "Headache",
      date: "2025-07-21",
      status: "scheduled",
      phone: "+1234567895",
      age: 35,
      bloodGroup: "A-",
    },
    {
      id: "P007",
      name: "David Taylor",
      slotStart: "14:30",
      slotEnd: "15:00",
      concern: "Blood pressure check",
      date: "2025-07-21",
      status: "scheduled",
      phone: "+1234567896",
      age: 51,
      bloodGroup: "B-",
    },
    {
      id: "P008",
      name: "Jennifer Lee",
      slotStart: "15:00",
      slotEnd: "15:30",
      concern: "Back pain",
      date: "2025-07-21",
      status: "scheduled",
      phone: "+1234567897",
      age: 29,
      bloodGroup: "AB-",
    },
  ],
  doctor: {
    name: "Dr. Amanda Richards",
    specialty: "Internal Medicine",
    experience: "12 years",
    email: "amanda.richards@hospital.com",
    phone: "+1234567800",
    license: "MD123456789",
    education: "Harvard Medical School",
  },
};

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

  const todayPatients = patientsData.patients.filter(
    (patient) => patient.date === today
  );
  const handlePatientInfo = (patient: Patient) => {
    router.push(`/dashboard/doctor/consultation/${patient.name}`);
  };
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
      <div className="mx-10">
        <h3 className="text-2xl font-bold py-6">Upcoming Appointments</h3>
        <PatientQueueTable
          patients={todayPatients}
          onPatientInfo={handlePatientInfo}
        />
      </div>
    </div>
  );
};

export default DoctorDashboard;
