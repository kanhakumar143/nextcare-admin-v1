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
};

export default function LogAttendance() {
  const router = useRouter();
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
      cell: ({ getValue }) => {
        const isActive = getValue() as boolean;
        return (
          <Badge
            className={
              isActive
                ? "bg-green-500 text-white w-16"
                : "bg-red-500 text-white w-16"
            }
          >
            {isActive ? "Active" : "Inactive"}
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
              onClick={() => router.push(`/dashboard/doctor/${doctor.user_id}`)}
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
