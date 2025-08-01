"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Prescription } from "@/types/doctor.types";
import { Pill } from "lucide-react";
import React from "react";

type PrescriptionCardProps = {
  prescriptions: Prescription[];
  handleOpenPrescription: () => void;
};

const PrescriptionCard: React.FC<PrescriptionCardProps> = ({
  prescriptions,
  handleOpenPrescription,
}) => {
  if (!prescriptions || prescriptions.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Pill className="h-5 w-5 text-primary" />
          <span>Medications</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-60 overflow-y-auto">
        {prescriptions.map((prescription) => (
          <div key={prescription.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  {prescription.medication_display_id}
                </Badge>
                <Badge
                  className={`capitalize ${
                    prescription.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {prescription.status}
                </Badge>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenPrescription}
              >
                View E-Prescription
              </Button>
            </div>

            <div className="grid gap-4">
              {prescription.medications.map((medication) => (
                <div key={medication.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {medication.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {medication.strength} • {medication.form} •{" "}
                        {medication.route}
                      </p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      {medication.frequency}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        Duration
                      </p>
                      <p className="text-sm">{medication.duration}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        Timing
                      </p>
                      <div className="flex space-x-1">
                        {medication.timing.morning && (
                          <Badge variant="outline" className="text-xs">
                            M
                          </Badge>
                        )}
                        {medication.timing.afternoon && (
                          <Badge variant="outline" className="text-xs">
                            A
                          </Badge>
                        )}
                        {medication.timing.evening && (
                          <Badge variant="outline" className="text-xs">
                            E
                          </Badge>
                        )}
                        {medication.timing.night && (
                          <Badge variant="outline" className="text-xs">
                            N
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs font-medium text-gray-500">
                        Instructions
                      </p>
                      <p className="text-sm">{medication.dosage_instruction}</p>
                    </div>
                  </div>

                  {medication.note?.info && (
                    <div className="p-2 bg-yellow-50 rounded text-sm text-yellow-800">
                      <strong>Note:</strong> {medication.note.info}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PrescriptionCard;
