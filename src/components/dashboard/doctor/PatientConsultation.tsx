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
import { ArrowLeft, Edit, Info } from "lucide-react";
import ConfirmConsultationModal from "./modals/ConfirmConsultationModal";
import PatientDetailsDrawer from "./PatientDetailsDrawer";
import { useDispatch, useSelector } from "react-redux";
import {
  setConfirmConsultationModal,
  clearConsultationOrders,
  updateVisitNote,
} from "@/store/slices/doctorSlice";
import { RootState } from "@/store";
import { useRouter } from "next/navigation";
import { getAssignedAppointmentDtlsById } from "@/services/doctor.api";
import { AppointmentDetails, ConsultationData } from "@/types/doctor.types";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { AppointmentDtlsForDoctor } from "@/types/doctorNew.types";

export default function PatientConsultation() {
  const dispatch = useDispatch();
  const { singlePatientDetails, visitNote } = useSelector(
    (state: RootState) => state.doctor
  );
  const [apptDtls, setApptDtls] = useState<AppointmentDtlsForDoctor | null>(
    null
  );
  const [isPatientDetailsDrawerOpen, setIsPatientDetailsDrawerOpen] =
    useState(false);
  const router = useRouter();

  useEffect(() => {
    dispatch(clearConsultationOrders());
    GetAssignedAppointmentDtlsById(singlePatientDetails?.id);
  }, [singlePatientDetails, dispatch]);

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

  const handleConfirmConsultationCheck = () => {
    if (!visitNote.summary.trim()) {
      toast.error(
        "Please provide a consultation summary before completing the consultation."
      );
      return;
    }

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
            <Label className="text-md font-light">Appointment ID :</Label>
            <p className="text-xl font-semibold text-foreground px-4">
              {apptDtls?.appointment_display_id}
            </p>
          </div>
          <div className="">
            <Button onClick={() => setIsPatientDetailsDrawerOpen(true)}>
              <Info className="h-4 w-4" />
              View Patient Details
            </Button>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="mx-6 flex items-center gap-4 py-5">
          <Label className="text-md font-medium">General Vitals : </Label>
          <div className="flex gap-7 items-center">
            {apptDtls &&
              apptDtls?.observations &&
              apptDtls?.observations?.map((vital: any, i: number) => (
                <div key={i} className="flex gap-1 items-center">
                  <span className="text-sm text-muted-foreground">
                    {vital.vital_definition?.name}
                  </span>
                  <span className="text-base font-semibold text-foreground">
                    {vital.value?.value}
                  </span>
                </div>
              ))}
            <Button variant={"ghost"} size={"icon"}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex p-4 bg-background gap-4">
        {/* Left Side */}
        <div className="w-full lg:w-5/12 space-y-4 min-h-full">
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
                  {apptDtls?.questionary_answers &&
                    apptDtls.questionary_answers.map((q: any, i: number) => (
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

        <Card className="w-full space-y-1 p-4">
          <div className="flex flex-col justify-between border-border">
            <div className="pb-2 px-3 py-3 flex items-start justify-between">
              <div>
                <p className="text-xl font-bold">Visit Summary</p>
                <p className="text-sm text-muted-foreground">
                  A detailed summary of the patient’s consultation, including
                  prescribed medicines and recommended lab investigations.
                </p>
              </div>
              <div className="mx-5">
                <Select
                  value={visitNote.visit_care_plan.plan_type}
                  onValueChange={(value) =>
                    dispatch(
                      updateVisitNote({
                        field: "visit_care_plan.plan_type",
                        value,
                      })
                    )
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select plan type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Treatment Plan Type</SelectLabel>
                      <SelectItem value="followup">Follow Up</SelectItem>
                      <SelectItem value="medication">Medication</SelectItem>
                      <SelectItem value="lifestyle">Lifestyle</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-grow px-3 py-2">
              <Label className="text-sm font-medium">Doctor Notes</Label>
              <Textarea
                placeholder="Write your summary here..."
                className="flex-grow h-[10vh]"
                value={visitNote.summary}
                onChange={(e) =>
                  dispatch(
                    updateVisitNote({ field: "summary", value: e.target.value })
                  )
                }
              />
            </div>
            <div className="flex flex-col gap-2 flex-grow px-3 py-2">
              <Label className="text-sm font-medium">
                Post-Visit Care Instructions
              </Label>
              <Input
                placeholder="Provide clear instructions for patient care and next steps"
                value={visitNote.follow_up}
                onChange={(e) =>
                  dispatch(
                    updateVisitNote({
                      field: "follow_up",
                      value: e.target.value,
                    })
                  )
                }
              />
            </div>

            <div className="flex flex-col gap-2 flex-grow px-3 py-2">
              <Label className="text-sm font-medium">Treatment Plan</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium">
                    Treatment Objective
                  </Label>
                  <Input
                    placeholder="Define the primary treatment goal."
                    value={visitNote.visit_care_plan.goal}
                    onChange={(e) =>
                      dispatch(
                        updateVisitNote({
                          field: "visit_care_plan.goal",
                          value: e.target.value,
                        })
                      )
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium">
                    Care Plan Specifics
                  </Label>
                  <Input
                    placeholder="Specify how the treatment plan will be executed"
                    value={visitNote.visit_care_plan.detail}
                    onChange={(e) =>
                      dispatch(
                        updateVisitNote({
                          field: "visit_care_plan.detail",
                          value: e.target.value,
                        })
                      )
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 flex-grow px-3 py-2">
              <Label className="text-sm font-medium">Clinical Assessment</Label>
              <div className="grid grid-cols-2 gap-4 p-3">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium">
                    Assessment Notes
                  </Label>
                  <Input
                    placeholder="Describe your clinical assessment and observations."
                    value={visitNote.visit_assessment.description}
                    onChange={(e) =>
                      dispatch(
                        updateVisitNote({
                          field: "visit_assessment.description",
                          value: e.target.value,
                        })
                      )
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium">Severity Level</Label>
                  <Select
                    value={visitNote.visit_assessment.severity}
                    onValueChange={(value) =>
                      dispatch(
                        updateVisitNote({
                          field: "visit_assessment.severity",
                          value,
                        })
                      )
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select severity Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Severity Level</SelectLabel>
                        <SelectItem value="mild">Mild</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="severe">Severe</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="px-4 mr-2">
        <DoctorMedicineLabEntry />
      </div>

      <div className="flex w-full gap-3 justify-end px-6 py-4">
        <Button variant={"outline"} onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleConfirmConsultationCheck}>
          Complete Consultation
        </Button>
      </div>

      <PatientDetailsDrawer
        isOpen={isPatientDetailsDrawerOpen}
        onClose={() => setIsPatientDetailsDrawerOpen(false)}
        appointmentDetails={apptDtls}
      />

      <ConfirmConsultationModal />
    </>
  );
}
