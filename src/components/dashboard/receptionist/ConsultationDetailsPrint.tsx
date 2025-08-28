"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Download, FileText } from "lucide-react";
import { getAppointmentEprescriptionDetails } from "@/services/receptionist.api";
import { EPrescriptionDetails } from "@/types/receptionist.types";
import { toast } from "sonner";
import { handlePrintPrescription } from "@/components/helper/prescriptionPrintHelper";

interface LabTestOrder {
  id: string;
  appointment_id: string;
  patient_id: string;
  practitioner_id: string;
  test_name: string;
  test_code: string;
  status: string;
  priority: string;
  test_report_path: string;
  created_at: string;
  updated_at: string;
}

const ConsultationDetailsPrint: React.FC<{ apptId: string }> = ({ apptId }) => {
  const { downloadReportsData } = useSelector(
    (state: RootState) => state.receptionistData
  );

  const handleDownloadPrescription = async () => {
    try {
      const response = await getAppointmentEprescriptionDetails(
        downloadReportsData?.all_appointment_details?.visit_note?.appointment_id
      );
      handlePrintPrescription(response);
      // setEPrescriptionDetails(response);
    } catch (error) {
      toast.error("Error fetching prescription details");
      console.error("Error fetching prescription details:", error);
    }
  };

  const handleDownloadReport = (reportUrl: string, testName: string) => {
    if (reportUrl) {
      // Create a temporary link element to download the file
      const link = document.createElement("a");
      link.href = reportUrl;
      link.download = `${testName}_report.pdf`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const columns: ColumnDef<LabTestOrder>[] = [
    {
      accessorKey: "test_name",
      header: "Test Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("test_name")}</div>
      ),
    },
    {
      accessorKey: "test_code",
      header: "Test Code",
      cell: ({ row }) => (
        <div className="text-gray-600">{row.getValue("test_code")}</div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"));
        return <div>{date.toLocaleDateString()}</div>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <div
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              status === "completed"
                ? "bg-green-100 text-green-800"
                : status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {status}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const testOrder = row.original;
        return (
          <Button
            onClick={() =>
              handleDownloadReport(
                testOrder.test_report_path,
                testOrder.test_name
              )
            }
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Report
          </Button>
        );
      },
    },
  ];

  if (!downloadReportsData) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500">No consultation data available</p>
      </div>
    );
  }

  const labTestOrders = downloadReportsData.lab_test_orders || [];
  const hasPrescription =
    downloadReportsData.all_appointment_details?.medication_request;

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Consultation Details
          </h3>
          <p className="text-gray-600">
            Patient:{" "}
            {
              downloadReportsData.all_appointment_details?.patient
                ?.patient_display_id
            }
          </p>
        </div>

        {/* Download Prescription Button */}
        {hasPrescription && (
          <Button
            onClick={handleDownloadPrescription}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Download Prescription
          </Button>
        )}
      </div>

      {/* Lab Test Orders Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Lab Test Orders
          </h3>
          <span className="text-sm text-gray-500">
            {labTestOrders.length} test{labTestOrders.length !== 1 ? "s" : ""}{" "}
            found
          </span>
        </div>

        {labTestOrders.length > 0 ? (
          <DataTable columns={columns} data={labTestOrders} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No lab test orders found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationDetailsPrint;
