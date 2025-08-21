"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface DentalProcedureEntryProps {
  onAddProcedure?: (procedure: string) => void;
}

export default function DentalProcedureEntry({
  onAddProcedure,
}: DentalProcedureEntryProps) {
  const procedures = [
    "Cavity Filling",
    "Tooth Extraction",
    "Root Canal",
    "Crown Placement",
    "Braces Consultation",
    "Cleaning & Polishing",
    "Whitening",
    "Gum Treatment",
  ];

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
              <img
                src="/teeth-numbering.jpg" // Place in public/images
                alt="Teeth Chart"
                className="max-h-[350px] w-full object-contain border rounded-xl shadow-sm"
              />
            </div>

            {/* Procedures Selection */}
            <div className="w-full lg:w-1/2 space-y-3">
              <Label className="text-sm font-medium">Select Procedures</Label>
              <ScrollArea className="h-[300px] rounded-md border p-3">
                <div className="space-y-2">
                  {procedures.map((procedure, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 border rounded-md hover:bg-accent cursor-pointer transition"
                    >
                      <span className="text-sm">{procedure}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          onAddProcedure && onAddProcedure(procedure)
                        }
                      >
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
