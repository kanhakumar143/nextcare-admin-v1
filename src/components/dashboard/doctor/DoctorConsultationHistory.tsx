"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  FlaskConical,
  Stethoscope,
  Pill,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { AppDispatch, RootState } from "@/store";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import { useDispatch, useSelector } from "react-redux";
import { PatientInfo } from "@/types/doctor.types";
import {
  fetchAssignedAppointments,
  setSinglePatientDetails,
} from "@/store/slices/doctorSlice";
import { useAuthInfo } from "@/hooks/useAuthInfo";

const patientHistory = [
  {
    id: "1",
    name: "Aarav Mehta",
    age: 34,
    gender: "Male",
    date: "2025-07-20",
    status: "completed",
    summary:
      "Patient reported mild chest pain. ECG normal. Advised lifestyle changes.",
    medicines: ["Aspirin 75mg - Once Daily", "Atorvastatin 10mg - At Night"],
    labTests: ["Lipid Profile", "ECG"],
  },
  {
    id: "2",
    name: "Sneha Kapoor",
    age: 27,
    gender: "Female",
    date: "2025-07-19",
    status: "follow-up",
    summary: "Complaints of fatigue and weight loss. Suspected hypothyroidism.",
    medicines: ["Thyroxine 50mcg - Morning empty stomach"],
    labTests: ["TSH", "CBC"],
  },
  {
    id: "3",
    name: "Rohit Verma",
    age: 45,
    gender: "Male",
    date: "2025-07-18",
    status: "completed",
    summary:
      "Routine check-up. No major complaints. Advised vitamin D supplement.",
    medicines: ["Vitamin D3 - Once weekly"],
    labTests: ["Vitamin D3 Level", "Blood Sugar Fasting"],
  },
  {
    id: "4",
    name: "Priya Singh",
    age: 31,
    gender: "Female",
    date: "2025-07-17",
    status: "cancelled",
    summary: "Patient didn’t show up for the scheduled consultation.",
    medicines: [],
    labTests: [],
  },
];

const statusColors: Record<string, string> = {
  "follow-up": "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusOptions = ["all", "follow-up", "completed", "cancelled"];

export default function DoctorConsultationHistory() {
  const [filter, setFilter] = useState("all");
  const dispatch: AppDispatch = useDispatch();
  const { practitionerId } = useAuthInfo();

  const { patientAppointmentHistory } = useSelector(
    (state: RootState) => state.doctor
  );
  const router = useRouter();
  const filteredHistory =
    filter === "all"
      ? patientHistory
      : patientHistory.filter((p) => p.status === filter);

  const handlePatientInfo = (patient: PatientInfo) => {
    dispatch(setSinglePatientDetails(patient));
    router.push(`/dashboard/doctor/consultation/${patient.id}`);
  };

  useEffect(() => {
    if (!patientAppointmentHistory || patientAppointmentHistory.length === 0) {
      dispatch(fetchAssignedAppointments(practitionerId));
    }
  }, []);

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

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-border pb-4 flex gap-3 items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Appointment History
            </h1>
          </div>
        </div>
      </div>

      <Card className="bg-card border-border mx-1 my-4">
        <CardHeader>
          <CardTitle className="text-card-foreground">
            Appointment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={patientAppointmentHistory} />
        </CardContent>
      </Card>
    </div>
  );
}
