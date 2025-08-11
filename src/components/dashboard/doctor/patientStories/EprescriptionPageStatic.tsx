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
import BackButton from "@/components/common/BackButton";
import { useSearchParams } from "next/navigation";
import moment from "moment";
import React, { Suspense } from "react";
import { useDispatch } from "react-redux";
import { setConfirmReviewPrescriptionModal } from "@/store/slices/doctorSlice";
import ConfirmReviewPrescriptionModalStatic from "./modals/ConfirmReviewPrescriptionModalStatic";

// Static data matching the PatientConsultationStatic structure
const staticPrescriptionData = {
  "story-001": {
    medication_request: {
      id: "MR-2024-001123",
      medication_display_id: "RX-2024-001123",
      authored_on: "2024-08-10T09:30:00Z",
      status: "active",
      medications: [
        {
          name: "Isoniazid",
          strength: "300mg",
          form: "tablet",
          route: "oral",
          frequency: "once-daily",
          timing: {
            morning: true,
            afternoon: false,
            evening: false,
            night: false,
          },
          duration: "180",
          dosage_instruction: "Take on an empty stomach for better absorption",
          note: {
            info: "Part of HRZE regimen; give with Pyridoxine to prevent neuropathy",
          },
        },
        {
          name: "Rifampicin",
          strength: "600mg",
          form: "capsule",
          route: "oral",
          frequency: "once-daily",
          timing: {
            morning: true,
            afternoon: false,
            evening: false,
            night: false,
          },
          duration: "180",
          dosage_instruction:
            "Take on an empty stomach; may cause orange-red discoloration of urine and tears",
          note: { info: "Part of HRZE regimen" },
        },
        {
          name: "Pyrazinamide",
          strength: "1500mg",
          form: "tablet",
          route: "oral",
          frequency: "once-daily",
          timing: {
            morning: true,
            afternoon: false,
            evening: false,
            night: false,
          },
          duration: "60",
          dosage_instruction: "Take with food to reduce gastric irritation",
          note: { info: "Monitor liver function during treatment" },
        },
        {
          name: "Ethambutol",
          strength: "1200mg",
          form: "tablet",
          route: "oral",
          frequency: "once-daily",
          timing: {
            morning: true,
            afternoon: false,
            evening: false,
            night: false,
          },
          duration: "60",
          dosage_instruction:
            "Take with water; report any changes in vision immediately",
          note: { info: "Monitor visual acuity periodically" },
        },
        {
          name: "Pyridoxine (Vitamin B6)",
          strength: "10mg",
          form: "tablet",
          route: "oral",
          frequency: "once-daily",
          timing: {
            morning: true,
            afternoon: false,
            evening: false,
            night: false,
          },
          duration: "180",
          dosage_instruction: "Take with water",
          note: { info: "Prevents peripheral neuropathy from Isoniazid" },
        },
        {
          name: "Multivitamins",
          strength: "—",
          form: "tablet",
          route: "oral",
          frequency: "once-daily",
          timing: {
            morning: true,
            afternoon: false,
            evening: false,
            night: false,
          },
          duration: "As prescribed",
          dosage_instruction: "Take after breakfast",
          note: { info: "General nutritional support" },
        },
      ],
    },
    patient: {
      user: {
        name: "Ms. Ananya Rao",
      },
      gender: "female",
      patient_display_id: "PAT-2024-0456",
    },
    practitioner: {
      user: {
        name: "Dr. Rajesh Kumar",
        email: "dr.rajesh@nextcare.com",
        is_active: true,
        tenant: {
          name: "NextCare Medical Center",
          active: true,
          contact: [
            {
              telecom: [
                { value: "+91-98765-43210" },
                { value: "info@nextcare.com" },
              ],
            },
          ],
        },
      },
      practitioner_display_id: "DOC-2024-0123",
    },
    visit_note: {
      assessments: [
        {
          id: "ASSESS-001",
          code: "A15.0",
          description:
            "Pulmonary Tuberculosis (Sputum positive, drug-sensitive)",
          severity: "mild",
        },
      ],
      care_plans: [
        {
          plan_type: "medication",
          goal: "Achieve complete cure of pulmonary tuberculosis with prevention of relapse and drug resistance. Restore weight and overall health, enabling full return to daily activities.",
          detail:
            "Intensive Phase (2 months): Isoniazid 300 mg, Rifampicin 600 mg (empty stomach), Pyrazinamide 1500 mg, Ethambutol 1200 mg, Pyridoxine 10 mg, Multivitamin — once daily. Continuation Phase (4 months): Isoniazid 300 mg, Rifampicin 600 mg, Pyridoxine 10 mg, Multivitamin — once daily. Monthly weight checks, symptom assessment, and medication adherence review. LFT after 1 month; repeat sputum test at end of intensive phase. Counselling on infection control, nutrition, and lifestyle modification.",
        },
      ],
      summary:
        "Presenting complaint: Persistent dry cough for 4 weeks Pattern: Worse at night, not positional, not related to meals Systemic Review: Fatigue, low-grade fever, night sweats No wheezing, no chest pain No GI, urinary, or neurological symptoms Weight loss: Yes (~4 kg over 6 weeks) Family history: Father diabetic, no TB history Psychosocial: Lives with 3 flatmates, works long hours, moderate stress Exposure risk: One flatmate recently had 'bronchitis-like' illness 2 months ago.",
      follow_up:
        "Take all TB medicines daily in the morning as prescribed, preferably on an empty stomach for better absorption (except Pyrazinamide and Ethambutol which can be taken after food). Do not skip doses — missing medicines can cause drug resistance. Report immediately if you notice jaundice, severe nausea, vomiting, visual problems, rash, or tingling in hands/feet. Maintain a nutritious, high-protein diet and drink plenty of fluids. Cover mouth and nose when coughing; avoid spitting in open areas; use good ventilation at home. Ask close contacts/flatmates to get screened for TB. Follow up in 2 weeks, then monthly for symptom check, weight monitoring, and lab review.",
    },
    lab_tests: [
      {
        test_display: "Complete Blood Count (CBC)",
        priority: "routine",
        status: "completed",
        authored_on: "2024-08-10T09:30:00Z",
        notes: [
          {
            text: "Hb 10.8 g/dL, TLC 8,400, Platelets 2.5 lakhs — Mild anemia",
          },
        ],
      },
      {
        test_display: "Erythrocyte Sedimentation Rate (ESR)",
        priority: "routine",
        status: "completed",
        authored_on: "2024-08-10T09:30:00Z",
        notes: [{ text: "68 mm/hr — Elevated" }],
      },
      {
        test_display: "C-Reactive Protein (CRP)",
        priority: "routine",
        status: "completed",
        authored_on: "2024-08-10T09:30:00Z",
        notes: [{ text: "24 mg/L — Elevated" }],
      },
      {
        test_display: "Sputum for Acid-Fast Bacilli (AFB) — 2 samples",
        priority: "stat",
        status: "completed",
        authored_on: "2024-08-10T09:30:00Z",
        notes: [{ text: "Positive for acid-fast bacilli" }],
      },
      {
        test_display:
          "CBNAAT (Cartridge Based Nucleic Acid Amplification Test)",
        priority: "stat",
        status: "completed",
        authored_on: "2024-08-10T09:30:00Z",
        notes: [
          {
            text: "Positive for Mycobacterium tuberculosis, sensitive to Rifampicin",
          },
        ],
      },
      {
        test_display: "Chest X-Ray (PA View)",
        priority: "routine",
        status: "completed",
        authored_on: "2024-08-10T09:30:00Z",
        notes: [
          {
            text: "Bilateral upper zone infiltrates, mild cavitation right upper lobe, no pleural effusion",
          },
        ],
      },
    ],
  },
  "story-002": {
    medication_request: {
      id: "MR-2025-002456",
      medication_display_id: "RX-2025-002456",
      authored_on: "2025-08-11T14:15:00Z",
      status: "active",
      medications: [
        {
          name: "Escitalopram",
          strength: "10mg",
          form: "tablet",
          route: "oral",
          frequency: "once-daily",
          timing: {
            morning: true,
            afternoon: false,
            evening: false,
            night: false,
          },
          duration: "As prescribed",
          dosage_instruction:
            "Take at the same time each day, with or without food",
          note: { info: "SSRI; first-line treatment for depression" },
        },
        {
          name: "Folic Acid + Methylcobalamin",
          strength: "—",
          form: "tablet",
          route: "oral",
          frequency: "once-daily",
          timing: {
            morning: true,
            afternoon: false,
            evening: false,
            night: false,
          },
          duration: "90",
          dosage_instruction: "Take after meals",
          note: {
            info: "Supports nerve health and corrects low-normal B12 levels",
          },
        },
        {
          name: "Zolpidem",
          strength: "5mg",
          form: "tablet",
          route: "oral",
          frequency: "as-needed",
          timing: {
            morning: false,
            afternoon: false,
            evening: false,
            night: true,
          },
          duration: "Use only when required",
          dosage_instruction: "Take immediately before bedtime",
          note: { info: "Limit use to prevent dependence" },
        },
      ],
    },
    patient: {
      user: {
        name: "Mrs. Aarti Sharma",
      },
      gender: "female",
      patient_display_id: "PAT-2025-0789",
    },
    practitioner: {
      user: {
        name: "Dr. Priya Patel",
        email: "dr.priya@nextcare.com",
        is_active: true,
        tenant: {
          name: "NextCare Medical Center",
          active: true,
          contact: [
            {
              telecom: [
                { value: "+91-98765-43210" },
                { value: "info@nextcare.com" },
              ],
            },
          ],
        },
      },
      practitioner_display_id: "DOC-2025-0456",
    },
    visit_note: {
      assessments: [
        {
          id: "ASSESS-002",
          code: "F32.1",
          description:
            "Moderate Depression (F32.1 – ICD-11) with early signs of Vitamin B12 deficiency",
          severity: "moderate",
        },
      ],
      care_plans: [
        {
          plan_type: "combined",
          goal: "Manage moderate depression and address nutritional deficiency",
          detail:
            "Initiated SSRI (Escitalopram), vitamin supplementation, CBT referral, lifestyle advice, and follow-up schedule.",
        },
      ],
      summary:
        "34-year-old female school teacher presenting for a general health check-up found to have symptoms of moderate depression for the past 3–4 months, with fatigue, low mood, anhedonia, poor sleep, and reduced appetite. No suicidal ideation. Supportive family history of depression.",
      follow_up:
        "First follow-up in 2 weeks to review SSRI tolerability and mood. Second follow-up at 4–6 weeks to reassess PHQ-9 score and adjust dose if needed. Monthly follow-up for 6 months.",
    },
    lab_tests: [
      {
        test_display: "Complete Blood Count (CBC)",
        priority: "routine",
        status: "completed",
        authored_on: "2025-08-11T14:15:00Z",
        notes: [{ text: "Mild anemia — Hb 10.8 g/dL" }],
      },
      {
        test_display: "Thyroid Stimulating Hormone (TSH)",
        priority: "routine",
        status: "completed",
        authored_on: "2025-08-11T14:15:00Z",
        notes: [{ text: "Normal" }],
      },
      {
        test_display: "Vitamin B12 Level",
        priority: "routine",
        status: "completed",
        authored_on: "2025-08-11T14:15:00Z",
        notes: [{ text: "Low-normal — 210 pg/mL" }],
      },
      {
        test_display: "PHQ-9 Questionnaire",
        priority: "optional",
        status: "completed",
        authored_on: "2025-08-11T14:15:00Z",
        notes: [{ text: "Score: 17 — Moderate depression" }],
      },
      {
        test_display: "GAD-7 Questionnaire",
        priority: "optional",
        status: "completed",
        authored_on: "2025-08-11T14:15:00Z",
        notes: [{ text: "Score: 6 — Mild anxiety" }],
      },
    ],
  },
};

