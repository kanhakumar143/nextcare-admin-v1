"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PatientQueueTable from "./PatientQueueTable";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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

const DoctorPortal = () => {
  const router = useRouter();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const today = format(new Date(), "yyyy-MM-dd");
  const todayPatients = patientsData.patients.filter(
    (patient) => patient.date === today
  );
  const nextPatient =
    todayPatients.find((patient) => patient.status === "scheduled") || null;

  const handlePatientInfo = (patient: Patient) => {
    setSelectedPatient(patient);
    router.push(`/dashboard/doctor/consultation/${patient.name}`);
  };

  return (
    <div className=" bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-border pb-4 flex gap-3 items-center">
          <Button size={"icon"} variant={"ghost"} onClick={() => router.back()}>
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Doctor Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {patientsData.doctor.name}
            </p>
          </div>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">
              Today's Patient Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PatientQueueTable
              patients={todayPatients}
              onPatientInfo={handlePatientInfo}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorPortal;
