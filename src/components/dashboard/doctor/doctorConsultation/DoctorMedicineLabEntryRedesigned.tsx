"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ListPlus,
  Plus,
  Trash2,
  Clock,
  Pill,
  FlaskConical,
  AlertTriangle,
  Info,
  Sparkles,
  Bot,
  Edit3,
  Save,
  X,
  Edit,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  addLabTest,
  addMedicine,
  updateLabTest,
  updateMedicine,
  deleteLabTest,
  deleteMedicine,
} from "@/store/slices/doctorSlice";
import { RootState } from "@/store";
import { LabTest, Medication } from "@/types/doctor.types";
import MedicationInstructionsModal from "../modals/MedicationInstructionsModal";
import EditItemModal from "./modals/EditItemModal";
import { toast } from "sonner";
import { AppointmentDtlsForDoctor } from "@/types/doctorNew.types";

// Drug warnings configuration
const drugWarnings = {
  amlodipine: {
    heading: "CDSS Alerts",
    message: "May cause pedal edema. Advice patient to monitor BP regularly",
  },
  atorvastatin: {
    heading: "CDSS Alerts",
    message:
      "When used with amlodipine, atorvastatin dose should not exceed 20 mg",
  },
  paracetamol: {
    heading: "CDSS Alerts",
    message: "Max dose = 3 g/day. Avoid in liver disease/alcohol misuse",
  },
  aspirin: {
    heading: "CDSS Alerts",
    message:
      "Check bleeding risk & GI history before prescribing. If long-term, consider PPI co-prescription for gastric protection",
  },
};

// Function to check for drug warnings
const checkDrugWarning = (medicationName: string) => {
  const drugName = medicationName.toLowerCase().trim();
  const warning = drugWarnings[drugName as keyof typeof drugWarnings];

  if (warning) {
    toast.info(warning.heading, {
      description: warning.message,
      duration: 8000,
      style: {
        backgroundColor: "#fef3c7",
        border: "1px solid #f59e0b",
        color: "#92400e",
      },
    });
  }
};

// Function to normalize AI suggestion values to match form options
const normalizeMedicineSuggestion = (suggestion: any) => {
  const normalized = { ...suggestion };

  // Normalize frequency
  if (normalized.frequency) {
    const freqLower = normalized.frequency.toLowerCase().replace(/\s+/g, "-");
    const freqMap: { [key: string]: string } = {
      "once-daily": "once-daily",
      "twice-daily": "twice-daily",
      "three-times-daily": "three-times-daily",
      "four-times-daily": "four-times-daily",
      "once daily": "once-daily",
      "twice daily": "twice-daily",
      "three times daily": "three-times-daily",
      "four times daily": "four-times-daily",
      hourly: "hourly",
      weekly: "weekly",
      monthly: "monthly",
    };
    normalized.frequency = freqMap[freqLower] || normalized.frequency;
  }

  // Normalize route
  if (normalized.route) {
    const routeLower = normalized.route.toLowerCase();
    const routeMap: { [key: string]: string } = {
      oral: "oral",
      intravenous: "intravenous",
      intramuscular: "intramuscular",
      subcutaneous: "subcutaneous",
      topical: "topical",
      nasal: "nasal",
      rectal: "rectal",
      ophthalmic: "ophthalmic",
      inhalation: "inhalation",
      transdermal: "transdermal",
    };
    normalized.route = routeMap[routeLower] || normalized.route;
  }

  // Normalize form
  if (normalized.form) {
    const formLower = normalized.form.toLowerCase();
    const formMap: { [key: string]: string } = {
      tablet: "tablet",
      capsule: "capsule",
      solution: "solution",
      injection: "injection",
      ointment: "ointment",
      powder: "powder",
      patch: "patch",
      spray: "spray",
      syrup: "syrup",
    };
    normalized.form = formMap[formLower] || normalized.form;
  }

  return normalized;
};

// Function to normalize AI lab test suggestion values
const normalizeLabTestSuggestion = (suggestion: any) => {
  const normalized = { ...suggestion };

  // Normalize intent
  if (normalized.intent) {
    const intentLower = normalized.intent.toLowerCase().replace(/\s+/g, "-");
    const intentMap: { [key: string]: string } = {
      proposal: "proposal",
      plan: "plan",
      order: "order",
      "original-order": "original-order",
      "reflex-order": "reflex-order",
      "filler-order": "filler-order",
      "instance-order": "instance-order",
      option: "option",
    };
    normalized.intent = intentMap[intentLower] || normalized.intent;
  }

  // Normalize priority
  if (normalized.priority) {
    const priorityLower = normalized.priority.toLowerCase();
    const priorityMap: { [key: string]: string } = {
      routine: "routine",
      urgent: "urgent",
      asap: "asap",
      stat: "stat",
      high: "high",
      medium: "medium",
    };
    normalized.priority = priorityMap[priorityLower] || normalized.priority;
  }

  return normalized;
};

