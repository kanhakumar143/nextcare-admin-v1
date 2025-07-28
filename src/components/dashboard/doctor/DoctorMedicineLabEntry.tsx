"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Save } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { addLabTest, addMedicine } from "@/store/slices/doctorSlice";
import { RootState } from "@/store";
import { LabTest, Medicine } from "@/types/doctor.types";

// Configuration for dynamic sections
const tableConfig = [
  {
    title: "Recommended Lab Tests",
    fields: [
      { key: "testName", placeholder: "Test Name", type: "input" },
      {
        key: "testDescription",
        placeholder: "Test Description",
        type: "input",
      },
      { key: "comments", placeholder: "Comments", type: "input" },
    ],
  },
  {
    title: "Medicines To Be Prescribed",
    fields: [
      { key: "medicineName", placeholder: "Medicine Name", type: "input" },
      {
        key: "composition",
        placeholder: "Medicine Composition",
        type: "input",
      },
      { key: "dosage", placeholder: "Dosage", type: "select" },
      { key: "days", placeholder: "Days", type: "input" },
      { key: "instructions", placeholder: "How to Consume", type: "input" },
    ],
  },
];

// Dosage options
const dosageOptions = [
  { value: "once-daily", label: "Once Daily" },
  { value: "twice-daily", label: "Twice Daily" },
  { value: "three-times-daily", label: "Three Times Daily" },
  { value: "four-times-daily", label: "Four Times Daily" },
  { value: "hourly", label: "Hourly" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

// Editable row component
function EditableTableRow({ fields, onChange, onSave, onSelectChange }: any) {
  return (
    <TableRow>
      <TableCell className="text-center text-muted">—</TableCell>
      {fields.map((field: any, idx: number) => (
        <TableCell key={field.key}>
          {field.type === "select" ? (
            <Select
              value={field.value}
              onValueChange={(value) => onSelectChange(idx, value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {dosageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              value={field.value}
              onChange={(e) => onChange(idx, e.target.value)}
              placeholder={field.placeholder}
            />
          )}
        </TableCell>
      ))}
      <TableCell>
        <Button onClick={onSave} variant="secondary" className="flex gap-1">
          <Save size={16} /> Save
        </Button>
      </TableCell>
    </TableRow>
  );
}

// Static display row
function StaticTableRow({ values, index }: any) {
  return (
    <TableRow className="hover:bg-muted">
      <TableCell className="text-center">{index + 1}</TableCell>
      {values.map((val: string, idx: number) => (
        <TableCell key={idx}>{val}</TableCell>
      ))}
    </TableRow>
  );
}

// New component for displaying lab test rows
function LabTestRow({ labTest, index }: { labTest: LabTest; index: number }) {
  return (
    <TableRow className="hover:bg-muted">
      <TableCell className="text-center">{index + 1}</TableCell>
      <TableCell>{labTest.testName}</TableCell>
      <TableCell>{labTest.testDescription}</TableCell>
      <TableCell>{labTest.comments}</TableCell>
    </TableRow>
  );
}

// New component for displaying medicine rows
function MedicineRow({
  medicine,
  index,
}: {
  medicine: Medicine;
  index: number;
}) {
  const getDosageLabel = (value: string) => {
    const option = dosageOptions.find((opt) => opt.value === value);
    return option ? option.label : value;
  };

  return (
    <TableRow className="hover:bg-muted">
      <TableCell className="text-center">{index + 1}</TableCell>
      <TableCell>{medicine.medicineName}</TableCell>
      <TableCell>{medicine.composition}</TableCell>
      <TableCell>{getDosageLabel(medicine.dosage)}</TableCell>
      <TableCell>{medicine.days}</TableCell>
      <TableCell>{medicine.instructions}</TableCell>
    </TableRow>
  );
}

export interface DoctorOrdersRef {
  getData: () => {
    labTests: LabTest[];
    medicines: Medicine[];
  };
}

function DoctorOrders() {
  const dispatch = useDispatch();
  const { labTests, medicines } = useSelector(
    (state: RootState) => state.doctor
  );

  const [inputs, setInputs] = useState<
    Record<
      string,
      { key: string; value: string; placeholder: string; type: string }[]
    >
  >(() =>
    tableConfig.reduce((acc, section) => {
      acc[section.title] = section.fields.map((f) => ({ ...f, value: "" }));
      return acc;
    }, {} as any)
  );

  const handleInputChange =
    (sectionTitle: string) => (idx: number, val: string) => {
      setInputs((prev) => {
        const copy = [...prev[sectionTitle]];
        copy[idx].value = val;
        return { ...prev, [sectionTitle]: copy };
      });
    };

  const handleSelectChange =
    (sectionTitle: string) => (idx: number, val: string) => {
      setInputs((prev) => {
        const copy = [...prev[sectionTitle]];
        copy[idx].value = val;
        return { ...prev, [sectionTitle]: copy };
      });
    };

  const handleSaveRow = (sectionTitle: string) => {
    const currentFields = inputs[sectionTitle];

    if (sectionTitle === "Recommended Lab Tests") {
      // Check if required fields are filled
      if (!currentFields[0].value.trim()) {
        alert("Please enter a test name");
        return;
      }

      const labTest: LabTest = {
        testName: currentFields[0].value || "",
        testDescription: currentFields[1].value || "",
        comments: currentFields[2].value || "",
      };
      dispatch(addLabTest(labTest));
    } else if (sectionTitle === "Medicines To Be Prescribed") {
      // Check if required fields are filled
      if (!currentFields[0].value.trim()) {
        alert("Please enter a medicine name");
        return;
      }
      if (!currentFields[2].value) {
        alert("Please select a dosage");
        return;
      }

      const medicine: Medicine = {
        medicineName: currentFields[0].value || "",
        composition: currentFields[1].value || "",
        dosage: currentFields[2].value || "",
        days: currentFields[3].value || "",
        instructions: currentFields[4].value || "",
      };
      dispatch(addMedicine(medicine));
    }

    // Clear input fields after saving
    setInputs((prev) => ({
      ...prev,
      [sectionTitle]: prev[sectionTitle].map((f) => ({ ...f, value: "" })),
    }));
  };

  return (
    <div className="grid gap-6">
      {tableConfig.map((section) => (
        <Card key={section.title} className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold">{section.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">#</TableHead>
                  {section.fields.map((f) => (
                    <TableHead key={f.key}>{f.placeholder}</TableHead>
                  ))}
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {section.title === "Recommended Lab Tests"
                  ? labTests.map((labTest, idx) => (
                      <LabTestRow key={idx} labTest={labTest} index={idx} />
                    ))
                  : medicines.map((medicine, idx) => (
                      <MedicineRow key={idx} medicine={medicine} index={idx} />
                    ))}
                <EditableTableRow
                  fields={inputs[section.title]}
                  onChange={handleInputChange(section.title)}
                  onSelectChange={handleSelectChange(section.title)}
                  onSave={() => handleSaveRow(section.title)}
                />
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default DoctorOrders;
