"use client";

import { useState, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Clock, Droplets, ListPlus } from "lucide-react";

// Types
interface MedicationTiming {
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
  night: boolean;
}

interface Medication {
  id?: string;
  medication_request_id?: string;
  name: string;
  form: string;
  route: string;
  frequency: string;
  strength: string;
  duration: string;
  timing: MedicationTiming;
  dosage_instruction: string;
  note?: {
    info: string;
  };
}

// Configuration options
const frequencyOptions = [
  { value: "once-daily", label: "Once Daily" },
  { value: "twice-daily", label: "Twice Daily" },
  { value: "three-times-daily", label: "Three Times Daily" },
  { value: "four-times-daily", label: "Four Times Daily" },
  { value: "hourly", label: "Hourly" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
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

// MedicationInstructionsModal Component
interface MedicationInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  medication: Medication;
  medicationIndex: number;
  onUpdateMedication: (
    index: number,
    field: keyof Medication,
    value: any
  ) => void;
}

function MedicationInstructionsModal({
  isOpen,
  onClose,
  medication,
  medicationIndex,
  onUpdateMedication,
}: MedicationInstructionsModalProps) {
  const [dosageInstructions, setDosageInstructions] = useState(
    medication.dosage_instruction || ""
  );
  const [notes, setNotes] = useState(medication.note?.info || "");

  // Update local state when medication changes
  useEffect(() => {
    setDosageInstructions(medication.dosage_instruction || "");
    setNotes(medication.note?.info || "");
  }, [medication]);

  const handleSave = () => {
    // Update dosage instructions
    if (dosageInstructions !== (medication.dosage_instruction || "")) {
      onUpdateMedication(
        medicationIndex,
        "dosage_instruction",
        dosageInstructions
      );
    }

    // Update notes
    if (notes !== (medication.note?.info || "")) {
      onUpdateMedication(medicationIndex, "note", { info: notes });
    }

    onClose();
  };

  const handleClose = () => {
    // Reset to original values when closing without saving
    setDosageInstructions(medication.dosage_instruction || "");
    setNotes(medication.note?.info || "");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {medication.name
              ? `Additional Instructions for ${medication.name}`
              : "Add Instructions for New Medication"}
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
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Instructions</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Timing Multi-Select Component
function TimingMultiSelect({
  value,
  onChange,
}: {
  value: MedicationTiming;
  onChange: (timing: MedicationTiming) => void;
}) {
  const getSelectedTimings = () => {
    return timingOptions.filter(
      (option) => value[option.key as keyof MedicationTiming] === true
    );
  };

  const toggleTiming = (timingKey: keyof MedicationTiming) => {
    const newTiming = {
      ...value,
      [timingKey]: !value[timingKey],
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
            checked={value[option.key as keyof MedicationTiming] || false}
            onCheckedChange={() =>
              toggleTiming(option.key as keyof MedicationTiming)
            }
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface EditableMedicationsTableProps {
  medications: Medication[];
  onUpdate: (medications: Medication[]) => void;
  isEditable?: boolean;
}

export default function EditableMedicationsTable({
  medications,
  onUpdate,
  isEditable = true,
}: EditableMedicationsTableProps) {
  const [localMedications, setLocalMedications] =
    useState<Medication[]>(medications);

  // Modal state for medication instructions
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMedicationIndex, setSelectedMedicationIndex] =
    useState<number>(-1);

  // Initialize local state when medications prop changes
  useEffect(() => {
    setLocalMedications(medications);
  }, [medications]);

  const createEmptyMedication = (): Medication => ({
    name: "",
    form: "",
    route: "",
    frequency: "",
    strength: "",
    duration: "",
    timing: {
      morning: false,
      afternoon: false,
      evening: false,
      night: false,
    },
    dosage_instruction: "",
    note: {
      info: "",
    },
  });

  const addNewMedication = () => {
    const newMedication = createEmptyMedication();
    const updatedMedications = [...localMedications, newMedication];
    setLocalMedications(updatedMedications);
    onUpdate(updatedMedications);
  };

  const deleteMedication = (index: number) => {
    const updatedMedications = localMedications.filter((_, i) => i !== index);
    setLocalMedications(updatedMedications);
    onUpdate(updatedMedications);
  };

  const updateMedicationField = (
    index: number,
    field: keyof Medication,
    value: any
  ) => {
    const updatedMedications = [...localMedications];
    if (field === "note") {
      updatedMedications[index] = {
        ...updatedMedications[index],
        note: { info: value },
      };
    } else {
      updatedMedications[index] = {
        ...updatedMedications[index],
        [field]: value,
      };
    }
    setLocalMedications(updatedMedications);
    onUpdate(updatedMedications);
  };

  // Modal functions
  const openInstructionsModal = (index: number) => {
    setSelectedMedicationIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedMedicationIndex(-1);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5" />
            Prescribed Medications
          </CardTitle>
          {isEditable && (
            <Button
              onClick={addNewMedication}
              variant="outline"
              className="flex gap-2"
            >
              <Plus size={16} />
              Add Medication
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {localMedications.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No medications prescribed
              {isEditable && (
                <>
                  <br />
                  <span className="text-sm">
                    Click "Add Medication" to get started.
                  </span>
                </>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Form</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Strength</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Timing</TableHead>
                  {isEditable && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {localMedications.map((medication, index) => (
                  <>
                    <TableRow key={index}>
                      <TableCell className="text-center">{index + 1}</TableCell>
                      <TableCell>
                        <Input
                          value={medication.name}
                          onChange={(e) =>
                            updateMedicationField(index, "name", e.target.value)
                          }
                          placeholder="Medication name"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={medication.form}
                          onValueChange={(value) =>
                            updateMedicationField(index, "form", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Form" />
                          </SelectTrigger>
                          <SelectContent>
                            {medicationFormOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={medication.route}
                          onValueChange={(value) =>
                            updateMedicationField(index, "route", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Route" />
                          </SelectTrigger>
                          <SelectContent>
                            {medicationRouteOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={medication.frequency}
                          onValueChange={(value) =>
                            updateMedicationField(index, "frequency", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            {frequencyOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={medication.strength}
                          onChange={(e) =>
                            updateMedicationField(
                              index,
                              "strength",
                              e.target.value
                            )
                          }
                          placeholder="Strength"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={medication.duration}
                          onChange={(e) =>
                            updateMedicationField(
                              index,
                              "duration",
                              e.target.value
                            )
                          }
                          placeholder="Duration"
                        />
                      </TableCell>
                      <TableCell>
                        <TimingMultiSelect
                          value={medication.timing}
                          onChange={(timing) =>
                            updateMedicationField(index, "timing", timing)
                          }
                        />
                      </TableCell>
                      {isEditable && (
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              onClick={() => deleteMedication(index)}
                              variant="outline"
                              size="sm"
                            >
                              <Trash2 size={16} />
                            </Button>
                            <Button
                              onClick={() => openInstructionsModal(index)}
                              variant="outline"
                              size="sm"
                              title="Add Instructions"
                            >
                              <ListPlus size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>

                    {/* Additional information row */}
                    {(medication.dosage_instruction ||
                      medication.note?.info) && (
                      <TableRow className="bg-muted/30">
                        <TableCell></TableCell>
                        <TableCell
                          colSpan={isEditable ? 8 : 7}
                          className="py-2"
                        >
                          <div className="text-sm space-y-1">
                            {medication.dosage_instruction && (
                              <div>
                                <span className="font-medium text-muted-foreground">
                                  Instructions:{" "}
                                </span>
                                <span className="text-foreground">
                                  {medication.dosage_instruction}
                                </span>
                              </div>
                            )}
                            {medication.note?.info && (
                              <div>
                                <span className="font-medium text-muted-foreground">
                                  Notes:{" "}
                                </span>
                                <span className="text-foreground">
                                  {medication.note.info}
                                </span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Medication Instructions Modal */}
      {modalOpen && selectedMedicationIndex >= 0 && (
        <MedicationInstructionsModal
          isOpen={modalOpen}
          onClose={closeModal}
          medication={localMedications[selectedMedicationIndex]}
          medicationIndex={selectedMedicationIndex}
          onUpdateMedication={updateMedicationField}
        />
      )}
    </>
  );
}
