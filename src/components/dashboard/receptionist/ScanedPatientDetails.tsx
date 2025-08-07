"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  setCheckinSuccessModal,
  setDecodedDetails,
  setQrToken,
} from "@/store/slices/receptionistSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { AlertCircleIcon } from "lucide-react";
import moment from "moment";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { checkInPatient } from "@/services/receptionist.api";
import { useAuthInfo } from "@/hooks/useAuthInfo";

const ScannedPatientDetails = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { userId } = useAuthInfo();

  const { patientDetails } = useSelector(
    (state: RootState) => state.receptionistData
  );
  const [loading, setLoading] = useState<boolean>(false);

  const handleConfirmCheckin = async () => {
    const payload = {
      appointment_id: patientDetails?.appointment.id || "",
      user_id: patientDetails?.patient.user_id || "",
      patient_id: patientDetails?.appointment.patient_id || "",
      practitioner_user_id: userId,
    };
    setLoading(true);
    try {
      const response = await checkInPatient(payload);
      dispatch(setCheckinSuccessModal(true));
      dispatch(setQrToken(null));
      dispatch(setDecodedDetails(null));
      console.log(response);
    } catch {
      toast.error("Something went wrong! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (desc: string) => {
    try {
      const [first] = desc.split(", ");
      return moment(first).format("Do MMMM YYYY");
    } catch {
      return desc;
    }
  };

  return (
    <div className="w-full">
      {["unverified", "under_review"].includes(
        patientDetails?.patient.patient_profile.verifications[0]
          .verification_status || ""
      ) && (
        <div className=" flex justify-center items-center w-full">
          <Alert variant="destructive" className="max-w-2xl mb-3">
            <AlertCircleIcon />
            <AlertTitle>Account Verification Required</AlertTitle>
            <AlertDescription>
              <p>
                You’ve successfully booked an appointment, but your account is
                not yet verified.
              </p>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {patientDetails && (
        <Card className="w-full max-w-md mx-auto rounded-xl shadow py-4 bg-white">
          <CardContent className="space-y-2">
            <div className="text-left">
              <h2 className="text-md font-semibold text-gray-800">
                Patient <span className="">Details</span>
              </h2>
            </div>

            <div className="space-y-1 text-sm text-gray-700">
              <div className="flex justify-between">
                <span className="font-medium">Full name:</span>
                <span className="text-primary font-bold">
                  {patientDetails.patient.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Phone:</span>
                <span className="text-primary text-right font-bold">
                  {patientDetails.patient.phone}
                </span>
              </div>
            </div>

            <div className="text-left mt-6">
              <h2 className="text-md font-semibold text-gray-800">
                Booking <span className="">Details</span>
              </h2>
            </div>

            <div className="space-y-1 text-sm text-gray-700">
              <div className="flex justify-between">
                <span className="font-medium">Service:</span>
                <span className="text-primary font-bold">
                  {patientDetails.appointment.service_category[0].text}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Date of Booking:</span>
                <span className="text-primary text-right font-bold">
                  {formatDate(patientDetails.appointment.slot_info.start)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Slot Time:</span>
                <span className="text-primary text-right font-bold">
                  {moment
                    .utc(patientDetails.appointment.slot_info.start)
                    .format("hh:mm a")}{" "}
                  -{" "}
                  {moment
                    .utc(patientDetails.appointment.slot_info.end)
                    .format("hh:mm a")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Booking Status:</span>
                <Badge
                  className={`${
                    patientDetails.appointment.status === "booked"
                      ? "bg-sky-700"
                      : patientDetails.appointment.status === "checked_in"
                      ? "bg-green-600"
                      : "bg-primary"
                  }`}
                >
                  {patientDetails.appointment.status === "checked_in"
                    ? "Checked In"
                    : patientDetails.appointment.status}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-5">
              {patientDetails.patient.patient_profile.verifications[0]
                .verification_status !== "verified" ? (
                <Button
                  className="w-full border-primary border-2"
                  onClick={() => {
                    router.push("/dashboard/receptionist/verify-patient");
                  }}
                >
                  Verify Patient
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleConfirmCheckin}
                    className="w-full bg-green-500 hover:bg-green-400 text-white font-semibold"
                  >
                    {loading ? "Checking In..." : "Confirm Check-In"}
                  </Button>
                  <p className="text-sm text-gray-500">
                    {patientDetails.time_alert}
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScannedPatientDetails;
