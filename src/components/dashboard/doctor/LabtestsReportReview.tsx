"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
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
import { useDispatch, useSelector } from "react-redux";
import { clearConsultationOrders } from "@/store/slices/doctorSlice";
import { RootState } from "@/store";
import { useParams, useRouter } from "next/navigation";
import {
  getAssignedAppointmentDtlsById,
  updateAppointmentStatus,
} from "@/services/doctor.api";
import { toast } from "sonner";
import { AppointmentDtlsForDoctor } from "@/types/doctorNew.types";
import { DataTable } from "@/components/common/DataTable";
import { ImageReportModal } from "@/components/dashboard/doctor/modals/ImageReportModal";
import { updateLabTestOrder } from "@/services/labTechnician.api";
import EditableMedicationsTable from "./EditableMedicationsTable";

export default function LabtestsReportReview() {
  const dispatch = useDispatch();
  const { appointment_id } = useParams();
  const { singlePatientDetails, editVitalsModalVisible } = useSelector(
    (state: RootState) => state.doctor
  );
  const [apptDtls, setApptDtls] = useState<AppointmentDtlsForDoctor | null>(
    null
  );
  const router = useRouter();

  // Modal state for image viewing
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");

  // State to persist selected status for each lab test
  const [selectedStatuses, setSelectedStatuses] = useState<
    Record<string, string>
  >({});

  // State for editable medications
  const [editableMedications, setEditableMedications] = useState<any[]>([]);

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
    dispatch(clearConsultationOrders());
    if (!singlePatientDetails?.id && appointment_id) {
      GetAssignedAppointmentDtlsById(appointment_id);
    }
    GetAssignedAppointmentDtlsById(singlePatientDetails?.id);
  }, [singlePatientDetails, dispatch, editVitalsModalVisible]);

  const GetAssignedAppointmentDtlsById = async (
    appointment_id: string | string[]
  ) => {
    try {
      const response = await getAssignedAppointmentDtlsById(appointment_id);
      setApptDtls(response);

      // Initialize editable medications with existing data
      const allMedications = response.prescriptions.flatMap(
        (prescription: any) => prescription.medications || []
      );
      setEditableMedications(allMedications);
    } catch (error) {
      console.error("Error fetching appointment details:", error);
      throw error;
    }
  };

  // Calculate age from birth date
  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleStatusUpdate = async (data: any, status: "verify" | "reject") => {
    setSelectedStatuses((prev) => ({
      ...prev,
      [data.id]: status,
    }));

    console.log(data);
    const payload = {
      ...data,
      status: status === "verify" ? "verified" : "cancelled",
    };
    try {
      const response = await updateLabTestOrder(payload);
      if (response) {
        toast.success(
          `Test ${status === "verify" ? "verified" : "rejected"} successfully`
        );
      }
    } catch {
      toast.error(
        `Failed to ${status === "verify" ? "verify" : "reject"} test`
      );
    }
  };

  const handleCompleteReview = async () => {
    try {
      // Save medications updates if there are any changes
      if (editableMedications.length > 0) {
        console.log("Saving updated medications:", editableMedications);
        // TODO: Add API call to save medications
        // await saveMedications(editableMedications);
      }

      await updateAppointmentStatus({
        id: apptDtls?.id || "",
        status: "completed",
      });
      // Clear selected statuses after successful completion
      setSelectedStatuses({});
      toast.success("Successfully Uploaded Reports");
      router.back();
    } catch (error) {
      toast.error("Failed to upload reports. Please try again.");
    }
  };

  // Handle image view
  const handleViewImage = (imagePath: string) => {
    setSelectedImage(imagePath);
    setImageModalOpen(true);
  };

  // Handle medication updates
  const handleMedicationUpdate = (updatedMedications: any[]) => {
    setEditableMedications(updatedMedications);
    // Here you can add API call to save medications if needed
    console.log("Updated medications:", updatedMedications);
  };

  if (!apptDtls) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-lg">Loading appointment details...</div>
        </div>
      </div>
    );
  }

  // Define columns for lab tests table
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
          {/* <Select
            value={selectedStatuses[row.original.id] || ""}
            onValueChange={(value) =>
              handleStatusUpdate(row.original, value as "verify" | "reject")
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="verify">Verify</SelectItem>
              <SelectItem value="reject">Reject</SelectItem>
            </SelectContent>
          </Select> */}
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
    <div className="container mx-auto p-6 space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Patient Information and Vital Signs - Horizontal Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Information - Left Side */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Name
                </Label>
                <p className="text-lg font-semibold">
                  {apptDtls.patient.user.name}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Patient ID
                </Label>
                <p className="text-lg">{apptDtls.patient.patient_display_id}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Appointment ID
                </Label>
                <p className="text-lg">{apptDtls.appointment_display_id}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Gender
                </Label>
                <p className="text-lg capitalize">{apptDtls.patient.gender}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Age</Label>
                <p className="text-lg">
                  {calculateAge(apptDtls.patient.birth_date)} years
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Contact
                </Label>
                <p className="text-lg">{apptDtls.patient.user.phone}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Email
                </Label>
                <p className="text-lg">{apptDtls.patient.user.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Birth Date
                </Label>
                <p className="text-lg">
                  {formatDate(apptDtls.patient.birth_date)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vital Signs - Right Side */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Vital Signs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {apptDtls.observations.map((observation) => (
                <div
                  key={observation.id}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <div className="flex items-center gap-2">
                    {getVitalIcon(observation.vital_definition.code)}
                    <span className="font-medium">
                      {observation.vital_definition.name}:
                    </span>
                    {observation.is_abnormal && (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs ml-2">
                        Abnormal
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      {observation.vital_definition.code === "BP"
                        ? `${observation.value.systolic}/${observation.value.diastolic} ${observation.vital_definition.unit}`
                        : `${observation.value.value} ${observation.vital_definition.unit}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      Normal: {observation.vital_definition.normal_min}-
                      {observation.vital_definition.normal_max}{" "}
                      {observation.vital_definition.unit}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prescribed Medications - Editable */}
      <EditableMedicationsTable
        medications={editableMedications}
        onUpdate={handleMedicationUpdate}
        isEditable={true}
      />

      {/* Visit Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Visit Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {apptDtls.visit_notes.length > 0 ? (
            <div className="space-y-4">
              {apptDtls.visit_notes.map((note) => (
                <div key={note.id} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Summary
                      </Label>
                      <p className="mt-1">{note.summary}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Follow Up
                      </Label>
                      <p className="mt-1">{note.follow_up}</p>
                    </div>
                  </div>

                  {note.assessments.length > 0 && (
                    <div className="mb-4">
                      <Label className="text-sm font-medium text-gray-600">
                        Assessments
                      </Label>
                      <div className="mt-2 space-y-2">
                        {note.assessments.map((assessment) => (
                          <div
                            key={assessment.id}
                            className="bg-gray-50 p-3 rounded"
                          >
                            <div className="flex justify-between items-start">
                              <p>{assessment.description}</p>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  assessment.severity === "mild"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : assessment.severity === "moderate"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {assessment.severity}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {note.care_plans.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Care Plans
                      </Label>
                      <div className="mt-2 space-y-2">
                        {note.care_plans.map((plan) => (
                          <div key={plan.id} className="bg-blue-50 p-3 rounded">
                            <div className="font-medium text-blue-800 capitalize mb-1">
                              {plan.plan_type.replace("_", " ")}
                            </div>
                            <div className="text-sm">
                              <strong>Goal:</strong> {plan.goal}
                            </div>
                            <div className="text-sm mt-1">
                              <strong>Detail:</strong> {plan.detail}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No visit notes available
            </p>
          )}
        </CardContent>
      </Card>

      {/* Lab Test Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Lab Test Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {apptDtls.lab_test_orders.length > 0 ? (
            <DataTable
              columns={labTestColumns}
              data={apptDtls.lab_test_orders}
            />
          ) : (
            <p className="text-gray-500 text-center py-8">No lab test orders</p>
          )}
        </CardContent>
      </Card>

      <div className="w-full flex justify-end items-center">
        <Button onClick={handleCompleteReview}>Complete Review</Button>
      </div>

      {/* Image Report Modal */}
      <ImageReportModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        imageUrl={selectedImage}
        title="Lab Test Report"
      />
    </div>
  );
}
