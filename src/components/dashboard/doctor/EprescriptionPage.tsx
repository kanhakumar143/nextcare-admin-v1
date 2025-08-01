"use client";

import {
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Clock,
  Shield,
  QrCode,
  ArrowLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { setConfirmReviewPrescriptionModal } from "@/store/slices/doctorSlice";
import ConfirmReviewPrescriptionModal from "./modals/ConfirmReviewPrescriptionModal";
import { useEffect, useState } from "react";
import moment from "moment";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const EprescriptionPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const [medicationRequestId, setMedicationRequestId] = useState<string>("");
  const { EprescriptionDetails } = useSelector(
    (state: RootState) => state.doctor
  );
  console.log("Eprescription Details:", EprescriptionDetails);
  const handleVerifyPrescription = () => {
    setMedicationRequestId(EprescriptionDetails?.medication_request?.id || "");
    dispatch(setConfirmReviewPrescriptionModal(true));
  };

  return (
    <div className="prescription-container max-w-4xl mx-auto p-8 bg-white min-h-screen">
      {/* Prescription Metadata */}
      <div>
        <Button onClick={() => router.back()} className="mb-6" variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="prescription-card">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Prescription ID
            </span>
          </div>
          <p className="text-lg font-bold text-foreground mt-1">
            {EprescriptionDetails?.medication_request?.medication_display_id ||
              "N/A"}
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
            {moment(
              EprescriptionDetails?.medication_request?.authored_on
            ).format("MMMM D, YYYY")}
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
            {EprescriptionDetails?.medication_request?.status}
          </Badge>
        </div>
      </div>

      {/* Patient Details */}
      <Card className="mb-6 border-l-4 border-l-primary py-0">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <User className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              Patient Information
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Full Name
              </p>
              <p className="text-base font-semibold text-foreground">
                {EprescriptionDetails?.patient?.user?.name}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Gender
              </p>
              <p className="text-base font-semibold text-foreground">
                {EprescriptionDetails?.patient?.gender}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">D.O.B</p>
              <p className="text-base font-semibold text-foreground">
                {moment(EprescriptionDetails?.patient?.birth_date).format(
                  "MMMM D, YYYY"
                )}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Patient ID
              </p>
              <p className="text-base font-semibold text-foreground">
                {EprescriptionDetails?.patient?.patient_display_id}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Practitioner Details */}
      <Card className="mb-6 border-l-4 border-l-primary py-0">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <User className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              Practitioner Information
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Doctor Name
              </p>
              <p className="text-base font-semibold text-foreground">
                {EprescriptionDetails?.practitioner?.user?.name}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Specialization
              </p>
              <p className="text-base font-semibold text-foreground">{"N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                License Number
              </p>
              <p className="text-base font-semibold text-foreground">
                {EprescriptionDetails?.practitioner?.licence_details?.number ||
                  "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Contact
              </p>
              <p className="text-base font-semibold text-foreground">
                {EprescriptionDetails?.practitioner?.user?.email || "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diagnosis Table */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
          <FileText className="h-5 w-5 text-primary" />
          <span>Diagnosis Information</span>
        </h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Severity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {EprescriptionDetails?.visit_note?.assessments?.map(
              (assessment) => (
                <TableRow key={assessment.id}>
                  <TableCell className="font-mono">
                    {assessment.code || "N/A"}
                  </TableCell>
                  <TableCell>{assessment.description || "N/A"}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-yellow-500 text-yellow-700"
                    >
                      {assessment?.severity || "N/A"}
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </div>

      {/* Medications Table */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
          <FileText className="h-5 w-5 text-primary" />
          <span>Prescribed Medications</span>
        </h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              {/* <TableHead>Strength</TableHead> */}
              <TableHead>Form</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {EprescriptionDetails?.medication_request?.medications.map(
              (data, index) => {
                return (
                  <>
                    <TableRow>
                      <TableCell className="font-semibold">
                        {data.name || "N/A"}
                      </TableCell>
                      <TableCell>{data.form || "N/A"}</TableCell>
                      <TableCell>{data.route || "N/A"}</TableCell>
                      <TableCell>{data.frequency || "N/A"}</TableCell>
                      <TableCell>{data.duration + " days" || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                      {/* <TableCell
                      colSpan={5}
                      className="text-sm italic text-muted-foreground"
                    >
                      <strong>Dosage Instruction:</strong>{" "}
                      {data.dosage_instruction || "N/A"}
                      <br />
                      <strong>Notes:</strong> {data.note?.info || "N/A"}
                    </TableCell> */}
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
                            <strong>Notes:</strong> {data.note?.info || "N/A"}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  </>
                );
              }
            )}
          </TableBody>
        </Table>
      </div>

      {/* Care Plans Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
          <Shield className="h-5 w-5 text-primary" />
          <span>Care Plans</span>
        </h3>
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/4 break-words">Type</TableHead>
              <TableHead className="w-1/4 break-words">Goal</TableHead>
              <TableHead className="w-1/2 break-words">Detail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {EprescriptionDetails?.visit_note?.care_plans?.map(
              (carePlan, index) => (
                <TableRow key={`care-plan-${index}`}>
                  <TableCell className="break-words whitespace-normal">
                    <div className="flex items-center gap-2">
                      <Badge className="status-badge status-active">
                        {carePlan?.plan_type || "N/A"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="break-words whitespace-normal">
                    {carePlan?.goal || "N/A"}
                  </TableCell>
                  <TableCell className="break-words whitespace-normal">
                    {carePlan?.detail || "N/A"}
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </div>

      {/* Visit Summary & Follow-Up */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="py-0 border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-3">
              <FileText className="h-5 w-5 text-primary" />
              <h4 className="font-semibold text-foreground">Visit Summary</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              {EprescriptionDetails?.visit_note?.summary ||
                "No summary provided."}
            </p>
          </CardContent>
        </Card>
        <Card className="py-0 border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-3">
              <Calendar className="h-5 w-5 text-primary" />
              <h4 className="font-semibold text-foreground">
                Follow-Up Instructions
              </h4>
            </div>
            <p className="text-sm text-muted-foreground">
              {EprescriptionDetails?.visit_note?.follow_up ||
                "No follow-up instructions provided."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Signature Section */}
      <div className="border-t-2 border-primary pt-6 mb-6">
        <div className="flex justify-end items-start">
          <div className="text-right">
            <div className="mb-4">
              <p className="text-sm font-medium text-muted-foreground">
                Digital Signature
              </p>
              <div className="mt-2 p-4 border-2 border-dashed border-primary rounded-lg bg-primary-light">
                <p className="text-primary font-semibold">
                  {EprescriptionDetails?.practitioner?.user?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Digitally signed on{" "}
                  {moment(
                    EprescriptionDetails?.medication_request?.authored_on
                  ).format("MMMM D, YYYY")}
                </p>
              </div>
            </div>
            {/* <div>
              <p className="text-sm font-medium text-muted-foreground">
                Practitioner Name
              </p>
              <p className="text-lg font-bold text-foreground">
                {EprescriptionDetails?.signature?.signed_by}
              </p>
            </div> */}
          </div>
        </div>
      </div>

      {/* Print Button (hidden in print) */}
      {EprescriptionDetails?.medication_request?.status === "active" && (
        <div className="no-print mt-8 flex justify-center">
          <button
            onClick={handleVerifyPrescription}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Verify Prescription
          </button>
        </div>
      )}
      <ConfirmReviewPrescriptionModal
        medicationRequestId={medicationRequestId}
      />
    </div>
  );
};

export default EprescriptionPage;
