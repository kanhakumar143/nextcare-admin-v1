"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/common/DataTable";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { PatientInfo } from "@/types/doctor.types";
import {
  fetchAssignedAppointments,
  setSinglePatientDetails,
} from "@/store/slices/doctorSlice";
import { ColumnDef } from "@tanstack/react-table";
import { useAuthInfo } from "@/hooks/useAuthInfo";

interface Patient {
  id: string;
  name: string;
  slotStart: string;
  slotEnd: string;
  concern: string;
  date: string;
  status: string;
}

interface PatientCalendarProps {
  patients: Patient[];
}

const DoctorCalendar = ({ patients }: PatientCalendarProps) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { practitionerId } = useAuthInfo();

  const { patientQueueList } = useSelector((state: RootState) => state.doctor);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const handlePatientInfo = (patient: PatientInfo) => {
    dispatch(setSinglePatientDetails(patient));
    router.push(`/dashboard/doctor/consultation/${patient.id}`);
  };

  const columns: ColumnDef<PatientInfo>[] = [
    {
      header: "Serial No.",
      cell: ({ row }) => {
        return <div className="px-5">{row.index + 1}</div>;
      },
    },
    {
      header: "Service",
      accessorFn: (row) => row.service_category[0]?.text || "",
      cell: ({ getValue }) => <div>{getValue() as string}</div>,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ getValue }) => (
        <Badge
          variant={getValue() === "scheduled" ? "secondary" : "outline"}
          className="bg-secondary text-secondary-foreground"
        >
          {getValue() as string}
        </Badge>
      ),
    },
    {
      header: "Action",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handlePatientInfo(row.original)}
          className="text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  useEffect(() => {
    if (!patientQueueList || patientQueueList.length === 0) {
      dispatch(fetchAssignedAppointments(practitionerId));
    }
  }, []);

  return (
    <>
      <div className="py-8 flex items-center gap-3">
        {/* <Button size={"icon"} variant={"ghost"} onClick={() => router.back()}>
          <ArrowLeft />
        </Button> */}
        <h2 className="text-3xl font-bold">Patient Management</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border border-border bg-background w-full"
            />
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">
              Appointments -{" "}
              {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={patientQueueList} />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default DoctorCalendar;
