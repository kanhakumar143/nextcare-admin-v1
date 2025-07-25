"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Patient {
  id: string;
  name: string;
  slotStart: string;
  slotEnd: string;
  concern: string;
  date: string;
  status: string;
}

interface PatientCalendarProps {
  patients: Patient[];
}

const DoctorCalendar = ({ patients }: PatientCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const router = useRouter();

  const getSelectedDatePatients = () => {
    if (!selectedDate) return [];
    const dateString = format(selectedDate, "yyyy-MM-dd");
    return patients.filter((patient) => patient.date === dateString);
  };

  const selectedPatients = getSelectedDatePatients();

  return (
    <>
      <div className="py-8 flex items-center gap-3">
        {/* <Button size={"icon"} variant={"ghost"} onClick={() => router.back()}>
          <ArrowLeft />
        </Button> */}
        <h2 className="text-3xl font-bold">Patient Management</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border border-border bg-background w-full"
            />
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">
              Appointments -{" "}
              {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedPatients.length === 0 ? (
              <p className="text-muted-foreground">
                No appointments for this date
              </p>
            ) : (
              <div className="space-y-3  max-h-[38vh] overflow-y-auto">
                {selectedPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="border border-border rounded-lg p-4 bg-background hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <h4 className="font-medium text-foreground">
                            {patient.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            {patient.slotStart} - {patient.slotEnd}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">
                          {patient.concern}
                        </p>
                      </div>
                      <Badge
                        variant={
                          patient.status === "scheduled"
                            ? "secondary"
                            : "outline"
                        }
                        className="bg-secondary text-secondary-foreground"
                      >
                        {patient.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default DoctorCalendar;
