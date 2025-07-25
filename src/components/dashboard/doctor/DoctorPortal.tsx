"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PatientQueueTable from "./PatientQueueTable";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import patientsData from "../../../mock/mockData.json";

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

  const handlePatientInfo = (patient: Patient) => {
    setSelectedPatient(patient);
    router.push(`/dashboard/doctor/consultation/${patient.name}`);
  };

  return (
    <div className=" bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-border pb-4 flex gap-3 items-center">
          <Button
            size={"icon"}
            variant={"ghost"}
            onClick={() => router.push("/dashboard/doctor")}
          >
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
        <div></div>
      </div>
    </div>
  );
};

export default DoctorPortal;
