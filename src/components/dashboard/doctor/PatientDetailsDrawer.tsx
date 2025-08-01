"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, MapPin, Phone, User, Mail, Clock } from "lucide-react";
import { AppointmentDtlsForDoctor } from "@/types/doctorNew.types";

interface PatientDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentDetails: AppointmentDtlsForDoctor | null;
}

export default function PatientDetailsDrawer({
  isOpen,
  onClose,
  appointmentDetails,
}: PatientDetailsDrawerProps) {
  const patient = appointmentDetails?.patient;
  const user = patient?.user;

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return "N/A";
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      return age - 1;
    }
    return age;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-[500px] sm:w-[700px] lg:w-[700px] flex flex-col p-4"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Patient Details
          </SheetTitle>
          <SheetDescription>
            Complete information about the patient and appointment
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="mt-6 space-y-6 pb-6">
            {/* Basic Patient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Full Name
                    </p>
                    <p className="text-base font-semibold">
                      {user?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Patient ID
                    </p>
                    <p className="text-base font-semibold">
                      {patient?.patient_display_id || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Age
                    </p>
                    <p className="text-base font-semibold">
                      {patient?.birth_date
                        ? `${calculateAge(patient.birth_date)} years`
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Gender
                    </p>
                    <Badge variant="outline" className="mt-1">
                      {patient?.gender || "N/A"}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Date of Birth
                    </p>
                    <p className="text-base font-semibold flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {patient?.birth_date
                        ? formatDate(patient.birth_date)
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Phone Number
                  </p>
                  <p className="text-base font-semibold flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {user?.phone || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Email Address
                  </p>
                  <p className="text-base font-semibold flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {user?.email || "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Appointment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Appointment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Appointment ID
                    </p>
                    <p className="text-base font-semibold">
                      {appointmentDetails?.appointment_display_id || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Status
                    </p>
                    <Badge
                      variant={
                        appointmentDetails?.status === "confirmed"
                          ? "default"
                          : "secondary"
                      }
                      className="mt-1"
                    >
                      {appointmentDetails?.status || "N/A"}
                    </Badge>
                  </div>
                </div>

                {appointmentDetails?.start && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Appointment Start Time
                    </p>
                    <p className="text-base font-semibold">
                      {formatDateTime(appointmentDetails.start)}
                    </p>
                  </div>
                )}

                {appointmentDetails?.end && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Appointment End Time
                    </p>
                    <p className="text-base font-semibold">
                      {formatDateTime(appointmentDetails.end)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
