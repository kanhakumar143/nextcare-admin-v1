import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { DataTable } from "@/components/common/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Medication } from "@/types/doctor.types";
import { MedicationReminder } from "@/types/receptionist.types";
import moment from "moment";
import { Timer, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import MedicationReminderModal from "./modals/MedicationReminderModal";
import { toast } from "sonner";
import { getAllMedicationReminders } from "@/services/receptionist.api";
import { setEditingMedicationReminder } from "@/store/slices/receptionistSlice";

const ScannedPatientMedication = () => {
  const dispatch = useDispatch();
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
    dispatch(setEditingMedicationReminder(null)); // Clear any existing edit data
    setIsReminderModalOpen(true);
  };

  const handleOpenEditReminderModal = (reminder: MedicationReminder) => {
    dispatch(setEditingMedicationReminder(reminder)); // Set the reminder data for editing
    // Convert reminder medication to the expected Medication type
    const medicationData: Medication = {
      ...reminder.medication,
      note: reminder.medication.note
        ? { info: reminder.medication.note }
        : undefined,
    };
    setSelectedMedication(medicationData); // Set medication data
    setIsReminderModalOpen(true);
  };

  const handleReminderModalClose = () => {
    setIsReminderModalOpen(false);
    dispatch(setEditingMedicationReminder(null)); // Clear edit data when modal closes
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
      accessorKey: "medication.name",
      header: "Medication",
      cell: ({ row }) => {
        const medication = row.original.medication;
        return (
          <div className="space-y-1">
            <div className="font-medium text-gray-900">
              {medication?.name || "N/A"}
            </div>
            <div className="text-xs text-gray-500">
              {medication?.strength} • {medication?.form}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "medication.route",
      header: "Route & Frequency",
      cell: ({ row }) => {
        const medication = row.original.medication;
        return (
          <div className="space-y-1">
            <div className="text-sm font-medium">
              {medication?.route?.charAt(0).toUpperCase() +
                medication?.route?.slice(1)}
            </div>
            <div className="text-xs text-gray-500">
              {medication?.frequency
                ?.replace(/-/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "medication.timing",
      header: "Timing",
      cell: ({ row }) => {
        const timing = row.original.medication?.timing;
        if (!timing) return "Not specified";

        const activeTimes = Object.entries(timing)
          .filter(([_, active]) => active)
          .map(([time, _]) => time.charAt(0).toUpperCase() + time.slice(1));
        return (
          <div className="text-sm">
            {activeTimes.join(", ") || "Not specified"}
          </div>
        );
      },
    },
    {
      accessorKey: "reminder_time",
      header: "Reminder Time",
      cell: ({ getValue }) => {
        const time = getValue() as string;
        return (
          <div className="font-medium text-blue-600">
            {moment(time, "HH:mm:ss").format("h:mm A")}
          </div>
        );
      },
    },
    {
      accessorKey: "frequency_per_day",
      header: "Daily Frequency",
      cell: ({ getValue }) => {
        const frequency = getValue() as number;
        return (
          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
            {frequency} {frequency === 1 ? "time" : "times"}/day
          </span>
        );
      },
    },
    {
      id: "duration",
      header: "Duration",
      cell: ({ row }) => {
        const startDate = row.original.start_date;
        const endDate = row.original.end_date;
        const duration = row.original.medication?.duration;

        return (
          <div className="space-y-1">
            <div className="text-sm font-medium">{duration || "N/A"}</div>
            <div className="text-xs text-gray-500">
              {moment(startDate).format("MMM DD")} -{" "}
              {moment(endDate).format("MMM DD, YYYY")}
            </div>
          </div>
        );
      },
    },
    // {
    //   accessorKey: "is_sent",
    //   header: "Status",
    //   cell: ({ row }) => {
    //     const isSent = row.original.is_sent;
    //     const sentAt = row.original.sent_at;

    //     return (
    //       <div className="space-y-1">
    //         <span
    //           className={`px-2 py-1 rounded-full text-xs font-medium ${
    //             isSent
    //               ? "bg-green-100 text-green-800"
    //               : "bg-yellow-100 text-yellow-800"
    //           }`}
    //         >
    //           {isSent ? "Sent" : "Pending"}
    //         </span>
    //         {isSent && sentAt && (
    //           <div className="text-xs text-gray-500">
    //             {moment(sentAt).format("MMM DD, h:mm A")}
    //           </div>
    //         )}
    //       </div>
    //     );
    //   },
    // },
    {
      accessorKey: "creator_role",
      header: "Created By",
      cell: ({ row }) => {
        const creatorRole = row.original.creator_role;
        const createdAt = row.original.created_at;

        return (
          <div className="space-y-1">
            <div className="text-sm font-medium capitalize">
              {creatorRole?.replace("_", " ")}
            </div>
            <div className="text-xs text-gray-500">
              {moment(createdAt).format("MMM DD, YYYY")}
            </div>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          onClick={() => handleOpenEditReminderModal(row.original)}
          size="icon"
          variant="outline"
          className="h-8 w-8"
        >
          <Edit size={16} />
        </Button>
      ),
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
