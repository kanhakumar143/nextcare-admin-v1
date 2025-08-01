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
import { Checkbox } from "@/components/ui/checkbox";
import { ListPlus, Plus, Trash2, Clock } from "lucide-react";
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
                    Instructions:{" "}
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

export interface DoctorOrdersRef {
  getData: () => {
    labTests: LabTest[];
    medicines: Medication[];
  };
}

function DoctorOrders() {
  const dispatch = useDispatch();

  // Get data from Redux store
  const { labTests, medicines } = useSelector(
    (state: RootState) => state.doctor
  );

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
                          No {isLabTests ? "lab tests" : "medicines"} added yet.
                          Click "Add" to get started.
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

export default DoctorOrders;
