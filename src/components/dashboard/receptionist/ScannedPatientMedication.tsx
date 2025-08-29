import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { DataTable } from "@/components/common/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Medication } from "@/types/doctor.types";
import { MedicationReminder } from "@/types/receptionist.types";
import moment from "moment";
import { Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import MedicationReminderModal from "./modals/MedicationReminderModal";
import { toast } from "sonner";
import { getAllMedicationReminders } from "@/services/receptionist.api";

const ScannedPatientMedication = () => {
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] =
    useState<Medication | null>(null);
  const [medicationReminders, setMedicationReminders] = useState<
    MedicationReminder[]
  >([]);

  const { medicationDetailsForReminder } = useSelector(
    (state: RootState) => state.receptionistData
  );

  const handleOpenReminderModal = (medication: Medication) => {
    setSelectedMedication(medication);
    setIsReminderModalOpen(true);
  };

  const handleReminderModalClose = () => {
    setIsReminderModalOpen(false);
    // Refresh the reminders list when modal closes
    medicationRemindersOfPatient();
  };

  useEffect(() => {
    medicationRemindersOfPatient();
  }, []);

  const medicationRemindersOfPatient = async () => {
    try {
      const response = await getAllMedicationReminders(
        medicationDetailsForReminder?.all_appointment_details?.patient?.id
      );
      setMedicationReminders(response?.data || response || []);
    } catch {
      toast.error("Something went wrong while fetching medication reminders.");
    }
  };

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
    {
      id: "action",
      header: "Action",
      cell: ({ row }) => (
        <Button
          onClick={() => handleOpenReminderModal(row.original)}
          className=""
          size={"icon"}
          variant={"outline"}
        >
          <Timer size={18} />
        </Button>
      ),
    },
  ];

  // Medication Reminders Columns
  const MedicationRemindersColumns: ColumnDef<MedicationReminder>[] = [
    {
      accessorKey: "medication_id",
      header: "Medication ID",
      cell: ({ getValue }) => {
        const id = getValue() as string;
        return id?.substring(0, 8) + "...";
      },
    },
    {
      accessorKey: "reminder_time",
      header: "Reminder Time",
      cell: ({ getValue }) => {
        const time = getValue() as string;
        return moment(time, "HH:mm:ss").format("h:mm A");
      },
    },
    {
      accessorKey: "start_date",
      header: "Start Date",
      cell: ({ getValue }) => {
        const date = getValue() as string;
        return moment(date).format("MMM DD, YYYY");
      },
    },
    {
      accessorKey: "end_date",
      header: "End Date",
      cell: ({ getValue }) => {
        const date = getValue() as string;
        return moment(date).format("MMM DD, YYYY");
      },
    },
    {
      accessorKey: "frequency_per_day",
      header: "Frequency/Day",
      cell: ({ getValue }) => {
        const frequency = getValue() as number;
        return `${frequency} ${frequency === 1 ? "time" : "times"}`;
      },
    },
    {
      accessorKey: "is_sent",
      header: "Status",
      cell: ({ getValue }) => {
        const isSent = getValue() as boolean;
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              isSent
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {isSent ? "Sent" : "Pending"}
          </span>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ getValue }) => {
        const date = getValue() as string;
        return moment(date).format("MMM DD, YYYY HH:mm");
      },
    },
  ];

  return (
    <div className="w-full mt-6">
      <h2 className="text-lg font-semibold mb-3">
        Set Medication Reminders for
      </h2>
      <DataTable
        data={
          medicationDetailsForReminder?.all_appointment_details
            ?.medication_request.medications || []
        }
        columns={MedicationColumns}
        // pageSize={5}
      />

      <h2 className="text-lg font-semibold mb-3 mt-8">Medication Reminders</h2>
      <DataTable
        data={medicationReminders}
        columns={MedicationRemindersColumns}
        // pageSize={5}
      />

      <MedicationReminderModal
        open={isReminderModalOpen}
        onOpenChange={handleReminderModalClose}
        medication={selectedMedication}
        patientId={
          medicationDetailsForReminder?.all_appointment_details?.patient?.id
        }
      />
    </div>
  );
};

export default ScannedPatientMedication;
