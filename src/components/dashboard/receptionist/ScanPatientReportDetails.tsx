import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {DataTable} from "@/components/common/DataTable";
 import { ColumnDef } from "@tanstack/react-table";
import { LabTestOrder } from "@/types/doctor.types";
import moment from "moment";
import { Printer } from "lucide-react";
const ScannedPatientLabOrders = () => {
  const { appoinmentDetails } = useSelector(
    (state: RootState) => state.receptionistData
  );

  if (!appoinmentDetails?.lab_test_orders?.length) return null;

  // Define columns based on your API response
 

const labOrderColumns: ColumnDef<LabTestOrder>[] = [
  {
    accessorKey: "test_display",
    header: "Test Name",
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
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ getValue }) => {
      const date = getValue() as string;
      return moment(date).format("MM/DD/YY hh:mm A"); // e.g., 08/23/25 02:15 PM
    },
  },
  {
      id: "action",
      header: "Action",
      cell: ({ row }) => (
        <button
        //   onClick={() => handlePrint(row.original)}
          className=""
        >
          <Printer size={18} />
        </button>
      ),
    },
  ];


  return (
    <div className="w-full max-w-4xl mx-auto mt-6">
      <h2 className="text-lg font-semibold mb-3">Lab Test Orders</h2>
      <DataTable
        data={appoinmentDetails.lab_test_orders}
        columns={labOrderColumns}
        // pageSize={5}
      />
    </div>
  );
};

export default ScannedPatientLabOrders;
