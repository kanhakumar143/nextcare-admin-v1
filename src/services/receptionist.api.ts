import { api, axios } from "@/lib/axios";
import { UserPatientProfileResponse } from "@/types/receptionist.types";

export const checkInPatient = async (payload: {
  appointment_id: string;
  user_id: string;
}) => {
  try {
    const response = await api.post("appointment/checked-in", payload);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to checkin patient";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const fetchDecodeQrDetails = async ({
  accessToken,
  staff_id,
}: {
  accessToken: string | null;
  staff_id: string | null;
}) => {
  const payload = {
    encrypted: accessToken,
    practitioner_user_id: staff_id,
  };
  try {
    const response = await api.post("appointment/qr/decode", payload);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error?.message || "Failed to fetch details from QR code";
      throw new Error(message);
    }
    throw new Error("Unexpected error occurred.");
  }
};

export const UpdatePatientAccountStatus = async (
  payload: UserPatientProfileResponse
) => {
  const { data } = await api.put("user/patient", payload);
  return data;
};
