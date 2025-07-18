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
import { setQrDetails } from "@/store/slices/nurseSlice";
import { fetchDecodeQrDetails } from "@/services/receptionist.api";
import { Badge } from "@/components/ui/badge";

const NurseScanQr: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { userId } = useAuthInfo();
  const { qrDtls } = useSelector((state: RootState) => state.nurse);
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
    <div className="px-4 mt-6 flex flex-col items-center gap-4 bg-white">
      {!qrDtls && (
        <CardContent className="space-y-2">
          <h1 className="text-2xl font-bold text-center text-primary">
            Scan QR Code to Proceed
          </h1>

          <QrScannerBox
            onScanSuccess={(token: string) => {
              handleScan(token);
            }}
            buttonLabel="Scan QR"
          />
        </CardContent>
      )}

      {invalidCode && <p className="text-red-500 font-medium">{invalidCode}</p>}

      {qrDtls && (
        <>
          <Card className="w-full max-w-xl shadow-md">
            <CardContent className="space-y-1">
              <h2 className="text-lg sm:text-xl flex justify-center font-semibold text-primary -mt-3">
                Patient Details
              </h2>
              <p className="text-sm sm:text-base capitalize">
                <strong>Name:</strong> {qrDtls.patient.name}
              </p>
              <p className="text-sm  sm:text-base">
                <strong>Phone:</strong> {qrDtls.patient.phone}
              </p>

              <p className="text-sm  sm:text-base capitalize">
                <strong>Gender:</strong>{" "}
                {qrDtls.patient?.patient_profile?.gender}
              </p>
            </CardContent>
          </Card>

          <Card className="w-full max-w-xl shadow-md">
            <CardContent className="space-y-1">
              <h2 className="text-lg sm:text-xl font-semibold flex justify-center text-primary -mt-3">
                Appointment Details
              </h2>
              <p className="text-sm  sm:text-base">
                <strong>Service:</strong>{" "}
                {qrDtls?.appointment?.service_category?.[0]?.text || "N/A"}
              </p>
              <div className="text-sm space-x-1 sm:text-base capitalize">
                <strong>Status:</strong>
                <Badge variant={"outline"}>
                  {qrDtls?.appointment?.status || "N/A"}
                </Badge>
              </div>
              <p className="text-sm sm:text-base">
                <strong>Date & Slot:</strong>{" "}
                {qrDtls?.appointment?.slot_info.start &&
                qrDtls?.appointment?.slot_info.end
                  ? `${moment(qrDtls.appointment.slot_info.start).format(
                      "DD MMM YYYY"
                    )} | ${moment(qrDtls.appointment.slot_info.start).format(
                      "hh:mm A"
                    )} - ${moment(qrDtls.appointment.slot_info.end).format(
                      "hh:mm A"
                    )}`
                  : "N/A"}
              </p>
            </CardContent>
          </Card>

          <Button
            onClick={() => {
              router.push("/dashboard/nurse/questionnaire");
            }}
            className="w-44"
          >
            Fill-Up Questionnaires
          </Button>
          <Button
            onClick={() => {
              router.push("/dashboard/nurse/capture-details");
            }}
            className="w-44"
          >
            Capture Vitals
          </Button>
        </>
      )}
    </div>
  );
};

export default NurseScanQr;
