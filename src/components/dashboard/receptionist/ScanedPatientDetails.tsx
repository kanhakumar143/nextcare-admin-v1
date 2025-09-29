"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  clearAllReceptionistData,
  setDecodedDetails,
  setQrToken,
} from "@/store/slices/receptionistSlice";
import moment from "moment";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { checkInPatient } from "@/services/receptionist.api";
import { useAuthInfo } from "@/hooks/useAuthInfo";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import ConfirmCheckedInModal from "./modals/ConfirmCheckInModal";

const ScannedPatientDetails = () => {
  const { patientDetails } = useSelector(
    (state: RootState) => state.receptionistData
  );
  const { userId } = useAuthInfo();
  const dispatch = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  if (!patientDetails) return null;

  const handleVerify = () => {
    setVerified(true);
    toast.success("Patient verified successfully");
  };

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      const payload = {
        appointment_id: patientDetails?.appointment.id,
        user_id: patientDetails?.patient.user_id,
        patient_id: patientDetails?.appointment.patient_id,
        practitioner_user_id: userId,
      };
      await checkInPatient(payload);
      dispatch(setQrToken(null));
      dispatch(setDecodedDetails(null));
      toast.success("Patient checked in successfully");
      router.push("/dashboard/receptionist"); // go to dashboard
    } catch (err) {
      toast.error("Check-in failed");
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
    <div className="w-full max-w-md mx-auto">
      <Card className="w-full max-w-md mx-auto rounded-xl shadow py-4 bg-white">
        <CardContent className="space-y-4">
          {/* Patient Details */}
          <div className="text-left">
            <h2 className="text-md font-semibold text-gray-800 border-b-2 pb-2 border-primary">
              Patient <span className="">Details</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="space-y-1">
              <div className="font-medium">Full name:</div>
              <div className="font-medium">Phone:</div>
            </div>
            <div className="space-y-1">
              <div className="font-bold">{patientDetails.patient.name}</div>
              <div className="font-bold">{patientDetails.patient.phone}</div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="text-left mt-6">
            <h2 className="text-md font-semibold text-gray-800 border-b-2 pb-2 border-primary">
              Booking <span className="">Details</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="space-y-1">
              <div className="font-medium">Service:</div>
              <div className="font-medium">Date of Booking:</div>
              <div className="font-medium">Slot Time:</div>
              <div className="font-medium">Booking Status:</div>
            </div>
            <div className="space-y-1">
              <div className="font-bold">
                {patientDetails.appointment.service_category[0].text}
              </div>
              <div className="font-bold">
                {formatDate(patientDetails.appointment.slot_info.start)}
              </div>
              <div className="font-bold">
                {moment
                  .utc(patientDetails.appointment.slot_info.start)
                  .format("hh:mm a")}{" "}
                -{" "}
                {moment
                  .utc(patientDetails.appointment.slot_info.end)
                  .format("hh:mm a")}
              </div>
              <div>
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
          </div>

          <div className="flex flex-col gap-2 mt-5 border-t-2 pt-2 border-primary">
            {patientDetails.patient.patient_profile.verifications[0]
              .verification_status !== "verified" ? (
              <>
                <Button
                  className="w-full border-primary border-2"
                  onClick={() => {
                    router.push("/dashboard/receptionist/verify-patient");
                  }}
                >
                  Verify Patient
                </Button>
                <Button
                  variant={"outline"}
                  className="w-full border-primary border-2"
                  onClick={() => {
                    router.back();
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                {patientDetails.appointment.status !== "checked_in" ? (
                  <Button
                    onClick={handleCheckIn}
                    className="w-full bg-primary hover:bg-green-400 text-white font-semibold"
                  >
                    {loading ? "Checking In..." : "Confirm Check-In"}
                  </Button>
                ) : (
                  <Label className="text-center w-full text-green-600 font-semibold">
                    Patient already checked in
                  </Label>
                )}
                <Button
                  variant={"outline"}
                  className="w-full"
                  onClick={() => {
                    dispatch(clearAllReceptionistData());
                    router.back();
                  }}
                >
                  Cancel
                </Button>
                <p className="text-sm text-gray-500">
                  {patientDetails.time_alert}
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      <ConfirmCheckedInModal />
    </div>
  );
};

export default ScannedPatientDetails;
