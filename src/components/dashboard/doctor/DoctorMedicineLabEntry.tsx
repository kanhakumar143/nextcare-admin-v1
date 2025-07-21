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
import { Save } from "lucide-react";

// Configuration for dynamic sections
const tableConfig = [
  {
    title: "Recommended Lab Tests",
    fields: [
      { key: "testName", placeholder: "Test Name" },
      { key: "testDescription", placeholder: "Test Description" },
      { key: "comments", placeholder: "Comments" },
    ],
  },
  {
    title: "Medicines To Be Prescribed",
    fields: [
      { key: "medicineName", placeholder: "Medicine Name" },
      { key: "composition", placeholder: "Medicine Composition" },
      { key: "dosage", placeholder: "Dosage" },
      { key: "days", placeholder: "Days" },
      { key: "instructions", placeholder: "How to Consume" },
    ],
  },
];

// Editable row component
function EditableTableRow({ fields, onChange, onSave }: any) {
  return (
    <TableRow>
      <TableCell className="text-center text-muted">—</TableCell>
      {fields.map((field: any, idx: number) => (
        <TableCell key={field.key}>
          <Input
            value={field.value}
            onChange={(e) => onChange(idx, e.target.value)}
            placeholder={field.placeholder}
          />
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

export default function DoctorOrders() {
  const [data, setData] = useState<Record<string, string[][]>>({});
  const [inputs, setInputs] = useState<
    Record<string, { key: string; value: string; placeholder: string }[]>
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

  const handleSaveRow = (sectionTitle: string) => {
    const currentFields = inputs[sectionTitle];
    const values = currentFields.map((f) => f.value);
    setData((prev) => ({
      ...prev,
      [sectionTitle]: [...(prev[sectionTitle] || []), values],
    }));
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
                {(data[section.title] || []).map((row, idx) => (
                  <StaticTableRow key={idx} values={row} index={idx} />
                ))}
                <EditableTableRow
                  fields={inputs[section.title]}
                  onChange={handleInputChange(section.title)}
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
