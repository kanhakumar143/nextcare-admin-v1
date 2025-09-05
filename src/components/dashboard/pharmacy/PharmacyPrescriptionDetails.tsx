"use client";

import { Calendar, FileText, Shield, FileSearch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import React, { useEffect } from "react";
import moment from "moment";
import { useRouter } from "next/navigation";
import { clearSelectedPrescriptionData } from "@/store/slices/pharmacySlice";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const PharmacyPrescriptionDetails = () => {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const { selectedPrescriptionData } = useSelector(
    (state: RootState) => state.pharmacy
  );

  useEffect(() => {
    // If no prescription data, redirect back
    if (!selectedPrescriptionData) {
      router.push("/dashboard/pharmacy/patient-medication");
    }
  }, [selectedPrescriptionData, router]);

  const handleBackClick = () => {
    dispatch(clearSelectedPrescriptionData());
    router.push("/dashboard/pharmacy/patient-medication");
  };

  if (!selectedPrescriptionData) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white min-h-screen">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-gray-500">
            Loading prescription details...
          </p>
        </div>
      </div>
    );
  }

  const prescriptionData = selectedPrescriptionData.prescriptions?.[0] || {};
  const appointmentData = selectedPrescriptionData;

  return (
    <div className="prescription-container max-w-4xl mx-auto p-8 bg-white min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          onClick={handleBackClick}
          className="group flex items-center text-sm hover:bg-white transition-all"
        >
          <ChevronLeft className="h-4 w-4 transform transition-transform duration-200 group-hover:-translate-x-1 text-slate-600" />
          <span className="transform transition-transform duration-200 group-hover:-translate-x-0.5 text-slate-600">
            Back
          </span>
        </Button>

        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">
            Prescription ID:
          </span>
          <span className="text-sm font-bold text-foreground">
            {prescriptionData?.medication_display_id || "N/A"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="prescription-card">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Appointment ID
            </span>
          </div>
          <p className="text-lg font-bold text-foreground mt-1">
            {appointmentData?.appointment_display_id || "N/A"}
          </p>
        </div>
        <div className="prescription-card">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Prescription ID
            </span>
          </div>
          <p className="text-lg font-bold text-foreground mt-1">
            {prescriptionData?.medication_display_id || "N/A"}
          </p>
        </div>
        <div className="prescription-card">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Issued Date
            </span>
          </div>
          <p className="text-lg font-bold text-foreground mt-1">
            {moment(prescriptionData?.authored_on).format("MMMM D, YYYY")}
          </p>
        </div>
        <div className="prescription-card">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Status
            </span>
          </div>
          <Badge className="mt-2 status-badge status-active">
            {prescriptionData?.status || "Active"}
          </Badge>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
          <FileText className="h-5 w-5 text-primary" />
          <span>Clinical Details</span>
        </h3>

        <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium text-gray-700">
                Chief Complaint:{" "}
              </span>
              <span className="text-gray-900">
                {appointmentData?.visit_notes?.[0]?.chief_complaint ||
                  "Not specified"}
              </span>
            </div>

            <div>
              <span className="font-medium text-gray-700">Diagnosis: </span>
              <span className="text-gray-900">
                {appointmentData?.visit_notes?.[0]?.provisional_diagnosis ||
                  "Not specified"}
              </span>
            </div>
          </div>

          <div>
            <span className="font-medium text-gray-700">Doctor Remarks: </span>
            <span className="text-gray-900">
              {appointmentData?.visit_notes?.[0]?.criticality_remark || "N/A"}
            </span>
          </div>

          {appointmentData?.visit_notes?.[0]?.summary && (
            <div className="border-t pt-3 mt-3">
              <span className="font-medium text-gray-700">
                Clinical Notes:{" "}
              </span>
              <span className="text-gray-900">
                {appointmentData.visit_notes[0].summary}
              </span>
            </div>
          )}

          {appointmentData?.visit_notes?.[0]?.follow_up === "followup" && (
            <div>
              <span className="font-medium text-gray-700">
                Follow-Up consultation required{" "}
              </span>
              <div>
                <span className="font-medium text-gray-700">
                  Next Follow-up:{" "}
                </span>
                <span className="text-gray-900">
                  {appointmentData?.visit_notes?.[0]?.followup_date
                    ? moment(
                        appointmentData.visit_notes[0].followup_date
                      ).format("DD/MM/YYYY")
                    : "Not scheduled"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
          <FileText className="h-5 w-5 text-primary" />
          <span>Prescribed Medications</span>
        </h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Form</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Strength</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prescriptionData?.medications?.map((data: any, index: number) => {
              return (
                <React.Fragment key={`medication-${index}`}>
                  <TableRow>
                    <TableCell className="font-semibold">
                      {data.name || "N/A"}
                    </TableCell>
                    <TableCell>{data.form || "N/A"}</TableCell>
                    <TableCell>{data.route || "N/A"}</TableCell>
                    <TableCell>{data.strength || "N/A"}</TableCell>
                    <TableCell>{data.frequency || "N/A"}</TableCell>
                    <TableCell>{data.duration + " days" || "N/A"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-sm italic text-muted-foreground"
                    >
                      <div className="space-y-2">
                        <div>
                          <strong>Timing:</strong>{" "}
                          {[
                            data.timing?.morning && "Morning",
                            data.timing?.afternoon && "Afternoon",
                            data.timing?.evening && "Evening",
                            data.timing?.night && "Night",
                          ]
                            .filter(Boolean)
                            .join(", ") || "N/A"}
                        </div>
                        <div>
                          <strong>Dosage Instruction:</strong>{" "}
                          {data.dosage_instruction || "N/A"}
                        </div>
                        <div>
                          <strong>Notes:</strong> {data.note || "N/A"}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {appointmentData?.lab_test_orders &&
        appointmentData.lab_test_orders.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
              <FileSearch className="h-5 w-5 text-primary" />
              <span>Investigations</span>
            </h3>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="first:rounded-tl-lg">Name</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="last:rounded-tr-lg">
                    Ordered On
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointmentData.lab_test_orders.map(
                  (test: any, index: number) => (
                    <React.Fragment key={`lab-test-${index}`}>
                      <TableRow>
                        <TableCell className="font-semibold">
                          {test.test_display}
                        </TableCell>
                        <TableCell className="capitalize">
                          {test.priority || "N/A"}
                        </TableCell>
                        <TableCell className="capitalize">
                          <Badge
                            variant="outline"
                            className="border-yellow-500 text-yellow-700 bg-yellow-100/40 capitalize"
                          >
                            {test.status || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {test.authored_on
                            ? moment(test.authored_on).format(
                                "DD MMM YYYY, hh:mm A"
                              )
                            : "N/A"}
                        </TableCell>
                      </TableRow>

                      {test.notes && (
                        <TableRow key={`lab-test-note-${index}`}>
                          <TableCell colSpan={4}>
                            <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-300">
                              <p className="text-sm text-yellow-800">
                                <strong>Note:</strong> {test.notes || "N/A"}
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  )
                )}
              </TableBody>
            </Table>
          </div>
        )}
    </div>
  );
};

export default PharmacyPrescriptionDetails;
