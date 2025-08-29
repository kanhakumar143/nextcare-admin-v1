"use client";

import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// import EPrescriptionModal from "@/components/modals/EPrescriptionModal";
// import { fetchSingleAppointmentDtlsAsync } from "@/store/slices/bookAppointmentSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
} from "lucide-react";
import moment from "moment";
import {
  getAssignedAppointmentDtlsById,
  getEprescriptionDetails,
} from "@/services/doctor.api";
import { AppDispatch, RootState } from "@/store";
import { toast } from "sonner";
import { getStatusColor } from "@/components/helper/apointmentDetailsHelper";
import { set } from "zod";
import BackButton from "@/components/common/BackButton";
import VitalSignsCard from "./appointmentDetails/VitalSignsCard";
import QuestionaryAnswers from "./appointmentDetails/QuestionaryAnswers";
import LabTestCard from "./appointmentDetails/LabTestCard";
import ClinicalNotesCard from "./appointmentDetails/ClinicalNotesCard";
import PrescriptionCard from "./appointmentDetails/PrescriptionCard";
import { setEprescriptionDetails } from "@/store/slices/doctorSlice";

export default function AppointmentHistoryDetails() {
  const router = useRouter();
  const { appointment_id } = useParams();
  const [apptDtls, setApptDtls] = useState<any>(null);
  const dispatch: AppDispatch = useDispatch();

  const { singlePatientDetails } = useSelector(
    (state: RootState) => state.doctor
  );

  useEffect(() => {
    if (!singlePatientDetails?.id) {
      console.log("Fetching appointment details for ID:", appointment_id);
      getAppointmentDetails(appointment_id || "");
    } else {
      console.log("Using existing appointment details:", singlePatientDetails);
      getAppointmentDetails(singlePatientDetails.id);
    }
  }, [dispatch, singlePatientDetails]);

  const getAppointmentDetails = async (apptdId: string | string[]) => {
    try {
      const response = await getAssignedAppointmentDtlsById(apptdId);
      setApptDtls(response);
      console.log("Appointment details fetched:", response);
    } catch (error) {
      toast.error("Failed to fetch appointment details");
      console.error("Error fetching appointment details:", error);
    }
  };

  if (!apptDtls) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No appointment found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                The requested appointment details could not be loaded.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleOpenPrescription = () => {
    getPrescriptionDetails();
  };

  const getPrescriptionDetails = async () => {
    try {
      const response = await getEprescriptionDetails(appointment_id as string);
      console.log("Prescription Details:", response);
      toast.success("Consultation completed");
      router.push(
        `/dashboard/doctor/consultation/${appointment_id}/prescription-review`
      );
      dispatch(setEprescriptionDetails(response));
    } catch (error) {
      console.error("Error fetching prescription details:", error);
    }
  };

  return (
    <div>
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <BackButton />
            <p className="text-sm text-gray-500">
              Appointment ID: {apptDtls.appointment_display_id}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span>Appointment Details</span>
                  </CardTitle>
                  <Badge className={getStatusColor(apptDtls.status)}>
                    {apptDtls.status === "fulfilled" && (
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                    )}
                    {apptDtls.status === "fulfilled"
                      ? "Completed"
                      : apptDtls.status.charAt(0).toUpperCase() +
                        apptDtls.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Date</p>
                      <p className="text-sm text-gray-600">
                        {moment(apptDtls.slot.start).format("MMMM D, YYYY")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Time</p>
                      <p className="text-sm text-gray-600">
                        {moment(apptDtls.slot.start).format("hh:mm A")} -{" "}
                        {moment(apptDtls.slot.end).format("hh:mm A")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {apptDtls.visit_notes.length > 0 && (
              <ClinicalNotesCard visitNotes={apptDtls.visit_notes} />
            )}
            {apptDtls.observations.length > 0 && (
              <VitalSignsCard observations={apptDtls.observations} />
            )}
            {apptDtls.prescriptions.length > 0 && (
              <PrescriptionCard
                prescriptions={apptDtls.prescriptions}
                handleOpenPrescription={handleOpenPrescription}
              />
            )}
            {apptDtls?.lab_test_orders?.length > 0 && (
              <LabTestCard labTests={apptDtls.lab_test_orders} />
            )}
            {apptDtls.questionary_answers.length > 0 && (
              <QuestionaryAnswers answers={apptDtls.questionary_answers} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Patient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-primary" />
                  <span>Patient Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {apptDtls.patient.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{apptDtls.patient.user.name}</p>
                    <p className="text-sm text-gray-500">
                      {apptDtls.patient.patient_display_id}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {apptDtls.patient.user.email}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {apptDtls.patient.user.phone}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm capitalize">
                      {apptDtls.patient.gender}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {moment(apptDtls.patient.birth_date).format(
                        "MMMM D, YYYY"
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  Book Follow-up
                </Button>
                <Button className="w-full" variant="outline">
                  Share Report
                </Button>
                <Button className="w-full" variant="outline">
                  Download Prescription
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
