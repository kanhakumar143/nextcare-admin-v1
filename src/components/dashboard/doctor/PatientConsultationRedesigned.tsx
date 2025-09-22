"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import DoctorMedicineLabEntry from "./DoctorMedicineLabEntryRedesigned";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Edit,
  Info,
  Ruler,
  Weight,
  Thermometer,
  Heart,
  Activity,
  Droplets,
  Gauge,
  Calendar,
  Clock,
  AlertTriangle,
  FileText,
  Stethoscope,
  User,
  BookOpen,
  ArrowLeft,
  Video,
} from "lucide-react";
import ConfirmConsultationModal from "./modals/ConfirmConsultationModal";
import EditVitalsModal from "./modals/EditVitalsModal";
import ReferPatientModal from "./modals/ReferPatientModal";
import { useDispatch, useSelector } from "react-redux";
import {
  setConfirmConsultationModal,
  setEditVitalsModal,
  setCurrentVitals,
  clearConsultationOrders,
  updateVisitNote,
  populateConsultationData,
} from "@/store/slices/doctorSlice";
import { RootState } from "@/store";
import { useParams, useRouter } from "next/navigation";
import {
  getAssignedAppointmentDtlsById,
  getMeetingURL,
} from "@/services/doctor.api";
import { toast } from "sonner";
import { AppointmentDtlsForDoctor } from "@/types/doctorNew.types";
import DentalProcedureEntry from "./DentalProcedureEntry";
import { DataTable } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";
import { ImageReportModal } from "@/components/dashboard/doctor/modals/ImageReportModal";
import ConsultationRecorder from "./ConsultationRecorder";
import PreConsultationAnswers from "./PreConsultationAnswersRedesigned";
import EhrModal from "./modals/ehrModal";
import { useAuthInfo } from "@/hooks/useAuthInfo";

