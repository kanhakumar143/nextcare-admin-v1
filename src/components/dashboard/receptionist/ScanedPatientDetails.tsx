"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { checkInPatient } from "@/services/receptionist.api";
import { useAuthInfo } from "@/hooks/useAuthInfo";
import {
  setDecodedDetails,
  setQrToken,
} from "@/store/slices/receptionistSlice";
import moment from "moment";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatDate } from "date-fns";

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

  const isVerified =
    patientDetails.patient.patient_profile?.verifications[0]
      ?.verification_status === "verified" || verified;

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="w-full max-w-md mx-auto rounded-xl shadow py-4 bg-white">
        <CardContent className="space-y-4">
          {/* Patient Details */}
          <div className="text-left">
            <h2 className="text-md font-semibold text-gray-800">
              Patient <span className="">Details</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="space-y-1">
              <div className="font-medium">Full name:</div>
              <div className="font-medium">Phone:</div>
            </div>
            <div className="space-y-1">
              <div className="text-primary font-bold">
                {patientDetails.patient.name}
              </div>
              <div className="text-primary font-bold">
                {patientDetails.patient.phone}
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="text-left mt-6">
            <h2 className="text-md font-semibold text-gray-800">
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
              <div className="text-primary font-bold">
                {patientDetails.appointment.service_category[0].text}
              </div>
              {/* <div className="text-primary font-bold">
              {formatDate(patientDetails.appointment.slot_info.start)}
            </div> */}
              <div className="text-primary font-bold">
                {moment(patientDetails.appointment.slot_info.start).format(
                  "DD MMM YYYY, h:mm A"
                )}
              </div>
              <div className="text-primary font-bold">
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

          {/* Actions */}
          {/* <div className="flex flex-col gap-3 mt-6">
          {verificationStatus !== "verified" && ( */}
          <Button
            variant="outline"
            className="w-full border-yellow-400 text-yellow-700"
            onClick={handleVerify}
          >
            Verify Patient
          </Button>
          {/* )} */}

          <Button
          // onClick={handleCheckIn}
          // disabled={verificationStatus !== "verified" || loading}
          // className="w-full bg-green-600 text-white"
          >
            {loading ? "Checking In..." : "Confirm Check-In"}
          </Button>
          {/* </div> */}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScannedPatientDetails;
