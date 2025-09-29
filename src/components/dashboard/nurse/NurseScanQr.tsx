"use client";

import React, { useState } from "react";
import QrScannerBox from "@/components/common/QrScannerBox";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { useAuthInfo } from "@/hooks/useAuthInfo";
import moment from "moment";
import { setNurseStepCompleted, setQrDetails } from "@/store/slices/nurseSlice";
import { fetchDecodeQrDetails } from "@/services/receptionist.api";
import { Badge } from "@/components/ui/badge";
import { Check, User, Calendar } from "lucide-react";
import { Label } from "recharts";

const NurseScanQr: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { userId } = useAuthInfo();
  const { qrDtls } = useSelector((state: RootState) => state.nurse);
  const [invalidCode, setInvalidCode] = useState<string | null>(null);
  const { nurseStepCompleted } = useSelector((state: RootState) => state.nurse);

  const handleScan = async (token: string) => {
    setInvalidCode(null);
    dispatch(setQrDetails(null));
    console.log("Scanned Token:", nurseStepCompleted);
    try {
      const response = await fetchDecodeQrDetails({
        accessToken: token,
        staff_id: userId,
      });

      if (response?.success) {
        dispatch(setQrDetails(response.data));
      } else {
        setInvalidCode(response?.message || "Invalid QR Data");
      }
    } catch (error) {
      console.log("error", error);
      setInvalidCode("Failed to parse QR Code");
    }
  };

  return (
    <div className="min-h-screen py-4 px-4">
      <div className="max-w-3xl mx-auto">
        {!qrDtls && (
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Patient QR Scanner
              </h1>
              <p className="text-gray-600">
                Scan the patient's QR code to access their details
              </p>
            </div>

            {/* <Card className="w-full max-w-md"> */}
            {/* <CardContent className="p-6 text-center"> */}
            <QrScannerBox
              onScanSuccess={(token: string) => {
                handleScan(token);
              }}
              buttonLabel="Scan QR Code"
            />
            {/* </CardContent> */}
            {/* </Card> */}
          </div>
        )}

        {invalidCode && (
          <div className="mb-4 p-3 ">
            <p className="text-red-700 font-medium text-center text-sm">
              {invalidCode === "Internal error: " ? (
                <>An internal error occurred. Please try again later.</>
              ) : (
                invalidCode
              )}
            </p>
          </div>
        )}

        {qrDtls && (
          <div className="w-full max-w-md mx-auto px-4 mt-7">
            <Label className="text-sm font-medium text-gray-600">
              Patient & Appointment Details
            </Label>
            <Card className="w-full rounded-2xl shadow-lg py-6 ">
              <CardContent className="space-y-6">
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
                    <span className="text-sm font-semibold text-gray-900 capitalize">
                      {qrDtls.patient.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Phone:
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {qrDtls.patient.phone}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-gray-600">
                      Gender:
                    </span>
                    <span className="text-sm font-semibold text-gray-900 capitalize">
                      {qrDtls.patient?.patient_profile?.gender ||
                        "Not specified"}
                    </span>
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="text-left">
                  <h2 className="text-md font-bold text-gray-900 mb-4 flex items-center justify-start gap-2">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    Appointment Details
                  </h2>
                </div>

                <div className="space-y-0">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Service:
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {qrDtls?.appointment?.service_category?.[0]?.text ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Status:
                    </span>
                    <Badge
                      className={`${
                        qrDtls?.appointment?.status === "booked"
                          ? "bg-sky-100 text-sky-800"
                          : qrDtls?.appointment?.status === "checked_in"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      } font-medium`}
                    >
                      {qrDtls?.appointment?.status === "checked_in"
                        ? "Checked In"
                        : qrDtls?.appointment?.status || "N/A"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    {/* <span className="text-sm font-medium text-gray-600">
                      Schedule:
                    </span> */}
                    <span className="text-sm font-semibold text-gray-900">
                      {qrDtls?.appointment?.slot_info.start &&
                      qrDtls?.appointment?.slot_info.end
                        ? `${moment(qrDtls.appointment.slot_info.start).format(
                            "DD MMM YYYY"
                          )} | ${moment(
                            qrDtls.appointment.slot_info.start
                          ).format("hh:mm A")} - ${moment(
                            qrDtls.appointment.slot_info.end
                          ).format("hh:mm A")}`
                        : "N/A"}
                    </span>
                  </div>
                </div>

                {/* Nursing Tasks */}
                <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                  {qrDtls?.appointment?.status === "checked_in" ? (
                    <>
                      <Button
                        onClick={() => {
                          router.push("/dashboard/nurse/questionnaire");
                        }}
                        className={`w-full bg-white border-primary border-1 hover:bg-primary hover:text-white text-primary font-semibold py-3 rounded-lg transition-colors ${
                          nurseStepCompleted.step1
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        disabled={nurseStepCompleted.step1}
                      >
                        {nurseStepCompleted.step1 && (
                          <Check className="mr-2 h-4 w-4" />
                        )}
                        Questionnaires
                      </Button>
                      <Button
                        onClick={() => {
                          router.push("/dashboard/nurse/capture-details");
                        }}
                        className={`w-full bg-white border-primary border-1 hover:bg-primary hover:text-white text-primary font-semibold py-3 rounded-lg transition-colors ${
                          nurseStepCompleted.step2
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        disabled={nurseStepCompleted.step2}
                      >
                        {nurseStepCompleted.step2 && (
                          <Check className="mr-2 h-4 w-4" />
                        )}
                        Capture Vitals
                      </Button>
                      {nurseStepCompleted.step1 && nurseStepCompleted.step2 && (
                        <Button
                          onClick={() => {
                            dispatch(setQrDetails(null));
                            dispatch(
                              setNurseStepCompleted({
                                step1: false,
                                step2: false,
                              })
                            );
                          }}
                          className="w-full bg-black hover:bg-gray-900 text-white font-semibold py-3 rounded-lg transition-colors"
                        >
                          Next Patient
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="text-center py-2">
                        <p className="text-sm text-gray-600">
                          This appointment is not yet checked in.
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          dispatch(setQrDetails(null));
                        }}
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg transition-colors"
                      >
                        Next Patient
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default NurseScanQr;
