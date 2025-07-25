"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  FlaskConical,
  Stethoscope,
  Pill,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";

const patientHistory = [
  {
    id: "1",
    name: "Aarav Mehta",
    age: 34,
    gender: "Male",
    date: "2025-07-20",
    status: "completed",
    summary:
      "Patient reported mild chest pain. ECG normal. Advised lifestyle changes.",
    medicines: ["Aspirin 75mg - Once Daily", "Atorvastatin 10mg - At Night"],
    labTests: ["Lipid Profile", "ECG"],
  },
  {
    id: "2",
    name: "Sneha Kapoor",
    age: 27,
    gender: "Female",
    date: "2025-07-19",
    status: "follow-up",
    summary: "Complaints of fatigue and weight loss. Suspected hypothyroidism.",
    medicines: ["Thyroxine 50mcg - Morning empty stomach"],
    labTests: ["TSH", "CBC"],
  },
  {
    id: "3",
    name: "Rohit Verma",
    age: 45,
    gender: "Male",
    date: "2025-07-18",
    status: "completed",
    summary:
      "Routine check-up. No major complaints. Advised vitamin D supplement.",
    medicines: ["Vitamin D3 - Once weekly"],
    labTests: ["Vitamin D3 Level", "Blood Sugar Fasting"],
  },
  {
    id: "4",
    name: "Priya Singh",
    age: 31,
    gender: "Female",
    date: "2025-07-17",
    status: "cancelled",
    summary: "Patient didn’t show up for the scheduled consultation.",
    medicines: [],
    labTests: [],
  },
];

const statusColors: Record<string, string> = {
  "follow-up": "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusOptions = ["all", "follow-up", "completed", "cancelled"];

export default function DoctorConsultationHistory() {
  const [filter, setFilter] = useState("all");
  const router = useRouter();
  const filteredHistory =
    filter === "all"
      ? patientHistory
      : patientHistory.filter((p) => p.status === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-4">
      <div>
        <Button
          variant={"ghost"}
          onClick={() => router.push("/dashboard/doctor")}
        >
          <ArrowLeft />
          back
        </Button>
      </div>
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-foreground">
          Consultation History
        </h1>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              onClick={() => setFilter(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-6">
        {filteredHistory.map((patient) => (
          <Card
            key={patient.id}
            className="transition hover:shadow-md border border-muted bg-gray-100 rounded-xl"
          >
            <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold uppercase">
                  {patient.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <CardTitle className="text-lg">{patient.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {patient.gender}, {patient.age} yrs •{" "}
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="w-4 h-4" />
                      {patient.date}
                    </span>
                  </p>
                </div>
              </div>
              <Badge
                className={cn(
                  "capitalize px-3 py-1 rounded-full text-sm",
                  statusColors[patient.status]
                )}
              >
                {patient.status}
              </Badge>
            </CardHeader>

            <Separator />

            <CardContent className="grid md:grid-cols-3 gap-6 pt-4 text-sm">
              {/* Summary */}
              <div>
                <div className="flex items-center gap-2 mb-1 font-medium text-base">
                  <Stethoscope className="w-4 h-4 text-primary" />
                  Summary
                </div>
                <p className="text-muted-foreground">{patient.summary}</p>
              </div>

              {/* Medicines */}
              <div>
                <div className="flex items-center gap-2 mb-1 font-medium text-base">
                  <Pill className="w-4 h-4 text-primary" />
                  Medicines
                </div>
                {patient.medicines.length > 0 ? (
                  <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                    {patient.medicines.map((med, idx) => (
                      <li key={idx}>{med}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground italic">
                    None prescribed
                  </p>
                )}
              </div>

              {/* Lab Tests */}
              <div>
                <div className="flex items-center gap-2 mb-1 font-medium text-base">
                  <FlaskConical className="w-4 h-4 text-primary" />
                  Lab Tests
                </div>
                {patient.labTests.length > 0 ? (
                  <div className="flex gap-2 flex-wrap">
                    {patient.labTests.map((test, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-xs bg-muted text-muted-foreground"
                      >
                        {test}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">
                    No tests advised
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
