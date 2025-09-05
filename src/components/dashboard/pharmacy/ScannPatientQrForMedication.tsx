"use client";

import React, { useEffect, useState } from "react";
import {
  clearError,
  setDownloadReportsData,
  setMedicationDetailsForReminder,
  setQrToken,
} from "@/store/slices/receptionistSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
  AlertCircleIcon,
  ArrowRight,
  Calendar as CalendarIcon,
  ChevronRight,
} from "lucide-react";
import QrScannerBox from "@/components/common/QrScannerBox";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { fetchDecodeQrDetailsForReports } from "@/services/receptionist.api";
import ScannedPatientMedication from "./ScannedPatientMedication";
import { toast } from "sonner";
import { fetchAllAppointmentsByDate } from "@/services/pharmacy.api";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import NestedTableComponent from "@/components/common/NestedTableComponent";
import { setSelectedPrescriptionData } from "@/store/slices/pharmacySlice";
import { useRouter } from "next/navigation";

const ScannedPatientQrForMedication: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { medicationDetailsForReminder } = useSelector(
    (state: RootState) => state.receptionistData
  );

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [appointmentData, setAppointmentData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch today's data on component mount
  useEffect(() => {
    const today = new Date();
    const formattedDate = format(today, "yyyy-MM-dd");
    fetchPatientMedicationDetails(formattedDate);
  }, []);

  // const handleScanSuccess = async (token: string) => {
  //   dispatch(clearError());
  //   try {
  //     const data = await fetchDecodeQrDetailsForReports({ accessToken: token });
  //     dispatch(setQrToken(token));
  //     console.log("Fetched report data:", data.data);
  //     dispatch(setMedicationDetailsForReminder(data.data));
  //   } catch (error) {
  //     console.error("Error fetching QR details:", error);
  //   }
  // };

  const fetchPatientMedicationDetails = async (date: string) => {
    setIsLoading(true);
    try {
      const response = await fetchAllAppointmentsByDate(date);
      console.log("Fetched medication details:", response.data);
      setAppointmentData(response || []);
      toast.success("Fetched medication details successfully.");
    } catch {
      toast.error("No Appointments found on this date.");
      setAppointmentData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setIsCalendarOpen(false);
      const formattedDate = format(date, "yyyy-MM-dd");
      fetchPatientMedicationDetails(formattedDate);
    }
  };

  const handleViewPrescription = (appointmentData: any) => {
    // Check if the appointment has prescriptions
    console.log(appointmentData);
    if (
      appointmentData.prescriptions &&
      appointmentData.prescriptions.length > 0
    ) {
      // Store the appointment data in Redux
      dispatch(setSelectedPrescriptionData(appointmentData));
      // Navigate to prescription details page
      router.push(
        "/dashboard/pharmacy/patient-medication/prescription-details"
      );
    } else {
      toast.error("No prescription found for this appointment.");
    }
  };

  const columns = [
    {
      label: "Appointment ID",
      accessor: "appointment_display_id",
      className: "min-w-[150px]",
    },
    {
      label: "Patient Name",
      accessor: "patientName",
      className: "min-w-[200px]",
      cellRenderer: (row: any) => row.patient?.user?.name || "N/A",
    },
    {
      label: "Patient ID",
      accessor: "patientId",
      className: "min-w-[150px]",
      cellRenderer: (row: any) => row.patient?.patient_display_id || "N/A",
    },
    {
      label: "Phone",
      accessor: "phone",
      className: "min-w-[120px]",
      cellRenderer: (row: any) => row.patient?.user?.phone || "N/A",
    },

    {
      label: "Status",
      accessor: "status",
      className: "min-w-[120px]",
    },
    {
      label: "Slot Time",
      accessor: "slot",
      className: "min-w-[150px]",
      cellRenderer: (row: any) => {
        const slot = row.slot;
        if (slot?.start) {
          const startTime = new Date(slot.start);
          const endTime = new Date(slot.end);
          return `${format(startTime, "HH:mm")} - ${format(endTime, "HH:mm")}`;
        }
        return "N/A";
      },
    },
    {
      label: "Prescriptions",
      accessor: "prescriptions",
      className: "min-w-[120px]",
      cellRenderer: (row: any) => {
        const prescriptions = row.prescriptions || [];
        const medicationCount = prescriptions.reduce(
          (total: number, prescription: any) => {
            return total + (prescription.medications?.length || 0);
          },
          0
        );
        return medicationCount > 0
          ? `${medicationCount} medication${medicationCount > 1 ? "s" : ""}`
          : "No medications";
      },
    },
    {
      label: "Actions",
      accessor: "actions",
      className: "min-w-[100px]",
      cellRenderer: (row: any) => (
        <Button
          variant="ghost"
          size="sm"
          className="p-2 hover:bg-primary/10"
          onClick={() => {
            handleViewPrescription(row);
          }}
        >
          <ArrowRight />
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col items-center justify-start p-6 gap-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-primary">
          Patient Medication Details
        </h1>
        <p className="text-gray-600">
          Select a date to view patient medication details for that day
        </p>
      </div>

      {/* Calendar Picker */}
      <div className="flex flex-col items-center gap-4">
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[240px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Table Display */}
      <div className="w-full max-w-7xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Appointments for{" "}
            {selectedDate ? format(selectedDate, "PPP") : "Today"}
          </h2>
          {isLoading && <div className="text-sm text-gray-500">Loading...</div>}
        </div>

        <NestedTableComponent
          columns={columns}
          data={appointmentData}
          caption={
            appointmentData.length > 0
              ? `Found ${appointmentData.length} appointment${
                  appointmentData.length > 1 ? "s" : ""
                }`
              : "No appointments found for the selected date"
          }
        />
      </div>

      {/* <div className="w-full max-w-md">
        <QrScannerBox
          onScanSuccess={(token) => handleScanSuccess(token)}
          buttonLabel="Start QR Scan"
        />
      </div> */}

      {/* {medicationDetailsForReminder && (
        <div className="w-full max-w-6xl space-y-6">
          <ScannedPatientMedication />
        </div>
      )} */}
    </div>
  );
};

export default ScannedPatientQrForMedication;
