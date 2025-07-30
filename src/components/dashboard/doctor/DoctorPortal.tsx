"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/common/DataTable";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import patientsData from "../../../mock/mockData.json";
import { useAuthInfo } from "@/hooks/useAuthInfo";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
  fetchAssignedAppointments,
  setSinglePatientDetails,
} from "@/store/slices/doctorSlice";
import { PatientInfo } from "@/types/doctor.types";

const DoctorPortal = () => {
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const { practitionerId } = useAuthInfo();
  const { patientQueueList, patientAppointmentHistory } = useSelector(
    (state: RootState) => state.doctor
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
            <DataTable columns={columns} data={patientQueueList} />
          </CardContent>
        </Card>

        {/* <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">
              Today's Patient Appointment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={patientAppointmentHistory} />
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
};

export default DoctorPortal;
