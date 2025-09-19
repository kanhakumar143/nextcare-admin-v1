"use client";
import { getPractitionerByRole } from "@/services/admin.api";
import { DoctorData } from "@/types/admin.types";
import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/DataTable";
import { Input } from "@/components/ui/input";
import { ArrowRight, MoveRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";

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
export default function AllDoctors() {
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

  const router = useRouter();

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
      header: "Service Specialty",
      accessorKey: "service_specialty.display",
      cell: ({ row }) => row.original.service_specialty?.display ?? "N/A",
    },
    // {
    //   header: "Qualification",
    //   cell: ({ row }) =>
    //     row.original.qualification?.[0]?.degree
    //       ? `${row.original.qualification[0].degree}, ${row.original.qualification[0].institution}`
    //       : "N/A",
    // },
    {
      header: "Status",
      accessorFn: (row) => row.is_active,
      cell: ({ getValue }) => {
        const isActive = getValue() as boolean;
        return (
          <Badge
            className={
              isActive
                ? "bg-green-700 text-white w-16"
                : "bg-red-700 text-white w-16"
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
              variant="secondary"
              className="cursor-pointer"
              size="icon"
              onClick={() => {
                router.push(
                  `/dashboard/admin/notify-patient/all-appointments?practitioner_id=${doctor.id}`
                );
              }}
            >
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        );
      },
    },
  ];
  return (
    <div className="p-2 space-y-4">
      <Label className="text-2xl font-bold">All Doctors</Label>
      <Input
        placeholder="Search by Doctor Name..."
        value={filterValue}
        onChange={(e) => setFilterValue(e.target.value)}
        className="max-w-sm"
      />
      <DataTable<ExtendedDoctorData>
        columns={columns}
        data={practitioners}
        filterColumn="name"
        externalFilterValue={filterValue}
      />
    </div>
  );
}
