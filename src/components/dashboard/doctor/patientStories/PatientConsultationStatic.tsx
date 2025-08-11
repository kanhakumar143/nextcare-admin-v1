"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
  Plus,
  Trash2,
  ListPlus,
  Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import EditVitalsModalStatic from "./modals/EditVitalsModalStatic";
import PatientDetailsDrawerStatic from "./PatientDetailsDrawerStatic";
import { useDispatch } from "react-redux";
import { setConfirmConsultationModal } from "@/store/slices/doctorSlice";
import ConfirmConsultationModalStatic from "./modals/ConfirmConsultationModalStatic";

// Static sample data for two different patient stories
const patientStoriesData = {
  "story-001": {
    patientInfo: {
      name: "Ms. Ananya Rao",
      age: 28,
      gender: "Female",
      phone: "+1-555-0123",
      bloodGroup: "A+",
    },
    appointment_display_id: "APT-2024-001123",
    observations: [
      {
        vital_definition: { code: "HT", name: "Height", unit: "cm" },
        value: { value: "162" },
        is_abnormal: false,
      },
      {
        vital_definition: { code: "WT", name: "Weight", unit: "kg" },
        value: { value: "49" },
        is_abnormal: false,
      },
      {
        vital_definition: { code: "TEMP", name: "Temperature", unit: "°F" },
        value: { value: "99.3" },
        is_abnormal: false,
      },
      {
        vital_definition: { code: "BP", name: "Blood Pressure", unit: "mmHg" },
        value: { systolic: "118", diastolic: "75" },
        is_abnormal: false,
      },
      {
        vital_definition: { code: "HR", name: "Heart Rate", unit: "bpm" },
        value: { value: "68" },
        is_abnormal: false,
      },
      {
        vital_definition: {
          code: "RR",
          name: "Respiratory Rate",
          unit: "/min",
        },
        value: { value: "14" },
        is_abnormal: false,
      },
      {
        vital_definition: {
          code: "SpO2",
          name: "Oxygen Saturation",
          unit: "%",
        },
        value: { value: "99" },
        is_abnormal: false,
      },
    ],
    questionary_answers: [
      {
        questionary: {
          label: "Duration of symptoms",
          question: "What is the main reason for your visit today?",
        },
        answer: "Cough for 4 weeks, mostly dry, occasional scanty sputum",
      },
      {
        questionary: {
          label: "Associated symptoms",
          question: "Rate your pain on a scale of 1-10",
        },
        answer:
          "Low-grade fever, evening rise of temperature, night sweats, weight loss (~4 kg)",
      },
      {
        questionary: {
          label: "Appetite",
          question: "How has your sleep been recently?",
        },
        answer: "Reduced",
      },
      {
        questionary: {
          label: "Fatigue",
          question: "Have you been under any stress lately?",
        },
        answer: "Yes",
      },
      {
        questionary: {
          label: "Medical history",
          question: "Are you currently taking any medications?",
        },
        answer: "No known comorbidities",
      },
      {
        questionary: {
          label: "Vaccination History",
          question: "Any previous similar episodes?",
        },
        answer: "Not clear about BCG",
      },
      {
        questionary: {
          label: "Smoking History",
          question: "Any previous similar episodes?",
        },
        answer: "Non Smoker",
      },
      {
        questionary: {
          label: "Alcohol",
          question: "Any previous similar episodes?",
        },
        answer: "Non Alcoholic",
      },
      {
        questionary: {
          label: "Travel History",
          question: "Any previous similar episodes?",
        },
        answer: "No recent travel history",
      },
      {
        questionary: {
          label: "TB Contact",
          question: "Any previous similar episodes?",
        },
        answer: "Unknown",
      },
      {
        questionary: {
          label: "Menstrual cycles",
          question: "Any previous similar episodes?",
        },
        answer: "Regular",
      },
      {
        questionary: {
          label: "Pregnancy",
          question: "Any previous similar episodes?",
        },
        answer: "Not Pregnant",
      },
    ],
    visitNote: {
      summary:
        "Presenting complaint: Persistent dry cough for 4 weeks Pattern: Worse at night, not positional, not related to meals Systemic Review: Fatigue, low-grade fever, night sweats No wheezing, no chest pain No GI, urinary, or neurological symptoms Weight loss: Yes (~4 kg over 6 weeks) Family history: Father diabetic, no TB history Psychosocial: Lives with 3 flatmates, works long hours, moderate stress Exposure risk: One flatmate recently had “bronchitis-like” illness 2 months ago. General: Thin-built, mildly pale Vitals: Stable, low-grade fever Respiratory exam: Mild bilateral crepitations over upper lung zones No wheeze, no bronchial breath sounds CVS/Abdomen/CNS: Unremarkable Lymph nodes: No palpable lymphadenopathy",
      follow_up:
        "Take all TB medicines daily in the morning as prescribed, preferably on an empty stomach for better absorption (except Pyrazinamide and Ethambutol which can be taken after food). Do not skip doses — missing medicines can cause drug resistance. Report immediately if you notice jaundice, severe nausea, vomiting, visual problems, rash, or tingling in hands/feet. Maintain a nutritious, high-protein diet and drink plenty of fluids. Cover mouth and nose when coughing; avoid spitting in open areas; use good ventilation at home. Ask close contacts/flatmates to get screened for TB. Follow up in 2 weeks, then monthly for symptom check, weight monitoring, and lab review.",
      visit_care_plan: {
        plan_type: "medication",
        goal: "Achieve complete cure of pulmonary tuberculosis with prevention of relapse and drug resistance. Restore weight and overall health, enabling full return to daily activities.",
        detail:
          "Intensive Phase (2 months): Isoniazid 300 mg, Rifampicin 600 mg (empty stomach), Pyrazinamide 1500 mg, Ethambutol 1200 mg, Pyridoxine 10 mg, Multivitamin — once daily. Continuation Phase (4 months): Isoniazid 300 mg, Rifampicin 600 mg, Pyridoxine 10 mg, Multivitamin — once daily. Monthly weight checks, symptom assessment, and medication adherence review. LFT after 1 month; repeat sputum test at end of intensive phase. Counselling on infection control, nutrition, and lifestyle modification.",
      },
      visit_assessment: {
        description: "Pulmonary Tuberculosis (Sputum positive, drug-sensitive)",
        severity: "mild",
      },
    },
    labTests: [
      {
        test_display: "Complete Blood Count (CBC)",
        intent: "order",
        priority: "routine",
        notes: "Hb 10.8 g/dL, TLC 8,400, Platelets 2.5 lakhs — Mild anemia",
      },
      {
        test_display: "Erythrocyte Sedimentation Rate (ESR)",
        intent: "order",
        priority: "routine",
        notes: "68 mm/hr — Elevated",
      },
      {
        test_display: "C-Reactive Protein (CRP)",
        intent: "order",
        priority: "routine",
        notes: "24 mg/L — Elevated",
      },
      {
        test_display: "Liver Function Test (LFT)",
        intent: "order",
        priority: "routine",
        notes: "Normal",
      },
      {
        test_display: "Renal Function Test (RFT)",
        intent: "order",
        priority: "routine",
        notes: "Normal",
      },
      {
        test_display: "HIV 1/2",
        intent: "order",
        priority: "routine",
        notes: "Negative",
      },
      {
        test_display: "HbA1c",
        intent: "order",
        priority: "routine",
        notes: "5.2% — Normal",
      },
      {
        test_display: "Urine Routine Examination",
        intent: "order",
        priority: "routine",
        notes: "Normal",
      },
      {
        test_display: "Sputum for Acid-Fast Bacilli (AFB) — 2 samples",
        intent: "order",
        priority: "stat",
        notes: "Positive for acid-fast bacilli",
      },
      {
        test_display:
          "CBNAAT (Cartridge Based Nucleic Acid Amplification Test)",
        intent: "order",
        priority: "stat",
        notes:
          "Positive for Mycobacterium tuberculosis, sensitive to Rifampicin",
      },
      {
        test_display: "Chest X-Ray (PA View)",
        intent: "order",
        priority: "routine",
        notes:
          "Bilateral upper zone infiltrates, mild cavitation right upper lobe, no pleural effusion",
      },
      {
        test_display: "Electrocardiogram (ECG)",
        intent: "order",
        priority: "routine",
        notes: "Normal sinus rhythm",
      },
      {
        test_display: "2D Echocardiography",
        intent: "order",
        priority: "routine",
        notes: "Normal cardiac structure and function",
      },
    ],
    medicines: [
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
        duration: "2 months (Intensive Phase) + 4 months (Continuation Phase)",
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
        duration: "2 months (Intensive Phase) + 4 months (Continuation Phase)",
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
        duration: "2 months (Intensive Phase)",
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
        duration: "2 months (Intensive Phase)",
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
        duration: "throughout anti-TB therapy",
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
        duration: "as prescribed",
        dosage_instruction: "Take after breakfast",
        note: { info: "General nutritional support" },
      },
    ],
  },
  "story-002": {
    patientInfo: {
      name: "Mrs. Aarti Sharma",
      age: 34,
      gender: "Female",
      phone: "+91-9876543210",
      bloodGroup: "O+",
    },
    appointment_display_id: "APT-2025-002456",
    observations: [
      {
        vital_definition: { code: "HT", name: "Height", unit: "cm" },
        value: { value: "160" },
        is_abnormal: false,
      },
      {
        vital_definition: { code: "WT", name: "Weight", unit: "kg" },
        value: { value: "56" },
        is_abnormal: false,
      },
      {
        vital_definition: { code: "TEMP", name: "Temperature", unit: "°F" },
        value: { value: "98.6" },
        is_abnormal: false,
      },
      {
        vital_definition: { code: "BP", name: "Blood Pressure", unit: "mmHg" },
        value: { systolic: "110", diastolic: "74" },
        is_abnormal: false,
      },
      {
        vital_definition: { code: "HR", name: "Heart Rate", unit: "bpm" },
        value: { value: "76" },
        is_abnormal: false,
      },
      {
        vital_definition: {
          code: "RR",
          name: "Respiratory Rate",
          unit: "/min",
        },
        value: { value: "18" },
        is_abnormal: false,
      },
      {
        vital_definition: {
          code: "SpO2",
          name: "Oxygen Saturation",
          unit: "%",
        },
        value: { value: "98" },
        is_abnormal: false,
      },
    ],
    questionary_answers: [
      {
        questionary: {
          label: "Reason for Visit",
          question: "What brings you in today?",
        },
        answer: "General health check-up",
      },
      {
        questionary: {
          label: "Energy Level",
          question: "Feeling tired or having little energy?",
        },
        answer: "Yes",
      },
      {
        questionary: {
          label: "Mood",
          question: "Feeling down, depressed, or hopeless?",
        },
        answer: "Yes",
      },
      {
        questionary: {
          label: "Irritability",
          question: "Irritability or mood swings?",
        },
        answer: "Yes",
      },
      {
        questionary: {
          label: "Interest",
          question: "Loss of interest in daily activities?",
        },
        answer: "Yes",
      },
      {
        questionary: {
          label: "Concentration",
          question: "Difficulty concentrating?",
        },
        answer: "Yes",
      },
      {
        questionary: {
          label: "Appetite",
          question: "Poor appetite?",
        },
        answer: "Yes",
      },
      {
        questionary: {
          label: "Suicidal Thoughts",
          question: "Any suicidal thoughts?",
        },
        answer: "No",
      },
      {
        questionary: {
          label: "Past Mental Illness",
          question: "Any past diagnosis of mental illness?",
        },
        answer: "No",
      },
      {
        questionary: {
          label: "Family History",
          question: "Any family history of mental illness?",
        },
        answer: "Mother had depression",
      },
    ],
    visitNote: {
      summary:
        "34-year-old female school teacher presenting for a general health check-up found to have symptoms of moderate depression for the past 3–4 months, with fatigue, low mood, anhedonia, poor sleep, and reduced appetite. No suicidal ideation. Supportive family history of depression.",
      follow_up:
        "First follow-up in 2 weeks to review SSRI tolerability and mood. Second follow-up at 4–6 weeks to reassess PHQ-9 score and adjust dose if needed. Monthly follow-up for 6 months.",
      visit_care_plan: {
        plan_type: "combined",
        goal: "Manage moderate depression and address nutritional deficiency",
        detail:
          "Initiated SSRI (Escitalopram), vitamin supplementation, CBT referral, lifestyle advice, and follow-up schedule.",
      },
      visit_assessment: {
        description:
          "Moderate Depression (F32.1 – ICD-11) with early signs of Vitamin B12 deficiency",
        severity: "moderate",
      },
    },
    labTests: [
      {
        test_display: "Complete Blood Count (CBC)",
        intent: "order",
        priority: "routine",
        notes: "Mild anemia — Hb 10.8 g/dL",
      },
      {
        test_display: "Thyroid Stimulating Hormone (TSH)",
        intent: "order",
        priority: "routine",
        notes: "Normal",
      },
      {
        test_display: "Vitamin B12 Level",
        intent: "order",
        priority: "routine",
        notes: "Low-normal — 210 pg/mL",
      },
      {
        test_display: "Fasting Blood Sugar",
        intent: "order",
        priority: "routine",
        notes: "Normal",
      },
      {
        test_display: "Liver Function Test (LFT)",
        intent: "order",
        priority: "routine",
        notes: "Normal",
      },
      {
        test_display: "Renal Function Test (RFT)",
        intent: "order",
        priority: "routine",
        notes: "Normal",
      },
      {
        test_display: "Serum Electrolytes",
        intent: "order",
        priority: "routine",
        notes: "Normal",
      },
      {
        test_display: "PHQ-9 Questionnaire",
        intent: "order",
        priority: "optional",
        notes: "Score: 17 — Moderate depression",
      },
      {
        test_display: "GAD-7 Questionnaire",
        intent: "order",
        priority: "optional",
        notes: "Score: 6 — Mild anxiety",
      },
    ],
    medicines: [
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
        duration: "as prescribed (typically long-term for depression)",
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
        duration: "3 months",
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
        duration: "use only when required for severe insomnia",
        dosage_instruction: "Take immediately before bedtime",
        note: { info: "Limit use to prevent dependence" },
      },
    ],
  },
};

