import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { DataTable } from "@/components/common/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Medication } from "@/types/doctor.types";
import moment from "moment";
import { Timer } from "lucide-react";
import { Button } from "@/components/ui/button";

const ScannedPatientMedication = () => {
  const { medicationDetailsForReminder } = useSelector(
    (state: RootState) => state.receptionistData
  );
  console.log(
    "Downloaded Reports Data:",
    medicationDetailsForReminder?.all_appointment_details?.medication_request
      .medications
  );

  // Define columns based on your API response

  const MedicationColumns: ColumnDef<Medication>[] = [
    {
      accessorKey: "name",
      header: "Medication Name",
    },
    {
      accessorKey: "strength",
      header: "Strength",
    },
    {
      accessorKey: "route",
      header: "Route",
      cell: ({ getValue }) => {
        const route = getValue() as string;
        return route?.charAt(0).toUpperCase() + route?.slice(1);
      },
    },
    {
      accessorKey: "form",
      header: "Form",
      cell: ({ getValue }) => {
        const form = getValue() as string;
        return form?.charAt(0).toUpperCase() + form?.slice(1);
      },
    },
    {
      accessorKey: "frequency",
      header: "Frequency",
      cell: ({ getValue }) => {
        const frequency = getValue() as string;
        return frequency
          ?.replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
      },
    },
    {
      accessorKey: "duration",
      header: "Duration (Days)",
    },
    {
      accessorKey: "timing",
      header: "Timing",
      cell: ({ getValue }) => {
        const timing = getValue() as {
          morning: boolean;
          afternoon: boolean;
          evening: boolean;
          night: boolean;
        };
        const activeTimes = Object.entries(timing)
          .filter(([_, active]) => active)
          .map(([time, _]) => time.charAt(0).toUpperCase() + time.slice(1));
        return activeTimes.join(", ") || "Not specified";
      },
    },
    {
      id: "instructions",
      header: "Instructions & Notes",
      cell: ({ row }) => {
        const medication = row.original;
        return (
          <div className="text-sm space-y-1">
            {medication.dosage_instruction && (
              <div className="font-medium text-gray-700">
                {medication.dosage_instruction}
              </div>
            )}
            {/* {medication.note?.info && (
              <div className="text-gray-600 italic">
                Note: {medication.note.info}
              </div>
            )} */}
          </div>
        );
      },
    },
    // {
    //   id: "action",
    //   header: "Action",
    //   cell: ({ row }) => (
    //     <Button
    //       onClick={() => console.log(row.original)}
    //       className=""
    //       size={"icon"}
    //     >
    //       <Timer size={18} />
    //     </Button>
    //   ),
    // },
  ];

  return (
    <div className="w-full mt-6">
      <h2 className="text-lg font-semibold mb-3">Medication Details</h2>
      <DataTable
        data={
          medicationDetailsForReminder?.all_appointment_details
            ?.medication_request.medications || []
        }
        columns={MedicationColumns}
        // pageSize={5}
      />
    </div>
  );
};

export default ScannedPatientMedication;
