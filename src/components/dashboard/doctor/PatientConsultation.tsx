"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import DoctorMedicineLabEntry from "./DoctorMedicineLabEntry";
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
} from "lucide-react";
import ConfirmConsultationModal from "./modals/ConfirmConsultationModal";
import EditVitalsModal from "./modals/EditVitalsModal";
import PatientDetailsDrawer from "./PatientDetailsDrawer";
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
import { getAssignedAppointmentDtlsById } from "@/services/doctor.api";
import { toast } from "sonner";
import { AppointmentDtlsForDoctor } from "@/types/doctorNew.types";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import BackButton from "@/components/common/BackButton";
import DentalProcedureEntry from "./DentalProcedureEntry";
import { DataTable } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";
import { ImageReportModal } from "@/components/dashboard/doctor/modals/ImageReportModal";
import { ScrollArea } from "@/components/ui/scroll-area";
import ConsultationRecorder from "./ConsultationRecorder";
import PreConsultationAnswers from "./PreConsultationAnswers";
import EhrModal from "./modals/ehrModal";

export default function PatientConsultation() {
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
  // const [isPatientDetailsDrawerOpen, setIsPatientDetailsDrawerOpen] =
  //   useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const router = useRouter();

  //
    const [ehrModalOpen, setEhrModalOpen] = useState(false);
  // const { singlePatientDetails } = useSelector((state: RootState) => state.doctor);

  // Helper function to get vital icon based on code
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
    console.log("singlePatientDetails", singlePatientDetails);
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

  // Effect to populate data when in edit mode and appointment details are loaded
  useEffect(() => {
    if (consultationMode === "edit" && apptDtls) {
      populateExistingConsultationData();
    }
  }, [consultationMode, apptDtls]);

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

  // Handle Health Record
   const handlePatientHealthRecord = () => {
    setEhrModalOpen(true);
  };

  // Handle image view for lab reports
  const handleViewImage = (imagePath: string) => {
    console.log("Viewing image:", imagePath);
    setSelectedImage(imagePath);
    setImageModalOpen(true);
  };

  // Format date for lab test reports
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Define columns for lab tests table when in edit mode
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
    <>
      <div className="mx-6 my-3 py-2 border-b-2">
        <BackButton />
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Label className="text-md font-light">Appointment ID :</Label>
            <p className="text-xl font-semibold text-foreground px-4">
              {apptDtls?.appointment_display_id}
            </p>
            {isEditingConsultation && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                <Edit className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Editing Consultation
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            {/* <Button onClick={() => setIsPatientDetailsDrawerOpen(true)}>
              <Info className="h-4 w-4" />
              View Patient Details
            </Button> */}
            
           <Button onClick={handlePatientHealthRecord}>
          Patient Health Records
        </Button>
            <ConsultationRecorder
              appointmentId={apptDtls?.appointment_display_id}
            />
          </div>
        </div>
      </div>
      <div className="border-b border-gray-200 mx-6 my-3 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-4 w-full">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-lg font-semibold text-gray-900">
                General Vitals
              </Label>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEditVitals}
                className="h-8 w-8 hover:bg-gray-100"
              >
                <Edit className="h-4 w-4 text-gray-600" />
              </Button>
            </div>

            {apptDtls?.observations && apptDtls.observations.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4 w-full">
                {apptDtls.observations.map((vital: any, i: number) => (
                  <Tooltip>
                    <TooltipTrigger>
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div className="flex-shrink-0">
                          {getVitalIcon(vital.vital_definition?.code)}
                        </div>
                        <div className="flex gap-3 min-w-0">
                          <div className="text-sm font-bold text-gray-900">
                            {vital.vital_definition?.code === "BP" ? (
                              <span>
                                {vital.value?.systolic}/{vital.value?.diastolic}{" "}
                                {vital.vital_definition?.unit}
                              </span>
                            ) : (
                              <span>
                                {vital.value?.value}{" "}
                                {vital.vital_definition?.unit}
                              </span>
                            )}
                          </div>
                          {vital.is_abnormal && (
                            <div className="text-xs text-red-600 font-medium mt-1">
                              Abnormal
                            </div>
                          )}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-sm text-white">
                        {vital.vital_definition?.name}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="text-center">
                  <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No vitals recorded</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex p-4 bg-background gap-4">
        <div className="w-full lg:w-5/12 space-y-4 min-h-full">
          <PreConsultationAnswers apptDtls={apptDtls} />
        </div>

        <Card className="w-full space-y-1 p-4">
          <div className="flex flex-col justify-between border-border">
            <div className="pb-2 px-3 py-3 flex items-start justify-between">
              <div>
                <p className="text-xl font-bold">Visit Summary</p>
                <p className="text-sm text-muted-foreground">
                  A detailed summary of the patient’s consultation, including
                  prescribed medicines and recommended lab investigations.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-grow px-3 py-2">
              <Label className="text-sm font-medium">Chief Complaint</Label>
              <Input
                placeholder="Enter the patient's main concern or complaint"
                value={visitNote.chief_complaint}
                onChange={(e) =>
                  dispatch(
                    updateVisitNote({
                      field: "chief_complaint",
                      value: e.target.value,
                    })
                  )
                }
              />
              <Label className="text-sm font-medium">
                Provisional Diagnosis
              </Label>
              <Input
                placeholder="Enter preliminary diagnosis based on assessment"
                value={visitNote.provisional_diagnosis}
                onChange={(e) =>
                  dispatch(
                    updateVisitNote({
                      field: "provisional_diagnosis",
                      value: e.target.value,
                    })
                  )
                }
              />
              <Label className="text-sm font-medium">Doctor Notes</Label>
              <Textarea
                placeholder="Write your summary here..."
                className="flex-grow h-[15vh]"
                value={visitNote.summary}
                onChange={(e) =>
                  dispatch(
                    updateVisitNote({ field: "summary", value: e.target.value })
                  )
                }
              />
              <div className="flex items-center justify-between w-full space-x-2 mt-2">
                <div className="flex-grow">
                  <Label className="text-sm font-medium mb-2">Remarks</Label>
                  <Input
                    placeholder="Additional remarks or observations"
                    value={visitNote.remarks || visitNote.criticality_remark}
                    onChange={(e) =>
                      dispatch(
                        updateVisitNote({
                          field: "criticality_remark",
                          value: e.target.value,
                        })
                      )
                    }
                  />
                </div>
                <div className="flex items-center space-x-2 mt-7">
                  <Checkbox
                    className="h-5 w-5"
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
                  <Label className="text-sm font-medium">
                    Critical Patient
                  </Label>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 mt-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    className="h-5 w-5"
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
                  <Label className="text-sm font-medium">
                    Requires Follow-up
                  </Label>
                </div>
                {/* Conditional Follow-up Fields */}
                {visitNote.visit_care_plan.plan_type === "followup" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex-1">
                      <Label className="text-sm font-medium mb-2">
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
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-sm font-medium mb-2">
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
                        <SelectTrigger className="w-full">
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
            </div>
          </div>
        </Card>
      </div>

      {/* Lab Test Orders - Only show in edit mode */}
      {isEditingConsultation &&
        apptDtls?.lab_test_orders &&
        apptDtls.lab_test_orders.length > 0 && (
          <div className="px-4 mr-2 mb-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  <Activity className="h-5 w-5" />
                  Lab Test Orders & Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={labTestColumns}
                  data={apptDtls.lab_test_orders}
                />
              </CardContent>
            </Card>
          </div>
        )}

      <div className="px-4 mr-2">
        <DoctorMedicineLabEntry appointmentDetails={apptDtls} />
      </div>

      {singlePatientDetails?.service_specialty.display === "Dentistry" && (
        <div className="mt-4">
          <DentalProcedureEntry
            onAddProcedure={(proc) => console.log("Added:", proc)}
          />
        </div>
      )}

      <div className="flex w-full gap-3 justify-end px-6 py-4">
        <Button variant={"outline"} onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleConfirmConsultationCheck}>
          {isEditingConsultation
            ? "Update Consultation"
            : "Complete Consultation"}
        </Button>
      </div>

      {/* <PatientDetailsDrawer
        isOpen={isPatientDetailsDrawerOpen}
        onClose={() => setIsPatientDetailsDrawerOpen(false)}
        appointmentDetails={apptDtls}
      /> */}

      <ConfirmConsultationModal />
      <EditVitalsModal />

      {/* Image Report Modal for lab test reports */}
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
    </>
  );
}
