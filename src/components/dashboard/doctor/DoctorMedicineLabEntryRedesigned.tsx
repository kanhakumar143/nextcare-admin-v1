"use client";

import { useState } from "react";
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
  ListPlus,
  Plus,
  Trash2,
  Clock,
  Pill,
  FlaskConical,
  AlertTriangle,
  Info,
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
import MedicationInstructionsModal from "./modals/MedicationInstructionsModal";
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
      <TableRow className="hover:bg-gray-50/50">
        <TableCell className="text-center font-medium text-gray-600">
          {index + 1}
        </TableCell>
        {fields.map((field) => (
          <TableCell key={field.key} className="min-w-[150px]">
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
                className="border-gray-200 focus:border-blue-500"
              />
            )}
          </TableCell>
        ))}
        <TableCell>
          <div className="flex gap-2">
            <Button
              onClick={() => onDelete(index)}
              variant="outline"
              size="sm"
              className="flex gap-1 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
            >
              <Trash2 size={16} />
            </Button>
            {showAddButton && (
              <Button
                onClick={() => onAdd(index)}
                variant="outline"
                size="sm"
                className="flex gap-1 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
              >
                <ListPlus size={16} />
                <span className="hidden sm:inline">More</span>
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>

      {/* Additional information row for medicines */}
      {(item.dosage_instruction ||
        item.note?.info ||
        (item.timing && Object.values(item.timing).some(Boolean))) && (
        <TableRow className="bg-blue-50/30 border-t-0">
          <TableCell></TableCell>
          <TableCell colSpan={fields.length + 1} className="py-3">
            <div className="space-y-2">
              {item.dosage_instruction && (
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-blue-800 text-sm">
                      Instructions:
                    </span>
                    <span className="text-gray-700 ml-1">
                      {item.dosage_instruction}
                    </span>
                  </div>
                </div>
              )}
              {item.timing && Object.values(item.timing).some(Boolean) && (
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-green-800 text-sm">
                      Timing:
                    </span>
                    <div className="inline-flex flex-wrap gap-1 ml-1">
                      {timingOptions.map(
                        (option) =>
                          item.timing?.[option.key] && (
                            <Badge
                              key={option.key}
                              variant="outline"
                              className="text-xs bg-green-50 border-green-200 text-green-700"
                            >
                              {option.label}
                            </Badge>
                          )
                      )}
                    </div>
                  </div>
                </div>
              )}
              {item.note?.info && (
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-amber-800 text-sm">
                      Remarks:
                    </span>
                    <span className="text-gray-700 ml-1">{item.note.info}</span>
                  </div>
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
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
  const { labTests, medicines, isEditingConsultation, singlePatientDetails } =
    useSelector((state: RootState) => state.doctor);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMedicineIndex, setSelectedMedicineIndex] =
    useState<number>(-1);

  // Add new row functions
  const addNewLabTest = () => {
    const newLabTest: LabTest = {
      notes: "",
      test_display: "",
      intent: "order",
      priority: "routine",
    };
    dispatch(addLabTest(newLabTest));
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
      ...(isEditingConsultation && {
        medication_request_id: appointmentDetails?.prescriptions[0]?.id,
      }),
    };
    dispatch(addMedicine(newMedicine));
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
            <Card
              key={section.title}
              className="shadow-sm border-0 bg-white/80 backdrop-blur-sm"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 ${colors.bg} rounded-lg`}>
                      <IconComponent className={`h-5 w-5 ${colors.text}`} />
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
              <CardContent>
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50">
                        <TableHead className="text-center w-12">#</TableHead>
                        {section.fields.map((f) => (
                          <TableHead key={f.key} className="font-semibold">
                            {f.placeholder}
                          </TableHead>
                        ))}
                        <TableHead className="w-32">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentData.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={section.fields.length + 2}
                            className="text-center py-12"
                          >
                            <div className="flex flex-col items-center justify-center space-y-3">
                              <IconComponent className="h-12 w-12 text-gray-400" />
                              <div>
                                <p className="text-lg font-medium text-gray-600">
                                  No {isLabTests ? "lab tests" : "medicines"}{" "}
                                  added yet
                                </p>
                                <p className="text-sm text-gray-500">
                                  Click "Add {isLabTests ? "Test" : "Medicine"}"
                                  to get started
                                </p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentData.map(
                          (item: LabTest | Medication, index: number) => (
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
                          )
                        )
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
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
    </>
  );
}

export default DoctorOrdersRedesigned;