// Configuration for dynamic sections
const tableConfig = [
  {
    title: "Recommended Lab Tests",
    fields: [
      { key: "test_display", placeholder: "Test Name", type: "input" },
      { key: "intent", placeholder: "Intent", type: "intent-select" },
      { key: "priority", placeholder: "Priority", type: "priority-select" },
      {
        key: "notes",
        placeholder: "Notes",
        type: "input",
      },
    ],
  },
  {
    title: "Medicines To Be Prescribed",
    fields: [
      { key: "name", placeholder: "Name", type: "input" },
      {
        key: "strength",
        placeholder: "Strength",
        type: "input",
      },
      { key: "form", placeholder: "Form", type: "medication-form" },
      {
        key: "route",
        placeholder: "Route",
        type: "medication-route",
      },
      { key: "frequency", placeholder: "Frequency", type: "select" },
      { key: "timing", placeholder: "Timing", type: "timing-multiselect" },
      { key: "duration", placeholder: "Duration", type: "input" },
    ],
  },
];

// Frequency options
const frequencyOptions = [
  { value: "once-daily", label: "Once Daily" },
  { value: "twice-daily", label: "Twice Daily" },
  { value: "three-times-daily", label: "Three Times Daily" },
  { value: "four-times-daily", label: "Four Times Daily" },
  { value: "hourly", label: "Hourly" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

// Intent options for lab tests
const intentOptions = [
  { value: "proposal", label: "Proposal" },
  { value: "plan", label: "Plan" },
  { value: "order", label: "Order" },
  { value: "original-order", label: "Original Order" },
  { value: "reflex-order", label: "Reflex Order" },
  { value: "filler-order", label: "Filler Order" },
  { value: "instance-order", label: "Instance Order" },
  { value: "option", label: "Option" },
];

// Priority options for lab tests
const priorityOptions = [
  { value: "routine", label: "Routine" },
  { value: "urgent", label: "Urgent" },
  { value: "asap", label: "ASAP" },
  { value: "stat", label: "STAT" },
];

// Medication form options
const medicationFormOptions = [
  { value: "tablet", label: "Tablet" },
  { value: "capsule", label: "Capsule" },
  { value: "solution", label: "Solution" },
  { value: "injection", label: "Injection" },
  { value: "ointment", label: "Ointment" },
  { value: "powder", label: "Powder" },
  { value: "patch", label: "Patch" },
  { value: "spray", label: "Spray" },
  { value: "syrup", label: "Syrup" },
];

// Medication route options
const medicationRouteOptions = [
  { value: "oral", label: "Oral" },
  { value: "intravenous", label: "Intravenous" },
  { value: "intramuscular", label: "Intramuscular" },
  { value: "subcutaneous", label: "Subcutaneous" },
  { value: "topical", label: "Topical" },
  { value: "nasal", label: "Nasal" },
  { value: "rectal", label: "Rectal" },
  { value: "ophthalmic", label: "Ophthalmic" },
  { value: "inhalation", label: "Inhalation" },
  { value: "transdermal", label: "Transdermal" },
];

// Timing options
const timingOptions = [
  { key: "morning", label: "Morning" },
  { key: "afternoon", label: "Afternoon" },
  { key: "evening", label: "Evening" },
  { key: "night", label: "Night" },
];

// Timing Multi-Select Component
function TimingMultiSelect({
  value,
  onChange,
}: {
  value: any;
  onChange: (timing: any) => void;
}) {
  const getSelectedTimings = () => {
    if (!value || typeof value !== "object") {
      return [];
    }
    return timingOptions.filter((option) => value[option.key] === true);
  };

  const toggleTiming = (timingKey: string) => {
    const currentTiming = value || {
      morning: false,
      afternoon: false,
      evening: false,
      night: false,
    };

    const newTiming = {
      ...currentTiming,
      [timingKey]: !currentTiming[timingKey],
    };

    onChange(newTiming);
  };

  const selectedTimings = getSelectedTimings();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center gap-1 overflow-hidden">
            {selectedTimings.length === 0 ? (
              <span className="text-muted-foreground">Select timing</span>
            ) : selectedTimings.length === 1 ? (
              <Badge variant="secondary" className="text-xs">
                {selectedTimings[0].label}
              </Badge>
            ) : (
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="text-xs">
                  {selectedTimings[0].label}
                </Badge>
                <span className="text-muted-foreground text-sm">...</span>
              </div>
            )}
          </div>
          <Clock className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {timingOptions.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.key}
            checked={value?.[option.key] || false}
            onCheckedChange={() => toggleTiming(option.key)}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Editable row component
function EditableTableRow({
  item,
  fields,
  onUpdate,
  onDelete,
  index,
  onAdd,
  showAddButton = false,
}: {
  item: any;
  fields: any[];
  onUpdate: (index: number, key: string, value: string | any) => void;
  onDelete: (index: number) => void;
  onAdd: (index: number) => void;
  index: number;
  showAddButton?: boolean;
}) {
  return (
    <>
      <TableRow>
        <TableCell className="text-center">{index + 1}</TableCell>
        {fields.map((field) => (
          <TableCell key={field.key} className="w-[20vw]">
            {field.type === "select" ? (
              <Select
                value={item[field.key] || ""}
                onValueChange={(value) => onUpdate(index, field.key, value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={field.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.type === "medication-form" ? (
              <Select
                value={item[field.key] || ""}
                onValueChange={(value) => onUpdate(index, field.key, value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={field.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {medicationFormOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.type === "medication-route" ? (
              <Select
                value={item[field.key] || ""}
                onValueChange={(value) => onUpdate(index, field.key, value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={field.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {medicationRouteOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.type === "timing-multiselect" ? (
              <TimingMultiSelect
                value={item[field.key]}
                onChange={(timing) => onUpdate(index, field.key, timing)}
              />
            ) : field.type === "intent-select" ? (
              <Select
                value={item[field.key] || ""}
                onValueChange={(value) => onUpdate(index, field.key, value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={field.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {intentOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.type === "priority-select" ? (
              <Select
                value={item[field.key] || ""}
                onValueChange={(value) => onUpdate(index, field.key, value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={field.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={item[field.key] || ""}
                onChange={(e) => onUpdate(index, field.key, e.target.value)}
                placeholder={field.placeholder}
              />
            )}
          </TableCell>
        ))}
        <TableCell>
          <div className="flex gap-1">
            <Button
              onClick={() => onDelete(index)}
              variant="outline"
              size="sm"
              className="flex gap-1"
            >
              <Trash2 size={16} />
            </Button>
            {showAddButton && (
              <Button
                onClick={() => onAdd(index)}
                variant="outline"
                size="sm"
                className="flex gap-1"
              >
                <ListPlus size={16} />
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>

      {/* Additional information row for medicines */}
      {(item.dosage_instruction ||
        item.note?.info ||
        (item.timing && Object.values(item.timing).some(Boolean))) && (
        <TableRow className="bg-muted/30">
          <TableCell></TableCell>
          <TableCell colSpan={fields.length + 1} className="py-2">
            <div className="text-sm space-y-1">
              {item.dosage_instruction && (
                <div>
                  <span className="font-medium text-muted-foreground">
                    Instructions for consumption:{" "}
                  </span>
                  <span className="text-foreground">
                    {item.dosage_instruction}
                  </span>
                </div>
              )}
              {item.timing && Object.values(item.timing).some(Boolean) && (
                <div>
                  <span className="font-medium text-muted-foreground">
                    Timing:{" "}
                  </span>
                  <div className="inline-flex flex-wrap gap-1">
                    {timingOptions.map(
                      (option) =>
                        item.timing?.[option.key] && (
                          <Badge
                            key={option.key}
                            variant="outline"
                            className="text-xs"
                          >
                            {option.label}
                          </Badge>
                        )
                    )}
                  </div>
                </div>
              )}
              {item.note?.info && (
                <div>
                  <span className="font-medium text-muted-foreground">
                    Remarks:{" "}
                  </span>
                  <span className="text-foreground">{item.note.info}</span>
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function PatientConsultationStaticContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storyId = searchParams.get("storyId") || "story-001";
  const dispatch = useDispatch();

  // Get the selected story data
  const selectedStoryData =
    patientStoriesData[storyId as keyof typeof patientStoriesData] ||
    patientStoriesData["story-001"];

  const [visitNote, setVisitNote] = useState(selectedStoryData.visitNote);
  const [showEditVitals, setShowEditVitals] = useState(false);
  const [labTests, setLabTests] = useState(selectedStoryData.labTests);
  const [medicines, setMedicines] = useState(selectedStoryData.medicines);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMedicineIndex, setSelectedMedicineIndex] =
    useState<number>(-1);
  const [dosageInstructions, setDosageInstructions] = useState("");
  const [notes, setNotes] = useState("");
  const [editVitalsModalOpen, setEditVitalsModalOpen] = useState(false);
  const [patientDetailsDrawerOpen, setPatientDetailsDrawerOpen] =
    useState(false);
  const [currentVitals, setCurrentVitals] = useState(
    selectedStoryData.observations
  );

  // Update data when story changes
  useEffect(() => {
    const newStoryData =
      patientStoriesData[storyId as keyof typeof patientStoriesData] ||
      patientStoriesData["story-001"];
    setVisitNote(newStoryData.visitNote);
    setLabTests(newStoryData.labTests);
    setMedicines(newStoryData.medicines);
    setCurrentVitals(newStoryData.observations);
  }, [storyId]);

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

  const updateVisitNote = (field: string, value: string) => {
    const fieldParts = field.split(".");
    if (fieldParts.length === 1) {
      setVisitNote((prev) => ({ ...prev, [field]: value }));
    } else if (fieldParts.length === 2) {
      setVisitNote((prev) => {
        const parentField = fieldParts[0] as keyof typeof prev;
        const currentValue = prev[parentField];

        return {
          ...prev,
          [fieldParts[0]]: {
            ...(typeof currentValue === "object" && currentValue !== null
              ? currentValue
              : {}),
            [fieldParts[1]]: value,
          },
        };
      });
    }
  };

  // Add new row functions
  const addNewLabTest = () => {
    const newLabTest = {
      notes: "",
      test_display: "",
      intent: "order",
      priority: "routine",
    };
    setLabTests((prev) => [...prev, newLabTest]);
  };

  const addNewMedicine = () => {
    const newMedicine = {
      name: "",
      strength: "",
      form: "",
      route: "",
      frequency: "",
      timing: {
        morning: false,
        afternoon: false,
        evening: false,
        night: false,
      },
      duration: "",
      dosage_instruction: "",
      note: { info: "" },
    };
    setMedicines((prev) => [...prev, newMedicine]);
  };

  // Update functions
  const updateLabTestField = (index: number, key: string, value: string) => {
    setLabTests((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  };

  const updateMedicineField = (
    index: number,
    key: string,
    value: string | any
  ) => {
    setMedicines((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  };

  // Delete functions
  const deleteLabTestItem = (index: number) => {
    setLabTests((prev) => prev.filter((_, i) => i !== index));
  };

  const deleteMedicineItem = (index: number) => {
    setMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  const onAddMoreFields = (index: number) => {
    setSelectedMedicineIndex(index);
    setDosageInstructions(medicines[index]?.dosage_instruction || "");
    setNotes(medicines[index]?.note?.info || "");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedMedicineIndex(-1);
    setDosageInstructions("");
    setNotes("");
  };

  const handleSaveModal = () => {
    if (selectedMedicineIndex >= 0) {
      // Update dosage instructions
      if (
        dosageInstructions !==
        (medicines[selectedMedicineIndex]?.dosage_instruction || "")
      ) {
        updateMedicineField(
          selectedMedicineIndex,
          "dosage_instruction",
          dosageInstructions
        );
      }

      // Update notes
      if (notes !== (medicines[selectedMedicineIndex]?.note?.info || "")) {
        updateMedicineField(selectedMedicineIndex, "note", { info: notes });
      }
    }
    closeModal();
  };

  const handleConfirmConsultationCheck = () => {
    if (!visitNote.summary.trim()) {
      alert(
        "Please provide a consultation summary before completing the consultation."
      );
      return;
    }
    dispatch(setConfirmConsultationModal(true));
  };

  return (
    <>
      <div className="mx-6 my-3 py-2 border-b-2">
        <Button
          variant={"ghost"}
          className="mb-4"
          onClick={() => router.push("/dashboard/doctor/patient-stories")}
        >
          <ArrowLeft /> back
        </Button>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Label className="text-md font-light">Appointment ID :</Label>
            <p className="text-xl font-semibold text-foreground px-4">
              {selectedStoryData.appointment_display_id}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Patient:{" "}
              <span className="font-medium text-foreground">
                {selectedStoryData.patientInfo.name}
              </span>
            </div>
            <Button onClick={() => setPatientDetailsDrawerOpen(true)}>
              <Info className="h-4 w-4" />
              View Patient Details
            </Button>
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
                onClick={() => setEditVitalsModalOpen(true)}
                className="h-8 w-8 hover:bg-gray-100"
              >
                <Edit className="h-4 w-4 text-gray-600" />
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4 w-full">
              {currentVitals.map((vital: any, i: number) => (
                <Tooltip key={i}>
                  <TooltipTrigger>
                    <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex-shrink-0">
                        {getVitalIcon(vital.vital_definition?.code)}
                      </div>
                      <div className="flex-1 min-w-0">
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
          </div>
        </div>
      </div>

      <div className="flex p-4 bg-background gap-4">
        {/* Left Side */}
        <div className="w-full lg:w-5/12 space-y-4 min-h-full">
          {/* Pre-consultation QnA */}
          <Card className="border-border p-0">
            <CardHeader className="bg-gray-200 rounded-t-lg">
              <CardTitle className="text-lg py-3">
                Pre-consultation Answers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="pb-6 pr-4 h-[52vh]">
                <div className="space-y-4 text-sm">
                  {selectedStoryData.questionary_answers.map(
                    (q: any, i: number) => (
                      <div
                        key={i}
                        className="grid grid-cols-5 gap-4 items-start"
                      >
                        <div className="col-span-2">
                          <p className="font-medium text-foreground text-left">
                            {q?.questionary?.label}:
                          </p>
                        </div>
                        <div className="col-span-3">
                          <p className="text-muted-foreground text-left">
                            {q.answer || ""}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <Card className="w-full space-y-1 p-4">
          <div className="flex flex-col justify-between border-border">
            <div className="pb-2 px-3 py-3 flex items-start justify-between">
              <div>
                <p className="text-xl font-bold">Visit Summary</p>
                <p className="text-sm text-muted-foreground">
                  A detailed summary of the patient's consultation, including
                  prescribed medicines and recommended lab investigations.
                </p>
              </div>
              <div className="mx-5">
                <Select
                  value={visitNote.visit_care_plan.plan_type}
                  onValueChange={(value) =>
                    updateVisitNote("visit_care_plan.plan_type", value)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select plan type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Treatment Plan Type</SelectLabel>
                      <SelectItem value="followup">Follow Up</SelectItem>
                      <SelectItem value="medication">Medication</SelectItem>
                      <SelectItem value="lifestyle">Lifestyle</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-grow px-3 py-2">
              <Label className="text-sm font-medium">Doctor Notes</Label>
              <Textarea
                placeholder="Write your summary here..."
                className="flex-grow h-[10vh]"
                value={visitNote.summary}
                onChange={(e) => updateVisitNote("summary", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 flex-grow px-3 py-2">
              <Label className="text-sm font-medium">
                Post-Visit Care Instructions
              </Label>
              <Input
                placeholder="Provide clear instructions for patient care and next steps"
                value={visitNote.follow_up}
                onChange={(e) => updateVisitNote("follow_up", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2 flex-grow px-3 py-2">
              <Label className="text-sm font-medium">Treatment Plan</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium">
                    Treatment Objective
                  </Label>
                  <Input
                    placeholder="Define the primary treatment goal."
                    value={visitNote.visit_care_plan.goal}
                    onChange={(e) =>
                      updateVisitNote("visit_care_plan.goal", e.target.value)
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium">
                    Care Plan Specifics
                  </Label>
                  <Input
                    placeholder="Specify how the treatment plan will be executed"
                    value={visitNote.visit_care_plan.detail}
                    onChange={(e) =>
                      updateVisitNote("visit_care_plan.detail", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 flex-grow px-3 py-2">
              <Label className="text-sm font-medium">Clinical Assessment</Label>
              <div className="grid grid-cols-2 gap-4 p-3">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium">
                    Assessment Notes
                  </Label>
                  <Input
                    placeholder="Describe your clinical assessment and observations."
                    value={visitNote.visit_assessment.description}
                    onChange={(e) =>
                      updateVisitNote(
                        "visit_assessment.description",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium">Severity Level</Label>
                  <Select
                    value={visitNote.visit_assessment.severity}
                    onValueChange={(value) =>
                      updateVisitNote("visit_assessment.severity", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select severity Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Severity Level</SelectLabel>
                        <SelectItem value="mild">Mild</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="severe">Severe</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Interactive Medicine and Lab Tests Section */}
      <div className="px-4 mr-2">
        <div className="grid gap-6">
          {tableConfig.map((section) => {
            const isLabTests = section.title === "Recommended Lab Tests";
            const currentData = isLabTests ? labTests : medicines;
            const addFunction = isLabTests ? addNewLabTest : addNewMedicine;
            const updateFunction = isLabTests
              ? updateLabTestField
              : updateMedicineField;
            const deleteFunction = isLabTests
              ? deleteLabTestItem
              : deleteMedicineItem;

            return (
              <Card key={section.title} className="shadow-md">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl font-bold">
                    {section.title}
                  </CardTitle>
                  <Button
                    onClick={addFunction}
                    variant="outline"
                    className="flex gap-2"
                  >
                    <Plus size={16} />
                    Add {isLabTests ? "Lab Test" : "Medicine"}
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center">#</TableHead>
                        {section.fields.map((f) => (
                          <TableHead key={f.key}>{f.placeholder}</TableHead>
                        ))}
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentData.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={section.fields.length + 2}
                            className="text-center text-muted-foreground py-8"
                          >
                            No {isLabTests ? "lab tests" : "medicines"} added
                            yet. Click "Add" to get started.
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentData.map((item: any, index: number) => (
                          <EditableTableRow
                            key={index}
                            item={item}
                            fields={section.fields}
                            onUpdate={updateFunction}
                            onDelete={deleteFunction}
                            onAdd={onAddMoreFields}
                            showAddButton={!isLabTests}
                            index={index}
                          />
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="flex w-full gap-3 justify-end px-6 py-4">
        <Button variant={"outline"}>Cancel</Button>
        <Button onClick={handleConfirmConsultationCheck}>
          Complete Consultation
        </Button>
      </div>

      {/* Medication Instructions Modal */}
      <Dialog open={modalOpen} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Additional Instructions for{" "}
              {selectedMedicineIndex >= 0
                ? medicines[selectedMedicineIndex]?.name || "Medicine"
                : "Medicine"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="dosage-instructions">
                Instructions for consumption
              </Label>
              <Textarea
                id="dosage-instructions"
                placeholder="Enter detailed consumption instructions..."
                value={dosageInstructions}
                onChange={(e) => setDosageInstructions(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Remarks</Label>
              <Textarea
                id="notes"
                placeholder="Enter any additional remarks or notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={handleSaveModal}>Save Instructions</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Vitals Modal */}
      <EditVitalsModalStatic
        isOpen={editVitalsModalOpen}
        onClose={() => setEditVitalsModalOpen(false)}
        currentVitals={currentVitals}
        onSave={(updatedVitals) => {
          setCurrentVitals(updatedVitals);
          setEditVitalsModalOpen(false);
        }}
      />

      {/* Patient Details Drawer */}
      <PatientDetailsDrawerStatic
        isOpen={patientDetailsDrawerOpen}
        onClose={() => setPatientDetailsDrawerOpen(false)}
        patientData={selectedStoryData}
      />
      <ConfirmConsultationModalStatic />
    </>
  );
}

// Loading component for Suspense fallback
function PatientConsultationLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

// Main export with Suspense boundary
export default function PatientConsultationStatic() {
  return (
    <Suspense fallback={<PatientConsultationLoading />}>
      <PatientConsultationStaticContent />
    </Suspense>
  );
}