export default function PatientConsultation() {
  const { practitionerId } = useAuthInfo();
  const dispatch = useDispatch();
  const { patient_name } = useParams();
  const {
    singlePatientDetails,
    visitNote,
    editVitalsModalVisible,
    consultationMode,
    isEditingConsultation,
  } = useSelector((state: RootState) => state.doctor);
  const [apptDtls, setApptDtls] = useState<AppointmentDtlsForDoctor | null>(
    null
  );
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [meetingURL, setMeetingURL] = useState<string>(
    "https://teams.microsoft.com/l/meetup-join/19%3ameeting_YjU1NmY3NjYtOWI0Yi00NzZkLWJlN2YtYWY2NDU0YjA0YzAy%40thread.v2/0?context=%7b%22Tid%22%3a%22774486a0-0b12-4dc4-8826-7509c0aba4b5%22%2c%22Oid%22%3a%220aa623a3-9104-44e4-8ea2-4056cf08a2f2%22%7d"
  );
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [referralSheetOpen, setReferralSheetOpen] = useState(false);
  const router = useRouter();

  const [ehrModalOpen, setEhrModalOpen] = useState(false);

  const getVitalIcon = (code: string) => {
    const iconProps = { className: "h-4 w-4 text-gray-600" };
    switch (code) {
      case "HT":
        return <Ruler {...iconProps} />;
      case "WT":
        return <Weight {...iconProps} />;
      case "TEMP":
        return <Thermometer {...iconProps} />;
      case "BP":
        return <Gauge {...iconProps} />;
      case "HR":
        return <Heart {...iconProps} />;
      case "RR":
        return <Activity {...iconProps} />;
      case "SpO2":
        return <Droplets {...iconProps} />;
      default:
        return <Activity {...iconProps} />;
    }
  };

  useEffect(() => {
    if (consultationMode === "new") {
      dispatch(clearConsultationOrders());
    }

    if (!singlePatientDetails?.id && patient_name) {
      GetAssignedAppointmentDtlsById(patient_name);
    }
    GetAssignedAppointmentDtlsById(singlePatientDetails?.id);
  }, [
    singlePatientDetails,
    dispatch,
    editVitalsModalVisible,
    consultationMode,
  ]);

  useEffect(() => {
    if (consultationMode === "edit" && apptDtls) {
      populateExistingConsultationData();
    }
  }, [consultationMode, apptDtls]);

  const getMeetingLink = async () => {
    try {
      const response = await getMeetingURL(apptDtls?.id || "");
      setMeetingURL(response.meeting_url);
    } catch (error) {
      setMeetingURL(
        "https://teams.microsoft.com/l/meetup-join/19%3ameeting_YjU1NmY3NjYtOWI0Yi00NzZkLWJlN2YtYWY2NDU0YjA0YzAy%40thread.v2/0?context=%7b%22Tid%22%3a%22774486a0-0b12-4dc4-8826-7509c0aba4b5%22%2c%22Oid%22%3a%220aa623a3-9104-44e4-8ea2-4056cf08a2f2%22%7d"
      );
      console.log("Error fetching meeting URL:", error);
    }
  };

  const populateExistingConsultationData = () => {
    if (!apptDtls) return;
    const existingVisitNote = apptDtls.visit_notes?.[0];
    const existingMedications = apptDtls.prescriptions?.[0]?.medications || [];
    const existingLabTests = apptDtls.lab_test_orders || [];

    dispatch(
      populateConsultationData({
        visitNote: existingVisitNote,
        medicines: existingMedications,
        labTests: existingLabTests,
      })
    );
  };

  const GetAssignedAppointmentDtlsById = async (
    appointment_id: string | string[]
  ) => {
    try {
      const response = await getAssignedAppointmentDtlsById(appointment_id);
      console.log("response======", response);
      setApptDtls(response);
    } catch (error) {
      console.error("Error fetching appointment details:", error);
      throw error;
    }
  };

  const handleConfirmConsultationCheck = () => {
    if (!visitNote.summary.trim()) {
      toast.error(
        `Please provide a consultation summary before ${
          isEditingConsultation ? "updating" : "completing"
        } the consultation.`
      );
      return;
    }

    dispatch(setConfirmConsultationModal(true));
  };

  const handleEditVitals = () => {
    if (apptDtls?.observations) {
      dispatch(setCurrentVitals(apptDtls?.observations));
    }
    dispatch(setEditVitalsModal(true));
  };

  const handlePatientHealthRecord = () => {
    setEhrModalOpen(true);
  };

  const handleViewImage = (imagePath: string) => {
    console.log("Viewing image:", imagePath);
    setSelectedImage(imagePath);
    setImageModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const labTestColumns = [
    {
      accessorKey: "test_display",
      header: "Test Name",
    },
    {
      accessorKey: "test_code",
      header: "Test Code",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => (
        <Badge
          variant={
            row.original.status === "completed" ? "default" : "secondary"
          }
          className={
            row.original.status === "completed"
              ? "bg-green-100 text-green-800 border-green-200"
              : "bg-yellow-100 text-yellow-800 border-yellow-200"
          }
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "priority",
      header: "Priority",
    },
    {
      accessorKey: "authored_on",
      header: "Ordered Date",
      cell: ({ row }: any) => formatDate(row.original.authored_on),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => (
        <div className="flex gap-2">
          {row.original.test_report_path && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewImage(row.original.test_report_path)}
            >
              View Report
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="mx-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900 pr-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <div className="flex gap-4">
                    <Label className="text-xs font-medium text-gray-500">
                      Appointment ID
                    </Label>
                    <p className="text-sm font-bold text-gray-900">
                      {apptDtls?.appointment_display_id}
                    </p>
                  </div>
                </div>
                {isEditingConsultation && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded text-xs">
                    <Edit className="h-3 w-3" />
                    <span className="font-medium">Editing</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => window.open(meetingURL, "_blank")}
                className="flex items-center gap-1 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                <Video className="h-3 w-3" />
                Start Meet
              </Button>
              <Button
                variant="outline"
                onClick={handlePatientHealthRecord}
                className="flex items-center gap-1"
              >
                <BookOpen className="h-3 w-3" />
                Health Records
              </Button>
              <ConsultationRecorder
                appointmentId={apptDtls?.appointment_display_id}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-4 my-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 " />
              <span className="text-sm font-bold">Patient Vitals:</span>
            </div>

            {apptDtls?.observations && apptDtls.observations.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {apptDtls.observations.map((vital: any, i: number) => (
                  <div
                    key={i}
                    className="relative flex items-center gap-1 px-2 py-1  text-xs"
                  >
                    <div className="flex items-center gap-1">
                      {getVitalIcon(vital.vital_definition?.code)}
                      <span className="font-medium text-gray-700">
                        {vital.vital_definition?.code}:
                      </span>
                      <span className="font-bold text-gray-900">
                        {vital.vital_definition?.code === "BP" ? (
                          <span>
                            {vital.value?.systolic}/{vital.value?.diastolic}
                          </span>
                        ) : (
                          <span>{vital.value?.value}</span>
                        )}
                      </span>
                      <span className="text-gray-500">
                        {vital.vital_definition?.unit}
                      </span>
                    </div>
                    {vital.is_abnormal && (
                      <AlertTriangle className="h-3 w-3 text-red-600" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Activity className="h-4 w-4 text-gray-400" />
                <span>No vitals recorded</span>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleEditVitals}
            className="h-8 px-3 hover:bg-blue-50 flex items-center gap-1"
          >
            <Edit className="h-3 w-3 text-blue-600" />
            <span className="text-xs text-blue-600">Edit</span>
          </Button>
        </div>
      </div>

      <div className="mx-4 grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
        <div className="lg:col-span-2 space-y-4">
          <PreConsultationAnswers apptDtls={apptDtls} />

          {isEditingConsultation &&
            apptDtls?.lab_test_orders &&
            apptDtls.lab_test_orders.length > 0 && (
              <Card className="border">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-bold">
                    <div className="p-1 bg-green-100 rounded">
                      <Activity className="h-3 w-3 text-green-600" />
                    </div>
                    Lab Test Orders & Reports
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <DataTable
                    columns={labTestColumns}
                    data={apptDtls.lab_test_orders}
                  />
                </CardContent>
              </Card>
            )}
        </div>

        <div className="lg:col-span-3">
          <Card className="border">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Visit Summary
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Document consultation details and patient care plan
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Chief Complaint
                </Label>
                <Input
                  placeholder="Patient's main concern"
                  value={visitNote.chief_complaint}
                  onChange={(e) =>
                    dispatch(
                      updateVisitNote({
                        field: "chief_complaint",
                        value: e.target.value,
                      })
                    )
                  }
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Provisional Diagnosis
                </Label>
                <Input
                  placeholder="Preliminary diagnosis"
                  value={visitNote.provisional_diagnosis}
                  onChange={(e) =>
                    dispatch(
                      updateVisitNote({
                        field: "provisional_diagnosis",
                        value: e.target.value,
                      })
                    )
                  }
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Doctor Notes
                </Label>
                <Textarea
                  placeholder="Detailed consultation summary..."
                  className="min-h-[110px]"
                  value={visitNote.summary}
                  onChange={(e) =>
                    dispatch(
                      updateVisitNote({
                        field: "summary",
                        value: e.target.value,
                      })
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Remarks</Label>
                <Input
                  placeholder="Additional observations"
                  value={visitNote.remarks || visitNote.criticality_remark}
                  onChange={(e) =>
                    dispatch(
                      updateVisitNote({
                        field: "criticality_remark",
                        value: e.target.value,
                      })
                    )
                  }
                  className="h-10"
                />
              </div>

              <div className="pt-4 border-t space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded">
                  <Checkbox
                    className="h-4 w-4"
                    checked={visitNote.critical}
                    onCheckedChange={(checked) =>
                      dispatch(
                        updateVisitNote({
                          field: "critical",
                          value: checked ? true : false,
                        })
                      )
                    }
                  />
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <Label className="text-sm font-medium text-red-800">
                      Critical Patient
                    </Label>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3">
                  <Checkbox
                    className="h-4 w-4"
                    checked={visitNote.visit_care_plan.plan_type === "followup"}
                    onCheckedChange={(checked) =>
                      dispatch(
                        updateVisitNote({
                          field: "visit_care_plan.plan_type",
                          value: checked ? "followup" : "normal",
                        })
                      )
                    }
                  />
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <Label className="text-sm font-medium">
                      Requires Follow-up
                    </Label>
                  </div>
                </div>

                {/* Follow-up Fields */}
                {visitNote.visit_care_plan.plan_type === "followup" && (
                  <div className="space-y-3 p-3 bg-blue-50 border border-blue-200 rounded">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Follow-up Date
                      </Label>
                      <Input
                        type="date"
                        value={visitNote.visit_care_plan.followup_date || ""}
                        onChange={(e) =>
                          dispatch(
                            updateVisitNote({
                              field: "visit_care_plan.followup_date",
                              value: e.target.value,
                            })
                          )
                        }
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Consultation Mode
                      </Label>
                      <Select
                        value={
                          visitNote.visit_care_plan.consultation_mode || ""
                        }
                        onValueChange={(value) =>
                          dispatch(
                            updateVisitNote({
                              field: "visit_care_plan.consultation_mode",
                              value,
                            })
                          )
                        }
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Mode</SelectLabel>
                            <SelectItem value="online" disabled>
                              Online
                            </SelectItem>
                            <SelectItem value="in-clinic">In-Clinic</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mx-4 mb-6">
        <DoctorMedicineLabEntry appointmentDetails={apptDtls} />
      </div>

      {singlePatientDetails?.service_specialty?.display === "Dentistry" && (
        <div className="mb-6">
          <DentalProcedureEntry
            onAddProcedure={(proc) => console.log("Added:", proc)}
          />
        </div>
      )}

      <div className="mx-4 mb-4">
        <div className="flex justify-between items-center py-5">
          <div className="text-xs text-gray-600">
            {isEditingConsultation
              ? "Review and update the consultation details"
              : "Complete the consultation to generate prescription"}
          </div>
          <div className="flex gap-2">
            <ReferPatientModal
              isOpen={referralSheetOpen}
              onOpenChange={setReferralSheetOpen}
              patientName={apptDtls?.patient?.user?.name}
              patientId={apptDtls?.patient?.id}
              practitionerId={practitionerId || ""}
              originAppointmentId={apptDtls?.id}
            >
              <Button variant="outline" className="flex items-center gap-1">
                Refer Patient
              </Button>
            </ReferPatientModal>

            <Button
              onClick={handleConfirmConsultationCheck}
              className="flex items-center gap-1"
            >
              <FileText className="h-3 w-3 mr-3" />
              {isEditingConsultation
                ? "Update Consultation"
                : "Complete Consultation"}
            </Button>
          </div>
        </div>
      </div>

      <ConfirmConsultationModal />
      <EditVitalsModal />

      <ImageReportModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        fileUrl={selectedImage}
        title="Lab Test Report"
      />

      <EhrModal
        isOpen={ehrModalOpen}
        onClose={() => setEhrModalOpen(false)}
        patientId={singlePatientDetails?.patient?.id}
      />
    </div>
  );
}
