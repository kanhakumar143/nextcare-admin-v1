"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, MapPin, Phone, User, Mail, Clock } from "lucide-react";

interface PatientDetailsDrawerStaticProps {
  isOpen: boolean;
  onClose: () => void;
  patientData?: {
    patientInfo: {
      name: string;
      age: number;
      gender: string;
      phone: string;
      bloodGroup: string;
    };
    appointment_display_id: string;
  };
}

// Static patient data for demonstration
const staticPatientData = {
  patient: {
    patient_display_id: "PAT-2024-001456",
    birth_date: "1985-03-15",
    gender: "Female",
    user: {
      name: "Sarah Johnson",
      phone: "+1 (555) 123-4567",
      email: "sarah.johnson@email.com",
    },
  },
  appointment_display_id: "APT-2024-001123",
  status: "confirmed",
  start: "2024-08-11T10:00:00Z",
  end: "2024-08-11T10:30:00Z",
  department: "General Medicine",
  doctor: {
    name: "Dr. Michael Thompson",
    specialization: "General Practitioner",
  },
  appointment_type: "Follow-up Consultation",
  medical_history: [
    "Hypertension (controlled)",
    "Type 2 Diabetes",
    "Seasonal Allergies",
  ],
  current_medications: [
    "Metformin 500mg - Twice daily",
    "Lisinopril 10mg - Once daily",
    "Vitamin D3 1000IU - Once daily",
  ],
  insurance: {
    provider: "Blue Cross Blue Shield",
    policy_number: "BCBS-789456123",
    group_number: "GRP-45678",
  },
  emergency_contact: {
    name: "John Johnson (Spouse)",
    phone: "+1 (555) 987-6543",
    relationship: "Spouse",
  },
};

export default function PatientDetailsDrawerStatic({
  isOpen,
  onClose,
  patientData,
}: PatientDetailsDrawerStaticProps) {
  // Use provided patient data or fall back to static data
  const currentPatientData = patientData
    ? {
        patient: {
          patient_display_id: `PAT-${
            patientData.appointment_display_id.split("-")[2]
          }`,
          birth_date: new Date(
            new Date().getFullYear() - patientData.patientInfo.age,
            0,
            1
          )
            .toISOString()
            .split("T")[0],
          gender: patientData.patientInfo.gender,
          user: {
            name: patientData.patientInfo.name,
            phone: patientData.patientInfo.phone,
            email: `${patientData.patientInfo.name
              .toLowerCase()
              .replace(" ", ".")}@email.com`,
          },
        },
        appointment_display_id: patientData.appointment_display_id,
        status: "completed",
        start: "2024-08-10T10:00:00Z",
        end: "2024-08-10T10:30:00Z",
        department: "General Medicine",
        doctor: {
          name: "Dr. Michael Thompson",
          specialization: "General Practitioner",
        },
        appointment_type: "Consultation",
        medical_history: [
          "No significant past medical history",
          "Regular health checkups",
        ],
        current_medications: ["None reported"],
        allergies: ["None known"],
        emergency_contact: {
          name: "Emergency Contact",
          relationship: "Spouse",
          phone: "+1 (555) 987-6543",
        },
        insurance: {
          provider: "HealthCare Plus",
          policy_number: "HC-789456123",
          group_number: "GRP-456",
        },
        vitals: {
          blood_pressure: "120/80 mmHg",
          heart_rate: "72 bpm",
          temperature: "98.6°F",
          weight: "68 kg",
          height: "170 cm",
          bmi: "23.5",
        },
      }
    : staticPatientData;
  const patient = currentPatientData.patient;
  const user = patient?.user;

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return "N/A";
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      return age - 1;
    }
    return age;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-[500px] sm:w-[700px] lg:w-[700px] flex flex-col p-4"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Patient Details (Demo)
          </SheetTitle>
          <SheetDescription>
            Complete information about the patient and appointment (Static Demo
            Data)
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="mt-6 space-y-6 pb-6">
            {/* Basic Patient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Full Name
                    </p>
                    <p className="text-base font-semibold">
                      {user?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Patient ID
                    </p>
                    <p className="text-base font-semibold">
                      {patient?.patient_display_id || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Age
                    </p>
                    <p className="text-base font-semibold">
                      {patient?.birth_date
                        ? `${calculateAge(patient.birth_date)} years`
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Gender
                    </p>
                    <Badge variant="outline" className="mt-1">
                      {patient?.gender || "N/A"}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Date of Birth
                    </p>
                    <p className="text-base font-semibold flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {patient?.birth_date
                        ? formatDate(patient.birth_date)
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Phone Number
                  </p>
                  <p className="text-base font-semibold flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {user?.phone || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Email Address
                  </p>
                  <p className="text-base font-semibold flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {user?.email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Emergency Contact
                  </p>
                  <p className="text-base font-semibold">
                    {currentPatientData.emergency_contact.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentPatientData.emergency_contact.phone} (
                    {currentPatientData.emergency_contact.relationship})
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Appointment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Appointment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Appointment ID
                    </p>
                    <p className="text-base font-semibold">
                      {staticPatientData?.appointment_display_id || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Status
                    </p>
                    <Badge
                      variant={
                        staticPatientData?.status === "confirmed"
                          ? "default"
                          : "secondary"
                      }
                      className="mt-1"
                    >
                      {staticPatientData?.status || "N/A"}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Department
                    </p>
                    <p className="text-base font-semibold">
                      {staticPatientData.department}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Appointment Type
                    </p>
                    <p className="text-base font-semibold">
                      {staticPatientData.appointment_type}
                    </p>
                  </div>
                </div>

                {staticPatientData?.start && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Appointment Start Time
                    </p>
                    <p className="text-base font-semibold">
                      {formatDateTime(staticPatientData.start)}
                    </p>
                  </div>
                )}

                {staticPatientData?.end && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Appointment End Time
                    </p>
                    <p className="text-base font-semibold">
                      {formatDateTime(staticPatientData.end)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Medical History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Medical History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Known Conditions
                  </p>
                  <div className="space-y-1">
                    {staticPatientData.medical_history.map(
                      (condition, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="mr-2 mb-1"
                        >
                          {condition}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Current Medications
                  </p>
                  <div className="space-y-1">
                    {staticPatientData.current_medications.map(
                      (medication, index) => (
                        <p
                          key={index}
                          className="text-sm bg-gray-50 p-2 rounded"
                        >
                          • {medication}
                        </p>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Insurance Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Insurance Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Insurance Provider
                    </p>
                    <p className="text-base font-semibold">
                      {staticPatientData.insurance.provider}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Policy Number
                    </p>
                    <p className="text-base font-semibold">
                      {staticPatientData.insurance.policy_number}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Group Number
                  </p>
                  <p className="text-base font-semibold">
                    {staticPatientData.insurance.group_number}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
