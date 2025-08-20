"use client";

import { DataTable } from "@/components/common/DataTable";
import { Check, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setSelectedOrder } from "@/store/slices/labTechnicianSlice";

type LabOrder = {
  id: string;
  appointment_id: string;
  patient_id: string;
  practitioner_id: string;
  test_code: string;
  test_display: string;
  status: string;
  intent: string;
  priority: string;
  test_report_path: string | null;
  authored_on: string;
  created_at: string;
  updated_at: string;
  notes: any[];
};

export default function LabOrderTable({
  labOrders,
}: {
  labOrders: LabOrder[];
}) {
  const router = useRouter();
  const dispatch = useDispatch();

  const columns = [
    {
      accessorKey: "test_display",
      header: "Test",
    },
    {
      accessorKey: "test_code",
      header: "Code",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      accessorKey: "priority",
      header: "Priority",
    },
    {
      accessorKey: "intent",
      header: "Intent",
    },
    {
      header: "File",
      cell: ({ row }: any) => {
        const order = row.original;
        if (order.test_report_path === null) {
          return <span>No File</span>;
        }
        return (
          <span className="flex justify-start gap-3 items-center">
            <Check className="w-4 h-4 text-green-500" /> Uploaded
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }: any) => {
        const order = row.original;
        return (
          <button
            onClick={() => {
              dispatch(setSelectedOrder(order));
              router.push(`/dashboard/lab-technician/upload`);
            }}
          >
            <Upload className="w-5 h-5" />
          </button>
        );
      },
    },
  ];

  return <DataTable data={labOrders || []} columns={columns} />;
}
