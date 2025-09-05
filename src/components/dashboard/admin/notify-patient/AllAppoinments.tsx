"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchUpcomingAppointmentsByPractitioner } from "@/store/slices/allAppointmentSlice";
import { DataTable } from "@/components/common/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { RootState, AppDispatch } from "@/store";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BellPlus } from "lucide-react";
import SendNotification from "@/components/dashboard/admin/notify-patient/modals/SendNotification";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface Appointment {
  appointment_display_id: string;
  patient_id: string;
  patient_name: string;
  patient_phone: string;
  created_at: string;
  status: string;
}

const statusColors: Record<string, string> = {
  proposed: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
  booked: "bg-sky-700 text-white",
  arrived: "bg-indigo-100 text-indigo-800",
  fulfilled: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  entered_in_error: "bg-red-200 text-red-900",
  checked_in: "bg-green-600 text-white",
  waitlist: "bg-orange-400 text-orange-800",
  report_ready: "bg-pink-100 text-pink-800",
};

export default function AllAppointments() {
  const [filterValue, setFilterValue] = useState("");
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);

  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();
  const practitionerId = searchParams.get("practitioner_id");

  const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
  const {
    upcoming = [],
    loading = false,
    error = null,
  } = useTypedSelector((state) => state.allAppointments);

  useEffect(() => {
    if (practitionerId) {
      dispatch(fetchUpcomingAppointmentsByPractitioner(practitionerId));
    }
  }, [practitionerId, dispatch]);

  const toggleSelect = (patientId: string) => {
    setSelectedPatients((prev) =>
      prev.includes(patientId)
        ? prev.filter((id) => id !== patientId)
        : [...prev, patientId]
    );
  };

  const selectAll = () => {
    const allPatientIds = upcoming.map((appt) => appt.patient_id);
    setSelectedPatients(allPatientIds);
  };

  const deselectAll = () => {
    setSelectedPatients([]);
  };

  const isAllSelected =
    upcoming.length > 0 && selectedPatients.length === upcoming.length;

  const columns = useMemo<ColumnDef<Appointment>[]>(() => {
    return [
      {
        id: "select",
        header: () => <span>Select</span>,
        cell: ({ row }) => {
          const appt = row.original;
          return (
            <Checkbox
              checked={selectedPatients.includes(appt.patient_id)}
              onCheckedChange={() => toggleSelect(appt.patient_id)}
            />
          );
        },
      },
      { header: "Appointment ID", accessorKey: "appointment_display_id" },
      { header: "Patient Name", accessorKey: "patient_name" },
      { header: "Patient Phone", accessorKey: "patient_phone" },
      {
        header: "Created At",
        accessorKey: "created_at",
        cell: ({ getValue }) => {
          const dateStr = getValue<string>();
          const date = new Date(dateStr);
          return format(date, "dd/MM/yy HH:mm");
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ getValue }) => {
          const status = getValue<string>();
          const classes = statusColors[status] || "bg-gray-200 text-gray-800";
          return (
            <Badge className={`${classes} w-20 text-center`}>
              {status.replaceAll("_", " ")}
            </Badge>
          );
        },
      },
    ];
  }, [selectedPatients]);

  const router = useRouter();

  return (
    <div className="p-2 space-y-4">
      {/* Filter + Select All/Deselect All + Global Send Notification */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Filter by Appointment ID..."
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="max-w-sm"
          />

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={isAllSelected ? deselectAll : selectAll}
              disabled={upcoming.length === 0}
            >
              {isAllSelected ? "Deselect All" : "Select All"}
            </Button>
            {/* {selectedPatients.length > 0 && (
              <span className="text-sm text-gray-600">
                {selectedPatients.length} selected
              </span>
            )} */}
          </div>
        </div>

        <SendNotification
          icon={<BellPlus className="w-6 h-6 cursor-pointer" />}
          triggerText="Send Notification"
          patientIds={selectedPatients}
          onSend={() =>
            toast.success(`Sent to ${selectedPatients.length} patients.`)
          }
        />
      </div>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && upcoming.length === 0 && <div>No appointments found.</div>}

      <DataTable
        columns={columns}
        data={upcoming}
        filterColumn="appointment_display_id"
        externalFilterValue={filterValue}
      />

      <div className="flex justify-start">
        <Button
          variant="secondary"
          onClick={() => router.back()}
          className="flex items-center cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
      </div>
    </div>
  );
}