const EprescriptionPageStaticContent = () => {
  const searchParams = useSearchParams();
  const storyId = searchParams.get("storyId") || "story-001";
  const dispatch = useDispatch();
  // Get the selected story data
  const EprescriptionDetails =
    staticPrescriptionData[storyId as keyof typeof staticPrescriptionData] ||
    staticPrescriptionData["story-001"];

  const handleVerifyPrescription = () => {
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
                  <Badge
                    className={
                      EprescriptionDetails?.practitioner?.user.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {EprescriptionDetails?.practitioner?.user.is_active
                      ? "Active"
                      : "Inactive"}
                  </Badge>
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
                  <Badge
                    className={
                      EprescriptionDetails?.practitioner?.user?.tenant?.active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {EprescriptionDetails?.practitioner?.user?.tenant?.active
                      ? "Active"
                      : "Inactive"}
                  </Badge>
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
                  <React.Fragment key={index}>
                    <TableRow>
                      <TableCell className="font-semibold">
                        {data.name || "N/A"}
                      </TableCell>
                      <TableCell>{data.form || "N/A"}</TableCell>
                      <TableCell>{data.route || "N/A"}</TableCell>
                      <TableCell>{data.frequency || "N/A"}</TableCell>
                      <TableCell>{data.duration || "N/A"}</TableCell>
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
                  </React.Fragment>
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
      <ConfirmReviewPrescriptionModalStatic />
    </div>
  );
};

// Loading component for Suspense fallback
function EprescriptionPageLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

// Main export with Suspense boundary
const EprescriptionPageStatic = () => {
  return (
    <Suspense fallback={<EprescriptionPageLoading />}>
      <EprescriptionPageStaticContent />
    </Suspense>
  );
};

export default EprescriptionPageStatic;