// Configuration for dynamic sections
const tableConfig = [
  {
    title: "Recommended Lab Tests",
    icon: FlaskConical,
    color: "emerald",
    fields: [
      { key: "test_display", placeholder: "Test Name", type: "input" },
      { key: "intent", placeholder: "Intent", type: "intent-select" },
      { key: "priority", placeholder: "Priority", type: "priority-select" },
      { key: "notes", placeholder: "Notes", type: "input" },
    ],
  },
  {
    title: "Prescribed Medicines",
    icon: Pill,
    color: "blue",
    fields: [
      { key: "name", placeholder: "Medicine Name", type: "input" },
      { key: "strength", placeholder: "Strength", type: "input" },
      { key: "form", placeholder: "Form", type: "medication-form" },
      { key: "route", placeholder: "Route", type: "medication-route" },
      { key: "frequency", placeholder: "Frequency", type: "select" },
      { key: "timing", placeholder: "Timing", type: "timing-multiselect" },
      { key: "duration", placeholder: "Duration", type: "input" },
    ],
  },
];

// Options for various selects
const frequencyOptions = [
  { value: "once-daily", label: "Once Daily" },
  { value: "twice-daily", label: "Twice Daily" },
  { value: "three-times-daily", label: "Three Times Daily" },
  { value: "four-times-daily", label: "Four Times Daily" },
  { value: "hourly", label: "Hourly" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

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

const priorityOptions = [
  { value: "routine", label: "Routine" },
  { value: "urgent", label: "Urgent" },
  { value: "asap", label: "ASAP" },
  { value: "stat", label: "STAT" },
];

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

const timingOptions = [
  { key: "morning", label: "Morning" },
  { key: "afternoon", label: "Afternoon" },
  { key: "evening", label: "Evening" },
  { key: "night", label: "Night" },
];
// Color variants for different sections
const colorVariants = {
  emerald: {
    bg: "bg-emerald-100",
    text: "text-emerald-600",
    border: "border-emerald-200",
    hover: "hover:bg-emerald-50",
  },
  blue: {
    bg: "bg-emerald-100",
    text: "text-emerald-600",
    border: "border-emerald-200",
    hover: "hover:bg-emerald-50",
  },
};

// AI Suggestions Component
function AISuggestions({
  title,
  suggestions,
  onAddSuggestion,
  type,
}: {
  title: string;
  suggestions: any[];
  onAddSuggestion: (suggestion: any) => void;
  type: "medicine" | "labtest";
}) {
  console.log("AI Suggestions Rendered: ", suggestions);
  return (
    <Card className="shadow-sm border-1 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-100 rounded-lg">
            <Sparkles className="h-4 w-4 text-purple-500" />
          </div>
          <CardTitle className="text-sm font-semibold text-purple-800">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-2 pb-4 max-h-[25vh] max-w-full">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-100 hover:border-purple-200 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {type === "medicine"
                      ? suggestion.name
                      : suggestion.test_name || suggestion.test_display}
                  </p>
                  {type === "medicine" && (
                    <p className="text-xs text-gray-600">
                      {suggestion.strength} • {suggestion.form} •{" "}
                      {suggestion.frequency}
                    </p>
                  )}
                  {type === "labtest" && (
                    <p className="text-xs text-gray-600">
                      {suggestion.priority} • {suggestion.intent}
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => onAddSuggestion(suggestion)}
                  size="sm"
                  variant="ghost"
                  className="ml-2 h-8 w-8 p-0 hover:bg-purple-100 hover:text-purple-700"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="px-6 border-t border-purple-100 flex-shrink-0">
          <p className="text-xs text-purple-600 text-center">
            AI-powered suggestions based on symptoms
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

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
                <span className="text-muted-foreground text-sm">
                  +{selectedTimings.length - 1} more
                </span>
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

// Editable card component
function EditableCardItem({
  item,
  fields,
  onUpdate,
  onDelete,
  index,
  onAdd,
  showAddButton = false,
  isLabTest = false,
  onToggleEdit,
}: {
  item: any;
  fields: any[];
  onUpdate: (index: number, key: string, value: string | any) => void;
  onDelete: (index: number) => void;
  onAdd: (index: number) => void;
  onToggleEdit?: (index: number) => void;
  index: number;
  showAddButton?: boolean;
  isLabTest?: boolean;
}) {
  const isEditing = item.isEditing !== false; // Default to true for backward compatibility
  const addedFromAI = item.addedFromAI || false;

  // Function to render field value in read-only mode
  const renderReadOnlyValue = (field: any, value: any) => {
    if (!value)
      return <span className="text-gray-400 italic">Not specified</span>;

    switch (field.type) {
      case "select":
        const freqOption = frequencyOptions.find((opt) => opt.value === value);
        return (
          <span className="text-gray-700">{freqOption?.label || value}</span>
        );

      case "medication-form":
        const formOption = medicationFormOptions.find(
          (opt) => opt.value === value
        );
        return (
          <span className="text-gray-700">{formOption?.label || value}</span>
        );

      case "medication-route":
        const routeOption = medicationRouteOptions.find(
          (opt) => opt.value === value
        );
        return (
          <span className="text-gray-700">{routeOption?.label || value}</span>
        );

      case "intent-select":
        const intentOption = intentOptions.find((opt) => opt.value === value);
        return (
          <span className="text-gray-700">{intentOption?.label || value}</span>
        );

      case "priority-select":
        const priorityOption = priorityOptions.find(
          (opt) => opt.value === value
        );
        return (
          <span className="text-gray-700">
            {priorityOption?.label || value}
          </span>
        );

      case "timing-multiselect":
        if (value && typeof value === "object") {
          const selectedTimings = timingOptions.filter(
            (option) => value[option.key]
          );
          if (selectedTimings.length === 0) {
            return (
              <span className="text-gray-400 italic">No timing selected</span>
            );
          }
          return (
            <div className="flex flex-wrap gap-1">
              {selectedTimings.map((timing) => (
                <Badge
                  key={timing.key}
                  variant="outline"
                  className="text-xs bg-green-50 border-green-200 text-green-700"
                >
                  {timing.label}
                </Badge>
              ))}
            </div>
          );
        }
        return <span className="text-gray-400 italic">No timing selected</span>;

      default:
        return <span className="text-gray-700">{value}</span>;
    }
  };
  return (
    <div className="border-blue-400 border-1 hover:shadow-md transition-shadow rounded-lg p-4 bg-blue-50">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* For items in readonly mode, show only the name with hover card */}
        {!isEditing ? (
          <div className="md:col-span-2">
            <HoverCard>
              <HoverCardTrigger asChild>
                <div>
                  <div className="min-h-[40px] flex items-center justify-between rounded-md cursor-pointer">
                    <span className="text-gray-700 font-medium text-md">
                      {isLabTest ? item.test_display : item.name}{" "}
                      {!isLabTest && `(${item.strength})`}
                    </span>
                    <div className="flex">
                      {onToggleEdit && (
                        <Button
                          onClick={() => onToggleEdit(index)}
                          variant="ghost"
                          size="sm"
                          className={`flex gap-1 ${
                            isEditing
                              ? "hover:bg-green-50 hover:border-green-200 hover:text-green-600"
                              : "hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
                          }`}
                        >
                          {isEditing ? <Save size={14} /> : <Edit size={14} />}
                          <span className="hidden sm:inline">
                            {isEditing && "Save"}
                          </span>
                        </Button>
                      )}
                      {showAddButton && isEditing && (
                        <Button
                          onClick={() => onAdd(index)}
                          variant="outline"
                          size="sm"
                          className="flex gap-1 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
                        >
                          <ListPlus size={14} />
                          <span className="hidden sm:inline">More</span>
                        </Button>
                      )}
                      <Button
                        onClick={() => onDelete(index)}
                        variant="ghost"
                        size="sm"
                        className="flex gap-1 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                  <div>
                    {isLabTest ? (
                      <div>
                        <div className="flex flex-wrap">
                          {item.priority && (
                            <span className="text-gray-500 text-xs">
                              Priority:{" "}
                              <Badge variant={"default"}>
                                {item.priority}{" "}
                              </Badge>
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-xs">
                          Duration: {item.duration}{" "}
                        </span>
                        {item.timing?.label && (
                          <span className="text-gray-500 text-xs">
                            Timing: {item.timing?.label}
                          </span>
                        )}
                        {item.frequency && (
                          <span className="text-gray-500 text-xs">
                            Frequency: {item.frequency}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-0 divide-y divide-gray-100">
                  {fields.map((field, idx) => (
                    <div
                      key={field.key}
                      className="flex justify-between gap-4 items-center py-2 first:pt-0 last:pb-0"
                    >
                      <span className="text-xs font-semibold text-gray-500">
                        {field.placeholder}
                      </span>
                      <span className="text-xs text-gray-900 font-medium text-right">
                        {renderReadOnlyValue(field, item[field.key])}
                      </span>
                    </div>
                  ))}
                  {/* Show extra info if present */}
                  {item.dosage_instruction && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                        <Info className="w-3 h-3" /> Instructions
                      </span>
                      <span className="text-xs text-blue-900 font-medium text-right">
                        {item.dosage_instruction}
                      </span>
                    </div>
                  )}
                  {item.timing && Object.values(item.timing).some(Boolean) && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Timing
                      </span>
                      <span className="inline-flex flex-wrap gap-1 ml-1">
                        {timingOptions.map(
                          (option) =>
                            item.timing?.[option.key] && (
                              <Badge
                                key={option.key}
                                variant="outline"
                                className="text-xs bg-green-50 border-green-200 text-green-700 px-2 py-0.5"
                              >
                                {option.label}
                              </Badge>
                            )
                        )}
                      </span>
                    </div>
                  )}
                  {item.note?.info && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs font-semibold text-amber-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Remarks
                      </span>
                      <span className="text-xs text-amber-900 font-medium">
                        {item.note.info}
                      </span>
                    </div>
                  )}
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        ) : (
          // Show all fields for manual entries or when editing
          fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {field.placeholder}
              </label>
              {isEditing ? (
                // Edit mode - show input fields
                field.type === "select" ? (
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
                    className="border-gray-200 focus:border-blue-500"
                  />
                )
              ) : (
                // Read-only mode - show values
                <div className="min-h-[40px] flex items-center px-3 py-2 bg-gray-50 rounded-md border">
                  {renderReadOnlyValue(field, item[field.key])}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export interface DoctorOrdersRef {
  getData: () => {
    labTests: LabTest[];
    medicines: Medication[];
  };
}

function DoctorOrdersRedesigned({
  appointmentDetails,
}: {
  appointmentDetails: AppointmentDtlsForDoctor | null;
}) {
  const dispatch = useDispatch();

  // Get data from Redux store
  const {
    labTests,
    medicines,
    isEditingConsultation,
    singlePatientDetails,
    aiSuggestedMedications,
    aiSuggestedLabTests,
  } = useSelector((state: RootState) => state.doctor);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMedicineIndex, setSelectedMedicineIndex] =
    useState<number>(-1);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    item: LabTest | Medication;
    index: number;
    type: "labtest" | "medicine";
  } | null>(null);

  // Add new row functions
  const addNewLabTest = () => {
    const newLabTest: LabTest = {
      notes: "",
      test_display: "",
      intent: "order",
      priority: "routine",
      isEditing: true, // Manual additions start in edit mode
      addedFromAI: false,
    };

    // Open edit modal with empty lab test
    setEditingItem({
      item: newLabTest,
      index: -1, // -1 indicates new item
      type: "labtest",
    });
    setEditModalOpen(true);
  };

  const addNewMedicine = () => {
    const newMedicine: Medication = {
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
      isEditing: true, // Manual additions start in edit mode
      addedFromAI: false,
      ...(isEditingConsultation && {
        medication_request_id: appointmentDetails?.prescriptions[0]?.id,
      }),
    };

    // Open edit modal with empty medicine
    setEditingItem({
      item: newMedicine,
      index: -1, // -1 indicates new item
      type: "medicine",
    });
    setEditModalOpen(true);
  };

  // Add suggested items functions
  const addSuggestedLabTest = (suggestion: any) => {
    const normalizedSuggestion = normalizeLabTestSuggestion(suggestion);
    const newLabTest: LabTest = {
      notes: normalizedSuggestion.ai_note || "",
      test_display:
        normalizedSuggestion.test_name ||
        normalizedSuggestion.test_display ||
        "",
      intent: normalizedSuggestion.intent || "order",
      priority: normalizedSuggestion.priority || "routine",
      isEditing: false, // AI suggestions start in read-only mode
      addedFromAI: true,
    };
    dispatch(addLabTest(newLabTest));
    toast.success("Lab test added from AI suggestion");
  };

  const addSuggestedMedicine = (suggestion: any) => {
    const normalizedSuggestion = normalizeMedicineSuggestion(suggestion);
    const newMedicine: Medication = {
      name: suggestion.name || "",
      strength: suggestion.strength || "",
      form: normalizedSuggestion.form || "",
      route: normalizedSuggestion.route || "",
      frequency: normalizedSuggestion.frequency || "",
      timing: {
        morning: false,
        afternoon: false,
        evening: false,
        night: false,
      },
      duration: suggestion.duration || "",
      dosage_instruction: suggestion.ai_note || "",
      isEditing: false, // AI suggestions start in read-only mode
      addedFromAI: true,
      ...(isEditingConsultation && {
        medication_request_id: appointmentDetails?.prescriptions[0]?.id,
      }),
    };
    dispatch(addMedicine(newMedicine));
    toast.success("Medicine added from AI suggestion");

    // Check for drug warnings
    if (suggestion.name) {
      checkDrugWarning(suggestion.name);
    }
  };

  // Update functions
  const updateLabTestField = (index: number, key: string, value: string) => {
    dispatch(updateLabTest({ index, key, value }));
  };

  const updateMedicineField = (
    index: number,
    key: string,
    value: string | any
  ) => {
    dispatch(updateMedicine({ index, key, value }));

    // Check for drug warnings when medication name is updated
    if (key === "name" && typeof value === "string" && value.trim()) {
      checkDrugWarning(value);
    }
  };

  // Toggle edit mode functions
  const toggleLabTestEditMode = (index: number) => {
    const currentItem = labTests[index];

    // Always open the edit modal for items in read-only mode
    if (!currentItem.isEditing) {
      setEditingItem({
        item: currentItem,
        index,
        type: "labtest",
      });
      setEditModalOpen(true);
    } else {
      // This case shouldn't happen with the new design, but keeping for safety
      dispatch(
        updateLabTest({
          index,
          key: "isEditing",
          value: !currentItem.isEditing,
        })
      );
    }
  };

  const toggleMedicineEditMode = (index: number) => {
    const currentItem = medicines[index];

    // Always open the edit modal for items in read-only mode
    if (!currentItem.isEditing) {
      setEditingItem({
        item: currentItem,
        index,
        type: "medicine",
      });
      setEditModalOpen(true);
    } else {
      // This case shouldn't happen with the new design, but keeping for safety
      dispatch(
        updateMedicine({
          index,
          key: "isEditing",
          value: !currentItem.isEditing,
        })
      );
    }
  };

  // Delete functions
  const deleteLabTestItem = (index: number) => {
    dispatch(deleteLabTest(index));
  };

  const deleteMedicineItem = (index: number) => {
    dispatch(deleteMedicine(index));
  };

  const onAddMoreFields = (index: number) => {
    setSelectedMedicineIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedMedicineIndex(-1);
  };

  // Edit modal handlers
  const handleEditModalSave = (updatedItem: LabTest | Medication) => {
    if (!editingItem) return;

    const { index, type } = editingItem;

    if (index === -1) {
      // Adding new item - set to read-only mode like AI suggestions
      const itemToAdd = {
        ...updatedItem,
        isEditing: false, // Show in simplified view
        addedFromAI: false, // Mark as manually added
      };

      if (type === "labtest") {
        dispatch(addLabTest(itemToAdd as LabTest));
        toast.success("Lab test added successfully");
      } else {
        dispatch(addMedicine(itemToAdd as Medication));
        toast.success("Medicine added successfully");

        // Check for drug warnings when adding new medicine
        if ((updatedItem as Medication).name) {
          checkDrugWarning((updatedItem as Medication).name);
        }
      }
    } else {
      // Updating existing item
      if (type === "labtest") {
        // Update all fields of the lab test
        Object.keys(updatedItem).forEach((key) => {
          dispatch(
            updateLabTest({ index, key, value: (updatedItem as any)[key] })
          );
        });
        // Set to read-only mode after saving
        dispatch(updateLabTest({ index, key: "isEditing", value: false }));
      } else {
        // Update all fields of the medicine
        Object.keys(updatedItem).forEach((key) => {
          dispatch(
            updateMedicine({ index, key, value: (updatedItem as any)[key] })
          );
        });
        // Set to read-only mode after saving
        dispatch(updateMedicine({ index, key: "isEditing", value: false }));
      }
      toast.success(
        `${type === "labtest" ? "Lab test" : "Medicine"} updated successfully`
      );
    }

    setEditModalOpen(false);
    setEditingItem(null);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingItem(null);
  };

  // Get data function for external access
  const getData = () => ({
    labTests,
    medicines,
  });

  return (
    <>
      <div className="space-y-6">
        {tableConfig.map((section) => {
          const isLabTests = section.title === "Recommended Lab Tests";
          const IconComponent = section.icon;
          const colors =
            colorVariants[section.color as keyof typeof colorVariants];

          // Hide lab tests section when editing consultation
          if (isLabTests && isEditingConsultation) {
            return null;
          }

          const currentData = isLabTests ? labTests : medicines;
          const addFunction = isLabTests ? addNewLabTest : addNewMedicine;
          const updateFunction = isLabTests
            ? updateLabTestField
            : updateMedicineField;
          const deleteFunction = isLabTests
            ? deleteLabTestItem
            : deleteMedicineItem;

          return (
            <div
              key={section.title}
              className="grid grid-cols-1 lg:grid-cols-6 gap-6 lg:items-start"
            >
              {/* Main Cards Grid */}
              <div
                className={
                  aiSuggestedLabTests?.length > 0 ||
                  aiSuggestedMedications?.length > 0
                    ? "lg:col-span-4 h-full"
                    : "lg:col-span-9 h-full"
                }
              >
                <Card className="border-1 bg-white/80 h-full shadow-none">
                  <CardHeader className="pb-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 bg-primary/10 rounded-lg`}>
                          <IconComponent className={`h-5 w-5 text-primary`} />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold text-gray-900">
                            {section.title}
                          </CardTitle>
                          <p className="text-sm text-gray-600">
                            {isLabTests
                              ? "Order laboratory tests and investigations"
                              : "Prescribe medications with dosage instructions"}
                          </p>
                        </div>
                      </div>
                      <Button onClick={addFunction} variant="outline">
                        <Plus size={16} />
                        <span className="hidden sm:inline">
                          Add {isLabTests ? "Test" : "Medicine"}
                        </span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {currentData.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <IconComponent className="h-12 w-12 text-gray-400" />
                          <div>
                            <p className="text-lg font-medium text-gray-600">
                              No {isLabTests ? "lab tests" : "medicines"} added
                              yet
                            </p>
                            <p className="text-sm text-gray-500">
                              Click "Add {isLabTests ? "Test" : "Medicine"}" to
                              get started
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentData.map(
                          (item: LabTest | Medication, index: number) => (
                            <EditableCardItem
                              key={index}
                              item={item}
                              fields={section.fields}
                              onUpdate={updateFunction}
                              onDelete={deleteFunction}
                              onAdd={onAddMoreFields}
                              onToggleEdit={
                                isLabTests
                                  ? toggleLabTestEditMode
                                  : toggleMedicineEditMode
                              }
                              showAddButton={!isLabTests}
                              isLabTest={isLabTests}
                              index={index}
                            />
                          )
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* AI Suggestions Panel */}
              {((isLabTests && aiSuggestedLabTests?.length > 0) ||
                (!isLabTests && aiSuggestedMedications?.length > 0)) && (
                <div className="lg:col-span-2 h-full">
                  <AISuggestions
                    title={
                      isLabTests
                        ? "AI - Suggested Lab Tests"
                        : "AI - Suggested Medicines"
                    }
                    suggestions={
                      isLabTests
                        ? aiSuggestedLabTests || []
                        : aiSuggestedMedications || []
                    }
                    onAddSuggestion={
                      isLabTests ? addSuggestedLabTest : addSuggestedMedicine
                    }
                    type={isLabTests ? "labtest" : "medicine"}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Medication Instructions Modal */}
      {modalOpen && selectedMedicineIndex >= 0 && (
        <MedicationInstructionsModal
          isOpen={modalOpen}
          onClose={closeModal}
          medicine={medicines[selectedMedicineIndex]}
          medicineIndex={selectedMedicineIndex}
        />
      )}

      {/* Edit Item Modal */}
      {editModalOpen && editingItem && (
        <EditItemModal
          isOpen={editModalOpen}
          onClose={closeEditModal}
          item={editingItem.item}
          itemType={editingItem.type}
          onSave={handleEditModalSave}
          isNewItem={editingItem.index === -1}
        />
      )}
    </>
  );
}

export default DoctorOrdersRedesigned;
