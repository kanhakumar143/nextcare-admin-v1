"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import DoctorMedicineLabEntry from "./DoctorMedicineLabEntry";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import ConfirmConsultationModal from "./modals/ConfirmConsultationModal";
import { useDispatch } from "react-redux";
import { setConfirmConsultationModal } from "@/store/slices/doctorSlice";
import { useParams, useRouter } from "next/navigation";
import { getAssignedAppointmentDtlsById } from "@/services/doctor.api";
import { AppointmentDetails } from "@/types/doctor.types";

export default function PatientConsultation() {
  const dispatch = useDispatch();
  const { patient_name } = useParams();
  const [summary, setSummary] = useState("");
  const [apptDtls, setApptDtls] = useState<AppointmentDetails | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (patient_name) {
      GetAssignedAppointmentDtlsById(patient_name);
    }
  }, []);

  const GetAssignedAppointmentDtlsById = async (
    appointment_id: string | string[]
  ) => {
    try {
      const response = await getAssignedAppointmentDtlsById(appointment_id);
      console.log("response======", response);
      setApptDtls(response);
    } catch (error) {
      console.error("Error fetching appointment details:", error);
      throw error;
    }
  };

  const patient = {
    name: "Kanha Kumar Khatua",
    age: 32,
    gender: "Male",
    contact: "+91 8473927374",
  };

  const handleConfirmConsultationCheck = () => {
    dispatch(setConfirmConsultationModal(true));
  };

  return (
    <>
      <div className="mx-6 my-3 py-2 border-b-2">
        <Button
          variant={"ghost"}
          className="mb-4"
          onClick={() => router.back()}
        >
          <ArrowLeft /> back
        </Button>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Label className="text-md font-light">Name :</Label>
            <p className="text-xl font-semibold text-foreground px-4">
              {patient.name}
            </p>
          </div>
          <div className="flex  gap-5">
            <div className="flex gap-3 items-center">
              <Label className="text-md font-light">Age :</Label>
              <p className="text-base font-semibold text-foreground">
                {patient.age}
              </p>
            </div>
            <div className="flex gap-3 items-center">
              <Label className="text-md font-light">Gender</Label>
              <p className="text-base font-semibold text-foreground">
                {patient.gender}
              </p>
            </div>
            <div className="flex gap-3">
              <Label className="text-md font-light">Contact</Label>
              <p className="text-base font-semibold text-foreground truncate">
                {patient.contact}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="mx-6 flex items-center gap-4 py-5">
          <Label className="text-md font-medium">General Vitals : </Label>
          <div className="flex gap-7 items-center">
            {apptDtls &&
              apptDtls?.vital_observations &&
              apptDtls?.vital_observations?.map((vital: any, i: number) => (
                <div key={i} className="flex gap-1 items-center">
                  <span className="text-sm text-muted-foreground">
                    {vital.vital_definition?.name}
                  </span>
                  <span className="text-base font-semibold text-foreground">
                    {vital.value?.value}
                  </span>
                </div>
              ))}
          </div>
        </div>
        <div className="mx-5">
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Consultation status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="apple">Follow Up</SelectItem>
                <SelectItem value="banana">Clinic</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex p-4 bg-background gap-4">
        {/* Left Side */}
        <div className="w-full lg:w-4/12 space-y-4 min-h-full">
          {/* Pre-consultation QnA */}
          <Card className="border-border p-0">
            <CardHeader className="bg-gray-200 rounded-t-lg">
              <CardTitle className="text-lg py-3">
                Pre-consultation Answers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="pb-6 pr-4 h-[52vh]">
                <div className="space-y-3 text-sm">
                  {apptDtls &&
                    apptDtls.pre_qa.map((q: any, i: number) => (
                      <div key={i}>
                        <p className="font-medium text-foreground">
                          Q{i + 1}: {q?.questionary?.question}
                        </p>
                        <p className="pl-3 text-muted-foreground">
                          A : {q.answer || ""}
                        </p>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="w-full lg:w-8/12 space-y-4">
          <div>
            <DoctorMedicineLabEntry />
          </div>
          <div className="flex flex-col justify-between border-border">
            <div className="pb-2 px-3 py-3">
              <p className="text-xl font-bold">Consultation Summary</p>
              <p className="text-sm text-muted-foreground">
                A detailed summary of the patient’s consultation, including
                prescribed medicines and recommended lab investigations.
              </p>
            </div>
            <div className="flex flex-col gap-4 flex-grow">
              <Textarea
                placeholder="Write your summary here..."
                className="flex-grow h-[10vh]"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full gap-3 justify-end px-6">
        <Button variant={"outline"} onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleConfirmConsultationCheck}>
          Complete Consultation
        </Button>
      </div>

      <ConfirmConsultationModal />
    </>
  );
}
