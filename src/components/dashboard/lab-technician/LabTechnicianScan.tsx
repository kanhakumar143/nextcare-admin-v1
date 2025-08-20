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
import { ArrowLeft, Check } from "lucide-react";
import LabOrderTable from "./LabOrderTable";
import { LabQrDetails } from "@/types/labTechnician.type";

const LabTechnicianScanQr: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { userId } = useAuthInfo();
  const { qrDtls } = useSelector(
    (state: RootState) => state.nurse
  ) as { qrDtls: LabQrDetails | null };

  const [invalidCode, setInvalidCode] = useState<string | null>(null);

  const handleScan = async (token: string) => {
    setInvalidCode(null);
    dispatch(setQrDetails(null));
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
          <>
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  Patient QR Scanner
                </h1>
                <p className="text-gray-600">
                  Scan the patient's QR code to access their details
                </p>
              </div>

              <Card className="w-full max-w-md bg-white border-gray-200 shadow-md">
                <CardContent className="p-6 text-center">
                  <QrScannerBox
                    onScanSuccess={(token: string) => {
                      handleScan(token);
                    }}
                    buttonLabel="Scan QR Code"
                  />
                </CardContent>
              </Card>
            </div>

            <button
              onClick={() => router.back()}
              className="mt-6 flex items-center gap-2 cursor-pointer text-gray-700 hover:text-black font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </>
        )}

       
        {invalidCode && (
          <div className="mb-4 p-3">
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
          <div className="space-y-4">
            <div className="text-center space-y-1 mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Patient Information
              </h1>
              <p className="text-gray-600 text-sm">
                Review details and complete tasks
              </p>
            </div>

            
            <Card className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200 pt-0">
              <div className="bg-gray-200 text-gray-800 p-3 rounded-t-lg">
                <h2 className="text-lg font-semibold text-center">
                  Patient Details
                </h2>
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Full Name
                    </p>
                    <p className="text-sm font-semibold text-gray-900 capitalize">
                      {qrDtls.patient.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Phone
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {qrDtls.patient.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Gender
                    </p>
                    <p className="text-sm font-semibold text-gray-900 capitalize">
                      {qrDtls.patient?.patient_profile?.gender || "Not specified"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Appointment Card */}
            <Card className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200 pt-0">
              <div className="bg-gray-200 text-gray-800 p-3 rounded-t-lg">
                <h2 className="text-lg font-semibold text-center">
                  Appointment Details
                </h2>
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Service
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {qrDtls.appointment?.service_category?.[0]?.text || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Status
                    </p>
                    <Badge
                      variant="outline"
                      className="bg-gray-100 text-gray-800 border-gray-300 capitalize text-xs"
                    >
                      {qrDtls.appointment?.status || "N/A"}
                    </Badge>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Schedule
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {qrDtls.appointment?.slot_info.start &&
                      qrDtls.appointment?.slot_info.end
                        ? `${moment(qrDtls.appointment.slot_info.start).format(
                            "DD MMM YYYY"
                          )} | ${moment(
                            qrDtls.appointment.slot_info.start
                          ).format("hh:mm A")} - ${moment(
                            qrDtls.appointment.slot_info.end
                          ).format("hh:mm A")}`
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lab Orders */}
            <LabOrderTable labOrders={qrDtls.appointment.lab_test_orders ?? []} />

            {/* Actions */}
            <Card className="bg-white border-gray-200 shadow-md pt-0">
              <CardContent className="p-4">
                {qrDtls.appointment?.status === "checked_in" ? (
                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <Button
                      onClick={() => {
                        dispatch(setQrDetails(null));
                        dispatch(setNurseStepCompleted({ step1: false, step2: false }));
                      }}
                      className="w-full sm:w-44 h-10 bg-black hover:bg-gray-900 text-white font-medium cursor-pointer transition-all duration-200"
                    >
                      Next Patient
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-4">
                    <p className="text-center text-gray-600">
                      This appointment is not yet checked in.
                    </p>
                    <Button
                      onClick={() => {
                        dispatch(setQrDetails(null));
                      }}
                      className="w-full sm:w-44 h-10 bg-black hover:bg-gray-900 text-white font-medium cursor-pointer transition-all duration-200"
                    >
                      Next Patient
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabTechnicianScanQr;
