"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { fetchServices } from "@/store/slices/servicesSlice";
import { AppDispatch } from "@/store";
import { forwardReferralConsultation } from "@/services/doctor.api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ReferPatientModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  patientName?: string;
  patientId?: string;
  practitionerId?: string;
  originAppointmentId?: string;
  children?: React.ReactNode;
}

export default function ReferPatientModal({
  isOpen,
  onOpenChange,
  patientName,
  patientId,
  practitionerId,
  originAppointmentId,
  children,
}: ReferPatientModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { items } = useSelector((state: RootState) => state.services);
  const router = useRouter();
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedServiceData, setSelectedServiceData] = useState<any>(null);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string>("");
  const [selectedReason, setSelectedReason] = useState<string>("");

  // Dummy reasons for referral
  const referralReasons = [
    "Patient requires specialized care beyond my expertise",
    "Need advanced diagnostic evaluation",
    "Specialist consultation for treatment planning",
    "Patient has high BP, refer to cardiology",
    "Chronic condition requiring specialist management",
    "Surgical consultation needed",
    "Second opinion required",
    "Complex case requiring multidisciplinary approach",
    "Emergency specialist intervention required",
    "Patient specifically requested specialist referral",
  ];

  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  // Handle service selection change
  const handleServiceChange = (serviceName: string) => {
    setSelectedService(serviceName);
    const serviceData = items?.find((item: any) => item.name === serviceName);
    setSelectedServiceData(serviceData);

    // Reset specialty selection when service changes
    setSelectedSpecialtyId("");
  };

  // Handle specialty selection change
  const handleSpecialtyChange = (specialtyId: string) => {
    setSelectedSpecialtyId(specialtyId);
  };

  // Handle reason selection change
  const handleReasonChange = (reason: string) => {
    setSelectedReason(reason);
  };

  // Handle cancel
  const handleCancel = () => {
    // Reset form state
    setSelectedService("");
    setSelectedServiceData(null);
    setSelectedSpecialtyId("");
    setSelectedReason("");
    onOpenChange(false);
  };

  // Handle confirm
  const handleConfirm = async () => {
    const referralData = {
      origin_appointment_id: originAppointmentId || "",
      patient_id: patientId || "",
      practitioner_id: practitionerId || "",
      service_specialty_id: selectedSpecialtyId || "",
      reason: selectedReason || "",
    };

    console.log("Referral Data:", referralData);
    try {
      const response = await forwardReferralConsultation(referralData);
      toast.success("Patient referred successfully.");
      router.push("/dashboard/doctor/portal");
    } catch (error) {
      toast.error("Failed to refer patient. Please try again.");
    }
    handleCancel();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      {children && <SheetTrigger asChild>{children}</SheetTrigger>}
      <SheetContent className="w-[500px] sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Refer Patient to Specialist
          </SheetTitle>
          <SheetDescription>
            Select a specialist service to refer {patientName || "the patient"}{" "}
            for further consultation.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6 px-7">
          {/* Service Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Service <span className="text-red-500">*</span>
            </Label>
            <Select onValueChange={handleServiceChange} value={selectedService}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {items?.map((service: any) => (
                  <SelectItem key={service.id} value={service.name}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Specialty Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Specialty <span className="text-red-500">*</span>
            </Label>
            <Select
              onValueChange={handleSpecialtyChange}
              value={selectedSpecialtyId}
              disabled={!selectedServiceData?.service_specialties?.length}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a specialty" />
              </SelectTrigger>
              <SelectContent>
                {selectedServiceData?.service_specialties?.map(
                  (specialty: any) => (
                    <SelectItem key={specialty.id} value={specialty.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {specialty.specialty_label}
                        </span>
                      </div>
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Reason for Referral */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Reason for Referral <span className="text-red-500">*</span>
            </Label>
            <Select onValueChange={handleReasonChange} value={selectedReason}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select reason for referral" />
              </SelectTrigger>
              <SelectContent>
                {referralReasons.map((reason, index) => (
                  <SelectItem key={index} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end space-x-3 px-7">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedSpecialtyId || !selectedReason}
          >
            Confirm Referral
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
