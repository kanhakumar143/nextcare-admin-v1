"use client";

import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/DataTable";
import { DoctorData } from "@/types/admin.types";
import { getPractitionerByRole } from "@/services/admin.api";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setPractitionerAttendanceData } from "@/store/slices/receptionistSlice";
import { PractitionerAttendanceData } from "@/types/receptionist.types";

type ExtendedDoctorData = DoctorData & {
  name: string;
  id: string;
  user_id: string;
  license_details: {
    number?: string;
    issued_by?: string;
    expiry?: string;
  };
  qualification: {
    degree?: string;
    institution?: string;
    year?: string;
  }[];
  availability_status: {
    availability_status: string;
  };
};

export default function LogAttendance() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [filterValue, setFilterValue] = useState("");
  const [practitioners, setPractitioners] = useState<ExtendedDoctorData[]>([]);

  const fetchPractitionerByRole = async () => {
    try {
      const res = await getPractitionerByRole("doctor");
      const data = (res?.data || []).map((doc: DoctorData) => ({
        ...doc,
        name: doc.user?.name ?? "",
      }));
      setPractitioners(data);
    } catch (error) {
      console.error("Failed to fetch practitioners:", error);
    }
  };

  const handleAttendanceClick = (doctor: ExtendedDoctorData) => {
    // Create a simplified practitioner data structure
    const practitionerData: PractitionerAttendanceData = {
      practitioner_display_id: doctor.practitioner_display_id || "",
      identifiers: [],
      name: {
        use: null,
        text: null,
        family: doctor.name.split(" ").pop() || "",
        given: [doctor.name.split(" ")[0] || doctor.name],
        prefix: [],
        suffix: null,
        period: null,
      },
      telecom: [],
      gender: "unknown",
      birth_date: "",
      qualification: doctor.qualification || [],
      is_active: doctor.is_active,
      license_details: doctor.license_details || {},
      profile_picture_url: "",
      license_url: "",
      e_sign_path: null,
      status: "unverified",
      id: doctor.id,
      user_id: doctor.user_id,
      user: {
        id: doctor.user_id,
        name: doctor.name,
        email: doctor.user?.email || "",
        phone: doctor.user?.phone || "",
        user_role: "doctor",
        is_active: doctor.is_active,
        created_at: "",
        updated_at: "",
        tenant: {
          id: "",
          active: true,
          name: "",
          alias: [],
          contact: [],
        },
      },
      availability_status: {
        practitioner_id: doctor.id,
        practitioner_name: doctor.name,
        date: new Date().toISOString().split("T")[0],
        availability_status:
          doctor.availability_status?.availability_status || "UNAVAILABLE",
        attendance_details: null,
        break_details: null,
        check_in_time: null,
        check_out_time: null,
        total_hours: null,
      },
    };

    // Dispatch to Redux store
    dispatch(setPractitionerAttendanceData(practitionerData));

    // Navigate to attendance page
    router.push(`/dashboard/receptionist/attendance/${doctor.user_id}`);
  };

  useEffect(() => {
    fetchPractitionerByRole();
  }, []);

  const columns: ColumnDef<ExtendedDoctorData>[] = [
    {
      header: "Doctor Name",
      accessorKey: "name",
    },
    {
      header: "Practitioner ID",
      accessorKey: "practitioner_display_id",
    },
    {
      header: "License Number",
      accessorKey: "license_details.number",
      cell: ({ row }) => row.original.license_details?.number ?? "N/A",
    },
    {
      header: "Status",
      accessorFn: (row) => row.is_active,
      cell: (row) => {
        const status = row.row.original;
        return (
          <Badge
            className={
              status.availability_status.availability_status === "UNAVAILABLE"
                ? "bg-red-700 text-white w-16"
                : "bg-green-700 text-white w-16"
            }
          >
            {status.availability_status.availability_status === "UNAVAILABLE"
              ? "Absent"
              : "Present"}
          </Badge>
        );
      },
    },
    {
      header: "Actions",
      cell: ({ row }) => {
        const doctor = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleAttendanceClick(doctor)}
            >
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Filter by Doctor Name..."
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <DataTable<ExtendedDoctorData>
        columns={columns}
        data={practitioners}
        filterColumn="name"
        externalFilterValue={filterValue}
      />
    </div>
  );
}
