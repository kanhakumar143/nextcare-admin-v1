"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";

interface DentalProcedureEntryProps {
  onAddProcedure?: (procedure: string) => void;
}

interface ProcedureData {
  name: string;
  isExpanded: boolean;
  selectedTeeth: number[];
}

export default function DentalProcedureEntry({
  onAddProcedure,
}: DentalProcedureEntryProps) {
  const [proceduresData, setProceduresData] = useState<ProcedureData[]>([
    { name: "Cavity Filling", isExpanded: false, selectedTeeth: [] },
    { name: "Tooth Extraction", isExpanded: false, selectedTeeth: [] },
    { name: "Root Canal", isExpanded: false, selectedTeeth: [] },
    { name: "Crown Placement", isExpanded: false, selectedTeeth: [] },
    { name: "Braces Consultation", isExpanded: false, selectedTeeth: [] },
    { name: "Cleaning & Polishing", isExpanded: false, selectedTeeth: [] },
    { name: "Whitening", isExpanded: false, selectedTeeth: [] },
    { name: "Gum Treatment", isExpanded: false, selectedTeeth: [] },
  ]);

  const handleAddProcedure = (index: number) => {
    setProceduresData((prev) =>
      prev.map((proc, i) =>
        i === index ? { ...proc, isExpanded: !proc.isExpanded } : proc
      )
    );
  };

  const handleToothSelect = (procedureIndex: number, toothNumber: number) => {
    setProceduresData((prev) =>
      prev.map((proc, i) =>
        i === procedureIndex
          ? {
              ...proc,
              selectedTeeth: proc.selectedTeeth.includes(toothNumber)
                ? proc.selectedTeeth.filter((t) => t !== toothNumber)
                : [...proc.selectedTeeth, toothNumber],
            }
          : proc
      )
    );
  };

  const renderTeethSelection = (
    procedureIndex: number,
    selectedTeeth: number[]
  ) => {
    const teeth = Array.from({ length: 32 }, (_, i) => i + 1);

    return (
      <div className="mt-3 p-3 bg-gray-50 rounded-md">
        <Label className="text-xs font-medium mb-2 block">
          Select Teeth (1-32)
        </Label>
        <div className="grid grid-cols-8 gap-2">
          {teeth.map((toothNumber) => (
            <Button
              key={toothNumber}
              size="sm"
              variant={
                selectedTeeth.includes(toothNumber) ? "default" : "outline"
              }
              className="w-8 h-8 p-0 text-xs"
              onClick={() => handleToothSelect(procedureIndex, toothNumber)}
            >
              {toothNumber}
            </Button>
          ))}
        </div>
        {selectedTeeth.length > 0 && (
          <div className="mt-2 text-xs text-gray-600">
            Selected: {selectedTeeth.sort((a, b) => a - b).join(", ")}
          </div>
        )}
      </div>
    );
  };

  // Helper function to get selected procedures data
  const getSelectedProcedures = () => {
    return proceduresData
      .filter((proc) => proc.selectedTeeth.length > 0)
      .map((proc) => ({
        procedure: proc.name,
        teeth: proc.selectedTeeth.sort((a, b) => a - b),
      }));
  };

  return (
    <div className="px-4 mr-2 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">
            Dental Examination
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Teeth Image */}
            <div className="flex justify-center items-center w-full lg:w-1/2">
              <Image
                src="/teeth-diagram.jpeg"
                alt="Teeth Diagram"
                width={500}
                height={500}
                className="object-contain"
              />
            </div>

            {/* Procedures Selection */}
            <div className="w-full lg:w-1/2 space-y-3">
              <Label className="text-sm font-medium">Select Procedures</Label>
              <ScrollArea className="h-[400px] rounded-md border p-3">
                <div className="space-y-2">
                  {proceduresData.map((procedureData, i) => (
                    <div key={i} className="border rounded-md">
                      <div className="flex items-center justify-between p-2 hover:bg-accent cursor-pointer transition">
                        <span className="text-sm">{procedureData.name}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddProcedure(i)}
                        >
                          {procedureData.isExpanded ? "Close" : "Add"}
                        </Button>
                      </div>
                      {procedureData.isExpanded &&
                        renderTeethSelection(i, procedureData.selectedTeeth)}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Summary of Selected Procedures */}
          {getSelectedProcedures().length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md border">
              <Label className="text-sm font-medium mb-2 block">
                Selected Procedures
              </Label>
              <div className="space-y-1">
                {getSelectedProcedures().map((item, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">{item.procedure}:</span>
                    <span className="ml-2 text-gray-600">
                      Teeth {item.teeth.join(", ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
