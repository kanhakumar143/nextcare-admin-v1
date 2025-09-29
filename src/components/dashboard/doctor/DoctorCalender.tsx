"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { format, isSameDay } from "date-fns";
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
  patients?: Patient[];
}

const DoctorCalendar = ({ patients = [] }: PatientCalendarProps) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { practitionerId } = useAuthInfo();

  const { patientQueueList } = useSelector((state: RootState) => state.doctor);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  // Use either Redux store data or props data
  const appointmentData = patientQueueList && patientQueueList.length > 0 ? patientQueueList : patients;

  // Filter appointments based on selected date
  const filteredAppointments = useMemo(() => {
    if (!selectedDate || !appointmentData) return [];

    return appointmentData.filter((appointment: any) => {
      // Handle both API data structure and mock data structure
      const appointmentDate = appointment.slot_info?.start
        ? new Date(appointment.slot_info.start)
        : appointment.date
          ? new Date(appointment.date)
          : null;

      if (!appointmentDate) return false;
      return isSameDay(appointmentDate, selectedDate);
    });
  }, [selectedDate, appointmentData]);

  // Get dates that have appointments for calendar highlighting
  const appointmentDates = useMemo(() => {
    if (!appointmentData) return [];

    return appointmentData
      .map((appointment: any) => {
        // Handle both API data structure and mock data structure
        const appointmentDate = appointment.slot_info?.start
          ? new Date(appointment.slot_info.start)
          : appointment.date
            ? new Date(appointment.date)
            : null;

        return appointmentDate;
      })
      .filter((date: Date | null) => date !== null) as Date[];
  }, [appointmentData]);

  const handlePatientInfo = (patient: PatientInfo) => {
    dispatch(setSinglePatientDetails(patient));
    router.push(`/dashboard/doctor/consultation/${patient.id}`);
  };

  const columns: ColumnDef<any>[] = [
    {
      header: "Serial No.",
      cell: ({ row }) => {
        return <div className="px-5">{row.index + 1}</div>;
      },
    },
    // {
    //   header: "Patient Name",
    //   accessorFn: (row) => row.patient?.user?.name || row.name || "Unknown Patient",
    //   cell: ({ getValue }) => <div className="font-medium">{getValue() as string}</div>,
    // },
    // {
    //   header: "Appointment ID",
    //   accessorFn: (row) => row.appointment_display_id || row.id || "",
    //   cell: ({ getValue }) => <div className="text-sm text-muted-foreground">{getValue() as string}</div>,
    // },
    // {
    //   header: "Time Slot",
    //   cell: ({ row }) => {
    //     const appointment = row.original;

    //     // Handle API data structure (slot_info.start/end)
    //     if (appointment.slot_info?.start && appointment.slot_info?.end) {
    //       try {
    //         const startTime = new Date(appointment.slot_info.start);
    //         const endTime = new Date(appointment.slot_info.end);
    //         return (
    //           <div className="text-sm">
    //             {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
    //           </div>
    //         );
    //       } catch (error) {
    //         return <div className="text-muted-foreground">-</div>;
    //       }
    //     }

    //     // Handle mock data structure (slotStart/slotEnd)
    //     if (appointment.slotStart && appointment.slotEnd) {
    //       try {
    //         return (
    //           <div className="text-sm">
    //             {format(new Date(`2000-01-01T${appointment.slotStart}`), "h:mm a")} - {format(new Date(`2000-01-01T${appointment.slotEnd}`), "h:mm a")}
    //           </div>
    //         );
    //       } catch (error) {
    //         return <div className="text-muted-foreground">-</div>;
    //       }
    //     }

    //     return <div className="text-muted-foreground">-</div>;
    //   },
    // },
    {
      header: "Service",
      accessorFn: (row) => row.service_category?.[0]?.text || row.concern || "",
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
              modifiers={{
                hasAppointments: appointmentDates,
              }}
              modifiersStyles={{
                hasAppointments: {
                  backgroundColor: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
                  fontWeight: 'bold',
                },
              }}
            />
            <div className="mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-primary"></div>
                <span>Dates with appointments</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">
              Appointments -{" "}
              {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
              {selectedDate && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              filteredAppointments.length > 0 ? (
                <DataTable columns={columns} data={filteredAppointments} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No appointments scheduled for {format(selectedDate, "PPP")}
                </div>
              )
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Please select a date to view appointments
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default DoctorCalendar;
