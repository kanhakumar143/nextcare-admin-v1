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
  setConsultationMode,
  setTempAppointmentId,
} from "@/store/slices/doctorSlice";
import { PatientInfo } from "@/types/doctor.types";
import { useSidebar } from "@/components/ui/sidebar";

const DoctorPortal = () => {
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const { practitionerId } = useAuthInfo();
  const { patientQueueList, labTestsReviewData } = useSelector(
    (state: RootState) => state.doctor
  );
  const { setOpen, toggleSidebar } = useSidebar();
  const handlePatientInfo = (patient: PatientInfo) => {
    console.log("Patient Info: ", patient);
    dispatch(setSinglePatientDetails(patient));
    dispatch(setTempAppointmentId(patient.id));
    dispatch(setConsultationMode("new"));
    toggleSidebar(); // Close the sidebar
    router.push(`/dashboard/doctor/consultation/${patient.id}`);
  };

  const handleLabTests = (patient: PatientInfo) => {
    dispatch(setSinglePatientDetails(patient));
    dispatch(setConsultationMode("edit"));
    router.push(`/dashboard/doctor/consultation/${patient.id}`);
  };

  const columns: ColumnDef<PatientInfo>[] = [
    {
      header: "Patient Name",
      accessorFn: (row) => row.patient.user.name || "",
      cell: ({ getValue }) => <div>{getValue() as string}</div>,
    },
    {
      header: "Patient ID",
      accessorFn: (row) => row.patient.patient_display_id || "",
      cell: ({ getValue }) => <div>{getValue() as string}</div>,
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

  const columnsforCompletedLabTests: ColumnDef<PatientInfo>[] = [
    {
      header: "Patient Name",
      accessorFn: (row) => row.patient.user.name || "",
      cell: ({ getValue }) => <div>{getValue() as string}</div>,
    },
    {
      header: "Patient ID",
      accessorFn: (row) => row.patient.patient_display_id || "",
      cell: ({ getValue }) => <div>{getValue() as string}</div>,
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
          {(getValue() as string) === "report_ready"
            ? "Pending Review"
            : (getValue() as string)}
        </Badge>
      ),
    },
    {
      header: "Action",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleLabTests(row.original)}
          className="text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  useEffect(() => {
    // if (!patientQueueList || patientQueueList.length === 0) {
    dispatch(fetchAssignedAppointments(practitionerId));
    // setOpen(true);
    // }
  }, []);

  return (
    <div className=" bg-background p-6 w-full">
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

        {
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                Reports Pending Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columnsforCompletedLabTests}
                data={labTestsReviewData}
              />
            </CardContent>
          </Card>
        }

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
      </div>
    </div>
  );
};

export default DoctorPortal;
