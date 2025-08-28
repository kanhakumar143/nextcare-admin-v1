"use client";

import {
  Calendar,
  User,
  FileText,
  Shield,
  Stethoscope,
  HospitalIcon,
  FileSearch,
} from "lucide-react";
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
import {
  setConfirmReviewPrescriptionModal,
  setEprescriptionDetails,
} from "@/store/slices/doctorSlice";
import ConfirmReviewPrescriptionModal from "./modals/ConfirmReviewPrescriptionModal";
import React, { useEffect, useState } from "react";
import moment from "moment";
import { useParams, useRouter } from "next/navigation";
import BackButton from "@/components/common/BackButton";
import { getEprescriptionDetails } from "@/services/doctor.api";

const EprescriptionPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const { patient_name } = useParams();
  const [medicationRequestId, setMedicationRequestId] = useState<string>("");
  const { EprescriptionDetails } = useSelector(
    (state: RootState) => state.doctor
  );

  useEffect(() => {
    if (!EprescriptionDetails) {
      getPrescriptionDetails();
    }
  }, []);

  const getPrescriptionDetails = async () => {
    try {
      if (!patient_name) {
        return "";
      }
      const response = await getEprescriptionDetails(patient_name);

      dispatch(setEprescriptionDetails(response));
    } catch (error) {
      console.error("Error fetching prescription details:", error);
    }
  };

  const handleVerifyPrescription = () => {
    setMedicationRequestId(EprescriptionDetails?.medication_request?.id || "");
    dispatch(setConfirmReviewPrescriptionModal(true));
  };

  return (
    <div className="prescription-container max-w-4xl mx-auto p-8 bg-white min-h-screen">
      <div>
        <BackButton />
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

      <Card className="mb-6 border-l-4 border-l-primary py-0">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-1">
                <User className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  Patient Information
                </h3>
              </div>
              <div className="space-y-0.5 text-sm text-slate-600 mt-2">
                <p>{EprescriptionDetails?.patient?.user?.name || "N/A"}</p>
                <p className="capitalize ">
                  {EprescriptionDetails?.patient?.gender || "N/A"}
                </p>
                <p>
                  {EprescriptionDetails?.patient?.patient_display_id || "N/A"}
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-1">
                <Stethoscope className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  Doctor Information
                </h3>
              </div>
              <div className="space-y-0.5 text-sm text-slate-600 mt-2">
                <div className="flex justify-between">
                  <p>
                    {EprescriptionDetails?.practitioner?.user?.name || "N/A"}
                  </p>
                </div>

                <p>
                  {EprescriptionDetails?.practitioner
                    ?.practitioner_display_id || "N/A"}
                </p>
                <p>
                  {EprescriptionDetails?.practitioner?.user?.email || "N/A"}
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-1">
                <HospitalIcon className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  Clinic Information
                </h3>
              </div>
              <div className="space-y-0.5 text-sm text-slate-600 mt-2">
                <div className="flex justify-between">
                  <p>
                    {EprescriptionDetails?.practitioner.user.tenant.name ||
                      "N/A"}
                  </p>
                </div>
                {EprescriptionDetails?.practitioner.user.tenant.contact[0].telecom.map(
                  (dtls, i: number) => (
                    <p key={i}>{dtls.value || "N/A"}</p>
                  )
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                {(EprescriptionDetails?.visit_note as any)?.chief_complaint ||
                  "Not specified"}
              </span>
            </div>

            <div>
              <span className="font-medium text-gray-700">Diagnosis: </span>
              <span className="text-gray-900">
                {(EprescriptionDetails?.visit_note as any)
                  ?.provisional_diagnosis || "Not specified"}
              </span>
            </div>
          </div>

          <div>
            <span className="font-medium text-gray-700">Doctor Remarks: </span>
            <span className="text-gray-900">
              {(EprescriptionDetails?.visit_note as any)?.criticality_remark}
            </span>
          </div>

          {EprescriptionDetails?.visit_note?.summary && (
            <div className="border-t pt-3 mt-3">
              <span className="font-medium text-gray-700">
                Clinical Notes:{" "}
              </span>
              <span className="text-gray-900">
                {EprescriptionDetails.visit_note.summary}
              </span>
            </div>
          )}

          {EprescriptionDetails?.visit_note?.follow_up === "followup" && (
            <div>
              <span className="font-medium text-gray-700">
                Follow-Up consultation required{" "}
              </span>
              <div>
                <span className="font-medium text-gray-700">
                  Next Follow-up:{" "}
                </span>
                <span className="text-gray-900">
                  {(EprescriptionDetails?.visit_note as any)?.followup_date
                    ? moment(
                        (EprescriptionDetails?.visit_note as any)?.followup_date
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
              <TableHead className=" last:rounded-tr-lg">Ordered On</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {EprescriptionDetails?.lab_tests?.map((test, index) => (
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
                      ? moment(test.authored_on).format("DD MMM YYYY, hh:mm A")
                      : "N/A"}
                  </TableCell>
                </TableRow>

                {test.notes?.length > 0 && (
                  <TableRow key={`lab-test-note-${index}`}>
                    <TableCell colSpan={4}>
                      <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-300">
                        <p className="text-sm text-yellow-800">
                          <strong>Note:</strong>{" "}
                          {test.notes
                            .map((note) => note.text || "N/A")
                            .join(", ")}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

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
          </div>
        </div>
      </div>

      <div className="no-print mt-8 flex justify-center">
        <button
          onClick={handleVerifyPrescription}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Verify Prescription
        </button>
      </div>
      <ConfirmReviewPrescriptionModal
        medicationRequestId={medicationRequestId}
      />
    </div>
  );
};

export default EprescriptionPage;
