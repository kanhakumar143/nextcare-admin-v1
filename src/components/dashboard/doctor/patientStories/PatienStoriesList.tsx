"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/common/DataTable";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

// Static patient stories data
interface PatientStory {
  id: string;
  patientName: string;
  age: number;
  gender: string;
  diagnosis: string;
  consultationDate: string;
  status: string;
  service_category: {
    text: string;
  }[];
  storyType: string;
  summary: string;
}

const staticPatientStories: PatientStory[] = [
  {
    id: "story-001",
    patientName: "Ms. Ananya Rao",
    age: 28,
    gender: "Female",
    diagnosis: "Suspected Pulmonary Tuberculosis",
    consultationDate: "2024-08-10",
    status: "Checked In",
    service_category: [{ text: "General Checkup" }],
    storyType: "Successful Treatment",
    summary:
      "Patient presented with persistent headaches and fatigue lasting 3 days. Successfully treated with pain management and lifestyle modifications.",
  },
  {
    id: "story-002",
    patientName: "Mrs. Aarti Sharma",
    age: 45,
    gender: "Female",
    diagnosis: "Tension Headache with Associated Fatigue",
    consultationDate: "2024-08-08",
    status: "Checked In",
    service_category: [{ text: "General Checkup" }],
    storyType: "Complex Case",
    summary:
      "Patient with persistent cough, night sweats, and weight loss. Comprehensive evaluation led to early TB detection and treatment initiation.",
  },
];

const PatientStoriesList = () => {
  const router = useRouter();
  const [selectedStory, setSelectedStory] = useState<PatientStory | null>(null);

  const handleViewStory = (story: PatientStory) => {
    setSelectedStory(story);
    // Navigate to PatientConsultationStatic with the story data
    router.push(
      `/dashboard/doctor/patient-stories/consultation?storyId=${story.id}`
    );
  };

  const columns: ColumnDef<PatientStory>[] = [
    {
      header: "Serial No.",
      cell: ({ row }) => {
        return <div className="px-5">{row.index + 1}</div>;
      },
    },
    {
      header: "Patient Name",
      accessorKey: "patientName",
      cell: ({ getValue }) => (
        <div className="font-medium">{getValue() as string}</div>
      ),
    },
    {
      header: "Diagnosis",
      accessorKey: "diagnosis",
      cell: ({ getValue }) => (
        <div className="max-w-xs truncate" title={getValue() as string}>
          {getValue() as string}
        </div>
      ),
    },
    {
      header: "Service",
      accessorFn: (row) => row.service_category[0]?.text || "",
      cell: ({ getValue }) => <div>{getValue() as string}</div>,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ getValue }) => (
        <Badge
          variant={getValue() === "completed" ? "default" : "outline"}
          className="bg-green-100 text-green-800 border-green-300"
        >
          {getValue() as string}
        </Badge>
      ),
    },
    {
      header: "Date",
      accessorKey: "consultationDate",
      cell: ({ getValue }) => {
        const date = new Date(getValue() as string);
        return <div>{date.toLocaleDateString()}</div>;
      },
    },
    {
      header: "Action",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewStory(row.original)}
          className="text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-border pb-4 flex gap-3 items-center">
          <Button
            size={"icon"}
            variant={"ghost"}
            onClick={() => router.push("/dashboard/doctor")}
          >
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Patient Stories
            </h1>
            <p className="text-muted-foreground">
              Review successful patient consultations and treatment outcomes
            </p>
          </div>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">
              Clinical Case Studies
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Explore detailed patient cases with complete consultation records,
              diagnostic procedures, and treatment outcomes for educational
              purposes.
            </p>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={staticPatientStories} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientStoriesList;
