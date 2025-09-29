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
import { User, Calendar } from "lucide-react";

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
    <div className="w-full max-w-sm mx-auto px-4">
      <Card className="w-full rounded-2xl shadow-lg py-6">
        <CardContent className="space-y-3">
          {/* Patient Details */}
          <div className="text-left">
            <h2 className="text-md font-bold text-gray-900 mb-4 flex items-center justify-start gap-2">
              <User className="w-5 h-5 text-orange-600" />
              Patient Details
            </h2>
          </div>

          <div className="space-y-0">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">
                Full Name:
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {patientDetails.patient.name}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">Phone:</span>
              <span className="text-sm font-semibold text-gray-900">
                {patientDetails.patient.phone}
              </span>
            </div>
          </div>

          {/* Booking Details */}
          <div className="text-left">
            <h2 className="text-md font-bold text-gray-900 mb-2 flex items-center justify-start gap-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              Booking Details
            </h2>
          </div>

          <div className="space-y-0">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">
                Service:
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {patientDetails.appointment.service_category[0].text}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">Date:</span>
              <span className="text-sm font-semibold text-gray-900">
                {formatDate(patientDetails.appointment.slot_info.start)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">Time:</span>
              <span className="text-sm font-semibold text-gray-900">
                {moment
                  .utc(patientDetails.appointment.slot_info.start)
                  .format("hh:mm a")}{" "}
                -{" "}
                {moment
                  .utc(patientDetails.appointment.slot_info.end)
                  .format("hh:mm a")}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-gray-600">Status:</span>
              <Badge
                className={`${
                  patientDetails.appointment.status === "booked"
                    ? "bg-sky-800 text-white"
                    : patientDetails.appointment.status === "checked_in"
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                } font-medium`}
              >
                {patientDetails.appointment.status === "checked_in"
                  ? "Checked In"
                  : patientDetails.appointment.status}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
            {patientDetails.patient.patient_profile.verifications[0]
              .verification_status !== "verified" ? (
              <>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                  onClick={() => {
                    router.push("/dashboard/receptionist/verify-patient");
                  }}
                >
                  Verify Patient
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 rounded-lg transition-colors"
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
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    {loading ? "Checking In..." : "Confirm Check-In"}
                  </Button>
                ) : (
                  <div className="text-center py-2">
                    <Label className="text-green-600 font-semibold text-sm">
                      Patient already checked in
                    </Label>
                  </div>
                )}
                <Button
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 rounded-lg transition-colors"
                  onClick={() => {
                    dispatch(clearAllReceptionistData());
                    router.back();
                  }}
                >
                  Cancel
                </Button>
                {patientDetails.time_alert && (
                  <p className="text-xs text-amber-600 text-center mt-2">
                    {patientDetails.time_alert}
                  </p>
                )}
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
